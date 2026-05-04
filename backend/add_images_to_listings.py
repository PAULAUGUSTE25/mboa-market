"""
Script pour ajouter des images aux annonces existantes
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.marketplace import Listing, ListingPhoto
from uuid import uuid4


# Images par type de produit (images locales du projet - DESIGN/DEMO)
PRODUCT_IMAGES = {
    "Maïs": [
        "/images/backgrounds/champs  de maise .jpg",
        "/images/agriculture/bonmanioc.jpg",
    ],
    "Manioc": [
        "/images/agriculture/bonmanioc.jpg",
        "/images/agriculture/arivage plat.jpg",
    ],
    "Macabo": [
        "/images/agriculture/bonne qualite de macabo.jpg",
        "/images/agriculture/arivage de 4 tone de macabo.jpg",
    ],
    "Tomate": [
        "/images/agriculture/tomate de haute qualite.jpg",
        "/images/agriculture/letu selectioné.jpg",
    ],
    "Poulet": [
        "/images/livestock/poulet de chaire 35 jour .jpg",
        "/images/livestock/poulet 35 jour ferme ndefo.jpg",
    ],
    "Plantain": [
        "/images/agriculture/plantain mur.jpg",
        "/images/agriculture/banane cochon.jpg",
    ],
    "Cacao": [
        "/images/agriculture/cacao de mr etoga  750kg dispo.jpg",
    ],
    "Café": [
        "/images/agriculture/cafe de tolé.jpg",
        "/images/agriculture/cafe selectioné.jpg",
    ],
    "Patate": [
        "/images/agriculture/ariivage  patate.jpg",
        "/images/agriculture/pomme de tonga.jpg",
    ],
    "Igname": [
        "/images/agriculture/yam for batibo.jpg",
    ],
    "Chèvre": [
        "/images/livestock/chevre de bazou.jpg",
        "/images/livestock/chevre de l'ouest .jpg",
    ],
    "Porc": [
        "/images/livestock/porc female sans graisse .jpg",
        "/images/livestock/porc.jpg",
    ],
    "Porcelet": [
        "/images/livestock/porcelet race selectioné.jpg",
        "/images/livestock/porcellet a vendre .jpg",
    ],
    "Lapin": [
        "/images/livestock/lapin de chaire a vendre .jpg",
        "/images/livestock/lapin de race albinous .jpg",
    ],
    "Poisson": [
        "/images/livestock/bars bossu kribi.jpg",
        "/images/livestock/bars frais kribi.jpg",
        "/images/livestock/carpe grise de la benue.jpg",
    ],
}


async def add_images():
    """Ajouter des images aux annonces"""
    print("🖼️  Ajout d'images aux annonces...")
    print(f"📊 URL: {settings.DATABASE_URL}")
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Récupérer toutes les annonces
        result = await session.execute(select(Listing))
        listings = result.scalars().all()
        
        print(f"📋 {len(listings)} annonces trouvées")
        print()
        
        added_count = 0
        for listing in listings:
            # Déterminer le type de produit à partir du titre
            product_type = None
            for product_name in PRODUCT_IMAGES.keys():
                if product_name.lower() in listing.title.lower():
                    product_type = product_name
                    break
            
            if not product_type:
                print(f"⚠️  Pas d'image pour: {listing.title}")
                continue
            
            # Vérifier si l'annonce a déjà des photos
            result = await session.execute(
                select(ListingPhoto).where(ListingPhoto.listing_id == listing.id)
            )
            existing_photos = result.scalars().all()
            
            if existing_photos:
                print(f"✅ {listing.title} a déjà {len(existing_photos)} photo(s)")
                continue
            
            # Ajouter les images
            images = PRODUCT_IMAGES[product_type]
            for idx, image_url in enumerate(images):
                photo = ListingPhoto(
                    id=uuid4(),
                    listing_id=listing.id,
                    storage_key=image_url,  # On utilise l'URL directement
                    position=idx + 1  # Position commence à 1
                )
                session.add(photo)
                added_count += 1
            
            print(f"✅ {listing.title}: {len(images)} images ajoutées")
        
        await session.commit()
        
        print()
        print(f"🎉 {added_count} images ajoutées au total!")
        
    await engine.dispose()
    print()
    print("✨ Terminé! Actualisez le Feed pour voir les images.")


if __name__ == "__main__":
    asyncio.run(add_images())
