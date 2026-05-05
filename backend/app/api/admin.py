"""
API Admin — Back Office MBOA Market
Endpoints pour la gestion et la traçabilité de la plateforme.
Accès : tout utilisateur authentifié (JWT valide).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Profile
from app.models.marketplace import Listing
from app.models.system import LoginHistory, AuditLog

router = APIRouter(prefix="/admin", tags=["Admin"])


# ═══════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════

class AdminUserResponse(BaseModel):
    id: str
    phone: str
    email: Optional[str]
    phone_verified: bool
    status: str
    badge: str
    locale: str
    created_at: datetime
    display_name: Optional[str]
    activity_type: Optional[str]
    region: Optional[str]
    locality: Optional[str]
    listing_count: int

    class Config:
        from_attributes = True


class AdminLoginResponse(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str]
    phone: Optional[str]
    ip_address: Optional[str]
    device_type: Optional[str]
    location: Optional[str]
    success: str
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityEventResponse(BaseModel):
    id: str
    kind: str           # 'registration' | 'login' | 'listing'
    title: str
    subtitle: str
    timestamp: datetime
    extra: Optional[dict] = None


class AdminStatsResponse(BaseModel):
    total_users: int
    total_listings: int
    total_logins: int
    new_users_24h: int
    new_listings_24h: int
    new_logins_24h: int
    users_by_region: dict
    users_by_activity: dict


# ═══════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════

@router.get("/users", response_model=List[AdminUserResponse])
async def get_all_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    region: Optional[str] = None,
    activity_type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Liste tous les utilisateurs inscrits — données live depuis la DB."""
    # Base query with profile
    stmt = (
        select(User)
        .options(selectinload(User.profile), selectinload(User.listings))
        .order_by(desc(User.created_at))
    )

    if status:
        stmt = stmt.where(User.status == status)

    result = await db.execute(stmt)
    users = result.scalars().unique().all()

    out = []
    for u in users:
        p = u.profile
        if region and (not p or p.region != region):
            continue
        if activity_type and (not p or p.activity_type != activity_type):
            continue

        out.append(AdminUserResponse(
            id=str(u.id),
            phone=u.phone,
            email=u.email,
            phone_verified=u.phone_verified,
            status=str(u.status.value if hasattr(u.status, 'value') else u.status),
            badge=str(u.badge.value if hasattr(u.badge, 'value') else u.badge),
            locale=u.locale,
            created_at=u.created_at,
            display_name=p.display_name if p else None,
            activity_type=p.activity_type if p else None,
            region=p.region if p else None,
            locality=p.locality if p else None,
            listing_count=len(u.listings) if u.listings else 0,
        ))

    # Manual pagination
    total = len(out)
    start = (page - 1) * page_size
    return out[start: start + page_size]


@router.get("/logins", response_model=List[AdminLoginResponse])
async def get_all_logins(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Historique de toutes les connexions — traçabilité complète."""
    stmt = (
        select(LoginHistory)
        .options(selectinload(LoginHistory.user))
        .order_by(desc(LoginHistory.created_at))
        .limit(limit)
    )
    result = await db.execute(stmt)
    logins = result.scalars().all()

    out = []
    for lh in logins:
        u = lh.user
        out.append(AdminLoginResponse(
            id=str(lh.id),
            user_id=str(lh.user_id),
            user_name=u.profile.display_name if u and u.profile else None,
            phone=u.phone if u else None,
            ip_address=lh.ip_address,
            device_type=lh.device_type,
            location=lh.location,
            success=lh.success,
            created_at=lh.created_at,
        ))
    return out


@router.get("/activity", response_model=List[ActivityEventResponse])
async def get_activity_feed(
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Feed d'activité consolidé : inscriptions + connexions + annonces."""
    events: List[ActivityEventResponse] = []

    # ① Nouvelles inscriptions
    users_stmt = (
        select(User)
        .options(selectinload(User.profile))
        .order_by(desc(User.created_at))
        .limit(limit)
    )
    users_result = await db.execute(users_stmt)
    users = users_result.scalars().unique().all()

    for u in users:
        p = u.profile
        events.append(ActivityEventResponse(
            id=f"reg-{u.id}",
            kind="registration",
            title=p.display_name if p else u.phone,
            subtitle=f"{p.activity_type if p else '—'} · {p.region if p else '—'}",
            timestamp=u.created_at,
            extra={
                "phone": u.phone,
                "badge": str(u.badge.value if hasattr(u.badge, 'value') else u.badge),
                "status": str(u.status.value if hasattr(u.status, 'value') else u.status),
            }
        ))

    # ② Connexions
    logins_stmt = (
        select(LoginHistory)
        .options(selectinload(LoginHistory.user))
        .order_by(desc(LoginHistory.created_at))
        .limit(limit)
    )
    logins_result = await db.execute(logins_stmt)
    logins = logins_result.scalars().all()

    for lh in logins:
        u = lh.user
        name = u.profile.display_name if u and u.profile else (u.phone if u else "Inconnu")
        events.append(ActivityEventResponse(
            id=f"login-{lh.id}",
            kind="login",
            title=f"Connexion — {name}",
            subtitle=f"{lh.device_type or 'Appareil inconnu'} · {lh.location or 'Cameroun'}",
            timestamp=lh.created_at,
            extra={
                "user_id": str(lh.user_id),
                "success": lh.success,
                "ip": lh.ip_address,
            }
        ))

    # ③ Nouvelles annonces
    listings_stmt = (
        select(Listing)
        .options(selectinload(Listing.seller).selectinload(User.profile))
        .order_by(desc(Listing.created_at))
        .limit(limit)
    )
    listings_result = await db.execute(listings_stmt)
    listings = listings_result.scalars().all()

    for lst in listings:
        seller = lst.seller
        seller_name = seller.profile.display_name if seller and seller.profile else "Vendeur"
        events.append(ActivityEventResponse(
            id=f"lst-{lst.id}",
            kind="listing",
            title=lst.title or f"Annonce · {lst.region}",
            subtitle=f"{seller_name} · {lst.region} · {float(lst.price_per_unit):,.0f} FCFA/{lst.unit}",
            timestamp=lst.created_at,
            extra={
                "listing_id": str(lst.id),
                "seller_id": str(lst.seller_id),
                "status": lst.status,
                "region": lst.region,
            }
        ))

    # Tri chronologique inverse
    events.sort(key=lambda e: e.timestamp, reverse=True)
    return events[:limit]


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Statistiques globales de la plateforme en temps réel."""
    from datetime import timedelta
    now = datetime.utcnow()
    h24 = now - timedelta(hours=24)

    # Totaux
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    total_listings = (await db.execute(select(func.count(Listing.id)))).scalar_one()
    total_logins = (await db.execute(select(func.count(LoginHistory.id)))).scalar_one()

    # 24h
    new_users_24h = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= h24)
    )).scalar_one()
    new_listings_24h = (await db.execute(
        select(func.count(Listing.id)).where(Listing.created_at >= h24)
    )).scalar_one()
    new_logins_24h = (await db.execute(
        select(func.count(LoginHistory.id)).where(LoginHistory.created_at >= h24)
    )).scalar_one()

    # Par région
    regions_result = await db.execute(
        select(Profile.region, func.count(Profile.id))
        .group_by(Profile.region)
    )
    users_by_region = {r: c for r, c in regions_result.all() if r}

    # Par type d'activité
    activity_result = await db.execute(
        select(Profile.activity_type, func.count(Profile.id))
        .group_by(Profile.activity_type)
    )
    users_by_activity = {a: c for a, c in activity_result.all() if a}

    return AdminStatsResponse(
        total_users=total_users,
        total_listings=total_listings,
        total_logins=total_logins,
        new_users_24h=new_users_24h,
        new_listings_24h=new_listings_24h,
        new_logins_24h=new_logins_24h,
        users_by_region=users_by_region,
        users_by_activity=users_by_activity,
    )
