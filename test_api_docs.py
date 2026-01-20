import requests

# Test if API is accessible
try:
    response = requests.get("http://localhost:8000/")
    print(f"Root endpoint: {response.status_code}")
    print(response.json())
    
    response = requests.get("http://localhost:8000/health")
    print(f"\nHealth check: {response.status_code}")
    print(response.json())
    
    response = requests.get("http://localhost:8000/api/listings/categories/all")
    print(f"\nCategories: {response.status_code}")
    if response.status_code == 200:
        cats = response.json()
        print(f"Found {len(cats)} categories")
        for cat in cats[:3]:
            print(f"  - {cat['name_fr']}")
except Exception as e:
    print(f"Error: {e}")
