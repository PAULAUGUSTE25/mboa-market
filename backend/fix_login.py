import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Connect to database
conn = sqlite3.connect('mboa_market.db')
cursor = conn.cursor()

phone = "+237695584290"
new_password = "password123"

# Hash the new password
hashed = pwd_context.hash(new_password)

# Update the user
cursor.execute("""
    UPDATE users 
    SET password_hash = ?, 
        status = 'ACTIVE', 
        phone_verified = 1 
    WHERE phone = ?
""", (hashed, phone))

conn.commit()

# Verify the update
cursor.execute("SELECT id, phone, email, status FROM users WHERE phone = ?", (phone,))
user = cursor.fetchone()

if user:
    print("✅ PASSWORD RESET SUCCESSFUL!")
    print(f"\n🔑 YOUR LOGIN CREDENTIALS:")
    print(f"   📱 Phone: {phone}")
    print(f"   🔒 Password: {new_password}")
    print(f"   📧 Email: {user[2]}")
    print(f"   ✓ Status: {user[3]}")
    print(f"\n🌐 Login at: http://localhost:5174/")
else:
    print("❌ User not found")

conn.close()
