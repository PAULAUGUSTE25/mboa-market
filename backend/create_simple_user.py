import asyncio
from sqlalchemy import text
from app.core.database import get_db
from app.core.security import get_password_hash
import uuid
from datetime import datetime

async def create_user():
    async for db in get_db():
        # Créer un utilisateur simple
        user_id = str(uuid.uuid4())
        phone = "+237654773746"
        password_hash = get_password_hash("password123")
        
        # Vérifier si l'utilisateur existe déjà
        result = await db.execute(
            text("SELECT id FROM users WHERE phone = :phone"),
            {"phone": phone}
        )
        existing = result.fetchone()
        
        if existing:
            print(f"✅ L'utilisateur {phone} existe déjà!")
            print(f"📱 Téléphone: {phone}")
            print(f"🔑 Mot de passe: password123")
            return
        
        # Créer l'utilisateur
        await db.execute(
            text("""
                INSERT INTO users (id, phone, phone_verified, email, password_hash, status, badge, locale, created_at, updated_at)
                VALUES (:id, :phone, :phone_verified, :email, :password_hash, :status, :badge, :locale, :created_at, :updated_at)
            """),
            {
                "id": user_id,
                "phone": phone,
                "phone_verified": True,
                "email": "user@mboa.cm",
                "password_hash": password_hash,
                "status": "ACTIVE",
                "badge": "UNVERIFIED",
                "locale": "fr",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        )
        
        # Créer le profil
        profile_id = str(uuid.uuid4())
        await db.execute(
            text("""
                INSERT INTO profiles (id, user_id, display_name, activity_type, domain, region, locality, bio, created_at, updated_at)
                VALUES (:id, :user_id, :display_name, :activity_type, :domain, :region, :locality, :bio, :created_at, :updated_at)
            """),
            {
                "id": profile_id,
                "user_id": user_id,
                "display_name": "Paul Auguste",
                "activity_type": "producer",
                "domain": "agriculture",
                "region": "Centre",
                "locality": "Yaoundé",
                "bio": "Producteur agricole",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        )
        
        await db.commit()
        
        print("✅ Utilisateur créé avec succès!")
        print(f"📱 Téléphone: {phone}")
        print(f"🔑 Mot de passe: password123")
        print(f"👤 Nom: Paul Auguste")

if __name__ == "__main__":
    asyncio.run(create_user())
