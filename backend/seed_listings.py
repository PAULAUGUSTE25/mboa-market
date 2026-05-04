"""
Script pour créer des annonces de test dans la base de données
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User
from app.models.marketplace import Listing, Category, ProductRef, ListingStatus
from uuid import uuid4
from datetime import datetime


async def seed_listings():
    """Créer des annonces de test"""
    print("🌱 Création d'annonces de test...")
    print(f"📊 URL: {settings.DATABASE_URL}")
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Récupérer le premier utilisateur
        result = await session.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ Aucun utilisateur trouvé! Créez d'abord un utilisateur.")
            return
        
        print(f"✅ Utilisateur trouvé: {user.phone}")
        print()
        
        # Créer des catégories si elles n'existent pas
        categories_data = [
            {"name_fr": "Céréales", "name_en": "Cereals", "kind": "agriculture"},
            {"name_fr": "Tubercules", "name_en": "Tubers", "kind": "agriculture"},
            {"name_fr": "Légumes", "name_en": "Vegetables", "kind": "agriculture"},
            {"name_fr": "Fruits", "name_en": "Fruits", "kind": "agriculture"},
            {"name_fr": "Volaille", "name_en": "Poultry", "kind": "elevage"},
            {"name_fr": "Bétail", "name_en": "Cattle", "kind": "elevage"},
        ]
        
        categories = {}
        for cat_data in categories_data:
            result = await session.execute(
                select(Category).where(Category.name_fr == cat_data["name_fr"])
            )
            category = result.scalar_one_or_none()
            
            if not category:
                category = Category(
                    id=uuid4(),
                    name_fr=cat_data["name_fr"],
                    name_en=cat_data["name_en"],
                    kind=cat_data["kind"],
                    is_active=True
                )
                session.add(category)
                await session.flush()
            
            categories[cat_data["name_fr"]] = category
        
        print(f"✅ {len(categories)} catégories créées/trouvées")
        print()
        
        # Créer des produits de référence
        products_data = [
            {"name_fr": "Maïs", "name_en": "Corn", "unit_default": "kg"},
            {"name_fr": "Manioc", "name_en": "Cassava", "unit_default": "kg"},
            {"name_fr": "Macabo", "name_en": "Taro", "unit_default": "kg"},
            {"name_fr": "Tomate", "name_en": "Tomato", "unit_default": "kg"},
            {"name_fr": "Poulet", "name_en": "Chicken", "unit_default": "unité"},
        ]
        
        products = {}
        for prod_data in products_data:
            result = await session.execute(
                select(ProductRef).where(ProductRef.name_fr == prod_data["name_fr"])
            )
            product = result.scalar_one_or_none()
            
            if not product:
                product = ProductRef(
                    id=uuid4(),
                    name_fr=prod_data["name_fr"],
                    name_en=prod_data["name_en"],
                    unit_default=prod_data["unit_default"],
                    is_active=True
                )
                session.add(product)
                await session.flush()
            
            products[prod_data["name_fr"]] = product
        
        print(f"✅ {len(products)} produits créés/trouvés")
        print()
        
        # Créer des annonces
        listings_data = [
            {
                "title": "Maïs frais de qualité",
                "product": "Maïs",
                "category": "Céréales",
                "variety": "Jaune",
                "quantity": 500,
                "unit": "kg",
                "price_per_unit": 350,
                "region": "Centre",
                "locality": "Yaoundé",
            },
            {
                "title": "Manioc fraîchement récolté",
                "product": "Manioc",
                "category": "Tubercules",
                "variety": "Blanc",
                "quantity": 1000,
                "unit": "kg",
                "price_per_unit": 200,
                "region": "Littoral",
                "locality": "Douala",
            },
            {
                "title": "Macabo de première qualité",
                "product": "Macabo",
                "category": "Tubercules",
                "variety": "Rouge",
                "quantity": 300,
                "unit": "kg",
                "price_per_unit": 450,
                "region": "Ouest",
                "locality": "Bafoussam",
            },
            {
                "title": "Tomates fraîches du jour",
                "product": "Tomate",
                "category": "Légumes",
                "variety": "Roma",
                "quantity": 200,
                "unit": "kg",
                "price_per_unit": 600,
                "region": "Nord-Ouest",
                "locality": "Bamenda",
            },
            {
                "title": "Poulets de chair prêts",
                "product": "Poulet",
                "category": "Volaille",
                "variety": "Cobb 500",
                "quantity": 50,
                "unit": "unité",
                "price_per_unit": 3500,
                "region": "Centre",
                "locality": "Yaoundé",
            },
        ]
        
        created_count = 0
        for listing_data in listings_data:
            # Vérifier si l'annonce existe déjà
            result = await session.execute(
                select(Listing).where(Listing.title == listing_data["title"])
            )
            existing = result.scalar_one_or_none()
            
            if not existing:
                listing = Listing(
                    id=uuid4(),
                    seller_id=user.id,
                    category_id=categories[listing_data["category"]].id,
                    product_ref_id=products[listing_data["product"]].id,
                    title=listing_data["title"],
                    variety=listing_data.get("variety"),
                    quantity=listing_data["quantity"],
                    unit=listing_data["unit"],
                    price_per_unit=listing_data["price_per_unit"],
                    currency="XAF",
                    region=listing_data["region"],
                    locality=listing_data.get("locality"),
                    status=ListingStatus.PUBLISHED,
                    created_at=datetime.utcnow()
                )
                session.add(listing)
                created_count += 1
        
        await session.commit()
        
        print(f"✅ {created_count} annonces créées!")
        print()
        
        # Afficher toutes les annonces
        result = await session.execute(select(Listing))
        all_listings = result.scalars().all()
        
        print(f"📋 Total: {len(all_listings)} annonces dans la base de données:")
        for listing in all_listings:
            print(f"  • {listing.title} - {listing.quantity} {listing.unit} à {listing.price_per_unit} XAF")
        
    await engine.dispose()
    print()
    print("✨ Terminé! Actualisez le Feed pour voir les annonces.")


if __name__ == "__main__":
    asyncio.run(seed_listings())
