from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    phone: str
    email: Optional[str] = Field(None, max_length=255)
    locale: str = "fr"


class UserCreate(UserBase):
    password: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[str] = Field(None, max_length=255)
    locale: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    phone_verified: bool
    status: str
    badge: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProfileBase(BaseModel):
    display_name: str
    activity_type: str
    domain: Optional[str] = None
    region: str
    locality: Optional[str] = None
    bio: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    activity_type: Optional[str] = None
    domain: Optional[str] = None
    region: Optional[str] = None
    locality: Optional[str] = None
    bio: Optional[str] = None
    avatar_storage_key: Optional[str] = None


class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    avatar_storage_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserWithProfile(UserResponse):
    profile: Optional[ProfileResponse] = None
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    phone: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserWithProfile


class PhoneVerificationRequest(BaseModel):
    phone: str
    code: str


class RoleResponse(BaseModel):
    id: UUID
    code: str
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True
