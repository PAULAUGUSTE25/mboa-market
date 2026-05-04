"""
Afficher TOUS les utilisateurs avec leurs coordonnées exactes
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User, Profile


async def show_users():
    """Afficher tous les utilisateurs"""
    print("=" * 70)
    print("👥 TOUS LES UTILISATEURS ENREGISTRÉS")
    print("=" * 70)
    print()
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Récupérer tous les utilisateurs
        result = await session.execute(select(User))
        users = result.scalars().all()
        
        if not users:
            print("❌ Aucun utilisateur trouvé!")
            return
        
        print(f"📊 {len(users)} utilisateur(s) trouvé(s)")
        print()
        
        for idx, user in enumerate(users, 1):
            print(f"{'=' * 70}")
            print(f"UTILISATEUR #{idx}")
            print(f"{'=' * 70}")
            print(f"📱 Téléphone: {user.phone}")
            print(f"📧 Email: {user.email if user.email else 'Pas d\'email'}")
            print(f"🔑 ID: {user.id}")
            print(f"📊 Statut: {user.status}")
            print(f"📅 Créé le: {user.created_at}")
            print()
            
            # Récupérer le profil
            result = await session.execute(
                select(Profile).where(Profile.user_id == user.id)
            )
            profile = result.scalar_one_or_none()
            
            if profile:
                print(f"👤 PROFIL:")
                print(f"   Nom: {profile.display_name}")
                print(f"   Domaine: {profile.domain}")
                print(f"   Type: {profile.activity_type}")
                print(f"   Région: {profile.region}")
                print(f"   Localité: {profile.locality if profile.locality else 'Non spécifiée'}")
            else:
                print(f"⚠️  Pas de profil associé")
            
            print()
            print(f"🔐 POUR SE CONNECTER:")
            print(f"   Téléphone: {user.phone}")
            print(f"   Mot de passe: [Le mot de passe que vous avez utilisé lors de l'inscription]")
            print()
        
        print("=" * 70)
        print("💡 NOTES IMPORTANTES:")
        print("=" * 70)
        print("1. Le mot de passe n'est PAS stocké en clair (sécurité)")
        print("2. Utilisez le téléphone EXACT comme indiqué ci-dessus")
        print("3. Si vous avez oublié le mot de passe, créez un nouvel utilisateur")
        print()
        print("🔧 Pour créer un nouvel utilisateur de test:")
        print("   python create_new_test_user.py")
        print()
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(show_users())
