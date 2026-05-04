import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete
from app.core.config import settings
from app.models.marketplace import ListingPhoto

async def clear():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession)
    async with async_session() as session:
        await session.execute(delete(ListingPhoto))
        await session.commit()
        print('✅ Photos supprimées')
    await engine.dispose()

asyncio.run(clear())
