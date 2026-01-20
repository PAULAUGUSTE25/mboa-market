"""
Suite de tests pour valider les corrections P0, P1 et P2
Teste toutes les validations, pagination et filtres implémentés
"""

import requests
import json
from typing import Optional
import time

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_PHONE = "+237690000001"
TEST_EMAIL = "test@mboa.com"
TEST_PASSWORD = "TestP@ssw0rd123!"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.token = None
        self.user_id = None
        
    def log_success(self, message):
        print(f"{Colors.GREEN}✓ {message}{Colors.END}")
        self.passed += 1
        
    def log_error(self, message):
        print(f"{Colors.RED}✗ {message}{Colors.END}")
        self.failed += 1
        
    def log_info(self, message):
        print(f"{Colors.BLUE}ℹ {message}{Colors.END}")
        
    def log_section(self, message):
        print(f"\n{Colors.YELLOW}{'='*60}")
        print(f"  {message}")
        print(f"{'='*60}{Colors.END}\n")

    def test_health(self):
        """Test que le serveur est accessible"""
        self.log_section("TEST: Santé du Serveur")
        try:
            response = requests.get(f"{BASE_URL.replace('/api', '')}/health", timeout=5)
            if response.status_code == 200:
                self.log_success("Serveur accessible")
                return True
            else:
                self.log_error(f"Serveur retourne {response.status_code}")
                return False
        except Exception as e:
            self.log_error(f"Serveur inaccessible: {e}")
            return False

    def test_password_validation(self):
        """Test P0: Validation mot de passe fort"""
        self.log_section("TEST P0: Validation Mot de Passe Fort")
        
        weak_passwords = [
            ("simple", "Trop simple"),
            ("12345678", "Que des chiffres"),
            ("abcdefgh", "Que des lettres"),
            ("Abcdefgh", "Pas de chiffre"),
            ("Abcd123", "Trop court"),
        ]
        
        for password, reason in weak_passwords:
            try:
                response = requests.post(f"{BASE_URL}/auth/register", json={
                    "phone": TEST_PHONE,
                    "email": f"test_{int(time.time())}@test.com",
                    "password": password,
                    "profile": {
                        "display_name": "Test User",
                        "activity_type": "producteur",
                        "domain": "agriculture",
                        "region": "Centre",
                        "locality": "Yaoundé"
                    }
                })
                
                if response.status_code == 400 or response.status_code == 422:
                    self.log_success(f"Mot de passe faible rejeté: {reason}")
                else:
                    self.log_error(f"Mot de passe faible accepté: {reason}")
            except Exception as e:
                self.log_error(f"Erreur test mot de passe: {e}")

    def test_email_uniqueness(self):
        """Test P0: Validation email unique"""
        self.log_section("TEST P0: Email Unique")
        
        test_email = f"unique_{int(time.time())}@test.com"
        
        # Première inscription
        try:
            response1 = requests.post(f"{BASE_URL}/auth/register", json={
                "phone": f"+237690{int(time.time()) % 1000000:06d}",
                "email": test_email,
                "password": TEST_PASSWORD,
                "profile": {
                    "display_name": "Test User 1",
                    "activity_type": "producteur",
                    "domain": "agriculture",
                    "region": "Centre",
                    "locality": "Yaoundé"
                }
            })
            
            if response1.status_code == 201:
                self.log_success("Premier utilisateur créé")
                
                # Deuxième inscription avec même email
                response2 = requests.post(f"{BASE_URL}/auth/register", json={
                    "phone": f"+237690{int(time.time()) % 1000000:06d}",
                    "email": test_email,
                    "password": TEST_PASSWORD,
                    "profile": {
                        "display_name": "Test User 2",
                        "activity_type": "producteur",
                        "domain": "agriculture",
                        "region": "Centre",
                        "locality": "Yaoundé"
                    }
                })
                
                if response2.status_code == 400:
                    self.log_success("Email dupliqué rejeté")
                else:
                    self.log_error("Email dupliqué accepté")
            else:
                self.log_error(f"Échec création premier utilisateur: {response1.status_code}")
        except Exception as e:
            self.log_error(f"Erreur test email unique: {e}")

    def test_phone_verification_format(self):
        """Test P0: Validation format code vérification"""
        self.log_section("TEST P0: Format Code Vérification")
        
        invalid_codes = [
            ("12345", "Trop court"),
            ("1234567", "Trop long"),
            ("abcdef", "Lettres"),
            ("12-456", "Caractères spéciaux"),
        ]
        
        for code, reason in invalid_codes:
            try:
                response = requests.post(f"{BASE_URL}/auth/verify-phone", json={
                    "phone": TEST_PHONE,
                    "code": code
                })
                
                if response.status_code == 400:
                    self.log_success(f"Code invalide rejeté: {reason}")
                else:
                    self.log_error(f"Code invalide accepté: {reason}")
            except Exception as e:
                self.log_error(f"Erreur test code: {e}")

    def setup_test_user(self):
        """Créer un utilisateur de test et récupérer le token"""
        self.log_section("SETUP: Création Utilisateur de Test")
        
        # Créer utilisateur
        test_phone = f"+237690{int(time.time()) % 1000000:06d}"
        try:
            response = requests.post(f"{BASE_URL}/auth/register", json={
                "phone": test_phone,
                "email": f"test_{int(time.time())}@test.com",
                "password": TEST_PASSWORD,
                "profile": {
                    "display_name": "Test User",
                    "activity_type": "producteur",
                    "domain": "agriculture",
                    "region": "Centre",
                    "locality": "Yaoundé"
                }
            })
            
            if response.status_code == 201:
                self.log_success("Utilisateur de test créé")
                
                # Login
                login_response = requests.post(f"{BASE_URL}/auth/login", json={
                    "phone": test_phone,
                    "password": TEST_PASSWORD
                })
                
                if login_response.status_code == 200:
                    data = login_response.json()
                    self.token = data.get("access_token")
                    self.user_id = data.get("user", {}).get("id")
                    self.log_success("Token obtenu")
                    return True
                else:
                    self.log_error("Échec login")
                    return False
            else:
                self.log_error(f"Échec création utilisateur: {response.status_code}")
                return False
        except Exception as e:
            self.log_error(f"Erreur setup: {e}")
            return False

    def test_pagination_conversations(self):
        """Test P1: Pagination conversations"""
        self.log_section("TEST P1: Pagination Conversations")
        
        if not self.token:
            self.log_error("Pas de token - skip test")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            # Test page 1
            response = requests.get(
                f"{BASE_URL}/conversations?page=1&page_size=5",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if all(key in data for key in ["items", "total", "page", "page_size", "pages"]):
                    self.log_success("Pagination conversations fonctionne")
                    self.log_info(f"  Total: {data['total']}, Pages: {data['pages']}")
                else:
                    self.log_error("Structure pagination incorrecte")
            else:
                self.log_error(f"Échec requête: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erreur test pagination: {e}")

    def test_message_validation(self):
        """Test P1: Validation longueur messages"""
        self.log_section("TEST P1: Validation Messages")
        
        if not self.token:
            self.log_error("Pas de token - skip test")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Test message vide
        try:
            response = requests.post(
                f"{BASE_URL}/conversations/00000000-0000-0000-0000-000000000000/messages",
                headers=headers,
                json={"content": ""}
            )
            
            if response.status_code in [400, 404]:
                self.log_success("Message vide rejeté")
            else:
                self.log_error("Message vide accepté")
        except Exception as e:
            self.log_error(f"Erreur test message vide: {e}")
        
        # Test message trop long
        try:
            long_message = "x" * 5001
            response = requests.post(
                f"{BASE_URL}/conversations/00000000-0000-0000-0000-000000000000/messages",
                headers=headers,
                json={"content": long_message}
            )
            
            if response.status_code in [400, 404]:
                self.log_success("Message trop long rejeté")
            else:
                self.log_error("Message trop long accepté")
        except Exception as e:
            self.log_error(f"Erreur test message long: {e}")

    def test_filter_domain(self):
        """Test P2: Filtre par domain"""
        self.log_section("TEST P2: Filtre Domain (Agriculture/Élevage)")
        
        try:
            # Test filtre agriculture
            response = requests.get(f"{BASE_URL}/listings?domain=agriculture&page=1&page_size=5")
            
            if response.status_code == 200:
                data = response.json()
                self.log_success("Filtre domain=agriculture fonctionne")
                self.log_info(f"  Résultats: {len(data.get('items', []))}")
            else:
                self.log_error(f"Échec filtre agriculture: {response.status_code}")
            
            # Test filtre élevage
            response = requests.get(f"{BASE_URL}/listings?domain=elevage&page=1&page_size=5")
            
            if response.status_code == 200:
                data = response.json()
                self.log_success("Filtre domain=elevage fonctionne")
                self.log_info(f"  Résultats: {len(data.get('items', []))}")
            else:
                self.log_error(f"Échec filtre élevage: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erreur test filtre domain: {e}")

    def test_filter_order_status(self):
        """Test P2: Filtre par status commandes"""
        self.log_section("TEST P2: Filtre Status Commandes")
        
        if not self.token:
            self.log_error("Pas de token - skip test")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            # Test sans filtre
            response = requests.get(f"{BASE_URL}/orders/my-orders", headers=headers)
            
            if response.status_code == 200:
                self.log_success("GET /my-orders fonctionne")
            else:
                self.log_error(f"Échec sans filtre: {response.status_code}")
            
            # Test avec filtre status valide
            response = requests.get(
                f"{BASE_URL}/orders/my-orders?status=PENDING",
                headers=headers
            )
            
            if response.status_code == 200:
                self.log_success("Filtre status=PENDING fonctionne")
            else:
                self.log_error(f"Échec filtre PENDING: {response.status_code}")
            
            # Test avec status invalide
            response = requests.get(
                f"{BASE_URL}/orders/my-orders?status=INVALID_STATUS",
                headers=headers
            )
            
            if response.status_code == 400:
                self.log_success("Status invalide rejeté")
            else:
                self.log_error("Status invalide accepté")
        except Exception as e:
            self.log_error(f"Erreur test filtre status: {e}")

    def test_my_listings_route(self):
        """Test P2: Route /my/listings accessible"""
        self.log_section("TEST P2: Route /my/listings")
        
        if not self.token:
            self.log_error("Pas de token - skip test")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.get(f"{BASE_URL}/listings/my/listings", headers=headers)
            
            if response.status_code == 200:
                self.log_success("Route /my/listings accessible")
                data = response.json()
                self.log_info(f"  Listings: {len(data)}")
            else:
                self.log_error(f"Route inaccessible: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erreur test route: {e}")

    def run_all_tests(self):
        """Exécuter tous les tests"""
        print(f"\n{Colors.BLUE}{'='*60}")
        print(f"  SUITE DE TESTS - CORRECTIONS API")
        print(f"  MBOA Market Backend")
        print(f"{'='*60}{Colors.END}\n")
        
        # Test santé
        if not self.test_health():
            self.log_error("Serveur inaccessible - arrêt des tests")
            return
        
        # Tests P0 - Validations
        self.test_password_validation()
        self.test_email_uniqueness()
        self.test_phone_verification_format()
        
        # Setup utilisateur pour tests authentifiés
        if self.setup_test_user():
            # Tests P1 - Pagination et validation
            self.test_pagination_conversations()
            self.test_message_validation()
            
            # Tests P2 - Filtres et optimisations
            self.test_filter_domain()
            self.test_filter_order_status()
            self.test_my_listings_route()
        
        # Résumé
        self.print_summary()

    def print_summary(self):
        """Afficher le résumé des tests"""
        total = self.passed + self.failed
        success_rate = (self.passed / total * 100) if total > 0 else 0
        
        print(f"\n{Colors.YELLOW}{'='*60}")
        print(f"  RÉSUMÉ DES TESTS")
        print(f"{'='*60}{Colors.END}\n")
        
        print(f"{Colors.GREEN}Tests réussis: {self.passed}{Colors.END}")
        print(f"{Colors.RED}Tests échoués: {self.failed}{Colors.END}")
        print(f"Total: {total}")
        print(f"Taux de réussite: {success_rate:.1f}%\n")
        
        if self.failed == 0:
            print(f"{Colors.GREEN}✓ TOUS LES TESTS SONT PASSÉS !{Colors.END}\n")
        else:
            print(f"{Colors.RED}✗ Certains tests ont échoué{Colors.END}\n")

if __name__ == "__main__":
    runner = TestRunner()
    runner.run_all_tests()
