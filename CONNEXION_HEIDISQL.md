# 🔌 Connexion HeidiSQL - MBOA Market

## ⚡ Configuration Rapide (2 Minutes)

### 📋 Paramètres de Connexion

Ouvrez HeidiSQL et créez une nouvelle session avec ces paramètres:

```
┌─────────────────────────────────────────┐
│  Nouvelle Session - MBOA Market         │
├─────────────────────────────────────────┤
│                                         │
│  Nom de session: MBOA Market           │
│                                         │
│  Type de réseau: PostgreSQL (TCP/IP)   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Paramètres                        │ │
│  ├───────────────────────────────────┤ │
│  │ Nom d'hôte / IP:  localhost      │ │
│  │ Utilisateur:      mboa_user      │ │
│  │ Mot de passe:     mboa_password  │ │
│  │ Port:             5432           │ │
│  │ Base de données:  mboa_market    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Ouvrir]  [Annuler]                   │
└─────────────────────────────────────────┘
```

### ✅ Étapes

1. **Ouvrez HeidiSQL**
2. **Cliquez** sur "Nouveau" (en bas à gauche)
3. **Remplissez** les champs:
   - **Nom de session:** `MBOA Market`
   - **Type de réseau:** `PostgreSQL (TCP/IP)`
   - **Nom d'hôte:** `localhost`
   - **Utilisateur:** `mboa_user`
   - **Mot de passe:** `mboa_password`
   - **Port:** `5432`
   - **Base de données:** `mboa_market`
4. **Cliquez** sur "Ouvrir"

---

## 🎯 Si la Base n'Existe Pas Encore

### Créer la Base avec HeidiSQL

**Connexion Administrateur:**
```
Nom d'hôte:  localhost
Utilisateur: postgres
Mot de passe: [votre mot de passe PostgreSQL]
Port:        5432
```

**Puis exécutez ce SQL:**
```sql
CREATE DATABASE mboa_market;
CREATE USER mboa_user WITH PASSWORD 'mboa_password';
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;
```

**Ou utilisez le script PowerShell:**
```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
.\setup_database.ps1
```

---

## 📊 Après Connexion

### Vous devriez voir:

```
MBOA Market
├── 📁 mboa_market
    ├── 📁 public
        ├── 📋 Tables
        │   ├── users
        │   ├── profiles
        │   └── listings
        ├── 📋 Vues
        ├── 📋 Fonctions
        └── 📋 Séquences
```

### Si les Tables n'Existent Pas:

```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
python init_db.py
```

Puis **rafraîchissez** HeidiSQL (F5).

---

## 🔍 Vérification Rapide

### Test 1: Voir les Utilisateurs
```sql
SELECT * FROM users;
```

### Test 2: Voir les Profils
```sql
SELECT * FROM profiles;
```

### Test 3: Voir les Annonces
```sql
SELECT * FROM listings;
```

---

## 🆘 Problèmes Courants

### ❌ "Impossible de se connecter"

**Vérifiez:**
1. PostgreSQL est démarré:
   ```powershell
   services.msc
   # Cherchez "postgresql" et démarrez-le
   ```

2. Le port est correct (5432)

3. Le mot de passe est correct

### ❌ "Base de données introuvable"

**Solution:**
```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
.\setup_database.ps1
```

### ❌ "Permission refusée"

**Solution dans HeidiSQL:**
```sql
-- Connectez-vous avec postgres
GRANT ALL PRIVILEGES ON DATABASE mboa_market TO mboa_user;
```

---

## 🎨 Interface HeidiSQL

### Panneau Gauche
- **Arbre des bases** - Navigation
- **Double-clic** sur une table pour voir les données

### Panneau Principal
- **Onglet "Données"** - Voir/modifier les données
- **Onglet "Requête"** - Exécuter du SQL
- **Onglet "Structure"** - Voir la structure de la table

### Barre d'Outils
- **▶️ Exécuter** (F9) - Lancer la requête
- **💾 Sauvegarder** (Ctrl+S) - Enregistrer les modifications
- **🔄 Rafraîchir** (F5) - Actualiser les données

---

## 📝 Requêtes Utiles

### Copier-Coller dans l'Onglet "Requête"

```sql
-- Voir tous les utilisateurs avec leurs profils
SELECT 
    u.phone,
    p.display_name,
    p.domain,
    p.activity_type,
    p.location
FROM users u
JOIN profiles p ON u.id = p.user_id;

-- Voir toutes les annonces actives
SELECT 
    l.title,
    l.price,
    l.category,
    p.display_name as vendeur
FROM listings l
JOIN users u ON l.seller_id = u.id
JOIN profiles p ON u.id = p.user_id
WHERE l.is_active = true;

-- Statistiques
SELECT 
    'Utilisateurs' as type,
    COUNT(*) as nombre
FROM users
UNION ALL
SELECT 
    'Annonces actives',
    COUNT(*)
FROM listings
WHERE is_active = true;
```

---

## 🚀 Workflow Quotidien

1. **Ouvrir HeidiSQL**
2. **Connecter** à MBOA Market
3. **Vérifier** les nouvelles données
4. **Tester** les requêtes
5. **Modifier** si nécessaire
6. **Sauvegarder** (Ctrl+S)

---

## 📚 Documentation Complète

Pour plus de détails, consultez:
- **Guide complet:** `backend/UTILISER_HEIDISQL.md`
- **Configuration BD:** `backend/DATABASE_SETUP.md`

---

## ✅ Checklist

- [ ] HeidiSQL installé
- [ ] PostgreSQL installé et démarré
- [ ] Base de données `mboa_market` créée
- [ ] Connexion réussie dans HeidiSQL
- [ ] Tables visibles (users, profiles, listings)
- [ ] Données de test présentes

---

**🎉 Vous êtes prêt à gérer MBOA Market avec HeidiSQL!**

**Prochaine étape:** Explorez les données et testez les requêtes SQL! 🚀
