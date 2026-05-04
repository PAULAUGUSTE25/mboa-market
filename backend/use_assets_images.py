"""
Utiliser les images depuis src/assets au lieu de public
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete
from app.core.config import settings
from app.models.marketplace import Listing, ListingPhoto
from uuid import uuid4


# VOS VRAIES IMAGES - maintenant dans src/assets
REAL_IMAGES = {
    "Maïs frais de qualité": [
        "/src/assets/images/backgrounds/champs_de_maise.jpg",
    ],
    "Manioc fraîchement récolté": [
        "/src/assets/images/agriculture/bonmanioc.jpg",
        "/src/assets/images/agriculture/arivage_plat.jpg",
    ],
    "Macabo de première qualité": [
        "/src/assets/images/agriculture/bonne_qualite_de_macabo.jpg",
        "/src/assets/images/agriculture/arivage_de_4_tone_de_macabo.jpg",
    ],
    "Macabo rouge de première qualité": [
        "/src/assets/images/agriculture/bonne_qualite_de_macabo.jpg",
        "/src/assets/images/agriculture/arivage_de_4_tone_de_macabo.jpg",
    ],
    "Manioc frais de qualité": [
        "/src/assets/images/agriculture/bonmanioc.jpg",
        "/src/assets/images/agriculture/arivage_plat.jpg",
    ],
    "Tomates fraîches du jour": [
        "/src/assets/images/agriculture/tomate_de_haute_qualite.jpg",
        "/src/assets/images/agriculture/letu_selectioné.jpg",
    ],
    "Plantain mûr prêt à vendre": [
        "/src/assets/images/agriculture/plantain_mur.jpg",
        "/src/assets/images/agriculture/banane_cochon.jpg",
    ],
    "Cacao de qualité supérieure": [
        "/src/assets/images/agriculture/cacao_de_mr_etoga_750kg_dispo.jpg",
    ],
    "Café arabica sélectionné": [
        "/src/assets/images/agriculture/cafe_de_tolé.jpg",
        "/src/assets/images/agriculture/cafe_selectioné.jpg",
    ],
    "Patates douces de Tonga": [
        "/src/assets/images/agriculture/ariivage_patate.jpg",
        "/src/assets/images/agriculture/pomme_de_tonga.jpg",
    ],
    "Igname de Batibo": [
        "/src/assets/images/agriculture/yam_for_batibo.jpg",
    ],
    "Poulets de chair 35 jours": [
        "/src/assets/images/livestock/poulet_de_chaire_35_jour.jpg",
        "/src/assets/images/livestock/poulet_35_jour_ferme_ndefo.jpg",
    ],
    "Poulets de chair prêts": [
        "/src/assets/images/livestock/poulet_de_chaire_35_jour.jpg",
        "/src/assets/images/livestock/poulet_35_jour_ferme_ndefo.jpg",
    ],
    "Poussins 21 jours à vendre": [
        "/src/assets/images/livestock/vente_pousin_21_jour.jpg",
    ],
    "Chèvres de Bazou": [
        "/src/assets/images/livestock/chevre_de_bazou.jpg",
        "/src/assets/images/livestock/chevre_de_louest.jpg",
        "/src/assets/images/livestock/chevre_marché_8_eme.jpg",
    ],
    "Porcs sans graisse": [
        "/src/assets/images/livestock/porc_female_sans_graisse.jpg",
        "/src/assets/images/livestock/porc.jpg",
        "/src/assets/images/livestock/pourc_long_chassi.jpg",
    ],
    "Porcelets race sélectionnée": [
        "/src/assets/images/livestock/porcelet_race_selectioné.jpg",
        "/src/assets/images/livestock/porcellet_a_vendre.jpg",
    ],
    "Lapins de chair albinos": [
        "/src/assets/images/livestock/lapin_de_chaire_a_vendre.jpg",
        "/src/assets/images/livestock/lapin_de_race_albinous.jpg",
    ],
    "Poissons frais de Kribi": [
        "/src/assets/images/livestock/bars_bossu_kribi.jpg",
        "/src/assets/images/livestock/bars_frais_kribi.jpg",
        "/src/assets/images/livestock/pioson_frais.jpg",
    ],
    "Carpes de la Bénoué": [
        "/src/assets/images/livestock/carpe_grise_de_la_benue.jpg",
        "/src/assets/images/livestock/carpe_rouge_du_lack.jpg",
    ],
}


async def use_assets():
    """Utiliser les images depuis assets"""
    print("🎨 Utilisation de VOS VRAIES IMAGES depuis src/assets")
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        await session.execute(delete(ListingPhoto))
        await session.commit()
        print("✅ Anciennes photos supprimées")
        print()
        
        result = await session.execute(select(Listing))
        listings = result.scalars().all()
        
        total = 0
        for listing in listings:
            images = REAL_IMAGES.get(listing.title)
            
            if images:
                for idx, url in enumerate(images):
                    photo = ListingPhoto(
                        id=uuid4(),
                        listing_id=listing.id,
                        storage_key=url,
                        position=idx + 1
                    )
                    session.add(photo)
                    total += 1
                
                print(f"✅ {listing.title}: {len(images)} image(s)")
        
        await session.commit()
        
        print()
        print(f"🎉 {total} de VOS images ajoutées!")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(use_assets())
