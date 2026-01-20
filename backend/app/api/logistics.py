from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/logistics", tags=["Logistics"])


@router.get("/transport-requests")
async def get_transport_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get transport requests"""
    return {"message": "Logistics endpoint - to be implemented"}
