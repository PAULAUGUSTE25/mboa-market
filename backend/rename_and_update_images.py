"""
RENOMMER TOUS LES FICHIERS IMAGES ET METTRE À JOUR LA BASE DE DONNÉES
Solution complète en un seul script!
"""
import os
import re
import asyncio
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.marketplace import ListingPhoto


def clean_filename(filename):
    """Nettoyer le nom de fichier"""
    # Séparer nom et extension
    name, ext = os.path.splitext(filename)
    
    # Remplacer espaces par underscores
    cleaned = name.replace(' ', '_')
    
    # Enlever caractères spéciaux sauf underscore et tiret
    cleaned = re.sub(r'[^\w\-]', '', cleaned)
    
    # Enlever underscores multiples
    cleaned = re.sub(r'_+', '_', cleaned)
    
    # Enlever underscores au début et à la fin
    cleaned = cleaned.strip('_')
    
    # Mettre en minuscules
    cleaned = cleaned.lower()
    
    return cleaned + ext.lower()


async def rename_and_update():
    """Renommer les fichiers et mettre à jour la DB"""
    print("=" * 80)
    print("🔧 RENOMMAGE DE TOUS LES FICHIERS IMAGES")
    print("=" * 80)
    print()
    
    # 1. RENOMMER LES FICHIERS
    image_dir = Path(r"C:\Users\HP\Desktop\mboa-market\frontend\public\images")
    mapping = {}  # ancien_chemin -> nouveau_chemin
    
    print("📁 Parcours des fichiers...")
    print()
    
    renamed_count = 0
    for root, dirs, files in os.walk(image_dir):
        for filename in files:
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                old_path = Path(root) / filename
                new_filename = clean_filename(filename)
                
                if filename != new_filename:
                    new_path = Path(root) / new_filename
                    
                    # Gérer les doublons
                    counter = 1
                    while new_path.exists():
                        name, ext = os.path.splitext(new_filename)
                        new_filename = f"{name}_{counter}{ext}"
                        new_path = Path(root) / new_filename
                        counter += 1
                    
                    # Calculer les chemins relatifs
                    old_relative = '/' + str(old_path.relative_to(image_dir.parent)).replace('\\', '/')
                    new_relative = '/' + str(new_path.relative_to(image_dir.parent)).replace('\\', '/')
                    
                    # Renommer le fichier
                    os.rename(old_path, new_path)
                    mapping[old_relative] = new_relative
                    
                    print(f"✅ {filename}")
                    print(f"   → {new_filename}")
                    renamed_count += 1
    
    print()
    print(f"🎉 {renamed_count} fichiers renommés!")
    print()
    
    # 2. METTRE À JOUR LA BASE DE DONNÉES
    if mapping:
        print("📊 Mise à jour de la base de données...")
        print()
        
        engine = create_async_engine(settings.DATABASE_URL, echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            result = await session.execute(select(ListingPhoto))
            photos = result.scalars().all()
            
            updated_count = 0
            for photo in photos:
                if photo.storage_key in mapping:
                    old_key = photo.storage_key
                    photo.storage_key = mapping[old_key]
                    updated_count += 1
                    print(f"✅ DB: {old_key}")
                    print(f"      → {photo.storage_key}")
            
            await session.commit()
            
            print()
            print(f"🎉 {updated_count} entrées mises à jour dans la DB!")
        
        await engine.dispose()
    
    print()
    print("=" * 80)
    print("✅ TERMINÉ! TOUS LES FICHIERS SONT RENOMMÉS!")
    print("=" * 80)
    print()
    print("🌐 Actualisez maintenant le Feed: http://localhost:5173/feed")
    print()


if __name__ == "__main__":
    asyncio.run(rename_and_update())
