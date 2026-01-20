import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User, Profile


async def update_user_domain():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get user by phone
        result = await session.execute(
            select(User).where(User.phone == "+237695584290")
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ User not found")
            return
        
        # Get profile
        profile_result = await session.execute(
            select(Profile).where(Profile.user_id == user.id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if profile:
            # Update domain based on activity_type
            if profile.activity_type == 'seed_provider':
                profile.domain = 'agriculture'
            elif profile.activity_type == 'producer':
                profile.domain = 'agriculture'
            elif profile.activity_type == 'buyer':
                profile.domain = 'agriculture'
            
            await session.commit()
            print(f"✅ Domain updated for {profile.display_name}")
            print(f"   Activity Type: {profile.activity_type}")
            print(f"   Domain: {profile.domain}")
        else:
            print("❌ Profile not found")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(update_user_domain())
