"""
SOLUTION RAPIDE: Encoder les URLs d'images pour qu'elles fonctionnent dans le navigateur
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.marketplace import ListingPhoto
from urllib.parse import quote


async def fix_urls():
    """Encoder les URLs d'images"""
    print("🔧 Correction des URLs d'images...")
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(ListingPhoto))
        photos = result.scalars().all()
        
        print(f"📸 {len(photos)} photos trouvées")
        print()
        
        fixed_count = 0
        for photo in photos:
            # Encoder seulement le nom du fichier, pas le chemin complet
            parts = photo.storage_key.split('/')
            filename = parts[-1]
            encoded_filename = quote(filename)
            
            if filename != encoded_filename:
                old_key = photo.storage_key
                photo.storage_key = '/'.join(parts[:-1]) + '/' + encoded_filename
                fixed_count += 1
                print(f"✅ {old_key}")
                print(f"   → {photo.storage_key}")
        
        await session.commit()
        
        print()
        print(f"🎉 {fixed_count} URLs corrigées!")
        
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(fix_urls())
