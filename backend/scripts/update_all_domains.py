import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User, Profile


async def update_all_domains():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(Profile))
        profiles = result.scalars().all()
        
        for profile in profiles:
            if not profile.domain:
                profile.domain = 'agriculture'
        
        await session.commit()
        print(f"✅ Updated {len(profiles)} profiles with default domain 'agriculture'")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(update_all_domains())
