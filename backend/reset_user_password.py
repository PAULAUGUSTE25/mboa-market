import sqlite3
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_password():
    # Connect to SQLite database
    conn = sqlite3.connect('mboa_market.db')
    cursor = conn.cursor()
    
    phone = "+237695584290"
    new_password = "password123"
    
    # Check if user exists
    cursor.execute("SELECT id, phone_number, email FROM users WHERE phone_number = ?", (phone,))
    user = cursor.fetchone()
    
    if user:
        user_id, phone_num, email = user
        print(f"✅ User found: {phone_num}")
        print(f"   ID: {user_id}")
        print(f"   Email: {email}")
        
        # Update password
        hashed = pwd_context.hash(new_password)
        cursor.execute("UPDATE users SET hashed_password = ?, is_active = 1, is_verified = 1 WHERE id = ?", 
                      (hashed, user_id))
        conn.commit()
        print(f"✅ Password reset successfully!")
        print(f"\n🔑 LOGIN CREDENTIALS:")
        print(f"   Phone: {phone}")
        print(f"   Password: {new_password}")
    else:
        print(f"❌ User {phone} not found. Creating new user...")
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed = pwd_context.hash(new_password)
        
        cursor.execute("""
            INSERT INTO users (id, phone_number, email, hashed_password, is_active, is_verified)
            VALUES (?, ?, ?, ?, 1, 1)
        """, (user_id, phone, "test@mboamarket.cm", hashed))
        
        # Create profile
        profile_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO profiles (id, user_id, display_name, activity_type, domain, region, locality)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (profile_id, user_id, "Test User", "producer", "agriculture", "Littoral", "Douala"))
        
        conn.commit()
        print(f"✅ User created successfully!")
        print(f"\n🔑 LOGIN CREDENTIALS:")
        print(f"   Phone: {phone}")
        print(f"   Password: {new_password}")
    
    # Show all users
    cursor.execute("SELECT phone_number, email FROM users LIMIT 10")
    users = cursor.fetchall()
    print(f"\n📊 Total users: {len(users)}")
    for phone, email in users:
        print(f"   - {phone} ({email})")
    
    conn.close()

if __name__ == "__main__":
    reset_password()
