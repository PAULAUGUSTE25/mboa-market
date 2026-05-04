"""
Script d'initialisation de la base de données MBOA Market
Crée toutes les tables et insère des données de test
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.database import Base

# Importer TOUS les modèles pour que SQLAlchemy les connaisse
from app.models import (
    User, Profile, Role, UserRole,
    KYCSubmission, KYCDocument,
    Category, ProductRef, Listing, ListingPhoto,
    Order, OrderItem, Payment, EscrowHold, Dispute, Review,
    B2BRequest, B2BOffer, B2BContract,
    Hub, TransportRequest, TransportMission,
    LivestockBatch, SyncClient, LivestockEvent,
    Notification, AuditLog, LoginHistory, TwoFactorCode,
    Conversation, ConversationParticipant, Message
)


async def init_database():
    """Initialiser la base de données"""
    print("🚀 Initialisation de la base de données MBOA Market...")
    print(f"📊 URL: {settings.DATABASE_URL}")
    
    # Créer le moteur
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        pool_recycle=settings.DB_POOL_RECYCLE,
    )
    
    # Créer toutes les tables
    print("\n📋 Création des tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Tables créées avec succès!")
    
    await engine.dispose()
    
    print("\n" + "="*60)
    print("✨ Base de données initialisée avec succès!")
    print("="*60)
    print("\n� Tables créées:")
    print("  • users")
    print("  • profiles")
    print("  • roles")
    print("  • listings")
    print("  • categories")
    print("  • orders")
    print("  • et plus...")
    print("\n� Vous pouvez maintenant:")
    print("  1. Démarrer le serveur: uvicorn app.main:app --reload")
    print("  2. Connecter HeidiSQL pour gérer les données")
    print("  3. Utiliser l'API: http://localhost:8000/docs")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(init_database())
