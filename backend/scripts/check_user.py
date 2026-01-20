import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User, Profile


async def check_user():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.phone == "+237695584290")
        )
        user = result.scalar_one_or_none()
        
        if user:
            print(f"Phone: {user.phone}")
            print(f"Email: {user.email}")
            print(f"Has Password: {'Yes' if user.password_hash else 'No'}")
            print(f"Status: {user.status}")
            print(f"Phone Verified: {user.phone_verified}")
            
            # Check profile
            profile_result = await session.execute(
                select(Profile).where(Profile.user_id == user.id)
            )
            profile = profile_result.scalar_one_or_none()
            if profile:
                print(f"\nProfile:")
                print(f"  Display Name: {profile.display_name}")
                print(f"  Activity Type: {profile.activity_type}")
                print(f"  Region: {profile.region}")
        else:
            print("User not found")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(check_user())
