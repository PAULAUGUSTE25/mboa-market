from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/livestock", tags=["Livestock"])


@router.get("/batches")
async def get_livestock_batches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get livestock batches"""
    return {"message": "Livestock endpoint - to be implemented"}
