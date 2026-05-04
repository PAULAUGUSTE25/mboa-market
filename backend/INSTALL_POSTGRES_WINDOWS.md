# 🐘 Installation PostgreSQL sur Windows - Guide Complet

## 📥 Étape 1: Télécharger PostgreSQL

1. **Visitez:** https://www.postgresql.org/download/windows/
2. **Cliquez sur:** "Download the installer"
3. **Choisissez:** Version 15 ou 16 (dernière stable)
4. **Téléchargez:** Le fichier .exe (environ 300 MB)

## 🔧 Étape 2: Installer PostgreSQL

1. **Lancez** le fichier téléchargé
2. **Cliquez** sur "Next" pour commencer
3. **Répertoire d'installation:** Laissez par défaut (`C:\Program Files\PostgreSQL\16`)
4. **Composants à installer:**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (interface graphique)
   - ✅ Stack Builder (optionnel)
   - ✅ Command Line Tools

5. **Répertoire des données:** Laissez par défaut
6. **Mot de passe superutilisateur:**
   - Entrez un mot de passe fort
   - ⚠️ **IMPORTANT:** Notez-le bien!
   - Exemple: `PostgreSQL2024!`

7. **Port:** Laissez `5432` (par défaut)
8. **Locale:** Laissez par défaut ou choisissez "French, France"
9. **Cliquez** sur "Next" puis "Install"
10. **Attendez** la fin de l'installation (2-5 minutes)

## ✅ Étape 3: Vérifier l'Installation

### Méthode 1: Via pgAdmin
1. **Ouvrez** pgAdmin 4 (dans le menu Démarrer)
2. **Entrez** le mot de passe que vous avez créé
3. **Développez** "Servers" → "PostgreSQL 16"
4. Si vous voyez "Databases", c'est bon! ✅

### Méthode 2: Via la ligne de commande
```powershell
# Ouvrir PowerShell et taper:
psql -U postgres

# Entrer le mot de passe
# Si vous voyez "postgres=#", c'est bon! ✅
```

## 🗄️ Étape 4: Créer la Base de Données MBOA Market

### Option A: Via pgAdmin (Interface Graphique)

1. **Ouvrez** pgAdmin 4
2. **Cliquez droit** sur "Databases"
3. **Sélectionnez** "Create" → "Database"
4. **Nom:** `mboa_market`
5. **Owner:** postgres
6. **Cliquez** "Save"

7. **Créer l'utilisateur:**
   - Cliquez droit sur "Login/Group Roles"
   - "Create" → "Login/Group Role"
   - **Name:** `mboa_user`
   - **Onglet "Definition":** Password: `mboa_password`
   - **Onglet "Privileges":** Cochez "Can login?"
   - "Save"

8. **Donner les droits:**
   - Cliquez droit sur la base `mboa_market`
   - "Properties" → "Security"
   - Ajoutez `mboa_user` avec tous les privilèges

### Option B: Via SQL (Ligne de Commande)

```powershell
# 1. Se connecter à PostgreSQL
psql -U postgres

# 2. Exécuter le script d'initialisation
\i C:/Users/HP/Desktop/mboa-market/backend/setup_postgres.sql

# 3. Quitter
\q
```

## 🔧 Étape 5: Configurer MBOA Market

### 1. Aller dans le dossier backend
```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
```

### 2. Créer le fichier .env
```powershell
# Copier le template
Copy-Item .env.example .env

# Ouvrir avec Notepad
notepad .env
```

### 3. Vérifier la configuration
Le fichier `.env` doit contenir:
```env
DATABASE_URL=postgresql+asyncpg://mboa_user:mboa_password@localhost:5432/mboa_market
```

⚠️ **Si vous avez changé le mot de passe, modifiez-le ici!**

### 4. Installer les dépendances Python
```powershell
# Activer l'environnement virtuel (si vous en avez un)
.venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

### 5. Initialiser la base de données
```powershell
python init_db.py
```

Vous devriez voir:
```
🚀 Initialisation de la base de données MBOA Market...
📊 URL: postgresql+asyncpg://mboa_user:***@localhost:5432/mboa_market
📋 Création des tables...
✅ Tables créées avec succès!
👤 Création d'utilisateurs de test...
📦 Création d'annonces de test...
✅ Données de test créées avec succès!
✨ Base de données initialisée avec succès!
```

## 🚀 Étape 6: Démarrer le Serveur

```powershell
uvicorn app.main:app --reload
```

Ouvrez: http://localhost:8000/docs

## ✨ Étape 7: Migrer les Données Existantes (Optionnel)

Si vous avez déjà des données dans SQLite:

```powershell
python migrate_sqlite_to_postgres.py
```

## 🔍 Vérification Finale

### Vérifier la connexion
```powershell
python check_config.py
```

### Vérifier les données
```powershell
# Se connecter à la base
psql -U mboa_user -d mboa_market

# Lister les tables
\dt

# Voir les utilisateurs
SELECT phone, is_active FROM users;

# Quitter
\q
```

## 🎯 Comparaison SQLite vs PostgreSQL

| Fonctionnalité | SQLite | PostgreSQL |
|----------------|--------|------------|
| **Taille max** | ~140 TB | Illimité |
| **Utilisateurs simultanés** | 1 écrivain | Milliers |
| **Performance** | Bonne | Excellente |
| **Transactions** | Basiques | Avancées |
| **Recherche full-text** | Limitée | Puissante |
| **Production** | ❌ Non recommandé | ✅ Recommandé |
| **Scalabilité** | ❌ Limitée | ✅ Excellente |

## 🐛 Dépannage

### "psql n'est pas reconnu"
Ajoutez PostgreSQL au PATH:
1. Recherchez "Variables d'environnement"
2. "Variables système" → "Path" → "Modifier"
3. Ajoutez: `C:\Program Files\PostgreSQL\16\bin`
4. Redémarrez PowerShell

### "Connection refused"
```powershell
# Vérifier que PostgreSQL est démarré
services.msc
# Cherchez "postgresql-x64-16" et démarrez-le
```

### "Password authentication failed"
- Vérifiez le mot de passe dans `.env`
- Réinitialisez le mot de passe:
```sql
ALTER USER mboa_user WITH PASSWORD 'nouveau_mot_de_passe';
```

### "Database does not exist"
```powershell
psql -U postgres
CREATE DATABASE mboa_market;
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;
```

## 📊 Outils Utiles

### pgAdmin 4
- Interface graphique complète
- Visualisation des données
- Éditeur SQL
- Monitoring

### DBeaver (Alternative)
- Gratuit et open source
- Support multi-bases
- Téléchargement: https://dbeaver.io/

### TablePlus (Payant mais excellent)
- Interface moderne
- Très rapide
- Téléchargement: https://tableplus.com/

## 🎉 Félicitations!

Votre base de données PostgreSQL est maintenant configurée et prête!

**Avantages obtenus:**
- ✅ Capacité illimitée
- ✅ Performance 10x supérieure
- ✅ Prêt pour la production
- ✅ Gestion de milliers d'utilisateurs
- ✅ Recherche avancée
- ✅ Transactions robustes

**Prochaines étapes:**
1. Démarrez le serveur: `uvicorn app.main:app --reload`
2. Testez l'API: http://localhost:8000/docs
3. Connectez le frontend

---

**📖 Besoin d'aide?** Consultez [DATABASE_SETUP.md](DATABASE_SETUP.md)
