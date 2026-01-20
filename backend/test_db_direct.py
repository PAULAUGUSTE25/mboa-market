import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User, Profile
from app.core.security import get_password_hash
from uuid import uuid4


async def test_create_user():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Create user
        user = User(
            id=uuid4(),
            phone="+237670000099",
            email="test@test.com",
            password_hash=get_password_hash("testpass123"),
            locale="fr",
        )
        
        session.add(user)
        await session.flush()
        
        # Create profile
        profile = Profile(
            id=uuid4(),
            user_id=user.id,
            display_name="Test User",
            activity_type="producer",
            region="Centre",
        )
        
        session.add(profile)
        await session.commit()
        
        print(f"✅ User created successfully!")
        print(f"ID: {user.id}")
        print(f"Phone: {user.phone}")
        print(f"Status: {user.status}")
        
        # Try to query it back
        result = await session.execute(select(User).where(User.phone == "+237670000099"))
        found_user = result.scalar_one_or_none()
        
        if found_user:
            print(f"✅ User found in database!")
            await session.refresh(found_user, ['profile'])
            print(f"Profile: {found_user.profile.display_name if found_user.profile else 'None'}")
        else:
            print(f"❌ User not found!")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_create_user())
