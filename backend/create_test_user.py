import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine
from app.models.user import User
from app.models.profile import Profile
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_user():
    db = SessionLocal()
    try:
        # Check if user exists
        phone = "+237695584290"
        existing_user = db.query(User).filter(User.phone_number == phone).first()
        
        if existing_user:
            print(f"✅ User {phone} already exists")
            print(f"   ID: {existing_user.id}")
            print(f"   Email: {existing_user.email}")
            
            # Update password to "password123"
            hashed = pwd_context.hash("password123")
            existing_user.hashed_password = hashed
            db.commit()
            print(f"✅ Password updated to: password123")
        else:
            # Create new user
            hashed_password = pwd_context.hash("password123")
            
            new_user = User(
                id=str(uuid.uuid4()),
                phone_number=phone,
                email="test@mboamarket.cm",
                hashed_password=hashed_password,
                is_active=True,
                is_verified=True
            )
            db.add(new_user)
            db.flush()
            
            # Create profile
            profile = Profile(
                id=str(uuid.uuid4()),
                user_id=new_user.id,
                display_name="Test User",
                activity_type="producer",
                domain="agriculture",
                region="Littoral",
                locality="Douala"
            )
            db.add(profile)
            db.commit()
            
            print(f"✅ User created successfully!")
            print(f"   Phone: {phone}")
            print(f"   Password: password123")
            print(f"   ID: {new_user.id}")
        
        # List all users
        all_users = db.query(User).all()
        print(f"\n📊 Total users in database: {len(all_users)}")
        for user in all_users[:10]:
            print(f"   - {user.phone_number} (ID: {user.id})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
