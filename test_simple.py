import requests
import json

BASE_URL = "http://localhost:8000/api"

# Simple registration test
data = {
    "phone": "+237670000001",
    "password": "test123",
    "email": "test@test.com",
    "profile": {
        "display_name": "Test User",
        "activity_type": "seed_provider",
        "region": "Centre"
    }
}

try:
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code < 400:
        print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
