import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test login with the producer we just created
login_data = {
    "phone": "+237670000002",
    "password": "prodpass123"
}

print("Testing login...")
response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    result = response.json()
    print("\n✅ Login successful!")
    print(f"Token: {result['access_token'][:50]}...")
    print(f"User: {result['user']['profile']['display_name']}")
else:
    print("\n❌ Login failed")
