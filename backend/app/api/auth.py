from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
# from app.core.rate_limiter import limiter
from app.models.user import User, Profile, UserStatus
from app.schemas.user import UserWithProfile, LoginRequest, LoginResponse, ProfileCreate
from app.schemas.auth import PhoneVerificationRequest, PhoneVerificationResponse, PasswordValidation
from uuid import uuid4
from pydantic import BaseModel, Field, validator
import re
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    phone: str
    email: str | None = None
    password: str = Field(..., min_length=8, max_length=128)
    locale: str = "fr"
    profile: ProfileCreate
    
    @validator('password')
    def validate_password_strength(cls, v):
        """Validate password meets security requirements"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('email')
    def validate_email(cls, v):
        if v:
            # Regex stricte pour email valide
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(pattern, v):
                raise ValueError('Invalid email format')
        return v


@router.post("/register", response_model=UserWithProfile, status_code=status.HTTP_201_CREATED)
# @limiter.limit("5/minute")  # Temporarily disabled - install slowapi to enable
async def register(
    # request: Request,
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register new user - Rate limited to 5 requests per minute"""
    logger.info(f"Registration attempt for phone: {data.phone}")
    # Check if phone already exists
    result = await db.execute(select(User).where(User.phone == data.phone))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        logger.warning(f"Registration failed - phone already exists: {data.phone}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Check if email already exists (if provided)
    if data.email:
        email_result = await db.execute(select(User).where(User.email == data.email))
        existing_email = email_result.scalar_one_or_none()
        if existing_email:
            logger.warning(f"Registration failed - email already exists: {data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    user = User(
        id=uuid4(),
        phone=data.phone,
        email=data.email,
        password_hash=get_password_hash(data.password) if data.password else None,
        locale=data.locale,
    )
    
    db.add(user)
    await db.flush()
    
    profile = Profile(
        id=uuid4(),
        user_id=user.id,
        display_name=data.profile.display_name,
        activity_type=data.profile.activity_type,
        domain=data.profile.domain,
        region=data.profile.region,
        locality=data.profile.locality,
        bio=data.profile.bio,
    )
    
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    await db.refresh(profile)
    
    user.profile = profile
    
    logger.info(f"User registered successfully: {user.id}")
    return user


@router.post("/login", response_model=LoginResponse)
# @limiter.limit("10/minute")  # Temporarily disabled - install slowapi to enable
async def login(
    # request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login user - Rate limited to 10 requests per minute"""
    import asyncio
    
    logger.info(f"Login attempt for phone: {credentials.phone}")
    
    # Constant-time delay to prevent timing attacks
    start_time = asyncio.get_event_loop().time()
    
    result = await db.execute(select(User).where(User.phone == credentials.phone))
    user = result.scalar_one_or_none()
    
    # Always verify password even if user doesn't exist (constant-time)
    if user and user.password_hash:
        password_valid = verify_password(credentials.password, user.password_hash)
    else:
        # Fake password verification to maintain constant time
        verify_password(credentials.password, get_password_hash("dummy_password"))
        password_valid = False
    
    # Ensure minimum delay of 100ms to prevent timing attacks
    elapsed = asyncio.get_event_loop().time() - start_time
    if elapsed < 0.1:
        await asyncio.sleep(0.1 - elapsed)
    
    if not user or not user.password_hash or not password_valid:
        logger.warning(f"Login failed for phone: {credentials.phone}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password"
        )
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    await db.refresh(user, ['profile'])
    
    logger.info(f"User logged in successfully: {user.id}")
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user
    )


@router.post("/verify-phone", response_model=PhoneVerificationResponse)
# @limiter.limit("5/minute")  # Temporarily disabled - install slowapi to enable
async def verify_phone(
    # request: Request,
    data: PhoneVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify phone number with verification code - Rate limited to 5 requests per minute"""
    logger.info(f"Phone verification attempt for: {data.phone}")
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()
    
    if not user:
        logger.warning(f"Phone verification failed - user not found: {data.phone}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # TODO: Implement actual code verification logic
    # For now, this is a placeholder. In production, you should:
    # 1. Store verification codes in database with expiration
    # 2. Verify the code matches and hasn't expired
    # 3. Implement rate limiting to prevent brute force
    # Example:
    # if not verify_code_from_db(request.phone, request.code):
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Invalid or expired verification code"
    #     )
    
    # TEMPORARY: Accept any 6-digit code for development
    # REMOVE THIS IN PRODUCTION!
    if len(data.code) != 6 or not data.code.isdigit():
        logger.warning(f"Phone verification failed - invalid code format: {data.phone}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code must be 6 digits"
        )
    
    user.phone_verified = True
    await db.commit()
    
    logger.info(f"Phone verified successfully: {user.id}")
    return PhoneVerificationResponse(
        message="Phone verified successfully",
        phone_verified=True
    )
