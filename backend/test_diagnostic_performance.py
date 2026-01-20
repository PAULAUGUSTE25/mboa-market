"""
Diagnostic approfondi pour identifier le goulot d'étranglement
"""

import requests
import time
import asyncio
from sqlalchemy import text, select
from app.core.database import engine, AsyncSessionLocal
from app.models.listing import Listing

BASE_URL = "http://localhost:8000/api"

async def test_direct_db():
    """Test direct sur la DB sans passer par l'API"""
    print("\n🔍 Test 1: Requête DB directe (sans API)")
    
    times = []
    async with AsyncSessionLocal() as session:
        for i in range(10):
            start = time.time()
            result = await session.execute(
                select(Listing).limit(20)
            )
            listings = result.scalars().all()
            duration = time.time() - start
            times.append(duration)
            print(f"  Requête {i+1}: {duration:.4f}s ({len(listings)} résultats)")
    
    avg = sum(times) / len(times)
    print(f"  ⏱️  Temps moyen DB: {avg:.4f}s")
    return avg

def test_api_localhost():
    """Test API via localhost"""
    print("\n🔍 Test 2: API via localhost (avec réseau)")
    
    times = []
    for i in range(10):
        start = time.time()
        response = requests.get(f"{BASE_URL}/listings?page=1&page_size=20", timeout=5)
        duration = time.time() - start
        times.append(duration)
        print(f"  Requête {i+1}: {duration:.4f}s (status: {response.status_code})")
    
    avg = sum(times) / len(times)
    print(f"  ⏱️  Temps moyen API: {avg:.4f}s")
    return avg

def test_api_simple():
    """Test endpoint simple sans DB"""
    print("\n🔍 Test 3: Endpoint simple (health check)")
    
    times = []
    for i in range(10):
        try:
            start = time.time()
            response = requests.get(f"{BASE_URL}/../docs", timeout=5)
            duration = time.time() - start
            times.append(duration)
            print(f"  Requête {i+1}: {duration:.4f}s")
        except:
            print(f"  Requête {i+1}: Erreur")
    
    if times:
        avg = sum(times) / len(times)
        print(f"  ⏱️  Temps moyen endpoint simple: {avg:.4f}s")
        return avg
    return 0

def test_network_overhead():
    """Test overhead réseau pur"""
    print("\n🔍 Test 4: Overhead réseau (ping)")
    
    times = []
    for i in range(10):
        start = time.time()
        try:
            requests.get("http://localhost:8000", timeout=5)
        except:
            pass
        duration = time.time() - start
        times.append(duration)
        print(f"  Ping {i+1}: {duration:.4f}s")
    
    avg = sum(times) / len(times)
    print(f"  ⏱️  Temps moyen réseau: {avg:.4f}s")
    return avg

async def main():
    print("="*70)
    print("  🔬 DIAGNOSTIC PERFORMANCE - IDENTIFICATION GOULOT")
    print("="*70)
    
    # Test 1: DB directe
    db_time = await test_direct_db()
    
    # Test 2: API complète
    api_time = test_api_localhost()
    
    # Test 3: Endpoint simple
    simple_time = test_api_simple()
    
    # Test 4: Réseau
    network_time = test_network_overhead()
    
    # Analyse
    print("\n" + "="*70)
    print("  📊 ANALYSE DES RÉSULTATS")
    print("="*70)
    
    print(f"\n⏱️  Temps mesurés:")
    print(f"  DB directe:        {db_time:.4f}s")
    print(f"  API complète:      {api_time:.4f}s")
    print(f"  Endpoint simple:   {simple_time:.4f}s")
    print(f"  Overhead réseau:   {network_time:.4f}s")
    
    overhead = api_time - db_time
    print(f"\n🔍 Overhead API:      {overhead:.4f}s ({overhead/api_time*100:.1f}%)")
    
    print(f"\n💡 DIAGNOSTIC:")
    
    if db_time > 0.5:
        print(f"  ⚠️  DB lente ({db_time:.3f}s) - Index pas efficaces ou requêtes lourdes")
    else:
        print(f"  ✅ DB rapide ({db_time:.3f}s) - Index fonctionnent bien")
    
    if overhead > 1.5:
        print(f"  🔴 Overhead API énorme ({overhead:.3f}s) - Problème réseau/middleware")
    elif overhead > 0.5:
        print(f"  🟡 Overhead API significatif ({overhead:.3f}s) - Middleware/serialization")
    else:
        print(f"  ✅ Overhead API acceptable ({overhead:.3f}s)")
    
    if network_time > 1.0:
        print(f"  🔴 Délai réseau fixe ({network_time:.3f}s) - Configuration timeout?")
    else:
        print(f"  ✅ Réseau rapide ({network_time:.3f}s)")
    
    print("\n" + "="*70)
    
    # Recommandations
    print("\n🎯 RECOMMANDATIONS:")
    
    if network_time > 1.0:
        print("  1. Vérifier configuration timeout réseau")
        print("  2. Désactiver keep-alive ou ajuster timeouts")
        print("  3. Tester avec curl direct pour isoler le problème")
    
    if overhead > 1.0:
        print("  4. Profiler le code API (cProfile)")
        print("  5. Vérifier middleware (CORS, logging, etc.)")
        print("  6. Optimiser sérialisation Pydantic")
    
    if db_time > 0.5:
        print("  7. Analyser EXPLAIN QUERY PLAN")
        print("  8. Ajouter plus d'index spécifiques")
        print("  9. Utiliser connection pooling")
    
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
