"""
FORCER L'INSTALLATION DE TOUTES LES IMAGES LOCALES
Chaque annonce aura ses vraies images du dossier public/images
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete
from app.core.config import settings
from app.models.marketplace import Listing, ListingPhoto
from uuid import uuid4


# MAPPING COMPLET: Titre exact -> Images exactes du dossier
COMPLETE_IMAGE_MAPPING = {
    # AGRICULTURE - Toutes les images du dossier
    "Maïs frais de qualité": [
        "/images/backgrounds/champs  de maise .jpg",
    ],
    "Manioc fraîchement récolté": [
        "/images/agriculture/bonmanioc.jpg",
        "/images/agriculture/arivage plat.jpg",
    ],
    "Macabo de première qualité": [
        "/images/agriculture/bonne qualite de macabo.jpg",
        "/images/agriculture/arivage de 4 tone de macabo.jpg",
    ],
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
    
    # ÉLEVAGE - Toutes les images du dossier
    "Poulets de chair 35 jours": [
        "/images/livestock/poulet de chaire 35 jour .jpg",
        "/images/livestock/poulet 35 jour ferme ndefo.jpg",
    ],
    "Poulets de chair prêts": [
        "/images/livestock/poulet de chaire 35 jour .jpg",
        "/images/livestock/poulet 35 jour ferme ndefo.jpg",
    ],
    "Poussins 21 jours à vendre": [
        "/images/livestock/vente pousin 21 jour .jpg",
    ],
    "Chèvres de Bazou": [
        "/images/livestock/chevre de bazou.jpg",
        "/images/livestock/chevre de l'ouest .jpg",
        "/images/livestock/chevre  marché 8 eme .jpg",
    ],
    "Porcs sans graisse": [
        "/images/livestock/porc female sans graisse .jpg",
        "/images/livestock/porc.jpg",
        "/images/livestock/pourc long chassi.jpg",
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
        "/images/livestock/pioson frais.jpg",
    ],
    "Carpes de la Bénoué": [
        "/images/livestock/carpe grise de la benue.jpg",
        "/images/livestock/carpe rouge du lack .jpg",
    ],
}


async def force_all_images():
    """Forcer l'installation de TOUTES les images"""
    print("=" * 80)
    print("🔧 FORÇAGE DE L'INSTALLATION DE TOUTES LES IMAGES")
    print("=" * 80)
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # 1. SUPPRIMER TOUTES LES PHOTOS EXISTANTES
        print("🗑️  Suppression de toutes les anciennes photos...")
        await session.execute(delete(ListingPhoto))
        await session.commit()
        print("   ✅ Toutes les anciennes photos supprimées")
        print()
        
        # 2. RÉCUPÉRER TOUTES LES ANNONCES
        result = await session.execute(select(Listing))
        listings = result.scalars().all()
        
        print(f"📋 {len(listings)} annonces trouvées")
        print()
        
        # 3. AJOUTER LES IMAGES POUR CHAQUE ANNONCE
        total_images = 0
        success_count = 0
        missing_count = 0
        
        for listing in listings:
            images = COMPLETE_IMAGE_MAPPING.get(listing.title)
            
            if not images:
                print(f"⚠️  MANQUANT: {listing.title}")
                missing_count += 1
                continue
            
            # Ajouter toutes les images
            for idx, image_url in enumerate(images):
                photo = ListingPhoto(
                    id=uuid4(),
                    listing_id=listing.id,
                    storage_key=image_url,
                    position=idx + 1
                )
                session.add(photo)
                total_images += 1
            
            success_count += 1
            print(f"✅ {listing.title}: {len(images)} image(s)")
        
        await session.commit()
        
        print()
        print("=" * 80)
        print("📊 RÉSULTAT FINAL")
        print("=" * 80)
        print(f"✅ Annonces avec images: {success_count}")
        print(f"⚠️  Annonces sans images: {missing_count}")
        print(f"🖼️  Total d'images ajoutées: {total_images}")
        print()
        
        if missing_count > 0:
            print("⚠️  ATTENTION: Certaines annonces n'ont pas d'images!")
            print("   Vérifiez les titres ci-dessus et ajoutez-les au mapping.")
        else:
            print("🎉 PARFAIT! Toutes les annonces ont leurs images!")
        
        print()
        print("=" * 80)
        
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(force_all_images())
