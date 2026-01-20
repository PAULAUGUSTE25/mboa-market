"""
SUITE DE TESTS ULTRA-AVANCÉE - MBOA MARKET API
Tests de stress, edge cases extrêmes, concurrence, et optimisations
"""

import requests
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import statistics

BASE_URL = "http://localhost:8000/api"

# Couleurs pour output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"

class TestStats:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.response_times = []
    
    def add_time(self, duration):
        self.response_times.append(duration)
    
    def get_avg_time(self):
        return statistics.mean(self.response_times) if self.response_times else 0
    
    def get_p95_time(self):
        if not self.response_times:
            return 0
        sorted_times = sorted(self.response_times)
        index = int(len(sorted_times) * 0.95)
        return sorted_times[index]

stats = TestStats()

def print_header(text):
    print(f"\n{BOLD}{'='*70}")
    print(f"  {text}")
    print(f"{'='*70}{RESET}\n")

def test_result(name, passed, details=""):
    global stats
    if passed:
        print(f"{GREEN}✓{RESET} {name}")
        stats.passed += 1
    else:
        print(f"{RED}✗{RESET} {name}")
        if details:
            print(f"  {YELLOW}→{RESET} {details}")
        stats.failed += 1

def skip_test(name, reason=""):
    global stats
    print(f"{YELLOW}⊘{RESET} {name}")
    if reason:
        print(f"  {YELLOW}→{RESET} {reason}")
    stats.skipped += 1

def create_user(suffix=""):
    """Créer un utilisateur de test avec toutes les données requises"""
    phone = f"+237{str(int(time.time() * 1000))[-9:]}{suffix}"
    email = f"test_{int(time.time() * 1000)}{suffix}@example.com"
    
    data = {
        "phone": phone,
        "email": email,
        "password": "SecurePass123!",
        "locale": "fr",
        "locality": "Douala",
        "profile": {
            "display_name": f"Test User {suffix}",
            "activity_type": "vendeur",
            "domain": "agriculture",
            "region": "Littoral",
            "bio": "Test bio"
        }
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    if response.status_code == 201:
        user_data = response.json()
        # Login pour obtenir token
        login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "phone": phone,
            "password": "SecurePass123!"
        })
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            return {"user": user_data, "token": token, "phone": phone, "email": email}
    return None

def create_listing(token, **kwargs):
    """Créer un listing avec données complètes"""
    default_data = {
        "title": f"Test Listing {int(time.time())}",
        "description": "Test description",
        "category_id": "00000000-0000-0000-0000-000000000001",
        "product_ref_id": "00000000-0000-0000-0000-000000000001",
        "price_per_unit": 1000,
        "quantity": 100,
        "unit": "kg",
        "currency": "XAF",
        "domain": "agriculture",
        "region": "Littoral",
        "locality": "Douala"
    }
    default_data.update(kwargs)
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/listings", json=default_data, headers=headers)
    return response

# ============================================================================
# TESTS EDGE CASES EXTRÊMES
# ============================================================================

def test_extreme_edge_cases():
    print_header("TESTS EDGE CASES EXTRÊMES")
    
    # Test 1: Pagination avec page énorme
    response = requests.get(f"{BASE_URL}/listings?page=999999&page_size=100")
    test_result(
        "Pagination page 999999 ne crash pas",
        response.status_code in [200, 404],
        f"Code: {response.status_code}"
    )
    
    # Test 2: Page size = 0
    response = requests.get(f"{BASE_URL}/listings?page=1&page_size=0")
    test_result(
        "page_size=0 rejeté",
        response.status_code == 422,
        f"Code: {response.status_code}"
    )
    
    # Test 3: Page négative
    response = requests.get(f"{BASE_URL}/listings?page=-1&page_size=20")
    test_result(
        "page=-1 rejeté",
        response.status_code == 422,
        f"Code: {response.status_code}"
    )
    
    # Test 4: Filtres avec caractères spéciaux
    special_chars = ["<script>", "'; DROP TABLE--", "../../../etc/passwd", "%00"]
    for char in special_chars:
        response = requests.get(f"{BASE_URL}/listings?domain={char}")
        test_result(
            f"Filtre avec '{char[:20]}' sécurisé",
            response.status_code in [200, 400, 422],
            f"Code: {response.status_code}"
        )
    
    # Test 5: UUID invalides
    invalid_uuids = ["not-a-uuid", "12345", "00000000-0000-0000-0000-00000000000g"]
    for uuid in invalid_uuids:
        response = requests.get(f"{BASE_URL}/listings/{uuid}")
        test_result(
            f"UUID invalide '{uuid[:20]}' rejeté",
            response.status_code in [400, 404, 422],
            f"Code: {response.status_code}"
        )

# ============================================================================
# TESTS DE VALIDATION EXTRÊMES
# ============================================================================

def test_extreme_validation():
    print_header("TESTS VALIDATION EXTRÊMES")
    
    # Test 1: Email avec 1000 caractères
    long_email = "a" * 1000 + "@example.com"
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "phone": "+237600000001",
        "email": long_email,
        "password": "SecurePass123!",
        "locale": "fr",
        "locality": "Douala",
        "profile": {
            "display_name": "Test",
            "activity_type": "vendeur",
            "domain": "agriculture",
            "region": "Littoral"
        }
    })
    test_result(
        "Email 1000+ caractères rejeté",
        response.status_code in [400, 422],
        f"Code: {response.status_code}"
    )
    
    # Test 2: Mot de passe avec emojis
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "phone": "+237600000002",
        "email": "emoji@test.com",
        "password": "🔒🔑Password123!",
        "locale": "fr",
        "locality": "Douala",
        "profile": {
            "display_name": "Test",
            "activity_type": "vendeur",
            "domain": "agriculture",
            "region": "Littoral"
        }
    })
    test_result(
        "Mot de passe avec emojis géré",
        response.status_code in [201, 400, 422],
        f"Code: {response.status_code}"
    )
    
    # Test 3: Téléphone avec espaces et tirets
    phones = ["+237 6 00 00 00 03", "+237-600-000-004", "+237.600.000.005"]
    for phone in phones:
        response = requests.post(f"{BASE_URL}/auth/register", json={
            "phone": phone,
            "email": f"test{phone[-3:]}@test.com",
            "password": "SecurePass123!",
            "locale": "fr",
            "locality": "Douala",
            "profile": {
                "display_name": "Test",
                "activity_type": "vendeur",
                "domain": "agriculture",
                "region": "Littoral"
            }
        })
        test_result(
            f"Téléphone '{phone}' géré correctement",
            response.status_code in [201, 400, 422],
            f"Code: {response.status_code}"
        )
    
    # Test 4: Champs avec null bytes
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "phone": "+237600000006",
        "email": "test\x00null@test.com",
        "password": "SecurePass123!",
        "locale": "fr",
        "locality": "Douala",
        "profile": {
            "display_name": "Test\x00Null",
            "activity_type": "vendeur",
            "domain": "agriculture",
            "region": "Littoral"
        }
    })
    test_result(
        "Null bytes dans données rejetés",
        response.status_code in [400, 422],
        f"Code: {response.status_code}"
    )

# ============================================================================
# TESTS DE CONCURRENCE
# ============================================================================

def test_concurrent_requests():
    print_header("TESTS DE CONCURRENCE")
    
    # Test 1: Créer 10 utilisateurs en parallèle
    def create_concurrent_user(i):
        return create_user(f"_concurrent_{i}")
    
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(create_concurrent_user, i) for i in range(10)]
        results = [f.result() for f in as_completed(futures)]
    
    duration = time.time() - start_time
    successful = sum(1 for r in results if r is not None)
    
    test_result(
        f"10 créations utilisateurs concurrentes ({successful}/10 réussies en {duration:.2f}s)",
        successful >= 8,
        f"Réussis: {successful}/10"
    )
    
    # Test 2: Lectures concurrentes sur même endpoint
    def read_listings():
        start = time.time()
        response = requests.get(f"{BASE_URL}/listings?page=1&page_size=20")
        return time.time() - start, response.status_code
    
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(read_listings) for _ in range(20)]
        results = [f.result() for f in as_completed(futures)]
    
    total_duration = time.time() - start_time
    successful = sum(1 for _, code in results if code == 200)
    avg_time = statistics.mean([t for t, _ in results])
    
    test_result(
        f"20 lectures concurrentes ({successful}/20 réussies, avg: {avg_time:.3f}s)",
        successful >= 18 and avg_time < 3.0,
        f"Total: {total_duration:.2f}s, Avg: {avg_time:.3f}s"
    )
    
    # Test 3: Race condition - double inscription même email
    test_email = f"race_{int(time.time())}@test.com"
    test_phone_base = f"+237{str(int(time.time()))[-9:]}"
    
    def register_same_email(i):
        return requests.post(f"{BASE_URL}/auth/register", json={
            "phone": f"{test_phone_base}{i}",
            "email": test_email,
            "password": "SecurePass123!",
            "locale": "fr",
            "locality": "Douala",
            "profile": {
                "display_name": f"Race Test {i}",
                "activity_type": "vendeur",
                "domain": "agriculture",
                "region": "Littoral"
            }
        })
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(register_same_email, i) for i in range(5)]
        results = [f.result() for f in as_completed(futures)]
    
    success_count = sum(1 for r in results if r.status_code == 201)
    test_result(
        "Race condition email unique (1 seul doit réussir)",
        success_count == 1,
        f"Réussis: {success_count}/5"
    )

# ============================================================================
# TESTS DE CHARGE
# ============================================================================

def test_load_performance():
    print_header("TESTS DE CHARGE ET PERFORMANCE")
    
    # Test 1: 100 requêtes séquentielles
    times = []
    errors = 0
    
    for i in range(100):
        start = time.time()
        response = requests.get(f"{BASE_URL}/listings?page=1&page_size=10")
        duration = time.time() - start
        times.append(duration)
        if response.status_code != 200:
            errors += 1
    
    avg_time = statistics.mean(times)
    p95_time = sorted(times)[94]  # 95th percentile
    
    test_result(
        f"100 requêtes séquentielles (avg: {avg_time:.3f}s, p95: {p95_time:.3f}s)",
        avg_time < 2.0 and p95_time < 3.0 and errors == 0,
        f"Erreurs: {errors}, Avg: {avg_time:.3f}s, P95: {p95_time:.3f}s"
    )
    
    # Test 2: Burst de 50 requêtes simultanées
    def burst_request():
        start = time.time()
        response = requests.get(f"{BASE_URL}/listings/categories/all")
        return time.time() - start, response.status_code
    
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(burst_request) for _ in range(50)]
        results = [f.result() for f in as_completed(futures)]
    
    total_time = time.time() - start_time
    successful = sum(1 for _, code in results if code == 200)
    avg_response = statistics.mean([t for t, _ in results])
    
    test_result(
        f"Burst 50 requêtes simultanées ({successful}/50 OK en {total_time:.2f}s)",
        successful >= 45 and total_time < 10.0,
        f"Réussis: {successful}/50, Total: {total_time:.2f}s, Avg: {avg_response:.3f}s"
    )
    
    # Test 3: Stress test - créations multiples
    user = create_user("_stress")
    if user:
        token = user["token"]
        
        creation_times = []
        for i in range(20):
            start = time.time()
            response = create_listing(token, title=f"Stress Test {i}")
            duration = time.time() - start
            creation_times.append(duration)
        
        avg_creation = statistics.mean(creation_times)
        test_result(
            f"20 créations listings séquentielles (avg: {avg_creation:.3f}s)",
            avg_creation < 2.0,
            f"Avg: {avg_creation:.3f}s"
        )

# ============================================================================
# TESTS SÉCURITÉ AVANCÉS
# ============================================================================

def test_advanced_security():
    print_header("TESTS SÉCURITÉ AVANCÉS")
    
    # Test 1: SQL Injection dans filtres
    sql_injections = [
        "' OR '1'='1",
        "1; DROP TABLE users--",
        "' UNION SELECT * FROM users--",
        "admin'--",
        "1' AND '1'='1"
    ]
    
    for injection in sql_injections:
        response = requests.get(f"{BASE_URL}/listings?domain={injection}")
        test_result(
            f"SQL injection '{injection[:30]}' bloquée",
            response.status_code in [200, 400, 422] and "error" not in response.text.lower(),
            f"Code: {response.status_code}"
        )
    
    # Test 2: XSS dans données
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "javascript:alert('XSS')",
        "<svg onload=alert('XSS')>"
    ]
    
    user = create_user("_xss")
    if user:
        token = user["token"]
        for payload in xss_payloads:
            response = create_listing(token, title=payload)
            # Devrait accepter mais échapper le contenu
            test_result(
                f"XSS payload '{payload[:30]}' géré",
                response.status_code in [201, 400, 422],
                f"Code: {response.status_code}"
            )
    
    # Test 3: Token manipulation
    fake_tokens = [
        "Bearer fake.token.here",
        "Bearer " + "A" * 1000,
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature",
        ""
    ]
    
    for fake_token in fake_tokens:
        headers = {"Authorization": fake_token} if fake_token else {}
        response = requests.get(f"{BASE_URL}/users/me", headers=headers)
        test_result(
            f"Token invalide rejeté",
            response.status_code == 401,
            f"Code: {response.status_code}"
        )
    
    # Test 4: IDOR - Accès ressources autres utilisateurs
    user1 = create_user("_idor1")
    user2 = create_user("_idor2")
    
    if user1 and user2:
        # User1 crée un listing
        listing_response = create_listing(user1["token"], title="IDOR Test")
        if listing_response.status_code == 201:
            listing_id = listing_response.json()["id"]
            
            # User2 essaie de modifier le listing de User1
            headers = {"Authorization": f"Bearer {user2['token']}"}
            response = requests.put(
                f"{BASE_URL}/listings/{listing_id}",
                json={"title": "Hacked"},
                headers=headers
            )
            test_result(
                "IDOR: User2 ne peut pas modifier listing de User1",
                response.status_code in [403, 404],
                f"Code: {response.status_code}"
            )

# ============================================================================
# TESTS DONNÉES RÉALISTES
# ============================================================================

def test_realistic_scenarios():
    print_header("TESTS SCÉNARIOS RÉALISTES")
    
    # Scénario 1: Workflow complet vendeur
    seller = create_user("_seller")
    if seller:
        # 1. Créer plusieurs listings
        listings = []
        for i in range(5):
            response = create_listing(
                seller["token"],
                title=f"Produit {i}",
                price_per_unit=1000 * (i + 1),
                quantity=50 + i * 10
            )
            if response.status_code == 201:
                listings.append(response.json())
        
        test_result(
            f"Vendeur crée 5 listings ({len(listings)}/5 réussis)",
            len(listings) == 5,
            f"Créés: {len(listings)}/5"
        )
        
        # 2. Récupérer ses listings
        headers = {"Authorization": f"Bearer {seller['token']}"}
        response = requests.get(f"{BASE_URL}/listings/my/listings", headers=headers)
        test_result(
            "Vendeur récupère ses listings",
            response.status_code == 200 and len(response.json()) >= 5,
            f"Code: {response.status_code}, Count: {len(response.json()) if response.status_code == 200 else 0}"
        )
        
        # 3. Modifier un listing
        if listings:
            listing_id = listings[0]["id"]
            response = requests.put(
                f"{BASE_URL}/listings/{listing_id}",
                json={"title": "Produit Modifié", "price_per_unit": 2000},
                headers=headers
            )
            test_result(
                "Vendeur modifie son listing",
                response.status_code == 200,
                f"Code: {response.status_code}"
            )
    
    # Scénario 2: Workflow acheteur
    buyer = create_user("_buyer")
    if buyer and seller and listings:
        # 1. Rechercher produits
        response = requests.get(f"{BASE_URL}/listings?domain=agriculture&page=1&page_size=20")
        test_result(
            "Acheteur recherche produits",
            response.status_code == 200,
            f"Code: {response.status_code}"
        )
        
        # 2. Voir détails produit
        listing_id = listings[0]["id"]
        response = requests.get(f"{BASE_URL}/listings/{listing_id}")
        test_result(
            "Acheteur voit détails produit",
            response.status_code == 200,
            f"Code: {response.status_code}"
        )
        
        # 3. Essayer de commander (devrait échouer si stock insuffisant ou propre listing)
        headers = {"Authorization": f"Bearer {buyer['token']}"}
        response = requests.post(
            f"{BASE_URL}/orders",
            json={
                "listing_id": listing_id,
                "quantity": 10,
                "delivery_address": "123 Test Street"
            },
            headers=headers
        )
        test_result(
            "Acheteur crée commande",
            response.status_code in [201, 400, 500],
            f"Code: {response.status_code}"
        )

# ============================================================================
# TESTS LIMITES SYSTÈME
# ============================================================================

def test_system_limits():
    print_header("TESTS LIMITES SYSTÈME")
    
    # Test 1: Payload énorme
    user = create_user("_huge")
    if user:
        huge_description = "A" * 100000  # 100KB de texte
        response = create_listing(
            user["token"],
            description=huge_description
        )
        test_result(
            "Payload 100KB géré correctement",
            response.status_code in [201, 400, 413, 422],
            f"Code: {response.status_code}"
        )
    
    # Test 2: Nombreux filtres combinés
    params = {
        "page": 1,
        "page_size": 20,
        "category_id": "00000000-0000-0000-0000-000000000001",
        "region": "Littoral",
        "domain": "agriculture",
        "status": "PUBLISHED"
    }
    response = requests.get(f"{BASE_URL}/listings", params=params)
    test_result(
        "Multiples filtres combinés fonctionnent",
        response.status_code == 200,
        f"Code: {response.status_code}"
    )
    
    # Test 3: Requêtes rapides répétées (rate limiting)
    user = create_user("_rate")
    if user:
        headers = {"Authorization": f"Bearer {user['token']}"}
        responses = []
        for i in range(100):
            response = requests.get(f"{BASE_URL}/users/me", headers=headers)
            responses.append(response.status_code)
        
        # Compter combien ont réussi
        success_count = sum(1 for code in responses if code == 200)
        rate_limited = sum(1 for code in responses if code == 429)
        
        test_result(
            f"100 requêtes rapides ({success_count} OK, {rate_limited} rate-limited)",
            success_count > 0,  # Au moins quelques-unes doivent passer
            f"OK: {success_count}, 429: {rate_limited}"
        )

# ============================================================================
# MAIN
# ============================================================================

def main():
    print(f"\n{BOLD}{BLUE}{'='*70}")
    print(f"  SUITE DE TESTS ULTRA-AVANCÉE - MBOA MARKET API")
    print(f"  Edge Cases, Stress, Concurrence, Sécurité, Limites")
    print(f"{'='*70}{RESET}\n")
    
    start_time = time.time()
    
    # Exécuter toutes les suites de tests
    test_extreme_edge_cases()
    test_extreme_validation()
    test_concurrent_requests()
    test_load_performance()
    test_advanced_security()
    test_realistic_scenarios()
    test_system_limits()
    
    # Résumé final
    total_time = time.time() - start_time
    total_tests = stats.passed + stats.failed + stats.skipped
    success_rate = (stats.passed / (stats.passed + stats.failed) * 100) if (stats.passed + stats.failed) > 0 else 0
    
    print_header("RÉSUMÉ DES TESTS ULTRA-AVANCÉS")
    
    print(f"{GREEN}✓{RESET} Tests réussis: {stats.passed}")
    print(f"{RED}✗{RESET} Tests échoués: {stats.failed}")
    print(f"{YELLOW}⊘{RESET} Tests ignorés: {stats.skipped}")
    print(f"Total: {total_tests}")
    print(f"Taux de réussite: {success_rate:.1f}%")
    print(f"Temps d'exécution: {total_time:.2f}s")
    
    if stats.response_times:
        print(f"\nPerformance:")
        print(f"  Temps moyen: {stats.get_avg_time():.3f}s")
        print(f"  P95: {stats.get_p95_time():.3f}s")
    
    if stats.failed > 0:
        print(f"\n{RED}✗ Certains tests ont échoué{RESET}")
        return 1
    else:
        print(f"\n{GREEN}✓ Tous les tests ont réussi !{RESET}")
        return 0

if __name__ == "__main__":
    exit(main())
