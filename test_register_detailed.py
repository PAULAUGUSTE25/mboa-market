import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test registration with minimal data
data = {
    "phone": "+237670000001",
    "password": "test123",
    "profile": {
        "display_name": "Test User",
        "activity_type": "seed_provider",
        "region": "Centre"
    }
}

print("Testing registration...")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(f"{BASE_URL}/auth/register", json=data, timeout=10)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code < 400:
        print("\n✅ SUCCESS!")
        print(json.dumps(response.json(), indent=2))
    else:
        print("\n❌ FAILED")
        
except requests.exceptions.Timeout:
    print("Request timed out")
except Exception as e:
    print(f"Exception: {type(e).__name__}: {e}")
