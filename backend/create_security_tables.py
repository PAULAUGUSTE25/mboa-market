"""
Script pour créer les nouvelles tables de sécurité dans la base de données
"""
import sys
sys.path.insert(0, '.')

from sqlalchemy import create_engine
from app.core.database import Base
from app.models.system import LoginHistory, TwoFactorCode

# Créer un moteur synchrone pour la création des tables
sync_engine = create_engine("sqlite:///mboa_market.db", echo=True)

def create_tables():
    """Créer les tables LoginHistory et TwoFactorCode"""
    print("Création des tables de sécurité...")
    
    # Créer uniquement les nouvelles tables
    LoginHistory.__table__.create(sync_engine, checkfirst=True)
    TwoFactorCode.__table__.create(sync_engine, checkfirst=True)
    
    print("✅ Tables créées avec succès:")
    print("   - login_history")
    print("   - two_factor_codes")

if __name__ == "__main__":
    create_tables()
