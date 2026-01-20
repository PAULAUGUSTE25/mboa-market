from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/b2b", tags=["B2B"])


@router.get("/requests")
async def get_b2b_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get B2B requests"""
    return {"message": "B2B requests endpoint - to be implemented"}
