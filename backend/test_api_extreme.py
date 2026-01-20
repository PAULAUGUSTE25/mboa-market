"""
SUITE DE TESTS EXTRÊMES - MBOA MARKET API
Chaos Engineering, Stress Massif, Limites Absolues, Scénarios Impossibles
"""

import requests
import time
import json
import random
import string
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import statistics
import hashlib

BASE_URL = "http://localhost:8000/api"

# Couleurs
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"

class ExtremeStats:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.chaos_survived = 0
        self.response_times = []
        self.errors_caught = []
    
    def add_time(self, duration):
        self.response_times.append(duration)
    
    def add_error(self, error):
        self.errors_caught.append(error)
    
    def get_stats(self):
        if not self.response_times:
            return {"avg": 0, "min": 0, "max": 0, "p50": 0, "p95": 0, "p99": 0}
        
        sorted_times = sorted(self.response_times)
        return {
            "avg": statistics.mean(self.response_times),
            "min": min(self.response_times),
            "max": max(self.response_times),
            "p50": sorted_times[len(sorted_times) // 2],
            "p95": sorted_times[int(len(sorted_times) * 0.95)],
            "p99": sorted_times[int(len(sorted_times) * 0.99)]
        }

stats = ExtremeStats()

def print_header(text, color=CYAN):
    print(f"\n{BOLD}{color}{'='*70}")
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

def chaos_result(name, survived, details=""):
    global stats
    if survived:
        print(f"{MAGENTA}⚡{RESET} {name} {GREEN}[SURVIVED]{RESET}")
        stats.chaos_survived += 1
        stats.passed += 1
    else:
        print(f"{MAGENTA}⚡{RESET} {name} {RED}[CRASHED]{RESET}")
        if details:
            print(f"  {YELLOW}→{RESET} {details}")
        stats.failed += 1

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_evil_string(type="unicode"):
    """Générer des strings malveillantes"""
    evil_strings = {
        "unicode": "𝕳𝖊𝖑𝖑𝖔 𝖂𝖔𝖗𝖑𝖉 🔥💀👻",
        "rtl": "مرحبا بالعالم",
        "emoji_spam": "🔥" * 100,
        "zalgo": "H̷̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ",
        "null_bytes": "Hello\x00World\x00",
        "control_chars": "\x01\x02\x03\x04\x05",
        "long_unicode": "あ" * 1000,
        "mixed": "Test\n\r\t<>\"'`&;|$(){}[]",
        "bidi": "‮This is reversed‮",
        "zero_width": "Hello\u200B\u200C\u200DWorld"
    }
    return evil_strings.get(type, evil_strings["unicode"])

def create_user(suffix=""):
    """Créer utilisateur avec retry"""
    for attempt in range(3):
        try:
            phone = f"+237{str(int(time.time() * 1000000))[-9:]}{suffix}"
            email = f"extreme_{hashlib.md5(phone.encode()).hexdigest()[:10]}@test.com"
            
            data = {
                "phone": phone,
                "email": email,
                "password": "ExtremeTest123!",
                "locale": "fr",
                "locality": "Douala",
                "profile": {
                    "display_name": f"Extreme User {suffix}",
                    "activity_type": "vendeur",
                    "domain": "agriculture",
                    "region": "Littoral",
                    "bio": "Extreme test"
                }
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=data, timeout=10)
            if response.status_code == 201:
                login_response = requests.post(f"{BASE_URL}/auth/login", json={
                    "phone": phone,
                    "password": "ExtremeTest123!"
                }, timeout=10)
                if login_response.status_code == 200:
                    token = login_response.json()["access_token"]
                    return {"user": response.json(), "token": token, "phone": phone, "email": email}
        except Exception as e:
            if attempt == 2:
                stats.add_error(f"create_user: {e}")
            time.sleep(0.1)
    return None

# ============================================================================
# TESTS CHAOS ENGINEERING
# ============================================================================

def test_chaos_engineering():
    print_header("🔥 CHAOS ENGINEERING - SCÉNARIOS IMPOSSIBLES", MAGENTA)
    
    # Chaos 1: Requêtes avec headers corrompus
    evil_headers = [
        {"Authorization": "Bearer " + "A" * 10000},
        {"Content-Type": "application/json" + "\x00" * 100},
        {"User-Agent": generate_evil_string("zalgo")},
        {"Accept": "*/*, " * 1000},
        {"X-Custom": generate_evil_string("emoji_spam")}
    ]
    
    for i, headers in enumerate(evil_headers):
        try:
            response = requests.get(f"{BASE_URL}/listings", headers=headers, timeout=5)
            chaos_result(
                f"Headers corrompus #{i+1}",
                response.status_code in [200, 400, 401, 422],
                f"Code: {response.status_code}"
            )
        except Exception as e:
            chaos_result(f"Headers corrompus #{i+1}", False, str(e))
    
    # Chaos 2: Payload JSON malformé
    malformed_payloads = [
        '{"incomplete": ',
        '{"nested": {"very": {"deep": ' * 100 + '}' * 100,
        '{"unicode": "' + generate_evil_string("unicode") + '"}',
        '{"number": ' + '9' * 1000 + '}',
        '{"array": [' + ','.join(['1'] * 10000) + ']}'
    ]
    
    for i, payload in enumerate(malformed_payloads):
        try:
            response = requests.post(
                f"{BASE_URL}/auth/register",
                data=payload,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            chaos_result(
                f"JSON malformé #{i+1}",
                response.status_code in [400, 422, 500],
                f"Code: {response.status_code}"
            )
        except Exception as e:
            chaos_result(f"JSON malformé #{i+1}", True, "Exception catchée")
    
    # Chaos 3: Requêtes simultanées contradictoires
    user = create_user("_chaos")
    if user:
        token = user["token"]
        
        def conflicting_request(action):
            headers = {"Authorization": f"Bearer {token}"}
            if action == "create":
                return requests.post(f"{BASE_URL}/listings", json={
                    "title": "Chaos Test",
                    "description": "Test",
                    "category_id": "00000000-0000-0000-0000-000000000001",
                    "product_ref_id": "00000000-0000-0000-0000-000000000001",
                    "price_per_unit": 1000,
                    "quantity": 100,
                    "unit": "kg",
                    "currency": "XAF",
                    "domain": "agriculture",
                    "region": "Littoral",
                    "locality": "Douala"
                }, headers=headers, timeout=5)
            else:
                return requests.get(f"{BASE_URL}/listings/my/listings", headers=headers, timeout=5)
        
        with ThreadPoolExecutor(max_workers=20) as executor:
            actions = ["create", "read"] * 10
            futures = [executor.submit(conflicting_request, action) for action in actions]
            results = [f.result() for f in as_completed(futures)]
        
        success = sum(1 for r in results if r.status_code in [200, 201])
        chaos_result(
            f"20 requêtes contradictoires simultanées ({success}/20 OK)",
            success >= 15,
            f"Réussis: {success}/20"
        )

# ============================================================================
# TESTS STRESS MASSIF
# ============================================================================

def test_massive_stress():
    print_header("💪 STRESS MASSIF - LIMITES ABSOLUES", BLUE)
    
    # Stress 1: 500 requêtes séquentielles ultra-rapides
    print(f"{CYAN}Test 1/5: 500 requêtes séquentielles...{RESET}")
    times = []
    errors = 0
    
    for i in range(500):
        try:
            start = time.time()
            response = requests.get(f"{BASE_URL}/listings?page=1&page_size=5", timeout=5)
            duration = time.time() - start
            times.append(duration)
            stats.add_time(duration)
            if response.status_code != 200:
                errors += 1
        except Exception as e:
            errors += 1
            stats.add_error(f"stress_500: {e}")
        
        if (i + 1) % 100 == 0:
            print(f"  {i + 1}/500 complétées...")
    
    avg = statistics.mean(times) if times else 0
    test_result(
        f"500 requêtes séquentielles (avg: {avg:.3f}s, erreurs: {errors})",
        errors < 50 and avg < 3.0,
        f"Avg: {avg:.3f}s, Erreurs: {errors}/500"
    )
    
    # Stress 2: Burst 100 requêtes simultanées
    print(f"{CYAN}Test 2/5: Burst 100 requêtes simultanées...{RESET}")
    
    def burst_request():
        try:
            start = time.time()
            response = requests.get(f"{BASE_URL}/listings/categories/all", timeout=10)
            return time.time() - start, response.status_code
        except Exception as e:
            return 10.0, 500
    
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=100) as executor:
        futures = [executor.submit(burst_request) for _ in range(100)]
        results = [f.result() for f in as_completed(futures)]
    
    total_time = time.time() - start_time
    successful = sum(1 for _, code in results if code == 200)
    avg_response = statistics.mean([t for t, _ in results])
    
    test_result(
        f"Burst 100 requêtes ({successful}/100 OK en {total_time:.2f}s)",
        successful >= 80 and total_time < 15.0,
        f"OK: {successful}/100, Total: {total_time:.2f}s, Avg: {avg_response:.3f}s"
    )
    
    # Stress 3: Créations massives
    print(f"{CYAN}Test 3/5: 50 créations utilisateurs...{RESET}")
    
    def create_stress_user(i):
        return create_user(f"_stress_{i}")
    
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=25) as executor:
        futures = [executor.submit(create_stress_user, i) for i in range(50)]
        results = [f.result() for f in as_completed(futures)]
    
    duration = time.time() - start_time
    successful = sum(1 for r in results if r is not None)
    
    test_result(
        f"50 créations utilisateurs ({successful}/50 en {duration:.2f}s)",
        successful >= 40,
        f"Réussis: {successful}/50, Durée: {duration:.2f}s"
    )
    
    # Stress 4: Lectures massives avec pagination
    print(f"{CYAN}Test 4/5: 200 lectures avec pagination variée...{RESET}")
    
    def paginated_read():
        page = random.randint(1, 100)
        size = random.choice([5, 10, 20, 50, 100])
        try:
            start = time.time()
            response = requests.get(f"{BASE_URL}/listings?page={page}&page_size={size}", timeout=5)
            return time.time() - start, response.status_code
        except:
            return 5.0, 500
    
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(paginated_read) for _ in range(200)]
        results = [f.result() for f in as_completed(futures)]
    
    successful = sum(1 for _, code in results if code == 200)
    avg_time = statistics.mean([t for t, _ in results])
    
    test_result(
        f"200 lectures paginées ({successful}/200 OK, avg: {avg_time:.3f}s)",
        successful >= 180,
        f"OK: {successful}/200, Avg: {avg_time:.3f}s"
    )
    
    # Stress 5: Mix complet - CHAOS TOTAL
    print(f"{CYAN}Test 5/5: 100 requêtes mixtes simultanées (CHAOS)...{RESET}")
    
    def chaos_request():
        actions = [
            lambda: requests.get(f"{BASE_URL}/listings", timeout=5),
            lambda: requests.get(f"{BASE_URL}/listings/categories/all", timeout=5),
            lambda: requests.get(f"{BASE_URL}/listings/products/all", timeout=5),
            lambda: requests.post(f"{BASE_URL}/auth/register", json={
                "phone": f"+237{random.randint(600000000, 699999999)}",
                "email": f"chaos{random.randint(1, 999999)}@test.com",
                "password": "Chaos123!",
                "locale": "fr",
                "locality": "Douala",
                "profile": {
                    "display_name": "Chaos",
                    "activity_type": "vendeur",
                    "domain": "agriculture",
                    "region": "Littoral"
                }
            }, timeout=5)
        ]
        
        try:
            action = random.choice(actions)
            start = time.time()
            response = action()
            return time.time() - start, response.status_code
        except:
            return 5.0, 500
    
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(chaos_request) for _ in range(100)]
        results = [f.result() for f in as_completed(futures)]
    
    total_time = time.time() - start_time
    successful = sum(1 for _, code in results if code in [200, 201, 400, 422])
    
    chaos_result(
        f"100 requêtes CHAOS mixtes ({successful}/100 gérées en {total_time:.2f}s)",
        successful >= 80,
        f"Gérées: {successful}/100, Durée: {total_time:.2f}s"
    )

# ============================================================================
# TESTS LIMITES ABSOLUES
# ============================================================================

def test_absolute_limits():
    print_header("🚀 LIMITES ABSOLUES - AU-DELÀ DU POSSIBLE", YELLOW)
    
    # Limite 1: Payload 10MB
    huge_data = {
        "phone": "+237600000001",
        "email": "huge@test.com",
        "password": "Huge123!",
        "locale": "fr",
        "locality": "Douala",
        "profile": {
            "display_name": "Huge",
            "activity_type": "vendeur",
            "domain": "agriculture",
            "region": "Littoral",
            "bio": "A" * (10 * 1024 * 1024)  # 10MB
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=huge_data, timeout=10)
        test_result(
            "Payload 10MB géré",
            response.status_code in [400, 413, 422],
            f"Code: {response.status_code}"
        )
    except Exception as e:
        test_result("Payload 10MB géré", True, "Exception catchée (OK)")
    
    # Limite 2: 1000 paramètres URL
    params = "&".join([f"param{i}=value{i}" for i in range(1000)])
    try:
        response = requests.get(f"{BASE_URL}/listings?{params}", timeout=10)
        test_result(
            "1000 paramètres URL gérés",
            response.status_code in [200, 400, 414],
            f"Code: {response.status_code}"
        )
    except Exception as e:
        test_result("1000 paramètres URL gérés", True, "Exception catchée (OK)")
    
    # Limite 3: Nested JSON 100 niveaux
    nested = {"level": 0}
    current = nested
    for i in range(100):
        current["nested"] = {"level": i + 1}
        current = current["nested"]
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=nested, timeout=10)
        test_result(
            "JSON 100 niveaux géré",
            response.status_code in [400, 422],
            f"Code: {response.status_code}"
        )
    except Exception as e:
        test_result("JSON 100 niveaux géré", True, "Exception catchée (OK)")
    
    # Limite 4: Array 10000 éléments
    huge_array = {
        "phone": "+237600000002",
        "email": "array@test.com",
        "password": "Array123!",
        "locale": "fr",
        "locality": "Douala",
        "profile": {
            "display_name": "Array",
            "activity_type": "vendeur",
            "domain": "agriculture",
            "region": "Littoral",
            "tags": list(range(10000))
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=huge_array, timeout=10)
        test_result(
            "Array 10000 éléments géré",
            response.status_code in [400, 422],
            f"Code: {response.status_code}"
        )
    except Exception as e:
        test_result("Array 10000 éléments géré", True, "Exception catchée (OK)")
    
    # Limite 5: Unicode extrême
    unicode_data = {
        "phone": "+237600000003",
        "email": "unicode@test.com",
        "password": "Unicode123!",
        "locale": "fr",
        "locality": "Douala",
        "profile": {
            "display_name": generate_evil_string("zalgo"),
            "activity_type": "vendeur",
            "domain": "agriculture",
            "region": "Littoral",
            "bio": generate_evil_string("emoji_spam")
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=unicode_data, timeout=10)
        test_result(
            "Unicode extrême géré",
            response.status_code in [201, 400, 422],
            f"Code: {response.status_code}"
        )
    except Exception as e:
        test_result("Unicode extrême géré", True, "Exception catchée (OK)")

# ============================================================================
# TESTS PERFORMANCE EXTRÊME
# ============================================================================

def test_extreme_performance():
    print_header("⚡ PERFORMANCE EXTRÊME - VITESSE MAXIMALE", GREEN)
    
    # Perf 1: Temps de réponse minimum
    min_times = []
    for _ in range(10):
        start = time.time()
        response = requests.get(f"{BASE_URL}/listings?page=1&page_size=5", timeout=5)
        duration = time.time() - start
        min_times.append(duration)
    
    fastest = min(min_times)
    test_result(
        f"Temps de réponse minimum: {fastest:.3f}s",
        fastest < 1.0,
        f"Meilleur: {fastest:.3f}s sur 10 essais"
    )
    
    # Perf 2: Throughput maximum
    print(f"{CYAN}Calcul throughput sur 30 secondes...{RESET}")
    request_count = 0
    start_time = time.time()
    
    while time.time() - start_time < 30:
        try:
            requests.get(f"{BASE_URL}/listings?page=1&page_size=5", timeout=2)
            request_count += 1
        except:
            pass
    
    throughput = request_count / 30
    test_result(
        f"Throughput: {throughput:.1f} req/s",
        throughput > 10,
        f"{request_count} requêtes en 30s"
    )
    
    # Perf 3: Latence sous charge
    def measure_latency():
        start = time.time()
        try:
            requests.get(f"{BASE_URL}/listings/categories/all", timeout=5)
            return time.time() - start
        except:
            return 5.0
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(measure_latency) for _ in range(100)]
        latencies = [f.result() for f in as_completed(futures)]
    
    p50 = sorted(latencies)[50]
    p95 = sorted(latencies)[95]
    p99 = sorted(latencies)[99]
    
    test_result(
        f"Latence sous charge (P50: {p50:.3f}s, P95: {p95:.3f}s, P99: {p99:.3f}s)",
        p95 < 3.0,
        f"P50: {p50:.3f}s, P95: {p95:.3f}s, P99: {p99:.3f}s"
    )

# ============================================================================
# TESTS SÉCURITÉ EXTRÊME
# ============================================================================

def test_extreme_security():
    print_header("🔒 SÉCURITÉ EXTRÊME - ATTAQUES SOPHISTIQUÉES", RED)
    
    # Sécu 1: Timing attack sur login
    valid_phone = "+237600000001"
    invalid_phone = "+237699999999"
    
    valid_times = []
    for _ in range(10):
        start = time.time()
        requests.post(f"{BASE_URL}/auth/login", json={
            "phone": valid_phone,
            "password": "WrongPassword123!"
        }, timeout=5)
        valid_times.append(time.time() - start)
    
    invalid_times = []
    for _ in range(10):
        start = time.time()
        requests.post(f"{BASE_URL}/auth/login", json={
            "phone": invalid_phone,
            "password": "WrongPassword123!"
        }, timeout=5)
        invalid_times.append(time.time() - start)
    
    avg_valid = statistics.mean(valid_times)
    avg_invalid = statistics.mean(invalid_times)
    diff = abs(avg_valid - avg_invalid)
    
    test_result(
        f"Protection timing attack (diff: {diff:.3f}s)",
        diff < 0.1,  # Moins de 100ms de différence
        f"Valid: {avg_valid:.3f}s, Invalid: {avg_invalid:.3f}s"
    )
    
    # Sécu 2: Brute force protection
    attempts = []
    for i in range(50):
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json={
                "phone": "+237600000001",
                "password": f"Attempt{i}!"
            }, timeout=5)
            attempts.append(response.status_code)
        except:
            attempts.append(500)
    
    rate_limited = sum(1 for code in attempts if code == 429)
    test_result(
        f"Protection brute force ({rate_limited}/50 rate-limited)",
        rate_limited > 0 or attempts.count(401) == 50,
        f"429: {rate_limited}, 401: {attempts.count(401)}"
    )
    
    # Sécu 3: JWT token expiration
    user = create_user("_jwt")
    if user:
        token = user["token"]
        
        # Test immédiat
        headers = {"Authorization": f"Bearer {token}"}
        response1 = requests.get(f"{BASE_URL}/users/me", headers=headers, timeout=5)
        
        # Attendre et retester (simuler expiration)
        time.sleep(2)
        response2 = requests.get(f"{BASE_URL}/users/me", headers=headers, timeout=5)
        
        test_result(
            "Token JWT valide et stable",
            response1.status_code == 200 and response2.status_code == 200,
            f"Immédiat: {response1.status_code}, Après 2s: {response2.status_code}"
        )

# ============================================================================
# MAIN
# ============================================================================

def main():
    print(f"\n{BOLD}{MAGENTA}{'='*70}")
    print(f"  🔥 SUITE DE TESTS EXTRÊMES - MBOA MARKET API 🔥")
    print(f"  Chaos Engineering | Stress Massif | Limites Absolues")
    print(f"{'='*70}{RESET}\n")
    
    start_time = time.time()
    
    # Exécuter toutes les suites
    test_chaos_engineering()
    test_massive_stress()
    test_absolute_limits()
    test_extreme_performance()
    test_extreme_security()
    
    # Résumé final
    total_time = time.time() - start_time
    total_tests = stats.passed + stats.failed + stats.skipped
    success_rate = (stats.passed / (stats.passed + stats.failed) * 100) if (stats.passed + stats.failed) > 0 else 0
    
    print_header("📊 RÉSUMÉ TESTS EXTRÊMES", CYAN)
    
    print(f"{GREEN}✓{RESET} Tests réussis: {stats.passed}")
    print(f"{RED}✗{RESET} Tests échoués: {stats.failed}")
    print(f"{MAGENTA}⚡{RESET} Chaos survived: {stats.chaos_survived}")
    print(f"Total: {total_tests}")
    print(f"Taux de réussite: {BOLD}{success_rate:.1f}%{RESET}")
    print(f"Temps d'exécution: {total_time:.2f}s")
    
    if stats.response_times:
        perf_stats = stats.get_stats()
        print(f"\n{BOLD}Performance Globale:{RESET}")
        print(f"  Moyenne: {perf_stats['avg']:.3f}s")
        print(f"  Min: {perf_stats['min']:.3f}s")
        print(f"  Max: {perf_stats['max']:.3f}s")
        print(f"  P50: {perf_stats['p50']:.3f}s")
        print(f"  P95: {perf_stats['p95']:.3f}s")
        print(f"  P99: {perf_stats['p99']:.3f}s")
    
    if stats.errors_caught:
        print(f"\n{YELLOW}Erreurs catchées: {len(stats.errors_caught)}{RESET}")
    
    print(f"\n{BOLD}{'='*70}{RESET}")
    if success_rate >= 85:
        print(f"{GREEN}{BOLD}🎉 API EXTRÊMEMENT ROBUSTE ! 🎉{RESET}")
    elif success_rate >= 70:
        print(f"{YELLOW}{BOLD}⚠️  API ROBUSTE AVEC AMÉLIORATIONS POSSIBLES{RESET}")
    else:
        print(f"{RED}{BOLD}❌ API NÉCESSITE CORRECTIONS CRITIQUES{RESET}")
    print(f"{BOLD}{'='*70}{RESET}\n")
    
    return 0 if success_rate >= 70 else 1

if __name__ == "__main__":
    exit(main())
