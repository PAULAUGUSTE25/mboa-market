"""
Community posts, likes and comments API.
All interactions are persisted in PostgreSQL and associated with real authenticated users.
"""
import asyncio
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal, get_db
from app.core.security import get_current_user
from app.models.user import User, Profile
from app.models.community import CommunityPost, PostLike, PostComment
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4, UUID
from jose import JWTError, jwt
from app.core.config import settings
from app.api.ai import _call_gemini_model, _get_clean_api_key
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/community", tags=["Community"])

# Optional bearer — does not raise 401 for anonymous users
_optional_bearer = HTTPBearer(auto_error=False)


async def _optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        return None
    try:
        parsed_user_id = UUID(user_id)
    except ValueError:
        return None
    result = await db.execute(select(User).where(User.id == parsed_user_id))
    return result.scalar_one_or_none()


# ── Schemas ──────────────────────────────────────────────────────────────────

class PostCreate(BaseModel):
    content: str
    domain: str = "agriculture"  # agriculture | elevage


class CommentCreate(BaseModel):
    content: str


class AuthorOut(BaseModel):
    display_name: str
    region: str
    activity_type: str
    avatar_storage_key: Optional[str] = None

    class Config:
        from_attributes = True


class PostOut(BaseModel):
    id: str
    author_id: str
    author: Optional[AuthorOut]
    domain: str
    content: str
    likes_count: int
    comments_count: int
    liked_by_me: bool
    created_at: str

    class Config:
        from_attributes = True


class CommentOut(BaseModel):
    id: str
    author_id: Optional[str]
    author: Optional[AuthorOut]
    content: str
    created_at: str
    is_ai_generated: bool = False

    class Config:
        from_attributes = True


# ── Helpers ───────────────────────────────────────────────────────────────────

def _format_post(
    post: CommunityPost,
    current_user_id,
    liked_ids: set,
    likes_count: Optional[int] = None,
    comments_count: Optional[int] = None,
) -> dict:
    profile = post.author.profile if post.author else None
    return {
        "id": str(post.id),
        "author_id": str(post.author_id),
        "author": {
            "display_name": profile.display_name if profile else "Anonyme",
            "region": profile.region if profile else "",
            "activity_type": profile.activity_type if profile else "",
            "avatar_storage_key": profile.avatar_storage_key if profile else None,
        } if profile else None,
        "domain": post.domain,
        "content": post.content,
        "is_demo": post.is_demo,
        "likes_count": likes_count if likes_count is not None else len(post.likes),
        "comments_count": comments_count if comments_count is not None else len(post.comments),
        "liked_by_me": str(post.id) in liked_ids,
        "created_at": post.created_at.isoformat(),
    }


def _format_comment(comment: PostComment) -> dict:
    profile = comment.author.profile if comment.author else None
    return {
        "id": str(comment.id),
        "author_id": str(comment.author_id) if comment.author_id else None,
        "author": ({
            "display_name": "Bigiss · IA",
            "region": "",
            "activity_type": "Assistant IA",
            "avatar_storage_key": None,
        } if comment.is_ai_generated else {
            "display_name": profile.display_name if profile else "Anonyme",
            "region": profile.region if profile else "",
            "activity_type": profile.activity_type if profile else "",
            "avatar_storage_key": profile.avatar_storage_key if profile else None,
        }) if profile or comment.is_ai_generated else None,
        "content": comment.content,
        "created_at": comment.created_at.isoformat(),
        "is_ai_generated": comment.is_ai_generated,
    }


async def _generate_demo_post_reply(comment_id: UUID) -> None:
    if not settings.DEMO_POST_AUTO_REPLY_ENABLED:
        return
    api_key = _get_clean_api_key()
    if not api_key:
        logger.error("Demo post auto-reply is enabled, but Gemini is not configured.")
        return

    async with AsyncSessionLocal() as db:
        try:
            source_result = await db.execute(
                select(PostComment).where(PostComment.id == comment_id)
            )
            source_comment = source_result.scalar_one_or_none()
            if not source_comment or source_comment.is_ai_generated:
                return

            post_result = await db.execute(
                select(CommunityPost).where(CommunityPost.id == source_comment.post_id)
            )
            post = post_result.scalar_one_or_none()
            if not post or not post.is_demo:
                return

            existing = await db.execute(
                select(PostComment.id).where(PostComment.auto_reply_to_id == source_comment.id)
            )
            if existing.scalar_one_or_none():
                return

            system_instruction = (
                "Tu es Bigiss, l'assistant IA de MBOA Market. Réponds en français ou en anglais "
                "selon le commentaire, en une ou deux phrases professionnelles. Tu réponds au nom "
                "de l'assistant IA, jamais comme l'auteur du post. Utilise uniquement le contenu "
                "fourni; n'invente ni prix, disponibilité, qualité, livraison ni autre donnée commerciale. "
                "Si l'information manque, dis-le simplement."
            )
            prompt = (
                f"Publication de démonstration ({post.domain}):\n{post.content[:1200]}\n\n"
                f"Commentaire de l'utilisateur:\n{source_comment.content[:1000]}\n\n"
                "Rédige une réponse courte et pertinente."
            )
            reply = await asyncio.to_thread(
                _call_gemini_model,
                prompt,
                settings.GEMINI_MODEL,
                api_key,
                system_instruction,
                None,
                None,
                15,
            )
            reply = reply.strip()
            if not reply:
                logger.warning("Gemini returned an empty demo-post reply for comment %s", comment_id)
                return

            duplicate = await db.execute(
                select(PostComment.id).where(
                    PostComment.post_id == post.id,
                    PostComment.is_ai_generated.is_(True),
                    PostComment.content == reply,
                )
            )
            if duplicate.scalar_one_or_none():
                logger.info("Skipped duplicate AI reply on demo post %s", post.id)
                return

            db.add(PostComment(
                post_id=post.id,
                author_id=None,
                content=reply,
                is_ai_generated=True,
                auto_reply_to_id=source_comment.id,
            ))
            await db.commit()
        except IntegrityError:
            await db.rollback()
            logger.info("Skipped duplicate AI reply for comment %s", comment_id)
        except Exception:
            await db.rollback()
            logger.exception("Failed to generate AI reply for demo comment %s", comment_id)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/posts")
async def get_posts(
    domain: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: Optional[User] = Depends(_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated community posts (public endpoint, auth optional)."""
    query = (
        select(
            CommunityPost,
            select(func.count(PostLike.id))
            .where(PostLike.post_id == CommunityPost.id)
            .correlate(CommunityPost)
            .scalar_subquery(),
            select(func.count(PostComment.id))
            .where(PostComment.post_id == CommunityPost.id)
            .correlate(CommunityPost)
            .scalar_subquery(),
        )
        .options(
            selectinload(CommunityPost.author).selectinload(User.profile),
        )
        .order_by(CommunityPost.created_at.desc())
    )
    if domain:
        query = query.where(CommunityPost.domain == domain)

    total_q = select(func.count(CommunityPost.id))
    if domain:
        total_q = total_q.where(CommunityPost.domain == domain)
    total = (await db.execute(total_q)).scalar()

    query = query.offset((page - 1) * page_size).limit(page_size)
    post_rows = (await db.execute(query)).all()
    posts = [row[0] for row in post_rows]

    # Collect ids liked by current user for this batch
    liked_ids: set = set()
    if current_user and posts:
        post_ids = [p.id for p in posts]
        likes_result = await db.execute(
            select(PostLike.post_id).where(
                PostLike.user_id == current_user.id,
                PostLike.post_id.in_(post_ids)
            )
        )
        liked_ids = {str(r) for r in likes_result.scalars()}

    uid = current_user.id if current_user else None
    return {
        "items": [
            _format_post(post, uid, liked_ids, likes_count, comments_count)
            for post, likes_count, comments_count in post_rows
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, (total + page_size - 1) // page_size),
    }


@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a community post. Requires authentication."""
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    post = CommunityPost(
        id=uuid4(),
        author_id=current_user.id,
        domain=data.domain,
        content=data.content.strip(),
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    # Reload with relationships
    result = await db.execute(
        select(CommunityPost)
        .where(CommunityPost.id == post.id)
        .options(
            selectinload(CommunityPost.author).selectinload(User.profile),
            selectinload(CommunityPost.likes),
            selectinload(CommunityPost.comments),
        )
    )
    post = result.scalar_one()
    return _format_post(post, current_user.id, set())


@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle like on a post. Returns {liked: bool, likes_count: int}."""
    # Check post exists
    post_result = await db.execute(
        select(CommunityPost)
        .where(CommunityPost.id == post_id)
        .options(selectinload(CommunityPost.likes))
    )
    post = post_result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check existing like
    existing = await db.execute(
        select(PostLike).where(
            PostLike.post_id == post_id,
            PostLike.user_id == current_user.id
        )
    )
    existing_like = existing.scalar_one_or_none()

    if existing_like:
        await db.delete(existing_like)
        liked = False
    else:
        like = PostLike(id=uuid4(), post_id=post_id, user_id=current_user.id)
        db.add(like)
        liked = True

    await db.commit()

    # Reload count
    count_result = await db.execute(
        select(func.count(PostLike.id)).where(PostLike.post_id == post_id)
    )
    likes_count = count_result.scalar()

    return {"liked": liked, "likes_count": likes_count}


@router.get("/posts/{post_id}/comments")
async def get_comments(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get comments for a post."""
    result = await db.execute(
        select(PostComment)
        .where(PostComment.post_id == post_id)
        .options(selectinload(PostComment.author).selectinload(User.profile))
        .order_by(PostComment.created_at.asc())
    )
    comments = result.scalars().all()
    return [_format_comment(c) for c in comments]


@router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: UUID,
    data: CommentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a comment to a post. Requires authentication."""
    # Verify post exists
    post_result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = post_result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    comment = PostComment(
        id=uuid4(),
        post_id=post_id,
        author_id=current_user.id,
        content=data.content.strip(),
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    if post.is_demo and settings.DEMO_POST_AUTO_REPLY_ENABLED:
        background_tasks.add_task(_generate_demo_post_reply, comment.id)

    # Reload with author profile
    result = await db.execute(
        select(PostComment)
        .where(PostComment.id == comment.id)
        .options(selectinload(PostComment.author).selectinload(User.profile))
    )
    comment = result.scalar_one()
    return _format_comment(comment)
