# 🗄️ Configuration de la Base de Données - MBOA Market

## 📋 Options de Base de Données

Le projet supporte deux types de bases de données:

1. **PostgreSQL** (Recommandé pour la production)
2. **SQLite** (Pour le développement local rapide)

---

## 🐘 Option 1: PostgreSQL (Recommandé)

### Prérequis
- PostgreSQL 12+ installé
- Python 3.8+

### Installation de PostgreSQL

#### Windows
1. Télécharger depuis: https://www.postgresql.org/download/windows/
2. Installer avec les paramètres par défaut
3. Noter le mot de passe du superutilisateur `postgres`

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Configuration de la Base de Données

#### Méthode 1: Script SQL Automatique
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Exécuter le script d'initialisation
\i setup_postgres.sql
```

#### Méthode 2: Commandes Manuelles
```sql
-- Créer la base de données
CREATE DATABASE mboa_market;

-- Créer l'utilisateur
CREATE USER mboa_user WITH PASSWORD 'mboa_password';

-- Donner les privilèges
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;

-- Se connecter à la base
\c mboa_market

-- Donner les privilèges sur le schéma
GRANT ALL ON SCHEMA public TO mboa_user;
```

### Configuration de l'Application

1. **Copier le fichier d'environnement:**
```bash
cp .env.example .env
```

2. **Éditer `.env` avec vos paramètres:**
```env
DATABASE_URL=postgresql+asyncpg://mboa_user:mboa_password@localhost:5432/mboa_market
```

3. **Installer les dépendances:**
```bash
pip install -r requirements.txt
```

4. **Initialiser la base de données:**
```bash
python init_db.py
```

### Vérification
```bash
# Se connecter à la base
psql -U mboa_user -d mboa_market

# Lister les tables
\dt

# Vérifier les données
SELECT * FROM users;
```

---

## 📦 Option 2: SQLite (Développement)

### Configuration Rapide

1. **Éditer `.env`:**
```env
DATABASE_URL=sqlite+aiosqlite:///./mboa_market.db
```

2. **Installer les dépendances:**
```bash
pip install -r requirements.txt
```

3. **Initialiser la base de données:**
```bash
python init_db.py
```

### Avantages SQLite
- ✅ Pas d'installation serveur requise
- ✅ Configuration zéro
- ✅ Parfait pour le développement local

### Limitations SQLite
- ❌ Moins performant en production
- ❌ Pas de connexions concurrentes optimales
- ❌ Fonctionnalités avancées limitées

---

## 🚀 Démarrage du Serveur

```bash
# Activer l'environnement virtuel
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

# Démarrer le serveur
uvicorn app.main:app --reload
```

Le serveur démarre sur: http://localhost:8000

---

## 👥 Utilisateurs de Test

Après l'initialisation, 3 utilisateurs sont créés:

### Utilisateur 1: Producteur Agriculture
- **Téléphone:** +237690000001
- **Mot de passe:** password123
- **Nom:** Jean Producteur
- **Type:** Producteur
- **Domaine:** Agriculture

### Utilisateur 2: Fournisseur Agriculture
- **Téléphone:** +237690000002
- **Mot de passe:** password123
- **Nom:** Marie Fournisseur
- **Type:** Fournisseur
- **Domaine:** Agriculture

### Utilisateur 3: Éleveur
- **Téléphone:** +237690000003
- **Mot de passe:** password123
- **Nom:** Paul Éleveur
- **Type:** Producteur
- **Domaine:** Élevage

---

## 🔧 Commandes Utiles

### PostgreSQL

```bash
# Se connecter
psql -U mboa_user -d mboa_market

# Lister les bases de données
\l

# Lister les tables
\dt

# Décrire une table
\d users

# Voir les données
SELECT * FROM users;

# Quitter
\q
```

### Réinitialiser la Base de Données

```bash
# PostgreSQL
psql -U postgres
DROP DATABASE mboa_market;
\i setup_postgres.sql

# SQLite
rm mboa_market.db

# Puis réinitialiser
python init_db.py
```

---

## 🔐 Sécurité

### Production
⚠️ **IMPORTANT:** Changez ces valeurs en production!

```env
# Générer une clé secrète forte
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire

# Utiliser un mot de passe fort
DATABASE_URL=postgresql+asyncpg://user:STRONG_PASSWORD@host:5432/db
```

### Générer une Clé Secrète
```python
import secrets
print(secrets.token_urlsafe(32))
```

---

## 📊 Migrations (Alembic)

### Initialiser Alembic
```bash
alembic init alembic
```

### Créer une Migration
```bash
alembic revision --autogenerate -m "Description"
```

### Appliquer les Migrations
```bash
alembic upgrade head
```

### Revenir en Arrière
```bash
alembic downgrade -1
```

---

## 🐛 Dépannage

### Erreur: "Connection refused"
- Vérifier que PostgreSQL est démarré
- Vérifier le port (5432 par défaut)
- Vérifier les credentials

### Erreur: "Database does not exist"
```bash
psql -U postgres
CREATE DATABASE mboa_market;
```

### Erreur: "Permission denied"
```sql
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;
```

### Réinitialiser Complètement
```bash
# Supprimer la base
psql -U postgres -c "DROP DATABASE IF EXISTS mboa_market;"

# Recréer
psql -U postgres -f setup_postgres.sql

# Réinitialiser
python init_db.py
```

---

## 📈 Performance

### Index Recommandés
Les index sont créés automatiquement pour:
- `users.phone` (unique)
- `profiles.user_id`
- `listings.seller_id`
- `listings.category`
- `listings.is_active`

### Pool de Connexions
Configuré dans `.env`:
```env
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

---

## 📚 Ressources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [FastAPI Database](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)

---

**🎉 Votre base de données est maintenant configurée!**
