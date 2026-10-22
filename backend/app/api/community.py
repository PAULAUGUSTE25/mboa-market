"""
Community posts, likes and comments API.
All interactions are persisted in PostgreSQL and associated with real authenticated users.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Profile
from app.models.community import CommunityPost, PostLike, PostComment
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4, UUID
from jose import JWTError, jwt
from app.core.config import settings
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
        user_id: str = payload.get("sub")
        if not user_id:
            return None
        from uuid import UUID as _UUID
        result = await db.execute(select(User).where(User.id == _UUID(user_id)))
        return result.scalar_one_or_none()
    except (JWTError, Exception):
        return None


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
    author_id: str
    author: Optional[AuthorOut]
    content: str
    created_at: str

    class Config:
        from_attributes = True


# ── Helpers ───────────────────────────────────────────────────────────────────

def _format_post(post: CommunityPost, current_user_id, liked_ids: set) -> dict:
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
        "likes_count": len(post.likes),
        "comments_count": len(post.comments),
        "liked_by_me": str(post.id) in liked_ids,
        "created_at": post.created_at.isoformat(),
    }


def _format_comment(comment: PostComment) -> dict:
    profile = comment.author.profile if comment.author else None
    return {
        "id": str(comment.id),
        "author_id": str(comment.author_id),
        "author": {
            "display_name": profile.display_name if profile else "Anonyme",
            "region": profile.region if profile else "",
            "activity_type": profile.activity_type if profile else "",
            "avatar_storage_key": profile.avatar_storage_key if profile else None,
        } if profile else None,
        "content": comment.content,
        "created_at": comment.created_at.isoformat(),
    }


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
        select(CommunityPost)
        .options(
            selectinload(CommunityPost.author).selectinload(User.profile),
            selectinload(CommunityPost.likes),
            selectinload(CommunityPost.comments),
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
    posts = (await db.execute(query)).scalars().all()

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
        "items": [_format_post(p, uid, liked_ids) for p in posts],
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a comment to a post. Requires authentication."""
    # Verify post exists
    post_check = await db.execute(select(CommunityPost.id).where(CommunityPost.id == post_id))
    if not post_check.scalar_one_or_none():
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

    # Reload with author profile
    result = await db.execute(
        select(PostComment)
        .where(PostComment.id == comment.id)
        .options(selectinload(PostComment.author).selectinload(User.profile))
    )
    comment = result.scalar_one()
    return _format_comment(comment)
