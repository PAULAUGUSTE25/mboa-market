import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.marketplace import Listing, Category, ProductRef
from app.models.user import User, Profile
from sqlalchemy import select
from uuid import uuid4
from datetime import datetime

async def create_provende_listing():
    async with AsyncSessionLocal() as db:
        # Get or create a test user
        result = await db.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        
        if not user:
            # Create test user
            user = User(
                id=str(uuid4()),
                phone="+237600000000",
                password_hash="test123"
            )
            user.profile = Profile(
                user_id=user.id,
                display_name="Fournisseur Équipement",
                activity_type="seed_provider",
                domain="agriculture",
                region="Centre",
                locality="Yaoundé"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Get a category (equipment or tools)
        result = await db.execute(select(Category).limit(1))
        category = result.scalar_one_or_none()
        
        if not category:
            print("❌ No categories found. Run seed_data.py first!")
            return
        
        # Create the provende machine listing
        listing = Listing(
            id=str(uuid4()),
            seller_id=user.id,
            category_id=category.id,
            product_ref_id=None,
            title="Mini Machine pour Provende",
            variety="Électrique",
            quantity=1,
            unit="unité",
            price_per_unit=350000,
            currency="XAF",
            region="Centre",
            locality="Yaoundé",
            status="PUBLISHED"
        )
        db.add(listing)
        
        await db.commit()
        print(f"✅ Listing créé pour Mini Machine pour Provende!")
        print(f"   ID: {listing.id}")
        print(f"   Prix: {listing.price_per_unit} XAF")

if __name__ == "__main__":
    asyncio.run(create_provende_listing())
