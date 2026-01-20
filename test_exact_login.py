import requests
import json

# Test with the exact user from database
tests = [
    {
        "name": "User 1 (Seed Provider)",
        "phone": "+237670000001",
        "password": "test123"
    },
    {
        "name": "User 2 (Producer)",
        "phone": "+237670000002",
        "password": "prodpass123"
    },
    {
        "name": "User 3",
        "phone": "695584290",
        "password": "test123"  # Try common password
    }
]

print("\n" + "="*60)
print("TESTING LOGIN FOR ALL USERS")
print("="*60 + "\n")

for test in tests:
    print(f"Testing: {test['name']}")
    print(f"Phone: {test['phone']}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json={"phone": test['phone'], "password": test['password']},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS!")
            print(f"   User: {result['user']['profile']['display_name']}")
            print(f"   Type: {result['user']['profile']['activity_type']}")
            print(f"   Token: {result['access_token'][:30]}...")
        else:
            print(f"❌ FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
    
    print("-" * 60 + "\n")
