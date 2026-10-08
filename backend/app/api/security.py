"""
API endpoints pour la sécurité : Reviews, Historique de connexion, 2FA
Fixed: all DB access migrated to async (AsyncSession + select) — the
sync db.query() calls would raise MissingGreenlet errors at runtime.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Review, LoginHistory, TwoFactorCode
from app.models.user import Profile

router = APIRouter(prefix="/security", tags=["Security"])
logger = logging.getLogger(__name__)


# ==================== SCHEMAS ====================

class ReviewCreate(BaseModel):
    to_user_id: str
    order_id: Optional[str] = None
    rating: int  # 1-5
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    from_user_id: str
    from_user_name: str
    to_user_id: str
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserRatingResponse(BaseModel):
    user_id: str
    average_rating: float
    total_reviews: int
    rating_breakdown: dict  # {1: count, 2: count, ...}


class LoginHistoryResponse(BaseModel):
    id: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    device_type: Optional[str]
    location: Optional[str]
    success: str
    created_at: datetime

    class Config:
        from_attributes = True


class TwoFactorRequest(BaseModel):
    purpose: str = "login"


class TwoFactorVerify(BaseModel):
    code: str
    purpose: str = "login"


# ==================== REVIEWS ====================

@router.post("/reviews", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un avis sur un utilisateur"""
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit être entre 1 et 5")

    # Vérifier que l'utilisateur cible existe
    target_result = await db.execute(select(User).where(User.id == review_data.to_user_id))
    target_user = target_result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Ne pas se noter soi-même
    if str(current_user.id) == review_data.to_user_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous noter vous-même")

    review = Review(
        from_user_id=current_user.id,
        to_user_id=review_data.to_user_id,
        order_id=review_data.order_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    db.add(review)
    await db.commit()
    await db.refresh(review)

    # Load reviewer profile for display name
    profile_result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()

    return ReviewResponse(
        id=str(review.id),
        from_user_id=str(review.from_user_id),
        from_user_name=profile.display_name if profile else "Utilisateur",
        to_user_id=str(review.to_user_id),
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at
    )


@router.get("/reviews/user/{user_id}", response_model=List[ReviewResponse])
async def get_user_reviews(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtenir tous les avis d'un utilisateur"""
    reviews_result = await db.execute(
        select(Review).where(Review.to_user_id == user_id).order_by(Review.created_at.desc())
    )
    reviews = reviews_result.scalars().all()

    # Load all reviewer profiles in one query
    reviewer_ids = [r.from_user_id for r in reviews]
    profiles_dict: dict = {}
    if reviewer_ids:
        profiles_result = await db.execute(select(Profile).where(Profile.user_id.in_(reviewer_ids)))
        for p in profiles_result.scalars().all():
            profiles_dict[p.user_id] = p

    result = []
    for review in reviews:
        profile = profiles_dict.get(review.from_user_id)
        result.append(ReviewResponse(
            id=str(review.id),
            from_user_id=str(review.from_user_id),
            from_user_name=profile.display_name if profile else "Utilisateur",
            to_user_id=str(review.to_user_id),
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at
        ))

    return result


@router.get("/reviews/rating/{user_id}", response_model=UserRatingResponse)
async def get_user_rating(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtenir la note moyenne d'un utilisateur"""
    reviews_result = await db.execute(
        select(Review).where(Review.to_user_id == user_id)
    )
    reviews = reviews_result.scalars().all()

    if not reviews:
        return UserRatingResponse(
            user_id=user_id,
            average_rating=0.0,
            total_reviews=0,
            rating_breakdown={1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        )

    total = len(reviews)
    avg = sum(r.rating for r in reviews) / total
    breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        breakdown[r.rating] += 1

    return UserRatingResponse(
        user_id=user_id,
        average_rating=round(avg, 2),
        total_reviews=total,
        rating_breakdown=breakdown
    )


# ==================== LOGIN HISTORY ====================

@router.get("/login-history", response_model=List[LoginHistoryResponse])
async def get_login_history(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir l'historique des connexions de l'utilisateur"""
    history_result = await db.execute(
        select(LoginHistory)
        .where(LoginHistory.user_id == current_user.id)
        .order_by(LoginHistory.created_at.desc())
        .limit(limit)
    )
    history = history_result.scalars().all()

    return [LoginHistoryResponse(
        id=str(h.id),
        ip_address=h.ip_address,
        user_agent=h.user_agent,
        device_type=h.device_type,
        location=h.location,
        success=h.success,
        created_at=h.created_at
    ) for h in history]


# ==================== 2FA ====================

@router.post("/2fa/generate")
async def generate_2fa_code(
    data: TwoFactorRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Générer un code 2FA"""
    code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    # Invalider les anciens codes
    old_codes_result = await db.execute(
        select(TwoFactorCode).where(
            TwoFactorCode.user_id == current_user.id,
            TwoFactorCode.purpose == data.purpose,
            TwoFactorCode.used == "false"
        )
    )
    for old_code in old_codes_result.scalars().all():
        old_code.used = "true"

    two_factor = TwoFactorCode(
        user_id=current_user.id,
        code=code,
        purpose=data.purpose,
        expires_at=expires_at
    )

    db.add(two_factor)
    await db.commit()

    logger.info("=" * 50)
    logger.info(f"🔐 CODE 2FA POUR {current_user.phone}")
    logger.info(f"📱 Code: {code}")
    logger.info(f"⏰ Expire dans 5 minutes")
    logger.info("=" * 50)

    return {
        "message": "Code 2FA généré.",
        "expires_in_seconds": 300,
    }


@router.post("/2fa/verify")
async def verify_2fa_code(
    data: TwoFactorVerify,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Vérifier un code 2FA"""
    result = await db.execute(
        select(TwoFactorCode).where(
            TwoFactorCode.user_id == current_user.id,
            TwoFactorCode.code == data.code,
            TwoFactorCode.purpose == data.purpose,
            TwoFactorCode.used == "false",
            TwoFactorCode.expires_at > datetime.utcnow()
        )
    )
    two_factor = result.scalar_one_or_none()

    if not two_factor:
        raise HTTPException(status_code=400, detail="Code invalide ou expiré")

    two_factor.used = "true"
    await db.commit()

    return {"verified": True, "message": "Code vérifié avec succès"}


# ==================== BADGE VERIFICATION ====================

@router.get("/badge/{user_id}")
async def get_user_badge(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtenir le badge de vérification d'un utilisateur"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return {
        "user_id": user_id,
        "badge": user.badge.value,
        "is_verified": user.badge.value in ["VERIFIED", "GOLD"],
        "badge_description": {
            "UNVERIFIED": "Non vérifié",
            "VERIFIED": "Vendeur vérifié ✓",
            "GOLD": "Vendeur Gold ⭐"
        }.get(user.badge.value, "Inconnu")
    }
