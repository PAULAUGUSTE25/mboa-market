"""
Script de migration SQLite vers PostgreSQL
Transfère toutes les données existantes de SQLite vers PostgreSQL
"""
import asyncio
from sqlalchemy import create_engine, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, Session
from app.core.database import Base
from app.models.user import User
from app.models.profile import Profile
from app.models.listing import Listing


async def migrate_data():
    """Migrer les données de SQLite vers PostgreSQL"""
    print("🔄 Migration SQLite → PostgreSQL")
    print("="*60)
    
    # Connexion SQLite (source)
    sqlite_engine = create_engine("sqlite:///./mboa_market.db")
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    
    # Connexion PostgreSQL (destination)
    postgres_url = "postgresql+asyncpg://mboa_user:mboa_password@localhost:5432/mboa_market"
    postgres_engine = create_async_engine(postgres_url, echo=False)
    PostgresSession = sessionmaker(
        postgres_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    # Créer les tables PostgreSQL
    print("\n📋 Création des tables PostgreSQL...")
    async with postgres_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables créées!")
    
    # Migrer les utilisateurs
    print("\n👥 Migration des utilisateurs...")
    with SQLiteSession() as sqlite_session:
        users = sqlite_session.query(User).all()
        print(f"   Trouvé {len(users)} utilisateurs")
        
        async with PostgresSession() as postgres_session:
            for user in users:
                new_user = User(
                    id=user.id,
                    phone=user.phone,
                    hashed_password=user.hashed_password,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                )
                postgres_session.add(new_user)
            
            await postgres_session.commit()
            print(f"✅ {len(users)} utilisateurs migrés")
    
    # Migrer les profils
    print("\n📝 Migration des profils...")
    with SQLiteSession() as sqlite_session:
        profiles = sqlite_session.query(Profile).all()
        print(f"   Trouvé {len(profiles)} profils")
        
        async with PostgresSession() as postgres_session:
            for profile in profiles:
                new_profile = Profile(
                    id=profile.id,
                    user_id=profile.user_id,
                    display_name=profile.display_name,
                    domain=profile.domain,
                    activity_type=profile.activity_type,
                    location=profile.location,
                    bio=profile.bio,
                    avatar_url=profile.avatar_url,
                    created_at=profile.created_at,
                    updated_at=profile.updated_at
                )
                postgres_session.add(new_profile)
            
            await postgres_session.commit()
            print(f"✅ {len(profiles)} profils migrés")
    
    # Migrer les annonces
    print("\n📦 Migration des annonces...")
    with SQLiteSession() as sqlite_session:
        listings = sqlite_session.query(Listing).all()
        print(f"   Trouvé {len(listings)} annonces")
        
        async with PostgresSession() as postgres_session:
            for listing in listings:
                new_listing = Listing(
                    id=listing.id,
                    seller_id=listing.seller_id,
                    title=listing.title,
                    description=listing.description,
                    category=listing.category,
                    price=listing.price,
                    quantity=listing.quantity,
                    unit=listing.unit,
                    location=listing.location,
                    images=listing.images,
                    is_active=listing.is_active,
                    created_at=listing.created_at,
                    updated_at=listing.updated_at
                )
                postgres_session.add(new_listing)
            
            await postgres_session.commit()
            print(f"✅ {len(listings)} annonces migrées")
    
    await postgres_engine.dispose()
    sqlite_engine.dispose()
    
    print("\n" + "="*60)
    print("✨ Migration terminée avec succès!")
    print("="*60)
    print("\n📊 Résumé:")
    print(f"   • Utilisateurs: {len(users)}")
    print(f"   • Profils: {len(profiles)}")
    print(f"   • Annonces: {len(listings)}")
    print("\n🔧 Prochaines étapes:")
    print("   1. Vérifier les données dans PostgreSQL")
    print("   2. Mettre à jour .env avec DATABASE_URL PostgreSQL")
    print("   3. Redémarrer le serveur")
    print("="*60)


if __name__ == "__main__":
    try:
        asyncio.run(migrate_data())
    except Exception as e:
        print(f"\n❌ Erreur lors de la migration: {e}")
        print("\n💡 Assurez-vous que:")
        print("   • PostgreSQL est démarré")
        print("   • La base mboa_market existe")
        print("   • Les credentials sont corrects")
        print("   • Le fichier mboa_market.db existe")
