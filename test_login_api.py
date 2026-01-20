import requests
import json

# Test login with existing user
login_data = {
    "phone": "+237670000002",
    "password": "prodpass123"
}

print("Testing login API...")
print(f"URL: http://localhost:8000/api/auth/login")
print(f"Data: {json.dumps(login_data, indent=2)}")

try:
    response = requests.post(
        "http://localhost:8000/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ Login successful!")
        print(f"Access Token: {result['access_token'][:50]}...")
        print(f"User: {result['user']['profile']['display_name']}")
    else:
        print("\n❌ Login failed")
        
except Exception as e:
    print(f"\nError: {e}")
