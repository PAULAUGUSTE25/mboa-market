"""
Script d'initialisation pour Render :
  1. Crée toutes les tables
  2. Crée l'utilisateur de démo (+237123456789 / Demo@2026)
  3. Seed les catégories et annonces de base
"""
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from app.core.config import settings
from app.core.database import Base
from app.core.security import get_password_hash
from uuid import uuid4
import datetime

# Importer tous les modèles
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
from app.models.user import UserStatus


CATEGORIES = [
    {"id": str(uuid4()), "name_fr": "Agriculture", "name_en": "Agriculture", "kind": "sector"},
    {"id": str(uuid4()), "name_fr": "Élevage", "name_en": "Livestock", "kind": "sector"},
    {"id": str(uuid4()), "name_fr": "Maraîchage", "name_en": "Market gardening", "kind": "sector"},
    {"id": str(uuid4()), "name_fr": "Céréales", "name_en": "Cereals", "kind": "category"},
    {"id": str(uuid4()), "name_fr": "Tubercules", "name_en": "Tubers", "kind": "category"},
    {"id": str(uuid4()), "name_fr": "Fruits tropicaux", "name_en": "Tropical fruits", "kind": "category"},
]


async def setup():
    print("=" * 60)
    print("🚀 MBOA Market — Initialisation Render")
    print(f"📊 DB: {settings.DATABASE_URL[:40]}...")
    print("=" * 60)

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # 1. Créer toutes les tables
    print("\n📋 Création des tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables créées")

    async with async_session() as session:

        # 2. Catégories
        print("\n📦 Seed catégories...")
        for cat in CATEGORIES:
            existing = await session.execute(
                select(Category).where(Category.name_fr == cat["name_fr"])
            )
            if not existing.scalar_one_or_none():
                session.add(Category(
                    id=cat["id"],
                    name_fr=cat["name_fr"],
                    name_en=cat["name_en"],
                    kind=cat["kind"]
                ))
        await session.commit()
        print(f"✅ {len(CATEGORIES)} catégories insérées")

        # 3. Utilisateur de démo
        print("\n👤 Création utilisateur démo...")
        DEMO_PHONE = "+237123456789"
        DEMO_PASSWORD = "Demo@2026"

        existing_user = (await session.execute(
            select(User).where(User.phone == DEMO_PHONE)
        )).scalar_one_or_none()

        if not existing_user:
            user_id = uuid4()
            user = User(
                id=user_id,
                phone=DEMO_PHONE,
                password_hash=get_password_hash(DEMO_PASSWORD),
                status=UserStatus.ACTIVE
            )
            session.add(user)
            await session.flush()

            profile = Profile(
                id=uuid4(),
                user_id=user_id,
                display_name="Démo MBOA Market",
                activity_type="producer",
                domain="agriculture",
                region="Centre",
                locality="Yaoundé"
            )
            session.add(profile)
            await session.commit()
            print(f"✅ Utilisateur démo créé : {DEMO_PHONE} / {DEMO_PASSWORD}")
        else:
            print(f"ℹ️  Utilisateur démo déjà existant : {DEMO_PHONE}")

    await engine.dispose()

    print("\n" + "=" * 60)
    print("✨ Initialisation terminée avec succès !")
    print("=" * 60)
    print(f"\n🔐 Compte de démo :")
    print(f"   Téléphone : +237123456789")
    print(f"   Mot de passe : Demo@2026")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(setup())
