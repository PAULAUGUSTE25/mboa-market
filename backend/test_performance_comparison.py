"""
Test de performance rapide pour mesurer l'impact des index DB
Compare les temps de réponse avant/après optimisations
"""

import requests
import time
import statistics

BASE_URL = "http://localhost:8000/api"

GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RESET = "\033[0m"
BOLD = "\033[1m"

def test_endpoint(name, url, count=50):
    """Tester un endpoint plusieurs fois et calculer les stats"""
    print(f"\n{CYAN}Testing {name}...{RESET}")
    times = []
    errors = 0
    
    for i in range(count):
        try:
            start = time.time()
            response = requests.get(url, timeout=5)
            duration = time.time() - start
            times.append(duration)
            
            if response.status_code != 200:
                errors += 1
        except Exception as e:
            errors += 1
            times.append(5.0)
        
        if (i + 1) % 10 == 0:
            print(f"  {i + 1}/{count}...", end="\r")
    
    if times:
        avg = statistics.mean(times)
        min_time = min(times)
        max_time = max(times)
        p50 = sorted(times)[len(times) // 2]
        p95 = sorted(times)[int(len(times) * 0.95)]
        
        print(f"\n{GREEN}✓{RESET} {name}")
        print(f"  Avg: {avg:.3f}s | Min: {min_time:.3f}s | Max: {max_time:.3f}s")
        print(f"  P50: {p50:.3f}s | P95: {p95:.3f}s | Errors: {errors}/{count}")
        
        return {
            "name": name,
            "avg": avg,
            "min": min_time,
            "max": max_time,
            "p50": p50,
            "p95": p95,
            "errors": errors,
            "count": count
        }
    
    return None

def main():
    print(f"\n{BOLD}{CYAN}{'='*70}")
    print(f"  🚀 TEST PERFORMANCE AVEC INDEX DB ACTIFS")
    print(f"  Mesure de l'amélioration après ajout de 27 index")
    print(f"{'='*70}{RESET}\n")
    
    results = []
    
    # Test 1: Listings (avec index sur status, created_at, category_id, region, domain)
    results.append(test_endpoint(
        "GET /listings (page 1)",
        f"{BASE_URL}/listings?page=1&page_size=20",
        count=50
    ))
    
    # Test 2: Listings avec filtres (utilise index composites)
    results.append(test_endpoint(
        "GET /listings (avec filtres)",
        f"{BASE_URL}/listings?page=1&page_size=20&region=Littoral&domain=agriculture",
        count=50
    ))
    
    # Test 3: Categories (avec index is_active)
    results.append(test_endpoint(
        "GET /categories/all",
        f"{BASE_URL}/listings/categories/all",
        count=50
    ))
    
    # Test 4: Products (avec index is_active)
    results.append(test_endpoint(
        "GET /products/all",
        f"{BASE_URL}/listings/products/all",
        count=50
    ))
    
    # Résumé
    print(f"\n{BOLD}{CYAN}{'='*70}")
    print(f"  📊 RÉSUMÉ PERFORMANCE AVEC INDEX")
    print(f"{'='*70}{RESET}\n")
    
    total_avg = statistics.mean([r["avg"] for r in results if r])
    total_p95 = statistics.mean([r["p95"] for r in results if r])
    total_errors = sum([r["errors"] for r in results if r])
    
    print(f"{BOLD}Performance Globale:{RESET}")
    print(f"  Temps moyen: {total_avg:.3f}s")
    print(f"  P95 moyen: {total_p95:.3f}s")
    print(f"  Erreurs totales: {total_errors}")
    
    # Comparaison avec résultats précédents
    print(f"\n{BOLD}Comparaison Avant/Après Index:{RESET}")
    print(f"  {YELLOW}AVANT (sans index):{RESET}")
    print(f"    - Temps moyen: 2.061s")
    print(f"    - P95: 2.086s")
    print(f"    - Throughput: 0.5 req/s")
    
    print(f"\n  {GREEN}APRÈS (avec 27 index):{RESET}")
    print(f"    - Temps moyen: {total_avg:.3f}s")
    print(f"    - P95: {total_p95:.3f}s")
    print(f"    - Throughput estimé: {1/total_avg:.1f} req/s")
    
    improvement = ((2.061 - total_avg) / 2.061) * 100
    print(f"\n  {BOLD}{GREEN}Amélioration: {improvement:+.1f}%{RESET}")
    
    if improvement > 30:
        print(f"\n{GREEN}{BOLD}🎉 AMÉLIORATION SIGNIFICATIVE ! 🎉{RESET}")
    elif improvement > 10:
        print(f"\n{GREEN}{BOLD}✅ AMÉLIORATION NOTABLE{RESET}")
    elif improvement > 0:
        print(f"\n{YELLOW}{BOLD}⚠️  AMÉLIORATION LÉGÈRE{RESET}")
    else:
        print(f"\n{YELLOW}{BOLD}⚠️  PAS D'AMÉLIORATION VISIBLE{RESET}")
    
    print(f"\n{BOLD}{'='*70}{RESET}\n")
    
    return 0 if improvement > 10 else 1

if __name__ == "__main__":
    exit(main())
