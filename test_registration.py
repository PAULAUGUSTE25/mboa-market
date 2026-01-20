import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test 1: Register a seed provider
print("=" * 60)
print("TEST 1: Register Seed Provider")
print("=" * 60)

seed_provider_data = {
    "phone": "+237670000001",
    "password": "seedpass123",
    "email": "seed@provider.com",
    "profile": {
        "display_name": "Semences Premium",
        "activity_type": "seed_provider",
        "region": "Centre",
        "locality": "Yaoundé"
    }
}

response = requests.post(f"{BASE_URL}/auth/register", json=seed_provider_data)
print(f"Status: {response.status_code}")
if response.status_code < 400:
    print(f"Success! Seed provider registered")
    print(json.dumps(response.json(), indent=2))
else:
    print(f"Error: {response.text}")

# Test 2: Register a producer
print("\n" + "=" * 60)
print("TEST 2: Register Producer")
print("=" * 60)

producer_data = {
    "phone": "+237670000002",
    "password": "prodpass123",
    "email": "producer@farm.com",
    "profile": {
        "display_name": "Ferme Bio Cameroun",
        "activity_type": "producer",
        "region": "Ouest",
        "locality": "Bafoussam"
    }
}

response = requests.post(f"{BASE_URL}/auth/register", json=producer_data)
print(f"Status: {response.status_code}")
if response.status_code < 400:
    print(f"Success! Producer registered")
    print(json.dumps(response.json(), indent=2))
else:
    print(f"Error: {response.text}")

# Test 3: Login as seed provider
print("\n" + "=" * 60)
print("TEST 3: Login as Seed Provider")
print("=" * 60)

login_data = {
    "phone": "+237670000001",
    "password": "seedpass123"
}

response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    seed_token = result["access_token"]
    print(f"Success! Logged in")
    print(f"Token: {seed_token[:50]}...")
    
    # Test 4: Get categories
    print("\n" + "=" * 60)
    print("TEST 4: Get Categories")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/listings/categories/all")
    print(f"Status: {response.status_code}")
    categories = response.json()
    print(f"Found {len(categories)} categories")
    for cat in categories:
        print(f"  - {cat['name_fr']} ({cat['name_en']})")
    
    # Test 5: Create a seed listing
    print("\n" + "=" * 60)
    print("TEST 5: Create Seed Listing")
    print("=" * 60)
    
    # Find "Semences" category
    semences_cat = next((c for c in categories if c['name_en'] == 'Seeds'), None)
    
    if semences_cat:
        listing_data = {
            "category_id": semences_cat['id'],
            "title": "Semences de Maïs Hybride",
            "variety": "Premium F1",
            "quantity": 500,
            "unit": "kg",
            "price_per_unit": 2500,
            "currency": "XAF",
            "region": "Centre",
            "locality": "Yaoundé"
        }
        
        headers = {"Authorization": f"Bearer {seed_token}"}
        response = requests.post(f"{BASE_URL}/listings", json=listing_data, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code < 400:
            listing = response.json()
            print(f"Success! Listing created")
            print(f"ID: {listing['id']}")
            print(f"Title: {listing['title']}")
            print(f"Price: {listing['price_per_unit']} {listing['currency']}/{listing['unit']}")
    
    # Test 6: Get all listings
    print("\n" + "=" * 60)
    print("TEST 6: Browse All Listings")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/listings")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Total listings: {result['total']}")
        print(f"Showing {len(result['items'])} items")

else:
    print(f"Login failed: {response.text}")

print("\n" + "=" * 60)
print("API TESTS COMPLETED")
print("=" * 60)
