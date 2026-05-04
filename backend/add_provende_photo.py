import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.marketplace import Listing, ListingPhoto
from sqlalchemy import select
from uuid import uuid4

async def add_provende_photo():
    async with AsyncSessionLocal() as db:
        # Find the provende listing
        result = await db.execute(
            select(Listing).where(Listing.title == "Mini Machine pour Provende")
        )
        listing = result.scalar_one_or_none()
        
        if not listing:
            print("❌ Listing not found!")
            return
        
        # Add photo
        photo = ListingPhoto(
            id=str(uuid4()),
            listing_id=listing.id,
            storage_key="/machine pour provende .png",
            position=1
        )
        db.add(photo)
        
        await db.commit()
        print(f"✅ Photo ajoutée au listing!")
        print(f"   Image: /machine pour provende .png")

if __name__ == "__main__":
    asyncio.run(add_provende_photo())
