"""
Script pour créer des annonces de DÉMO avec TOUTES les images locales
Ces annonces sont pour le design/présentation de l'application
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User
from app.models.marketplace import Listing, Category, ProductRef, ListingStatus, ListingPhoto
from uuid import uuid4
from datetime import datetime


# Annonces de DÉMO avec images locales
DEMO_LISTINGS = [
    # AGRICULTURE
    {
        "title": "Macabo rouge de première qualité",
        "category": "Tubercules",
        "product": "Macabo",
        "variety": "Rouge",
        "quantity": 300,
        "unit": "kg",
        "price": 450,
        "region": "Ouest",
        "locality": "Bafoussam",
        "images": [
            "/images/agriculture/bonne qualite de macabo.jpg",
            "/images/agriculture/arivage de 4 tone de macabo.jpg",
        ]
    },
    {
        "title": "Manioc frais de qualité",
        "category": "Tubercules",
        "product": "Manioc",
        "variety": "Blanc",
        "quantity": 1000,
        "unit": "kg",
        "price": 200,
        "region": "Littoral",
        "locality": "Douala",
        "images": [
            "/images/agriculture/bonmanioc.jpg",
            "/images/agriculture/arivage plat.jpg",
        ]
    },
    {
        "title": "Tomates fraîches du jour",
        "category": "Légumes",
        "product": "Tomate",
        "variety": "Roma",
        "quantity": 200,
        "unit": "kg",
        "price": 600,
        "region": "Nord-Ouest",
        "locality": "Bamenda",
        "images": [
            "/images/agriculture/tomate de haute qualite.jpg",
            "/images/agriculture/letu selectioné.jpg",
        ]
    },
    {
        "title": "Plantain mûr prêt à vendre",
        "category": "Fruits",
        "product": "Plantain",
        "variety": "Mûr",
        "quantity": 500,
        "unit": "régime",
        "price": 1500,
        "region": "Sud-Ouest",
        "locality": "Buea",
        "images": [
            "/images/agriculture/plantain mur.jpg",
            "/images/agriculture/banane cochon.jpg",
        ]
    },
    {
        "title": "Cacao de qualité supérieure",
        "category": "Céréales",
        "product": "Cacao",
        "variety": "Fermenté",
        "quantity": 750,
        "unit": "kg",
        "price": 1200,
        "region": "Centre",
        "locality": "Yaoundé",
        "images": [
            "/images/agriculture/cacao de mr etoga  750kg dispo.jpg",
        ]
    },
    {
        "title": "Café arabica sélectionné",
        "category": "Céréales",
        "product": "Café",
        "variety": "Arabica",
        "quantity": 500,
        "unit": "kg",
        "price": 2500,
        "region": "Ouest",
        "locality": "Dschang",
        "images": [
            "/images/agriculture/cafe de tolé.jpg",
            "/images/agriculture/cafe selectioné.jpg",
        ]
    },
    {
        "title": "Patates douces de Tonga",
        "category": "Tubercules",
        "product": "Patate",
        "variety": "Douce",
        "quantity": 400,
        "unit": "kg",
        "price": 350,
        "region": "Ouest",
        "locality": "Tonga",
        "images": [
            "/images/agriculture/ariivage  patate.jpg",
            "/images/agriculture/pomme de tonga.jpg",
        ]
    },
    {
        "title": "Igname de Batibo",
        "category": "Tubercules",
        "product": "Igname",
        "quantity": 600,
        "unit": "kg",
        "price": 400,
        "region": "Nord-Ouest",
        "locality": "Batibo",
        "images": [
            "/images/agriculture/yam for batibo.jpg",
        ]
    },
    
    # ÉLEVAGE
    {
        "title": "Poulets de chair 35 jours",
        "category": "Volaille",
        "product": "Poulet",
        "variety": "Chair",
        "quantity": 50,
        "unit": "unité",
        "price": 3500,
        "region": "Centre",
        "locality": "Yaoundé",
        "images": [
            "/images/livestock/poulet de chaire 35 jour .jpg",
            "/images/livestock/poulet 35 jour ferme ndefo.jpg",
        ]
    },
    {
        "title": "Poussins 21 jours à vendre",
        "category": "Volaille",
        "product": "Poulet",
        "variety": "Poussin",
        "quantity": 100,
        "unit": "unité",
        "price": 1500,
        "region": "Centre",
        "locality": "Yaoundé",
        "images": [
            "/images/livestock/vente pousin 21 jour .jpg",
        ]
    },
    {
        "title": "Chèvres de Bazou",
        "category": "Bétail",
        "product": "Chèvre",
        "quantity": 10,
        "unit": "unité",
        "price": 25000,
        "region": "Ouest",
        "locality": "Bazou",
        "images": [
            "/images/livestock/chevre de bazou.jpg",
            "/images/livestock/chevre de l'ouest .jpg",
        ]
    },
    {
        "title": "Porcs sans graisse",
        "category": "Bétail",
        "product": "Porc",
        "variety": "Femelle",
        "quantity": 5,
        "unit": "unité",
        "price": 80000,
        "region": "Ouest",
        "locality": "Bafoussam",
        "images": [
            "/images/livestock/porc female sans graisse .jpg",
            "/images/livestock/porc.jpg",
        ]
    },
    {
        "title": "Porcelets race sélectionnée",
        "category": "Bétail",
        "product": "Porcelet",
        "quantity": 15,
        "unit": "unité",
        "price": 15000,
        "region": "Ouest",
        "locality": "Bafoussam",
        "images": [
            "/images/livestock/porcelet race selectioné.jpg",
            "/images/livestock/porcellet a vendre .jpg",
        ]
    },
    {
        "title": "Lapins de chair albinos",
        "category": "Bétail",
        "product": "Lapin",
        "variety": "Albinos",
        "quantity": 20,
        "unit": "unité",
        "price": 5000,
        "region": "Centre",
        "locality": "Yaoundé",
        "images": [
            "/images/livestock/lapin de chaire a vendre .jpg",
            "/images/livestock/lapin de race albinous .jpg",
        ]
    },
    {
        "title": "Poissons frais de Kribi",
        "category": "Bétail",
        "product": "Poisson",
        "variety": "Bars",
        "quantity": 100,
        "unit": "kg",
        "price": 2500,
        "region": "Sud",
        "locality": "Kribi",
        "images": [
            "/images/livestock/bars bossu kribi.jpg",
            "/images/livestock/bars frais kribi.jpg",
        ]
    },
    {
        "title": "Carpes de la Bénoué",
        "category": "Bétail",
        "product": "Poisson",
        "variety": "Carpe",
        "quantity": 80,
        "unit": "kg",
        "price": 2000,
        "region": "Nord",
        "locality": "Garoua",
        "images": [
            "/images/livestock/carpe grise de la benue.jpg",
            "/images/livestock/carpe rouge du lack .jpg",
        ]
    },
]


async def seed_demo():
    """Créer les annonces de démo"""
    print("🎨 Création des annonces de DÉMO...")
    print(f"📊 URL: {settings.DATABASE_URL}")
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Récupérer le premier utilisateur
        result = await session.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ Aucun utilisateur trouvé!")
            return
        
        print(f"✅ Utilisateur: {user.phone}")
        print()
        
        # Récupérer les catégories et produits
        categories = {}
        result = await session.execute(select(Category))
        for cat in result.scalars().all():
            categories[cat.name_fr] = cat
        
        products = {}
        result = await session.execute(select(ProductRef))
        for prod in result.scalars().all():
            products[prod.name_fr] = prod
        
        created_count = 0
        for listing_data in DEMO_LISTINGS:
            # Vérifier si existe déjà
            result = await session.execute(
                select(Listing).where(Listing.title == listing_data["title"])
            )
            if result.scalar_one_or_none():
                print(f"⏭️  {listing_data['title']} existe déjà")
                continue
            
            # Créer l'annonce
            listing = Listing(
                id=uuid4(),
                seller_id=user.id,
                category_id=categories.get(listing_data["category"]).id if listing_data.get("category") in categories else None,
                product_ref_id=products.get(listing_data["product"]).id if listing_data.get("product") in products else None,
                title=listing_data["title"],
                variety=listing_data.get("variety"),
                quantity=listing_data["quantity"],
                unit=listing_data["unit"],
                price_per_unit=listing_data["price"],
                currency="XAF",
                region=listing_data["region"],
                locality=listing_data.get("locality"),
                status=ListingStatus.PUBLISHED,
                created_at=datetime.utcnow()
            )
            session.add(listing)
            await session.flush()
            
            # Ajouter les images
            for idx, image_url in enumerate(listing_data.get("images", [])):
                photo = ListingPhoto(
                    id=uuid4(),
                    listing_id=listing.id,
                    storage_key=image_url,
                    position=idx + 1
                )
                session.add(photo)
            
            created_count += 1
            print(f"✅ {listing_data['title']}: {len(listing_data.get('images', []))} images")
        
        await session.commit()
        
        print()
        print(f"🎉 {created_count} annonces de démo créées!")
        
        # Afficher le total
        result = await session.execute(select(Listing))
        total = len(result.scalars().all())
        print(f"📊 Total: {total} annonces dans la base")
        
    await engine.dispose()
    print()
    print("✨ Actualisez le Feed pour voir toutes les annonces!")


if __name__ == "__main__":
    asyncio.run(seed_demo())
