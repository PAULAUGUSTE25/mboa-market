# 🚀 Démarrage Complet - MBOA Market avec PostgreSQL + HeidiSQL

## ✅ Vous Avez HeidiSQL - Parfait!

Voici le guide complet pour tout configurer en **10 minutes**.

---

## 📥 Étape 1: Installer PostgreSQL (5 minutes)

### Téléchargement
**Lien:** https://www.postgresql.org/download/windows/

1. Cliquez sur "Download the installer"
2. Téléchargez PostgreSQL 16 (dernière version)
3. Lancez le fichier .exe

### Installation
1. Cliquez "Next" partout
2. **IMPORTANT:** Créez un mot de passe et **notez-le**
   - Exemple: `PostgreSQL2024!`
3. Port: Laissez `5432`
4. Attendez la fin (3-5 minutes)

---

## 🗄️ Étape 2: Créer la Base de Données (2 minutes)

### Option A: Script Automatique (RECOMMANDÉ)

```powershell
# Ouvrir PowerShell
cd C:\Users\HP\Desktop\mboa-market\backend
.\setup_database.ps1
```

**Entrez le mot de passe postgres quand demandé.**

### Option B: Avec HeidiSQL

1. **Ouvrez HeidiSQL**
2. **Nouvelle session:**
   - Type: PostgreSQL
   - Hôte: localhost
   - Utilisateur: `postgres`
   - Mot de passe: [votre mot de passe]
   - Port: 5432

3. **Connectez-vous**

4. **Onglet "Requête"**, collez et exécutez (F9):

```sql
CREATE DATABASE mboa_market;
CREATE USER mboa_user WITH PASSWORD 'mboa_password';
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;
```

---

## 🔌 Étape 3: Connecter HeidiSQL à MBOA Market (1 minute)

### Créer la Connexion

1. **Nouvelle session** dans HeidiSQL
2. **Remplissez:**

```
Nom de session:  MBOA Market
Type:            PostgreSQL (TCP/IP)
Hôte:            localhost
Utilisateur:     mboa_user
Mot de passe:    mboa_password
Port:            5432
Base de données: mboa_market
```

3. **Cliquez "Ouvrir"**

### OU Importer la Configuration

1. **Menu "Fichier"** → "Importer paramètres"
2. **Sélectionnez:** `backend/mboa_market_heidisql.txt`
3. **Connectez-vous**

---

## 📊 Étape 4: Initialiser les Tables (1 minute)

```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
pip install -r requirements.txt
python init_db.py
```

**Attendez le message:**
```
✨ Base de données initialisée avec succès!
```

**Dans HeidiSQL:**
- Appuyez sur **F5** (Rafraîchir)
- Vous devriez voir les tables: `users`, `profiles`, `listings`

---

## 🎯 Étape 5: Vérifier que Tout Fonctionne (1 minute)

### Dans HeidiSQL

**Onglet "Requête"**, exécutez:

```sql
-- Voir les utilisateurs
SELECT * FROM users;

-- Voir les profils
SELECT * FROM profiles;

-- Voir les annonces
SELECT * FROM listings;
```

**Vous devriez voir 3 utilisateurs de test!** ✅

### Démarrer le Serveur

```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
uvicorn app.main:app --reload
```

**Ouvrez:** http://localhost:8000/docs

---

## 🎉 C'est Terminé!

### ✅ Ce que Vous Avez Maintenant

- ✅ PostgreSQL installé et configuré
- ✅ Base de données `mboa_market` créée
- ✅ HeidiSQL connecté et fonctionnel
- ✅ Tables créées avec données de test
- ✅ API backend démarrée

### 📱 Utilisateurs de Test

| Téléphone | Mot de passe | Type | Domaine |
|-----------|--------------|------|---------|
| +237690000001 | password123 | Producteur | Agriculture |
| +237690000002 | password123 | Fournisseur | Agriculture |
| +237690000003 | password123 | Producteur | Élevage |

---

## 🔧 Utilisation Quotidienne

### Démarrer le Backend

```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
uvicorn app.main:app --reload
```

### Gérer la Base de Données

1. **Ouvrez HeidiSQL**
2. **Connectez-vous** à "MBOA Market"
3. **Explorez** les données
4. **Exécutez** des requêtes SQL

### Démarrer le Frontend

```powershell
cd C:\Users\HP\Desktop\mboa-market\frontend
npm run dev
```

---

## 📊 Requêtes SQL Utiles dans HeidiSQL

### Statistiques

```sql
-- Nombre d'utilisateurs
SELECT COUNT(*) as total FROM users;

-- Utilisateurs par domaine
SELECT p.domain, COUNT(*) as nombre
FROM profiles p
GROUP BY p.domain;

-- Annonces actives
SELECT COUNT(*) as actives 
FROM listings 
WHERE is_active = true;
```

### Recherche

```sql
-- Chercher un utilisateur
SELECT u.phone, p.display_name, p.domain
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE p.display_name ILIKE '%jean%';

-- Chercher une annonce
SELECT * FROM listings 
WHERE title ILIKE '%macabo%';
```

### Gestion

```sql
-- Activer/Désactiver une annonce
UPDATE listings 
SET is_active = false 
WHERE id = 'ID_DE_L_ANNONCE';

-- Modifier un profil
UPDATE profiles 
SET location = 'Douala' 
WHERE user_id = 'ID_UTILISATEUR';
```

---

## 🆘 Dépannage Rapide

### PostgreSQL ne démarre pas
```powershell
# Ouvrir Services Windows
services.msc
# Chercher "postgresql" → Clic droit → Démarrer
```

### HeidiSQL ne se connecte pas
**Vérifiez:**
- PostgreSQL est démarré
- Le mot de passe est correct
- Le port est 5432

### Tables vides
```powershell
python init_db.py
```

### Réinitialiser tout
```powershell
# Dans HeidiSQL, exécutez:
DROP DATABASE mboa_market;

# Puis recréez:
.\setup_database.ps1
python init_db.py
```

---

## 📚 Documentation

- **HeidiSQL:** `CONNEXION_HEIDISQL.md`
- **Guide complet HeidiSQL:** `backend/UTILISER_HEIDISQL.md`
- **PostgreSQL:** `backend/DATABASE_SETUP.md`
- **Migration:** `PASSER_A_POSTGRESQL.md`

---

## 🎯 Prochaines Étapes

1. **Explorez** les données dans HeidiSQL
2. **Testez** l'API: http://localhost:8000/docs
3. **Démarrez** le frontend
4. **Créez** vos propres données

---

## 💡 Astuces HeidiSQL

| Raccourci | Action |
|-----------|--------|
| **F5** | Rafraîchir |
| **F9** | Exécuter la requête |
| **Ctrl+T** | Nouvel onglet requête |
| **Ctrl+S** | Sauvegarder |
| **Ctrl+F** | Rechercher |

---

## ✨ Avantages de Votre Configuration

### PostgreSQL
- ✅ Capacité illimitée
- ✅ Performance 10x supérieure à SQLite
- ✅ Prêt pour la production
- ✅ Milliers d'utilisateurs simultanés

### HeidiSQL
- ✅ Interface graphique intuitive
- ✅ Pas besoin de ligne de commande
- ✅ Visualisation des données
- ✅ Requêtes SQL faciles

---

**🎊 Félicitations! Votre environnement de développement est complet!**

**Vous pouvez maintenant:**
- ✅ Gérer la base de données visuellement
- ✅ Développer l'API backend
- ✅ Tester avec des données réelles
- ✅ Préparer la production

**Bon développement avec MBOA Market! 🌾🚀**
