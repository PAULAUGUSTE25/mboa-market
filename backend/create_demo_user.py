"""
Créer un utilisateur de DÉMONSTRATION avec mot de passe connu
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User, Profile, UserStatus
from app.core.security import get_password_hash
from uuid import uuid4


async def create_demo_user():
    """Créer un utilisateur de démo"""
    print("=" * 70)
    print("🎯 CRÉATION D'UN UTILISATEUR DE DÉMONSTRATION")
    print("=" * 70)
    print()
    
    # Informations du compte de démo
    DEMO_PHONE = "+237123456789"
    DEMO_PASSWORD = "Demo@2026"
    DEMO_NAME = "Démo Présentation"
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Vérifier si l'utilisateur existe déjà
        result = await session.execute(
            select(User).where(User.phone == DEMO_PHONE)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"⚠️  L'utilisateur {DEMO_PHONE} existe déjà!")
            print(f"   Suppression de l'ancien compte...")
            
            # Supprimer le profil
            result = await session.execute(
                select(Profile).where(Profile.user_id == existing_user.id)
            )
            profile = result.scalar_one_or_none()
            if profile:
                await session.delete(profile)
            
            # Supprimer l'utilisateur
            await session.delete(existing_user)
            await session.commit()
            print(f"   ✅ Ancien compte supprimé")
            print()
        
        # Créer le nouvel utilisateur
        user_id = uuid4()
        
        user = User(
            id=user_id,
            phone=DEMO_PHONE,
            password_hash=get_password_hash(DEMO_PASSWORD),
            status=UserStatus.ACTIVE
        )
        session.add(user)
        await session.flush()
        
        # Créer le profil
        profile = Profile(
            id=uuid4(),
            user_id=user_id,
            display_name=DEMO_NAME,
            activity_type="producer",
            domain="agriculture",
            region="Centre",
            locality="Yaoundé"
        )
        session.add(profile)
        
        await session.commit()
        
        print("✅ UTILISATEUR DE DÉMO CRÉÉ AVEC SUCCÈS!")
        print()
        print("=" * 70)
        print("🔐 COORDONNÉES DE CONNEXION")
        print("=" * 70)
        print(f"📱 Téléphone: {DEMO_PHONE}")
        print(f"🔑 Mot de passe: {DEMO_PASSWORD}")
        print()
        print("👤 PROFIL:")
        print(f"   Nom: {DEMO_NAME}")
        print(f"   Domaine: agriculture")
        print(f"   Type: producteur")
        print(f"   Région: Centre (Yaoundé)")
        print()
        print("=" * 70)
        print("💡 UTILISEZ CES COORDONNÉES POUR VOTRE PRÉSENTATION!")
        print("=" * 70)
        print()
        print("🌐 URL de connexion: http://localhost:5173/login")
        print()
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_demo_user())
