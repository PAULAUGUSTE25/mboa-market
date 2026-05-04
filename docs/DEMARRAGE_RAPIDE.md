# ⚡ DÉMARRAGE RAPIDE - MBOA MARKET

## 🚀 ÉTAPES À CHAQUE SESSION

### 1. Démarrer le Backend
```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Démarrer le Frontend (nouveau terminal)
```powershell
cd C:\Users\HP\Desktop\mboa-market\frontend
npm run dev
```

### 3. Ouvrir dans le navigateur
- http://localhost:5173

---

## 🔐 CONNEXION DÉMO
```
Téléphone: +237123456789
Mot de passe: Demo@2026
```

---

## 🖼️ RÈGLE CRITIQUE DES IMAGES

> **LES IMAGES DOIVENT ÊTRE DANS:**
> - `frontend/public/images/agriculture/` → chemins `/images/agriculture/nom_sans_espaces.jpg`
> - `frontend/public/images/livestock/` → chemins `/images/livestock/nom_sans_espaces.jpg`
> - `frontend/public/images/backgrounds/` → chemins `/images/backgrounds/nom_sans_espaces.jpg`
>
> **JAMAIS** de `/images/products/...` ou `/src/assets/...`
> **JAMAIS** d'espaces dans les noms de fichiers → utiliser des underscores `_`

---

## 🔧 SI LES IMAGES NE S'AFFICHENT PLUS
```powershell
cd C:\Users\HP\Desktop\mboa-market\backend
python update_db_with_new_names.py
```
Puis actualiser le navigateur.

---

## 📁 FICHIERS IMPORTANTS

| Fichier | Rôle |
|---------|------|
| `frontend/src/services/api.ts` | Tous les appels API frontend |
| `frontend/src/data/demoListings.ts` | Publications de démonstration |
| `frontend/src/pages/FeedPage.tsx` | Page principale du feed |
| `backend/app/api/listings.py` | Endpoints annonces |
| `backend/app/api/auth.py` | Endpoints authentification |
| `backend/app/api/messaging.py` | Endpoints messages |
| `backend/app/schemas/marketplace.py` | Schémas Pydantic (inclut `images` computed field) |
| `docs/API_DOCUMENTATION.md` | Documentation complète des APIs |

---

## 📊 VÉRIFICATIONS RAPIDES
```powershell
# Vérifier la base de données
cd C:\Users\HP\Desktop\mboa-market\backend
python check_database_full.py

# Voir tous les utilisateurs
python show_all_users.py

# Tester l'API directement
Invoke-WebRequest -Uri "http://localhost:8000/api/listings?page=1&page_size=3" -UseBasicParsing | Select-Object -ExpandProperty Content
```
