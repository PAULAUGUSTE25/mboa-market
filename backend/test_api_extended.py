"""
Suite de tests étendue et approfondie pour MBOA Market API
Teste TOUTES les corrections P0, P1, P2 avec scénarios réalistes
"""

import requests
import json
from typing import Optional, Dict, Any
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_PASSWORD = "TestP@ssw0rd123!"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    END = '\033[0m'

class ExtendedTestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.token = None
        self.user_id = None
        self.test_users = []
        self.test_listings = []
        self.test_conversations = []
        
    def log_success(self, message):
        print(f"{Colors.GREEN}✓ {message}{Colors.END}")
        self.passed += 1
        
    def log_error(self, message):
        print(f"{Colors.RED}✗ {message}{Colors.END}")
        self.failed += 1
        
    def log_skip(self, message):
        print(f"{Colors.YELLOW}⊘ {message}{Colors.END}")
        self.skipped += 1
        
    def log_info(self, message):
        print(f"{Colors.BLUE}ℹ {message}{Colors.END}")
        
    def log_section(self, message):
        print(f"\n{Colors.CYAN}{'='*70}")
        print(f"  {message}")
        print(f"{'='*70}{Colors.END}\n")

    def create_test_user(self, suffix="") -> Optional[Dict[str, Any]]:
        """Créer un utilisateur de test et retourner ses infos"""
        phone = f"+237690{int(time.time() * 1000) % 1000000:06d}"
        email = f"test_{int(time.time() * 1000)}_{suffix}@test.com"
        
        try:
            # Register
            response = requests.post(f"{BASE_URL}/auth/register", json={
                "phone": phone,
                "email": email,
                "password": TEST_PASSWORD,
                "profile": {
                    "display_name": f"Test User {suffix}",
                    "activity_type": "producteur",
                    "domain": "agriculture",
                    "region": "Centre",
                    "locality": "Yaoundé"
                }
            })
            
            if response.status_code != 201:
                return None
            
            # Login
            login_response = requests.post(f"{BASE_URL}/auth/login", json={
                "phone": phone,
                "password": TEST_PASSWORD
            })
            
            if login_response.status_code != 200:
                return None
            
            data = login_response.json()
            user_info = {
                "phone": phone,
                "email": email,
                "token": data.get("access_token"),
                "user_id": data.get("user", {}).get("id"),
                "password": TEST_PASSWORD
            }
            
            self.test_users.append(user_info)
            return user_info
            
        except Exception as e:
            self.log_error(f"Erreur création utilisateur: {e}")
            return None

    def create_test_listing(self, user_token: str) -> Optional[str]:
        """Créer un listing de test"""
        try:
            response = requests.post(
                f"{BASE_URL}/listings",
                headers={"Authorization": f"Bearer {user_token}"},
                json={
                    "title": f"Test Listing {int(time.time())}",
                    "description": "Test description",
                    "category_id": "00000000-0000-0000-0000-000000000001",
                    "product_ref_id": "00000000-0000-0000-0000-000000000001",
                    "price_per_unit": 1000,
                    "quantity": 100,
                    "unit": "kg",
                    "currency": "XAF",
                    "domain": "agriculture",
                    "region": "Centre",
                    "locality": "Yaoundé",
                    "status": "PUBLISHED"
                }
            )
            
            if response.status_code == 201:
                listing_id = response.json().get("id")
                self.test_listings.append(listing_id)
                return listing_id
            return None
        except Exception:
            return None

    # ==================== TESTS P0 - VALIDATIONS ====================
    
    def test_p0_password_validation_detailed(self):
        """Test détaillé validation mot de passe"""
        self.log_section("TEST P0: Validation Mot de Passe (Détaillé)")
        
        test_cases = [
            ("short", "Trop court (< 8 caractères)"),
            ("lowercase", "Que des minuscules"),
            ("UPPERCASE", "Que des majuscules"),
            ("NoDigits!", "Pas de chiffre"),
            ("NoSpecial1", "Pas de caractère spécial"),
            ("12345678", "Que des chiffres"),
            ("Abc123", "Trop court + manque spécial"),
            ("", "Vide"),
            ("   ", "Espaces uniquement"),
        ]
        
        for password, reason in test_cases:
            try:
                response = requests.post(f"{BASE_URL}/auth/register", json={
                    "phone": f"+237690{int(time.time() * 1000) % 1000000:06d}",
                    "email": f"test_{int(time.time() * 1000)}@test.com",
                    "password": password,
                    "profile": {
                        "display_name": "Test",
                        "activity_type": "producteur",
                        "domain": "agriculture",
                        "region": "Centre",
                        "locality": "Yaoundé"
                    }
                })
                
                if response.status_code in [400, 422]:
                    self.log_success(f"Rejeté: {reason}")
                else:
                    self.log_error(f"Accepté: {reason} (devrait rejeter)")
            except Exception as e:
                self.log_error(f"Erreur test: {reason} - {e}")

    def test_p0_email_validation(self):
        """Test validation format email"""
        self.log_section("TEST P0: Validation Format Email")
        
        invalid_emails = [
            ("notanemail", "Pas de @"),
            ("@nodomain.com", "Pas de nom avant @"),
            ("noat.com", "Pas de @"),
            ("multiple@@at.com", "Multiple @"),
        ]
        
        for email, reason in invalid_emails:
            try:
                response = requests.post(f"{BASE_URL}/auth/register", json={
                    "phone": f"+237690{int(time.time() * 1000) % 1000000:06d}",
                    "email": email,
                    "password": TEST_PASSWORD,
                    "profile": {
                        "display_name": "Test",
                        "activity_type": "producteur",
                        "domain": "agriculture",
                        "region": "Centre",
                        "locality": "Yaoundé"
                    }
                })
                
                if response.status_code in [400, 422]:
                    self.log_success(f"Email invalide rejeté: {reason}")
                else:
                    self.log_error(f"Email invalide accepté: {reason}")
            except Exception as e:
                self.log_error(f"Erreur: {e}")

    def test_p0_public_profile_security(self):
        """Test que le profil public ne contient pas de données sensibles"""
        self.log_section("TEST P0: Sécurité Profil Public")
        
        # Créer utilisateur
        user = self.create_test_user("public_profile")
        if not user:
            self.log_skip("Impossible de créer utilisateur")
            return
        
        try:
            # Récupérer profil public (sans auth)
            response = requests.get(f"{BASE_URL}/users/{user['user_id']}")
            
            if response.status_code == 200:
                profile = response.json()
                
                # Vérifier que données sensibles ne sont PAS présentes
                sensitive_fields = ["email", "phone", "password_hash", "password"]
                
                has_sensitive = False
                for field in sensitive_fields:
                    if field in profile:
                        self.log_error(f"Donnée sensible exposée: {field}")
                        has_sensitive = True
                
                if not has_sensitive:
                    self.log_success("Aucune donnée sensible dans profil public")
                    
                # Vérifier que données publiques SONT présentes
                if "display_name" in profile.get("profile", {}):
                    self.log_success("Données publiques présentes")
                else:
                    self.log_error("Données publiques manquantes")
            else:
                self.log_error(f"Échec récupération profil: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erreur test profil public: {e}")

    def test_p0_stock_validation(self):
        """Test validation stock disponible"""
        self.log_section("TEST P0: Validation Stock Disponible")
        
        # Créer vendeur et acheteur
        seller = self.create_test_user("seller")
        buyer = self.create_test_user("buyer")
        
        if not seller or not buyer:
            self.log_skip("Impossible de créer utilisateurs")
            return
        
        # Créer listing avec stock limité
        listing_id = self.create_test_listing(seller["token"])
        if not listing_id:
            self.log_skip("Impossible de créer listing")
            return
        
        try:
            # Tenter de commander plus que le stock (100 disponibles)
            response = requests.post(
                f"{BASE_URL}/orders",
                headers={"Authorization": f"Bearer {buyer['token']}"},
                json={
                    "listing_id": listing_id,
                    "quantity": 150,  # Plus que disponible
                    "delivery_address": "Test Address"
                }
            )
            
            if response.status_code == 400:
                error = response.json().get("detail", "")
                if "stock" in error.lower() or "insufficient" in error.lower():
                    self.log_success("Commande excédant stock rejetée")
                else:
                    self.log_error(f"Rejeté mais mauvais message: {error}")
            else:
                self.log_error("Commande excédant stock acceptée")
            
            # Tester commande valide
            response = requests.post(
                f"{BASE_URL}/orders",
                headers={"Authorization": f"Bearer {buyer['token']}"},
                json={
                    "listing_id": listing_id,
                    "quantity": 50,  # Dans le stock
                    "delivery_address": "Test Address"
                }
            )
            
            if response.status_code == 201:
                self.log_success("Commande valide acceptée")
            else:
                self.log_error(f"Commande valide rejetée: {response.status_code}")
                
        except Exception as e:
            self.log_error(f"Erreur test stock: {e}")

    def test_p0_order_status_transitions(self):
        """Test validation transitions de statut"""
        self.log_section("TEST P0: Validation Transitions Statut")
        
        # Créer vendeur et acheteur
        seller = self.create_test_user("seller_status")
        buyer = self.create_test_user("buyer_status")
        
        if not seller or not buyer:
            self.log_skip("Impossible de créer utilisateurs")
            return
        
        # Créer listing et commande
        listing_id = self.create_test_listing(seller["token"])
        if not listing_id:
            self.log_skip("Impossible de créer listing")
            return
        
        try:
            # Créer commande
            order_response = requests.post(
                f"{BASE_URL}/orders",
                headers={"Authorization": f"Bearer {buyer['token']}"},
                json={
                    "listing_id": listing_id,
                    "quantity": 10,
                    "delivery_address": "Test Address"
                }
            )
            
            if order_response.status_code != 201:
                self.log_skip("Impossible de créer commande")
                return
            
            order_id = order_response.json().get("id")
            
            # Mettre à COMPLETED
            response = requests.put(
                f"{BASE_URL}/orders/{order_id}/status",
                headers={"Authorization": f"Bearer {seller['token']}"},
                json={"status": "COMPLETED"}
            )
            
            if response.status_code == 200:
                self.log_success("Transition vers COMPLETED acceptée")
                
                # Tenter transition invalide: COMPLETED -> PENDING
                response = requests.put(
                    f"{BASE_URL}/orders/{order_id}/status",
                    headers={"Authorization": f"Bearer {seller['token']}"},
                    json={"status": "CREATED"}
                )
                
                if response.status_code == 400:
                    self.log_success("Transition invalide COMPLETED->CREATED rejetée")
                else:
                    self.log_error("Transition invalide acceptée")
            else:
                self.log_error(f"Échec transition: {response.status_code}")
                
        except Exception as e:
            self.log_error(f"Erreur test transitions: {e}")

    # ==================== TESTS P1 - PAGINATION ====================
    
    def test_p1_pagination_comprehensive(self):
        """Test complet pagination avec différentes tailles"""
        self.log_section("TEST P1: Pagination Complète")
        
        user = self.create_test_user("pagination")
        if not user:
            self.log_skip("Impossible de créer utilisateur")
            return
        
        headers = {"Authorization": f"Bearer {user['token']}"}
        
        # Test différentes tailles de page
        page_sizes = [5, 10, 20, 50, 100]
        
        for size in page_sizes:
            try:
                response = requests.get(
                    f"{BASE_URL}/conversations?page=1&page_size={size}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("page_size") == size:
                        self.log_success(f"Pagination page_size={size} fonctionne")
                    else:
                        self.log_error(f"page_size incorrect pour {size}")
                else:
                    self.log_error(f"Échec pagination size={size}")
            except Exception as e:
                self.log_error(f"Erreur pagination size={size}: {e}")
        
        # Test limites
        try:
            response = requests.get(
                f"{BASE_URL}/conversations?page=1&page_size=150",
                headers=headers
            )
            
            if response.status_code == 422:
                self.log_success("page_size > 100 rejeté")
            else:
                self.log_error("page_size > 100 accepté")
        except Exception as e:
            self.log_error(f"Erreur test limite: {e}")

    def test_p1_message_validation_with_conversation(self):
        """Test validation messages avec conversation réelle"""
        self.log_section("TEST P1: Validation Messages (Avec Conversation)")
        
        # Créer deux utilisateurs
        user1 = self.create_test_user("msg_user1")
        user2 = self.create_test_user("msg_user2")
        
        if not user1 or not user2:
            self.log_skip("Impossible de créer utilisateurs")
            return
        
        # Créer listing pour conversation
        listing_id = self.create_test_listing(user1["token"])
        if not listing_id:
            self.log_skip("Impossible de créer listing")
            return
        
        try:
            # Créer conversation
            conv_response = requests.post(
                f"{BASE_URL}/conversations",
                headers={"Authorization": f"Bearer {user2['token']}"},
                json={
                    "participant_user_id": user1["user_id"],
                    "listing_id": listing_id,
                    "initial_message": "Hello, interested in your product!"
                }
            )
            
            if conv_response.status_code != 201:
                self.log_skip("Impossible de créer conversation")
                return
            
            conv_id = conv_response.json().get("id")
            
            # Test message vide
            response = requests.post(
                f"{BASE_URL}/conversations/{conv_id}/messages",
                headers={"Authorization": f"Bearer {user2['token']}"},
                json={"content": ""}
            )
            
            if response.status_code in [400, 422]:
                self.log_success("Message vide rejeté")
            else:
                self.log_error("Message vide accepté")
            
            # Test message avec espaces uniquement
            response = requests.post(
                f"{BASE_URL}/conversations/{conv_id}/messages",
                headers={"Authorization": f"Bearer {user2['token']}"},
                json={"content": "   "}
            )
            
            if response.status_code in [400, 422]:
                self.log_success("Message espaces uniquement rejeté")
            else:
                self.log_error("Message espaces uniquement accepté")
            
            # Test message trop long
            long_message = "x" * 5001
            response = requests.post(
                f"{BASE_URL}/conversations/{conv_id}/messages",
                headers={"Authorization": f"Bearer {user2['token']}"},
                json={"content": long_message}
            )
            
            if response.status_code in [400, 422]:
                self.log_success("Message trop long rejeté")
            else:
                self.log_error("Message trop long accepté")
            
            # Test message valide
            response = requests.post(
                f"{BASE_URL}/conversations/{conv_id}/messages",
                headers={"Authorization": f"Bearer {user2['token']}"},
                json={"content": "This is a valid message!"}
            )
            
            if response.status_code == 201:
                self.log_success("Message valide accepté")
            else:
                self.log_error(f"Message valide rejeté: {response.status_code}")
                
        except Exception as e:
            self.log_error(f"Erreur test messages: {e}")

    # ==================== TESTS P2 - FILTRES ====================
    
    def test_p2_filters_comprehensive(self):
        """Test complet de tous les filtres"""
        self.log_section("TEST P2: Filtres Complets")
        
        # Test filtres listings
        filters = [
            ("domain=agriculture", "Filtre domain agriculture"),
            ("domain=elevage", "Filtre domain élevage"),
            ("region=Centre", "Filtre region"),
            ("domain=agriculture&region=Centre", "Filtres combinés"),
        ]
        
        for filter_str, description in filters:
            try:
                response = requests.get(f"{BASE_URL}/listings?{filter_str}")
                
                if response.status_code == 200:
                    self.log_success(f"{description} fonctionne")
                else:
                    self.log_error(f"{description} échoue: {response.status_code}")
            except Exception as e:
                self.log_error(f"Erreur {description}: {e}")

    def test_p2_order_status_filter_correct(self):
        """Test filtre status avec valeurs correctes"""
        self.log_section("TEST P2: Filtre Status Orders (Valeurs Correctes)")
        
        user = self.create_test_user("order_filter")
        if not user:
            self.log_skip("Impossible de créer utilisateur")
            return
        
        headers = {"Authorization": f"Bearer {user['token']}"}
        
        # Test statuts valides
        valid_statuses = [
            "CREATED",
            "AWAITING_PAYMENT",
            "PAID_IN_ESCROW",
            "IN_PREPARATION",
            "COMPLETED"
        ]
        
        for status in valid_statuses:
            try:
                response = requests.get(
                    f"{BASE_URL}/orders/my-orders?status={status}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    self.log_success(f"Filtre status={status} fonctionne")
                else:
                    self.log_error(f"Filtre status={status} échoue: {response.status_code}")
            except Exception as e:
                self.log_error(f"Erreur status={status}: {e}")
        
        # Test status invalide
        try:
            response = requests.get(
                f"{BASE_URL}/orders/my-orders?status=INVALID_STATUS",
                headers=headers
            )
            
            if response.status_code == 400:
                error = response.json().get("detail", "")
                if "Invalid status" in error or "Valid values" in error:
                    self.log_success("Status invalide rejeté avec message clair")
                else:
                    self.log_error(f"Rejeté mais message peu clair: {error}")
            else:
                self.log_error("Status invalide accepté")
        except Exception as e:
            self.log_error(f"Erreur test status invalide: {e}")

    # ==================== TESTS DE PERFORMANCE ====================
    
    def test_performance_n_plus_1(self):
        """Test que l'optimisation N+1 fonctionne"""
        self.log_section("TEST PERFORMANCE: Optimisation N+1")
        
        user = self.create_test_user("perf")
        if not user:
            self.log_skip("Impossible de créer utilisateur")
            return
        
        headers = {"Authorization": f"Bearer {user['token']}"}
        
        try:
            # Mesurer temps de réponse conversations
            start = time.time()
            response = requests.get(
                f"{BASE_URL}/conversations?page=1&page_size=20",
                headers=headers
            )
            elapsed = time.time() - start
            
            if response.status_code == 200:
                if elapsed < 1.0:  # Moins de 1 seconde
                    self.log_success(f"Conversations rapides: {elapsed:.3f}s")
                else:
                    self.log_error(f"Conversations lentes: {elapsed:.3f}s")
            else:
                self.log_error(f"Échec requête: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erreur test performance: {e}")

    def test_response_times(self):
        """Test temps de réponse de différents endpoints"""
        self.log_section("TEST PERFORMANCE: Temps de Réponse")
        
        endpoints = [
            ("GET", "/listings?page=1&page_size=20", None, None),
            ("GET", "/listings/categories/all", None, None),
            ("GET", "/listings/products/all", None, None),
        ]
        
        for method, endpoint, headers, data in endpoints:
            try:
                start = time.time()
                if method == "GET":
                    response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
                elapsed = time.time() - start
                
                if response.status_code == 200:
                    if elapsed < 0.5:
                        self.log_success(f"{endpoint}: {elapsed:.3f}s (rapide)")
                    elif elapsed < 1.0:
                        self.log_info(f"{endpoint}: {elapsed:.3f}s (acceptable)")
                    else:
                        self.log_error(f"{endpoint}: {elapsed:.3f}s (lent)")
                else:
                    self.log_error(f"{endpoint}: {response.status_code}")
            except Exception as e:
                self.log_error(f"Erreur {endpoint}: {e}")

    # ==================== TESTS DE SÉCURITÉ ====================
    
    def test_security_authorization(self):
        """Test que les endpoints protégés nécessitent authentification"""
        self.log_section("TEST SÉCURITÉ: Autorisation")
        
        protected_endpoints = [
            ("GET", "/conversations"),
            ("GET", "/orders/my-orders"),
            ("GET", "/listings/my/listings"),
            ("GET", "/users/me"),
        ]
        
        for method, endpoint in protected_endpoints:
            try:
                # Sans token
                response = requests.get(f"{BASE_URL}{endpoint}")
                
                if response.status_code == 401:
                    self.log_success(f"{endpoint} protégé (401 sans auth)")
                elif response.status_code == 403:
                    self.log_success(f"{endpoint} protégé (403 sans auth)")
                else:
                    self.log_error(f"{endpoint} accessible sans auth: {response.status_code}")
            except Exception as e:
                self.log_error(f"Erreur {endpoint}: {e}")

    def test_security_cannot_order_own_listing(self):
        """Test qu'on ne peut pas commander son propre listing"""
        self.log_section("TEST SÉCURITÉ: Pas de Commande Propre Listing")
        
        user = self.create_test_user("self_order")
        if not user:
            self.log_skip("Impossible de créer utilisateur")
            return
        
        # Créer listing
        listing_id = self.create_test_listing(user["token"])
        if not listing_id:
            self.log_skip("Impossible de créer listing")
            return
        
        try:
            # Tenter de commander son propre listing
            response = requests.post(
                f"{BASE_URL}/orders",
                headers={"Authorization": f"Bearer {user['token']}"},
                json={
                    "listing_id": listing_id,
                    "quantity": 10,
                    "delivery_address": "Test"
                }
            )
            
            if response.status_code == 400:
                error = response.json().get("detail", "")
                if "own" in error.lower():
                    self.log_success("Commande propre listing rejetée")
                else:
                    self.log_error(f"Rejeté mais mauvais message: {error}")
            else:
                self.log_error("Commande propre listing acceptée")
        except Exception as e:
            self.log_error(f"Erreur test: {e}")

    # ==================== EXÉCUTION ====================
    
    def run_all_tests(self):
        """Exécuter tous les tests"""
        print(f"\n{Colors.MAGENTA}{'='*70}")
        print(f"  SUITE DE TESTS ÉTENDUE - MBOA MARKET API")
        print(f"  Tests Complets P0, P1, P2 + Performance + Sécurité")
        print(f"{'='*70}{Colors.END}\n")
        
        start_time = time.time()
        
        # Tests P0 - Validations
        self.test_p0_password_validation_detailed()
        self.test_p0_email_validation()
        self.test_p0_public_profile_security()
        self.test_p0_stock_validation()
        self.test_p0_order_status_transitions()
        
        # Tests P1 - Pagination et Validation
        self.test_p1_pagination_comprehensive()
        self.test_p1_message_validation_with_conversation()
        
        # Tests P2 - Filtres
        self.test_p2_filters_comprehensive()
        self.test_p2_order_status_filter_correct()
        
        # Tests Performance
        self.test_performance_n_plus_1()
        self.test_response_times()
        
        # Tests Sécurité
        self.test_security_authorization()
        self.test_security_cannot_order_own_listing()
        
        elapsed = time.time() - start_time
        
        # Résumé
        self.print_summary(elapsed)

    def print_summary(self, elapsed_time):
        """Afficher le résumé des tests"""
        total = self.passed + self.failed + self.skipped
        success_rate = (self.passed / total * 100) if total > 0 else 0
        
        print(f"\n{Colors.MAGENTA}{'='*70}")
        print(f"  RÉSUMÉ DES TESTS ÉTENDUS")
        print(f"{'='*70}{Colors.END}\n")
        
        print(f"{Colors.GREEN}✓ Tests réussis: {self.passed}{Colors.END}")
        print(f"{Colors.RED}✗ Tests échoués: {self.failed}{Colors.END}")
        print(f"{Colors.YELLOW}⊘ Tests ignorés: {self.skipped}{Colors.END}")
        print(f"Total: {total}")
        print(f"Taux de réussite: {success_rate:.1f}%")
        print(f"Temps d'exécution: {elapsed_time:.2f}s\n")
        
        if self.failed == 0 and self.skipped == 0:
            print(f"{Colors.GREEN}🎉 TOUS LES TESTS SONT PASSÉS !{Colors.END}\n")
        elif self.failed == 0:
            print(f"{Colors.YELLOW}⚠️  Tous les tests exécutés sont passés (certains ignorés){Colors.END}\n")
        else:
            print(f"{Colors.RED}✗ Certains tests ont échoué{Colors.END}\n")
        
        # Statistiques utilisateurs créés
        print(f"{Colors.CYAN}Ressources de test créées:{Colors.END}")
        print(f"  - Utilisateurs: {len(self.test_users)}")
        print(f"  - Listings: {len(self.test_listings)}")
        print(f"  - Conversations: {len(self.test_conversations)}\n")

if __name__ == "__main__":
    runner = ExtendedTestRunner()
    runner.run_all_tests()
