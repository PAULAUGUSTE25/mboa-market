import sqlite3

conn = sqlite3.connect('backend/mboa_market.db')
cursor = conn.cursor()

cursor.execute('SELECT phone, email, password_hash FROM users')
users = cursor.fetchall()

print(f"\n{'='*60}")
print(f"USERS IN DATABASE ({len(users)} total)")
print(f"{'='*60}\n")

for i, (phone, email, has_pass) in enumerate(users, 1):
    print(f"User {i}:")
    print(f"  Phone: {phone}")
    print(f"  Email: {email or 'None'}")
    print(f"  Has Password: {'Yes' if has_pass else 'No'}")
    print()

conn.close()
