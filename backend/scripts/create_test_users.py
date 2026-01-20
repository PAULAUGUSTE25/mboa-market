import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, Profile, UserStatus
from uuid import uuid4


async def create_test_users():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if users already exist
        result = await session.execute(select(User).where(User.phone == "+237670000001"))
        if result.scalar_one_or_none():
            print("Test users already exist!")
            return
        
        # Create Seed Provider user
        user1 = User(
            id=uuid4(),
            phone="+237670000001",
            email="seedprovider@test.com",
            password_hash=get_password_hash("test123"),
            status=UserStatus.ACTIVE,
            phone_verified=True,
            locale="fr"
        )
        session.add(user1)
        await session.flush()
        
        profile1 = Profile(
            id=uuid4(),
            user_id=user1.id,
            display_name="Test User",
            activity_type="seed_provider",
            region="Centre",
            locality="Yaoundé",
            bio="Fournisseur de semences de qualité"
        )
        session.add(profile1)
        
        # Create Producer user
        user2 = User(
            id=uuid4(),
            phone="+237670000002",
            email="producer@test.com",
            password_hash=get_password_hash("prodpass123"),
            status=UserStatus.ACTIVE,
            phone_verified=True,
            locale="fr"
        )
        session.add(user2)
        await session.flush()
        
        profile2 = Profile(
            id=uuid4(),
            user_id=user2.id,
            display_name="Ferme Bio Cameroun",
            activity_type="producer",
            region="Ouest",
            locality="Bafoussam",
            bio="Producteur bio de fruits et légumes"
        )
        session.add(profile2)
        
        await session.commit()
        print("✅ Test users created successfully!")
        print("\nLogin Credentials:")
        print("=" * 50)
        print("Seed Provider:")
        print(f"  Phone: +237670000001")
        print(f"  Password: test123")
        print("\nProducer:")
        print(f"  Phone: +237670000002")
        print(f"  Password: prodpass123")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_test_users())
