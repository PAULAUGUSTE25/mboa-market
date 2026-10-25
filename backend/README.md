# 🌾 MBOA Market - Backend API

API REST pour la plateforme agro-pastorale MBOA Market.

## 🚀 Démarrage Rapide

### Option 1: SQLite (Développement Rapide)
```bash
# Installer les dépendances
pip install -r requirements.txt

# Copier la configuration
cp .env.example .env

# Éditer .env et utiliser SQLite
DATABASE_URL=sqlite+aiosqlite:///./mboa_market.db

# Initialiser la base de données
python init_db.py

# Démarrer le serveur
uvicorn app.main:app --reload
```

### Option 2: PostgreSQL (Recommandé)
```bash
# 1. Installer PostgreSQL
# Voir DATABASE_SETUP.md pour les instructions détaillées

# 2. Créer la base de données
psql -U postgres -f setup_postgres.sql

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres PostgreSQL

# 5. Initialiser la base de données
python init_db.py

# 6. Démarrer le serveur
uvicorn app.main:app --reload
```

## 📚 Documentation

- **API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Configuration BD:** [DATABASE_SETUP.md](DATABASE_SETUP.md)

## Déploiement Vercel et transfert PostgreSQL

Configurez deux projets Vercel si frontend et API restent séparés : racine `frontend` (Vite)
et racine `backend` (fonction Python `api/index.py`). Dans le frontend, définissez `VITE_API_URL`
sur l’URL publique du backend, terminée par `/api`.

Créez une base Neon vide et utilisez son URL directe dans `NEON_DATABASE_URL` pour l’import.
Conservez `RENDER_DATABASE_URL` comme URL source et exécutez `python migrate_render_to_neon.py`
depuis un poste doté de `pg_dump`, `pg_restore` et `psql`. Le script refuse une cible PostgreSQL
non vide, réalise un dump complet, restaure dans une transaction et compare le nombre de lignes de
toutes les tables publiques. Il ne supprime ni la source ni la sauvegarde. N’exécutez pas
`init_neon_db.py` avant ce restore.

Après vérification, configurez côté serveur Vercel `DATABASE_URL` avec l’URL Neon **poolée**,
`ENVIRONMENT=production`, `SECRET_KEY` (reprenez temporairement la valeur actuelle pour préserver
les JWT existants), ainsi que `GEMINI_API_KEY` si l’IA est activée. Configurez `CORS_ORIGINS` avec
l’origine exacte du frontend Vercel et définissez `VITE_API_URL` côté frontend. N’exposez jamais ces
secrets dans les variables `VITE_*`. Gardez Render et le dump jusqu’à validation des connexions,
des comptes existants et des fonctionnalités; aucun basculement ni suppression n’est automatisé.

## 🗄️ Base de Données

### Réponses IA sur les publications de démonstration

Pour une base PostgreSQL existante, exécutez une fois `migrations/2026_10_24_demo_ai_comments.sql`
avant de déployer la nouvelle version. Les publications existantes restent des publications réelles
(`is_demo = false`). Marquez explicitement les seules publications de démonstration avec leur UUID :

```sql
UPDATE community_posts SET is_demo = TRUE WHERE id = 'UUID_DE_LA_PUBLICATION_DE_DEMO';
```

Les réponses automatiques sont désactivées par défaut. Activez-les uniquement côté serveur avec
`DEMO_POST_AUTO_REPLY_ENABLED=true` et configurez `GEMINI_API_KEY`. Une réponse persistée est
attribuée à « Bigiss · IA », jamais au propriétaire de la publication.

### Modèles Principaux

#### Users (Utilisateurs)
- `id`: UUID
- `phone`: Numéro de téléphone (unique)
- `hashed_password`: Mot de passe hashé
- `is_active`: Compte actif
- `is_verified`: Téléphone vérifié

#### Profiles (Profils)
- `id`: UUID
- `user_id`: Référence utilisateur
- `display_name`: Nom d'affichage
- `domain`: agriculture | elevage
- `activity_type`: producer | seed_provider | buyer
- `location`: Localisation
- `bio`: Biographie
- `avatar_url`: Photo de profil

#### Listings (Annonces)
- `id`: UUID
- `seller_id`: Référence vendeur
- `title`: Titre
- `description`: Description
- `category`: Catégorie
- `price`: Prix
- `quantity`: Quantité
- `unit`: Unité (kg, sac, unité)
- `location`: Localisation
- `images`: URLs des images
- `is_active`: Annonce active

## 🔐 Authentification

### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "phone": "+237690000001",
  "password": "password123",
  "display_name": "Jean Producteur",
  "domain": "agriculture",
  "activity_type": "producer",
  "location": "Yaoundé"
}
```

### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+237690000001",
  "password": "password123"
}
```

Réponse:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "phone": "+237690000001",
    "profile": {
      "display_name": "Jean Producteur",
      "domain": "agriculture"
    }
  }
}
```

## 📦 Endpoints Principaux

### Annonces
- `GET /api/listings` - Liste des annonces
- `GET /api/listings/{id}` - Détail d'une annonce
- `POST /api/listings` - Créer une annonce (auth requise)
- `PUT /api/listings/{id}` - Modifier une annonce (auth requise)
- `DELETE /api/listings/{id}` - Supprimer une annonce (auth requise)

### Profil
- `GET /api/profile/me` - Mon profil (auth requise)
- `PUT /api/profile/me` - Modifier mon profil (auth requise)

### Utilisateurs
- `GET /api/users/me` - Mes informations (auth requise)

## 🛠️ Scripts Utiles

### Initialisation
```bash
# Créer la base de données avec données de test
python init_db.py
```

### Migration SQLite → PostgreSQL
```bash
# Migrer les données existantes
python migrate_sqlite_to_postgres.py
```

### Créer un Utilisateur
```bash
# Créer un utilisateur simple
python create_simple_user.py
```

## 🧪 Tests

```bash
# Tests API basiques
python test_api_corrections.py

# Tests étendus
python test_api_extended.py

# Tests de performance
python test_diagnostic_performance.py
```

## 📁 Structure du Projet

```
backend/
├── app/
│   ├── api/              # Routes API
│   │   ├── auth.py      # Authentification
│   │   ├── listings.py  # Annonces
│   │   └── users.py     # Utilisateurs
│   ├── core/            # Configuration
│   │   ├── config.py    # Paramètres
│   │   ├── database.py  # Connexion BD
│   │   └── security.py  # Sécurité
│   ├── models/          # Modèles SQLAlchemy
│   │   ├── user.py
│   │   ├── profile.py
│   │   └── listing.py
│   ├── schemas/         # Schémas Pydantic
│   └── main.py          # Point d'entrée
├── scripts/             # Scripts utilitaires
├── init_db.py          # Initialisation BD
├── migrate_sqlite_to_postgres.py  # Migration
├── setup_postgres.sql  # Setup PostgreSQL
├── requirements.txt    # Dépendances
└── .env.example        # Configuration exemple
```

## 🔧 Configuration

### Variables d'Environnement (.env)

```env
# Base de données
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/mboa_market

# Sécurité
SECRET_KEY=votre-cle-secrete
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Pool PostgreSQL
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
```

## 🐛 Dépannage

### Erreur de connexion BD
```bash
# Vérifier PostgreSQL
psql -U mboa_user -d mboa_market

# Vérifier les tables
\dt
```

### Réinitialiser la BD
```bash
# PostgreSQL
psql -U postgres -c "DROP DATABASE mboa_market;"
psql -U postgres -f setup_postgres.sql
python init_db.py

# SQLite
rm mboa_market.db
python init_db.py
```

## 📊 Performance

### Optimisations
- Pool de connexions configuré
- Index sur les colonnes fréquemment recherchées
- Requêtes asynchrones avec SQLAlchemy
- Cache des sessions

### Monitoring
- Logs détaillés en mode développement
- Métriques de performance disponibles
- Health check endpoint: `/health`

## 🚀 Déploiement

### Render.com
```bash
# Le fichier render.yaml est déjà configuré
# Connecter votre repo GitHub à Render
```

### Variables d'environnement Production
```env
DATABASE_URL=postgresql://...  # URL PostgreSQL Render
SECRET_KEY=...  # Générer avec secrets.token_urlsafe(32)
ENVIRONMENT=production
```

## 📝 Licence

Propriétaire - MBOA Market © 2026

## 👥 Contributeurs

- Équipe MBOA Market

---

**🎉 Backend prêt pour le développement et la production!**
