"""
Mettre à jour TOUTES les annonces avec les vraies images locales du projet
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete
from app.core.config import settings
from app.models.marketplace import Listing, ListingPhoto
from uuid import uuid4


# Mapping: Titre de l'annonce -> Images locales
LISTING_IMAGES = {
    # AGRICULTURE
    "Macabo rouge de première qualité": [
        "/images/agriculture/bonne qualite de macabo.jpg",
        "/images/agriculture/arivage de 4 tone de macabo.jpg",
    ],
    "Manioc frais de qualité": [
        "/images/agriculture/bonmanioc.jpg",
        "/images/agriculture/arivage plat.jpg",
    ],
    "Tomates fraîches du jour": [
        "/images/agriculture/tomate de haute qualite.jpg",
        "/images/agriculture/letu selectioné.jpg",
    ],
    "Plantain mûr prêt à vendre": [
        "/images/agriculture/plantain mur.jpg",
        "/images/agriculture/banane cochon.jpg",
    ],
    "Cacao de qualité supérieure": [
        "/images/agriculture/cacao de mr etoga  750kg dispo.jpg",
    ],
    "Café arabica sélectionné": [
        "/images/agriculture/cafe de tolé.jpg",
        "/images/agriculture/cafe selectioné.jpg",
    ],
    "Patates douces de Tonga": [
        "/images/agriculture/ariivage  patate.jpg",
        "/images/agriculture/pomme de tonga.jpg",
    ],
    "Igname de Batibo": [
        "/images/agriculture/yam for batibo.jpg",
    ],
    "Maïs frais de qualité": [
        "/images/backgrounds/champs  de maise .jpg",
    ],
    
    # ÉLEVAGE
    "Poulets de chair 35 jours": [
        "/images/livestock/poulet de chaire 35 jour .jpg",
        "/images/livestock/poulet 35 jour ferme ndefo.jpg",
    ],
    "Poussins 21 jours à vendre": [
        "/images/livestock/vente pousin 21 jour .jpg",
    ],
    "Chèvres de Bazou": [
        "/images/livestock/chevre de bazou.jpg",
        "/images/livestock/chevre de l'ouest .jpg",
    ],
    "Porcs sans graisse": [
        "/images/livestock/porc female sans graisse .jpg",
        "/images/livestock/porc.jpg",
    ],
    "Porcelets race sélectionnée": [
        "/images/livestock/porcelet race selectioné.jpg",
        "/images/livestock/porcellet a vendre .jpg",
    ],
    "Lapins de chair albinos": [
        "/images/livestock/lapin de chaire a vendre .jpg",
        "/images/livestock/lapin de race albinous .jpg",
    ],
    "Poissons frais de Kribi": [
        "/images/livestock/bars bossu kribi.jpg",
        "/images/livestock/bars frais kribi.jpg",
    ],
    "Carpes de la Bénoué": [
        "/images/livestock/carpe grise de la benue.jpg",
        "/images/livestock/carpe rouge du lack .jpg",
    ],
    "Poulets de chair prêts": [
        "/images/livestock/poulet de chaire 35 jour .jpg",
        "/images/livestock/poulet 35 jour ferme ndefo.jpg",
    ],
    "Manioc fraîchement récolté": [
        "/images/agriculture/bonmanioc.jpg",
        "/images/agriculture/arivage plat.jpg",
    ],
}


async def update_images():
    """Mettre à jour toutes les images"""
    print("🔄 Mise à jour des images des annonces...")
    print(f"📊 URL: {settings.DATABASE_URL}")
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Supprimer TOUTES les photos existantes
        await session.execute(delete(ListingPhoto))
        await session.commit()
        print("🗑️  Anciennes photos supprimées")
        print()
        
        # Récupérer toutes les annonces
        result = await session.execute(select(Listing))
        listings = result.scalars().all()
        
        print(f"📋 {len(listings)} annonces trouvées")
        print()
        
        updated_count = 0
        for listing in listings:
            # Chercher les images pour cette annonce
            images = LISTING_IMAGES.get(listing.title)
            
            if not images:
                print(f"⚠️  Pas d'images pour: {listing.title}")
                continue
            
            # Ajouter les images
            for idx, image_url in enumerate(images):
                photo = ListingPhoto(
                    id=uuid4(),
                    listing_id=listing.id,
                    storage_key=image_url,
                    position=idx + 1
                )
                session.add(photo)
            
            updated_count += 1
            print(f"✅ {listing.title}: {len(images)} images")
        
        await session.commit()
        
        print()
        print(f"🎉 {updated_count} annonces mises à jour!")
        
    await engine.dispose()
    print()
    print("✨ Actualisez le Feed pour voir les nouvelles images!")


if __name__ == "__main__":
    asyncio.run(update_images())
