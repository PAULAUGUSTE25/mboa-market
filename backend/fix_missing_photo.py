import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.marketplace import Listing, ListingPhoto
from uuid import uuid4

async def fix():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession)
    async with async_session() as session:
        result = await session.execute(
            select(Listing).where(Listing.title == 'Macabo de première qualité')
        )
        listing = result.scalar_one_or_none()
        if listing:
            photo = ListingPhoto(
                id=uuid4(),
                listing_id=listing.id,
                storage_key='/images/agriculture/bonne qualite de macabo.jpg',
                position=1
            )
            session.add(photo)
            await session.commit()
            print('✅ Photo ajoutée à "Macabo de première qualité"!')
        else:
            print('❌ Annonce non trouvée')
    await engine.dispose()

asyncio.run(fix())
