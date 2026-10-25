"""
Analytics — Tracking des visites de la plateforme MBOA Market
Endpoint public (sans authentification) utilisé par le frontend.
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.database import get_db
from app.models.system import SiteVisit
from app.models.user import User, Profile
from app.models.marketplace import Listing, ListingStatus
from app.models.community import CommunityPost

router = APIRouter(prefix="/analytics", tags=["Analytics"])
logger = logging.getLogger(__name__)


def _detect_device(user_agent: str) -> str:
    ua = (user_agent or "").lower()
    if any(k in ua for k in ("mobile", "android", "iphone", "ipad")):
        return "mobile"
    if "tablet" in ua:
        return "tablet"
    return "desktop"


class PlatformStatsResponse(BaseModel):
    users: int
    listings: int
    regions: int
    posts: int


@router.get("/platform-stats", response_model=PlatformStatsResponse)
async def get_platform_stats(db: AsyncSession = Depends(get_db)):
    """Public aggregate counts for marketing surfaces (no authentication)."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    active_listings = (
        await db.execute(
            select(func.count(Listing.id)).where(Listing.status == ListingStatus.PUBLISHED)
        )
    ).scalar_one()
    regions_covered = (
        await db.execute(
            select(func.count(func.distinct(Profile.region))).where(
                Profile.region.isnot(None),
                Profile.region != "",
            )
        )
    ).scalar_one()
    total_posts = (await db.execute(select(func.count(CommunityPost.id)))).scalar_one()
    return PlatformStatsResponse(
        users=int(total_users or 0),
        listings=int(active_listings or 0),
        regions=int(regions_covered or 0),
        posts=int(total_posts or 0),
    )


class VisitPayload(BaseModel):
    session_id: str
    page: Optional[str] = "/"
    referrer: Optional[str] = None
    action: Optional[str] = "visit"   # visit / register / login
    user_id: Optional[str] = None


@router.post("/visit", status_code=201)
async def record_visit(
    payload: VisitPayload,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Enregistre une visite (ou action) de la plateforme.
    Appelé par le frontend à chaque changement de page.
    Aucune authentification requise.
    """
    try:
        ua  = request.headers.get("user-agent", "")
        ip  = request.headers.get("x-forwarded-for", "")
        if not ip and request.client:
            ip = request.client.host
        if ip and "," in ip:
            ip = ip.split(",")[0].strip()

        visit = SiteVisit(
            session_id  = payload.session_id,
            ip_address  = ip or None,
            user_agent  = ua[:500] if ua else None,
            device_type = _detect_device(ua),
            referrer    = payload.referrer,
            page        = payload.page or "/",
            action      = payload.action or "visit",
            user_id     = payload.user_id or None,
        )
        db.add(visit)
        await db.commit()
        return {"ok": True}
    except Exception as e:
        logger.warning(f"Analytics visit record failed: {e}")
        return {"ok": False}
