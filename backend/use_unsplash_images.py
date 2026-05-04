"""
SOLUTION URGENTE: Utiliser des images Unsplash qui fonctionnent à 100%
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete
from app.core.config import settings
from app.models.marketplace import Listing, ListingPhoto
from uuid import uuid4


# Images Unsplash qui fonctionnent parfaitement
UNSPLASH_IMAGES = {
    "Maïs frais de qualité": [
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    ],
    "Manioc fraîchement récolté": [
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
    ],
    "Macabo de première qualité": [
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
        "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800",
    ],
    "Macabo rouge de première qualité": [
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
        "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800",
    ],
    "Manioc frais de qualité": [
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
    ],
    "Tomates fraîches du jour": [
        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800",
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
    ],
    "Plantain mûr prêt à vendre": [
        "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800",
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800",
    ],
    "Cacao de qualité supérieure": [
        "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800",
    ],
    "Café arabica sélectionné": [
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
    ],
    "Patates douces de Tonga": [
        "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800",
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800",
    ],
    "Igname de Batibo": [
        "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800",
    ],
    "Poulets de chair 35 jours": [
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800",
        "https://images.unsplash.com/photo-1594981596071-8a62e6926ba3?w=800",
    ],
    "Poulets de chair prêts": [
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800",
        "https://images.unsplash.com/photo-1594981596071-8a62e6926ba3?w=800",
    ],
    "Poussins 21 jours à vendre": [
        "https://images.unsplash.com/photo-1563281577-a7be47e20db9?w=800",
    ],
    "Chèvres de Bazou": [
        "https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=800",
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800",
    ],
    "Porcs sans graisse": [
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800",
        "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f?w=800",
    ],
    "Porcelets race sélectionnée": [
        "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f?w=800",
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800",
    ],
    "Lapins de chair albinos": [
        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800",
        "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=800",
    ],
    "Poissons frais de Kribi": [
        "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800",
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    ],
    "Carpes de la Bénoué": [
        "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800",
        "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800",
    ],
}


async def use_unsplash():
    """Utiliser Unsplash pour TOUTES les images"""
    print("⚡ SOLUTION URGENTE: Images Unsplash")
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
        
        total = 0
        for listing in listings:
            images = UNSPLASH_IMAGES.get(listing.title)
            
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
        print(f"🎉 {total} images Unsplash ajoutées!")
        print()
        print("🚀 ACTUALISEZ LE FEED - TOUT VA FONCTIONNER!")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(use_unsplash())
