import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.marketplace import Listing, Category, ProductRef
from app.models.user import User, Profile
from sqlalchemy import select
from uuid import uuid4
from datetime import datetime

async def create_sample_listings():
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
                display_name="Producteur Test",
                activity_type="producer",
                domain="agriculture",
                region="Centre",
                locality="Yaoundé"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Get categories
        result = await db.execute(select(Category).limit(5))
        categories = result.scalars().all()
        
        # Get products
        result = await db.execute(select(ProductRef).limit(5))
        products = result.scalars().all()
        
        if not categories or not products:
            print("❌ No categories or products found. Run seed_data.py first!")
            return
        
        # Create sample listings
        sample_listings = [
            {"title": "Tomates fraîches - Récolte du jour", "quantity": 150, "unit": "kg", "price_per_unit": 500},
            {"title": "Maïs grain - Grande quantité disponible", "quantity": 500, "unit": "kg", "price_per_unit": 250},
            {"title": "Mangues mûres - Variété Kent", "quantity": 200, "unit": "kg", "price_per_unit": 350},
            {"title": "Poulets de chair - Prêts pour la vente", "quantity": 50, "unit": "tête", "price_per_unit": 3500},
            {"title": "Plantain vert - Régimes complets", "quantity": 100, "unit": "régime", "price_per_unit": 600},
        ]
        
        for listing_data in sample_listings:
            listing = Listing(
                id=str(uuid4()),
                seller_id=user.id,
                category_id=categories[0].id,
                product_ref_id=products[0].id if products else None,
                title=listing_data["title"],
                variety="Standard",
                quantity=listing_data["quantity"],
                unit=listing_data["unit"],
                price_per_unit=listing_data["price_per_unit"],
                currency="XAF",
                region="Centre",
                locality="Yaoundé",
                status="PUBLISHED"
            )
            db.add(listing)
        
        await db.commit()
        print(f"✅ Created {len(sample_listings)} sample listings!")

if __name__ == "__main__":
    asyncio.run(create_sample_listings())
