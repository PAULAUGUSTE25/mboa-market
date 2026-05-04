# 🔧 Utiliser HeidiSQL avec MBOA Market

## 📋 HeidiSQL - Interface Graphique pour PostgreSQL

HeidiSQL est un excellent outil pour gérer votre base de données PostgreSQL sans ligne de commande!

---

## 🚀 Configuration Rapide

### Étape 1: Créer une Nouvelle Session

1. **Ouvrez HeidiSQL**
2. **Cliquez** sur "Nouveau" (en bas à gauche)
3. **Nom de session:** `MBOA Market`
4. **Type de réseau:** Sélectionnez `PostgreSQL (TCP/IP)`

### Étape 2: Paramètres de Connexion

Remplissez les champs suivants:

| Champ | Valeur |
|-------|--------|
| **Nom d'hôte / IP** | `localhost` ou `127.0.0.1` |
| **Utilisateur** | `mboa_user` |
| **Mot de passe** | `mboa_password` |
| **Port** | `5432` |
| **Base de données** | `mboa_market` |

### Étape 3: Tester et Connecter

1. **Cliquez** sur "Ouvrir" (en bas)
2. Si la connexion réussit, vous verrez la base de données! ✅

---

## 📊 Créer la Base de Données avec HeidiSQL

Si la base `mboa_market` n'existe pas encore:

### Méthode 1: Via HeidiSQL

1. **Connectez-vous** avec l'utilisateur `postgres`:
   - Utilisateur: `postgres`
   - Mot de passe: (celui que vous avez créé lors de l'installation)

2. **Clic droit** sur la connexion → "Créer nouveau" → "Base de données"

3. **Nom:** `mboa_market`

4. **Propriétaire:** `postgres`

5. **Cliquez** "OK"

### Méthode 2: Via SQL dans HeidiSQL

1. **Connectez-vous** avec `postgres`

2. **Cliquez** sur l'onglet "Requête" (en haut)

3. **Collez** ce code SQL:

```sql
-- Créer la base de données
CREATE DATABASE mboa_market;

-- Créer l'utilisateur
CREATE USER mboa_user WITH PASSWORD 'mboa_password';

-- Donner les privilèges
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;
```

4. **Cliquez** sur le bouton ▶️ (Exécuter) ou appuyez sur **F9**

5. **Reconnectez-vous** avec `mboa_user` pour voir la base

---

## 🗄️ Initialiser les Tables

### Option 1: Via Python (Recommandé)

```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
python init_db.py
```

Puis rafraîchissez HeidiSQL (F5) pour voir les tables.

### Option 2: Via HeidiSQL

1. **Ouvrez** le fichier SQL dans HeidiSQL:
   - Menu "Fichier" → "Charger fichier SQL"
   - Sélectionnez: `C:\Users\HP\Desktop\mboa-market\backend\setup_postgres.sql`

2. **Exécutez** le script (F9)

3. **Rafraîchissez** (F5)

---

## 📋 Utilisation Quotidienne

### Voir les Tables

1. **Développez** `mboa_market` dans l'arbre à gauche
2. **Développez** `public` → `Tables`
3. **Cliquez** sur une table pour voir son contenu

### Voir les Données

**Double-cliquez** sur une table (ex: `users`) pour voir toutes les données.

### Ajouter des Données

1. **Sélectionnez** une table
2. **Onglet "Données"**
3. **Cliquez** sur "Insérer une ligne" (icône +)
4. **Remplissez** les champs
5. **Sauvegardez** (icône disquette)

### Modifier des Données

1. **Double-cliquez** sur une cellule
2. **Modifiez** la valeur
3. **Appuyez** sur Entrée
4. **Sauvegardez** (icône disquette ou Ctrl+S)

### Supprimer des Données

1. **Sélectionnez** une ligne
2. **Clic droit** → "Supprimer la ligne"
3. **Confirmez**

### Exécuter des Requêtes SQL

1. **Cliquez** sur l'onglet "Requête"
2. **Tapez** votre requête SQL:

```sql
-- Voir tous les utilisateurs
SELECT * FROM users;

-- Voir les profils
SELECT u.phone, p.display_name, p.domain, p.activity_type
FROM users u
JOIN profiles p ON u.id = p.user_id;

-- Voir les annonces actives
SELECT l.title, l.price, p.display_name as vendeur
FROM listings l
JOIN users u ON l.seller_id = u.id
JOIN profiles p ON u.id = p.user_id
WHERE l.is_active = true;

-- Compter les utilisateurs par domaine
SELECT p.domain, COUNT(*) as nombre
FROM profiles p
GROUP BY p.domain;
```

3. **Exécutez** (F9)

---

## 🔍 Requêtes Utiles pour MBOA Market

### Voir tous les utilisateurs avec leurs profils

```sql
SELECT 
    u.id,
    u.phone,
    u.is_active,
    u.is_verified,
    p.display_name,
    p.domain,
    p.activity_type,
    p.location,
    u.created_at
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;
```

### Voir toutes les annonces avec les vendeurs

```sql
SELECT 
    l.id,
    l.title,
    l.category,
    l.price,
    l.quantity,
    l.unit,
    l.location,
    l.is_active,
    p.display_name as vendeur,
    p.domain,
    l.created_at
FROM listings l
JOIN users u ON l.seller_id = u.id
JOIN profiles p ON u.id = p.user_id
ORDER BY l.created_at DESC;
```

### Statistiques de la plateforme

```sql
-- Nombre total d'utilisateurs
SELECT COUNT(*) as total_utilisateurs FROM users;

-- Utilisateurs par domaine
SELECT 
    p.domain,
    COUNT(*) as nombre
FROM profiles p
GROUP BY p.domain;

-- Utilisateurs par type d'activité
SELECT 
    p.activity_type,
    COUNT(*) as nombre
FROM profiles p
GROUP BY p.activity_type;

-- Nombre d'annonces actives
SELECT COUNT(*) as annonces_actives 
FROM listings 
WHERE is_active = true;

-- Annonces par catégorie
SELECT 
    category,
    COUNT(*) as nombre,
    AVG(price) as prix_moyen
FROM listings
WHERE is_active = true
GROUP BY category
ORDER BY nombre DESC;
```

### Rechercher des utilisateurs

```sql
-- Par téléphone
SELECT * FROM users WHERE phone LIKE '%690000001%';

-- Par nom
SELECT u.*, p.*
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE p.display_name ILIKE '%jean%';

-- Par localisation
SELECT u.phone, p.display_name, p.location
FROM users u
JOIN profiles p ON u.id = p.user_id
WHERE p.location ILIKE '%yaoundé%';
```

### Rechercher des annonces

```sql
-- Par titre
SELECT * FROM listings 
WHERE title ILIKE '%macabo%'
AND is_active = true;

-- Par prix
SELECT * FROM listings 
WHERE price BETWEEN 1000 AND 5000
AND is_active = true;

-- Par catégorie
SELECT * FROM listings 
WHERE category = 'tubercules'
AND is_active = true;
```

---

## 🛠️ Maintenance

### Sauvegarder la Base de Données

1. **Clic droit** sur `mboa_market`
2. **"Exporter la base de données en SQL"**
3. **Choisissez** un emplacement
4. **Sauvegardez**

### Restaurer une Sauvegarde

1. **Menu "Fichier"** → "Charger fichier SQL"
2. **Sélectionnez** votre fichier de sauvegarde
3. **Exécutez** (F9)

### Vider une Table

```sql
-- Vider la table listings
TRUNCATE TABLE listings CASCADE;

-- Vider toutes les tables et recommencer
TRUNCATE TABLE users, profiles, listings CASCADE;
```

Puis réinitialisez:
```powershell
python init_db.py
```

### Réinitialiser Complètement

1. **Clic droit** sur `mboa_market`
2. **"Supprimer"**
3. **Confirmez**
4. **Recréez** la base (voir section "Créer la Base de Données")
5. **Exécutez** `python init_db.py`

---

## 🎨 Astuces HeidiSQL

### Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| **F5** | Rafraîchir |
| **F9** | Exécuter la requête |
| **Ctrl+S** | Sauvegarder les modifications |
| **Ctrl+T** | Nouvel onglet requête |
| **Ctrl+F** | Rechercher |
| **Ctrl+H** | Rechercher et remplacer |

### Filtrer les Données

1. **Sélectionnez** une table
2. **Onglet "Données"**
3. **Cliquez** sur l'icône "Filtre" (entonnoir)
4. **Tapez** votre filtre (ex: `domain = 'agriculture'`)

### Exporter en CSV/Excel

1. **Sélectionnez** les données
2. **Clic droit** → "Exporter la grille"
3. **Choisissez** le format (CSV, Excel, HTML, etc.)

### Visualiser la Structure

1. **Sélectionnez** une table
2. **Onglet "Structure"**
3. Vous voyez toutes les colonnes, types, index, etc.

---

## 🔐 Sécurité

### Créer un Utilisateur en Lecture Seule

```sql
-- Créer l'utilisateur
CREATE USER lecteur WITH PASSWORD 'mot_de_passe_lecture';

-- Donner accès à la base
GRANT CONNECT ON DATABASE mboa_market TO lecteur;

-- Donner accès au schéma
GRANT USAGE ON SCHEMA public TO lecteur;

-- Donner droits de lecture uniquement
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lecteur;
```

### Changer le Mot de Passe

```sql
ALTER USER mboa_user WITH PASSWORD 'nouveau_mot_de_passe';
```

---

## 📊 Monitoring

### Voir les Connexions Actives

```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'mboa_market';
```

### Taille de la Base de Données

```sql
SELECT 
    pg_size_pretty(pg_database_size('mboa_market')) as taille;
```

### Taille des Tables

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as taille
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🎯 Workflow Recommandé

### Développement Quotidien

1. **Ouvrez HeidiSQL**
2. **Connectez-vous** à `mboa_market`
3. **Vérifiez** les nouvelles données
4. **Testez** vos requêtes
5. **Exportez** si besoin

### Avant de Déployer

1. **Sauvegardez** la base
2. **Vérifiez** l'intégrité des données
3. **Testez** les requêtes critiques
4. **Documentez** les changements

---

## 🆘 Dépannage

### "Impossible de se connecter"

**Vérifiez:**
1. PostgreSQL est démarré (services.msc)
2. Le port 5432 est correct
3. Le mot de passe est correct
4. L'utilisateur existe

### "Base de données introuvable"

**Solution:**
```sql
-- Dans HeidiSQL, connectez-vous avec postgres
CREATE DATABASE mboa_market;
```

### "Permission refusée"

**Solution:**
```sql
-- Donner les droits
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;
GRANT ALL ON SCHEMA public TO mboa_user;
```

---

## 🎉 Avantages HeidiSQL

✅ **Interface visuelle** - Pas besoin de ligne de commande
✅ **Facile à utiliser** - Glisser-déposer, double-clic
✅ **Puissant** - Toutes les fonctionnalités PostgreSQL
✅ **Gratuit** - Open source
✅ **Multi-bases** - MySQL, PostgreSQL, SQLite, etc.

---

## 📚 Ressources

- **Site officiel:** https://www.heidisql.com/
- **Documentation PostgreSQL:** https://www.postgresql.org/docs/
- **Tutoriels SQL:** https://www.postgresqltutorial.com/

---

**🎊 Vous êtes maintenant prêt à gérer MBOA Market avec HeidiSQL!**

**Prochaines étapes:**
1. Connectez-vous à la base
2. Explorez les tables
3. Testez les requêtes SQL
4. Gérez vos données visuellement

**Bon développement! 🚀**
