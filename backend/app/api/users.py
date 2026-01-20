from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Profile
from app.schemas.user import UserWithProfile, ProfileUpdate, ProfileResponse
from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])


class PublicProfileData(BaseModel):
    """Profile data for public response"""
    display_name: str
    activity_type: str
    domain: Optional[str]
    region: str
    locality: Optional[str]
    bio: Optional[str]
    avatar_storage_key: Optional[str] = None
    
    class Config:
        from_attributes = True


class PublicProfileResponse(BaseModel):
    """Public profile - excludes sensitive data like email and phone"""
    id: UUID
    display_name: str
    activity_type: str
    domain: Optional[str]
    region: str
    locality: Optional[str]
    bio: Optional[str]
    badge: str
    avatar_storage_key: Optional[str] = None
    created_at: datetime
    profile: Optional[PublicProfileData] = None  # For compatibility
    
    class Config:
        from_attributes = True


@router.get("/me", response_model=UserWithProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile"""
    await db.refresh(current_user, ['profile'])
    return current_user


@router.put("/me/profile", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile"""
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    await db.commit()
    await db.refresh(profile)
    
    return profile


@router.get("/{user_id}", response_model=PublicProfileResponse)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get public user profile by ID (excludes sensitive data)"""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get profile
    profile_result = await db.execute(
        select(Profile).where(Profile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Return public data only (no email, no phone)
    profile_data = PublicProfileData(
        display_name=profile.display_name,
        activity_type=profile.activity_type,
        domain=profile.domain,
        region=profile.region,
        locality=profile.locality,
        bio=profile.bio,
        avatar_storage_key=profile.avatar_storage_key
    )
    
    return PublicProfileResponse(
        id=user.id,
        display_name=profile.display_name,
        activity_type=profile.activity_type,
        domain=profile.domain,
        region=profile.region,
        locality=profile.locality,
        bio=profile.bio,
        badge=user.badge.value,
        avatar_storage_key=profile.avatar_storage_key,
        created_at=user.created_at,
        profile=profile_data
    )
