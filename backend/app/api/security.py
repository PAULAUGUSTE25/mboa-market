"""
API endpoints pour la sécurité : Reviews, Historique de connexion, 2FA
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Review, LoginHistory, TwoFactorCode

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un avis sur un utilisateur"""
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit être entre 1 et 5")
    
    # Vérifier que l'utilisateur cible existe
    target_user = db.query(User).filter(User.id == review_data.to_user_id).first()
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
    db.commit()
    db.refresh(review)
    
    return ReviewResponse(
        id=str(review.id),
        from_user_id=str(review.from_user_id),
        from_user_name=current_user.profile.display_name if current_user.profile else "Utilisateur",
        to_user_id=str(review.to_user_id),
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at
    )


@router.get("/reviews/user/{user_id}", response_model=List[ReviewResponse])
async def get_user_reviews(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Obtenir tous les avis d'un utilisateur"""
    reviews = db.query(Review).filter(Review.to_user_id == user_id).order_by(Review.created_at.desc()).all()
    
    result = []
    for review in reviews:
        from_user = db.query(User).filter(User.id == review.from_user_id).first()
        result.append(ReviewResponse(
            id=str(review.id),
            from_user_id=str(review.from_user_id),
            from_user_name=from_user.profile.display_name if from_user and from_user.profile else "Utilisateur",
            to_user_id=str(review.to_user_id),
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at
        ))
    
    return result


@router.get("/reviews/rating/{user_id}", response_model=UserRatingResponse)
async def get_user_rating(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Obtenir la note moyenne d'un utilisateur"""
    reviews = db.query(Review).filter(Review.to_user_id == user_id).all()
    
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtenir l'historique des connexions de l'utilisateur"""
    history = db.query(LoginHistory).filter(
        LoginHistory.user_id == current_user.id
    ).order_by(LoginHistory.created_at.desc()).limit(limit).all()
    
    return [LoginHistoryResponse(
        id=str(h.id),
        ip_address=h.ip_address,
        user_agent=h.user_agent,
        device_type=h.device_type,
        location=h.location,
        success=h.success,
        created_at=h.created_at
    ) for h in history]


def record_login(db: Session, user_id: str, request: Request, success: bool = True):
    """Enregistrer une tentative de connexion"""
    # Déterminer le type d'appareil
    user_agent = request.headers.get("user-agent", "")
    device_type = "desktop"
    if "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent:
        device_type = "mobile"
    elif "Tablet" in user_agent or "iPad" in user_agent:
        device_type = "tablet"
    
    # IP (en local, ce sera 127.0.0.1)
    ip = request.client.host if request.client else "unknown"
    
    login_record = LoginHistory(
        user_id=user_id,
        ip_address=ip,
        user_agent=user_agent[:500] if user_agent else None,  # Limiter la taille
        device_type=device_type,
        location="Cameroun",  # En local, on ne peut pas déterminer la vraie localisation
        success="true" if success else "false"
    )
    
    db.add(login_record)
    db.commit()
    
    logger.info(f"Login recorded for user {user_id}: success={success}, ip={ip}")


# ==================== 2FA ====================

@router.post("/2fa/generate")
async def generate_2fa_code(
    data: TwoFactorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Générer un code 2FA (simulé - affiché en console)"""
    # Générer un code à 6 chiffres
    code = str(random.randint(100000, 999999))
    
    # Expiration dans 5 minutes
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # Invalider les anciens codes
    db.query(TwoFactorCode).filter(
        TwoFactorCode.user_id == current_user.id,
        TwoFactorCode.purpose == data.purpose,
        TwoFactorCode.used == "false"
    ).update({"used": "true"})
    
    # Créer le nouveau code
    two_factor = TwoFactorCode(
        user_id=current_user.id,
        code=code,
        purpose=data.purpose,
        expires_at=expires_at
    )
    
    db.add(two_factor)
    db.commit()
    
    # En mode local, afficher le code en console (simuler l'envoi par SMS/email)
    logger.info("=" * 50)
    logger.info(f"🔐 CODE 2FA POUR {current_user.phone}")
    logger.info(f"📱 Code: {code}")
    logger.info(f"⏰ Expire dans 5 minutes")
    logger.info("=" * 50)
    
    # En production, on enverrait par SMS/email
    # Pour le dev, on retourne aussi le code (à retirer en prod)
    return {
        "message": "Code 2FA généré. Vérifiez la console du serveur.",
        "expires_in_seconds": 300,
        "dev_code": code  # À RETIRER EN PRODUCTION
    }


@router.post("/2fa/verify")
async def verify_2fa_code(
    data: TwoFactorVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Vérifier un code 2FA"""
    two_factor = db.query(TwoFactorCode).filter(
        TwoFactorCode.user_id == current_user.id,
        TwoFactorCode.code == data.code,
        TwoFactorCode.purpose == data.purpose,
        TwoFactorCode.used == "false",
        TwoFactorCode.expires_at > datetime.utcnow()
    ).first()
    
    if not two_factor:
        raise HTTPException(status_code=400, detail="Code invalide ou expiré")
    
    # Marquer comme utilisé
    two_factor.used = "true"
    db.commit()
    
    return {"verified": True, "message": "Code vérifié avec succès"}


# ==================== BADGE VERIFICATION ====================

@router.get("/badge/{user_id}")
async def get_user_badge(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Obtenir le badge de vérification d'un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
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
