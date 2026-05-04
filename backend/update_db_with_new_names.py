"""
Mettre à jour la DB avec les nouveaux noms de fichiers
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete
from app.core.config import settings
from app.models.marketplace import Listing, ListingPhoto
from uuid import uuid4


# NOUVEAU MAPPING avec les noms nettoyés
NEW_MAPPING = {
    "Maïs frais de qualité": [
        "/images/backgrounds/champs_de_maise.jpg",
    ],
    "Manioc fraîchement récolté": [
        "/images/agriculture/bonmanioc.jpg",
        "/images/agriculture/arivage_plat.jpg",
    ],
    "Macabo de première qualité": [
        "/images/agriculture/bonne_qualite_de_macabo.jpg",
        "/images/agriculture/arivage_de_4_tone_de_macabo.jpg",
    ],
    "Macabo rouge de première qualité": [
        "/images/agriculture/bonne_qualite_de_macabo.jpg",
        "/images/agriculture/arivage_de_4_tone_de_macabo.jpg",
    ],
    "Manioc frais de qualité": [
        "/images/agriculture/bonmanioc.jpg",
        "/images/agriculture/arivage_plat.jpg",
    ],
    "Tomates fraîches du jour": [
        "/images/agriculture/tomate_de_haute_qualite.jpg",
        "/images/agriculture/letu_selectioné.jpg",
    ],
    "Plantain mûr prêt à vendre": [
        "/images/agriculture/plantain_mur.jpg",
        "/images/agriculture/banane_cochon.jpg",
    ],
    "Cacao de qualité supérieure": [
        "/images/agriculture/cacao_de_mr_etoga_750kg_dispo.jpg",
    ],
    "Café arabica sélectionné": [
        "/images/agriculture/cafe_de_tolé.jpg",
        "/images/agriculture/cafe_selectioné.jpg",
    ],
    "Patates douces de Tonga": [
        "/images/agriculture/ariivage_patate.jpg",
        "/images/agriculture/pomme_de_tonga.jpg",
    ],
    "Igname de Batibo": [
        "/images/agriculture/yam_for_batibo.jpg",
    ],
    "Poulets de chair 35 jours": [
        "/images/livestock/poulet_de_chaire_35_jour.jpg",
        "/images/livestock/poulet_35_jour_ferme_ndefo.jpg",
    ],
    "Poulets de chair prêts": [
        "/images/livestock/poulet_de_chaire_35_jour.jpg",
        "/images/livestock/poulet_35_jour_ferme_ndefo.jpg",
    ],
    "Poussins 21 jours à vendre": [
        "/images/livestock/vente_pousin_21_jour.jpg",
    ],
    "Chèvres de Bazou": [
        "/images/livestock/chevre_de_bazou.jpg",
        "/images/livestock/chevre_de_louest.jpg",
        "/images/livestock/chevre_marché_8_eme.jpg",
    ],
    "Porcs sans graisse": [
        "/images/livestock/porc_female_sans_graisse.jpg",
        "/images/livestock/porc.jpg",
        "/images/livestock/pourc_long_chassi.jpg",
    ],
    "Porcelets race sélectionnée": [
        "/images/livestock/porcelet_race_selectioné.jpg",
        "/images/livestock/porcellet_a_vendre.jpg",
    ],
    "Lapins de chair albinos": [
        "/images/livestock/lapin_de_chaire_a_vendre.jpg",
        "/images/livestock/lapin_de_race_albinous.jpg",
    ],
    "Poissons frais de Kribi": [
        "/images/livestock/bars_bossu_kribi.jpg",
        "/images/livestock/bars_frais_kribi.jpg",
        "/images/livestock/pioson_frais.jpg",
    ],
    "Carpes de la Bénoué": [
        "/images/livestock/carpe_grise_de_la_benue.jpg",
        "/images/livestock/carpe_rouge_du_lack.jpg",
    ],
}


async def update_db():
    """Mettre à jour la DB"""
    print("🔄 Mise à jour de la base de données avec les nouveaux noms...")
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Supprimer toutes les photos
        await session.execute(delete(ListingPhoto))
        await session.commit()
        print("✅ Anciennes photos supprimées")
        print()
        
        # Récupérer toutes les annonces
        result = await session.execute(select(Listing))
        listings = result.scalars().all()
        
        total_images = 0
        for listing in listings:
            images = NEW_MAPPING.get(listing.title)
            
            if images:
                for idx, image_url in enumerate(images):
                    photo = ListingPhoto(
                        id=uuid4(),
                        listing_id=listing.id,
                        storage_key=image_url,
                        position=idx + 1
                    )
                    session.add(photo)
                    total_images += 1
                
                print(f"✅ {listing.title}: {len(images)} image(s)")
        
        await session.commit()
        
        print()
        print(f"🎉 {total_images} images ajoutées avec les nouveaux noms!")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(update_db())
