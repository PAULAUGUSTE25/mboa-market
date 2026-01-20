import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from backend.app.core.config import settings
from backend.app.models.user import User

async def check_users():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        
        print(f"Found {len(users)} users in database:\n")
        for user in users:
            await session.refresh(user, ['profile'])
            print(f"Phone: {user.phone}")
            print(f"Email: {user.email}")
            print(f"Has password: {bool(user.password_hash)}")
            print(f"Status: {user.status}")
            if user.profile:
                print(f"Name: {user.profile.display_name}")
                print(f"Type: {user.profile.activity_type}")
            print("-" * 50)
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_users())
