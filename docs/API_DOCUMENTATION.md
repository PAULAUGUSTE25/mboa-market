# 📡 MBOA MARKET - DOCUMENTATION COMPLÈTE DES APIs

## BASE URL
```
Backend: http://localhost:8000/api
Frontend: http://localhost:5173
Documentation Swagger: http://localhost:8000/docs
```

---

## 🔧 CONFIGURATION FRONTEND (`frontend/src/services/api.ts`)

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_LOCAL_AUTH = false; // ✅ Vrai backend PostgreSQL
```

**Authentification:** JWT Bearer Token stocké dans `localStorage.getItem('access_token')`

---

## 🔐 AUTHENTIFICATION (`/api/auth`)

### POST `/auth/register` - Inscription
```typescript
// Appel Frontend
api.register({
  phone: "+237695584290",
  password: "Demo@2026",
  email: "user@example.com",        // optionnel
  profile: {
    display_name: "Paul Auguste",
    activity_type: "producer",       // producer | buyer | seed_provider
    region: "Centre",
    locality: "Yaoundé",            // optionnel
    bio: "Agriculteur"              // optionnel
  }
})

// Réponse Backend
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": { ... }
}
```

### POST `/auth/login` - Connexion
```typescript
// Appel Frontend
api.login({
  phone: "+237695584290",
  password: "Demo@2026"
})

// Réponse Backend
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": { ... }
}
```

### POST `/auth/logout` - Déconnexion
```typescript
// Appel Frontend (local uniquement, supprime le token)
api.logout()
```

---

## 👤 UTILISATEURS (`/api/users`)

### GET `/users/me` - Utilisateur connecté
```typescript
// Appel Frontend
api.getCurrentUser()

// Réponse
{
  "id": "uuid",
  "phone": "+237695584290",
  "email": null,
  "status": "ACTIVE",
  "profile": {
    "display_name": "Paul Auguste",
    "activity_type": "producer",
    "domain": "agriculture",
    "region": "Centre",
    "locality": "Yaoundé"
  }
}
```

### PUT `/users/me/profile` - Mettre à jour le profil
```typescript
// Appel Frontend
api.updateProfile({
  display_name: "Nouveau Nom",
  region: "Littoral",
  locality: "Douala"
})
```

---

## 📦 ANNONCES (`/api/listings`)

### GET `/listings` - Liste paginée des annonces
```typescript
// Appel Frontend
api.getListings({
  page: 1,
  page_size: 50,
  category_id: "uuid",    // optionnel
  region: "Centre",       // optionnel
  status: "PUBLISHED"     // optionnel
})

// Réponse
{
  "items": [
    {
      "id": "uuid",
      "seller_id": "uuid",
      "title": "Maïs frais de qualité",
      "category_id": "uuid",
      "quantity": 500.0,
      "unit": "kg",
      "price_per_unit": 350.0,
      "currency": "XAF",
      "region": "Centre",
      "locality": "Yaoundé",
      "status": "PUBLISHED",
      "photos": [
        { "id": "uuid", "storage_key": "/images/agriculture/bonmanioc.jpg", "position": 1 }
      ],
      "images": ["/images/agriculture/bonmanioc.jpg"],  // ← Champ calculé pour le frontend
      "created_at": "2026-04-16T23:35:36",
      "updated_at": "2026-04-16T23:35:36"
    }
  ],
  "total": 20,
  "page": 1,
  "page_size": 50,
  "pages": 1
}
```

### GET `/listings/{id}` - Une annonce
```typescript
// Appel Frontend
api.getListing("uuid-annonce")
```

### POST `/listings` - Créer une annonce (🔒 Authentifié)
```typescript
// Appel Frontend
api.createListing({
  category_id: "uuid-categorie",
  product_ref_id: "uuid-produit",   // optionnel
  title: "Mon Produit",
  variety: "Qualité premium",       // optionnel
  quantity: 100,
  unit: "kg",
  price_per_unit: 500,
  currency: "XAF",
  region: "Centre",
  locality: "Yaoundé",             // optionnel
  available_from: "2026-05-01"     // optionnel
})
```

### PUT `/listings/{id}` - Modifier une annonce (🔒 Authentifié)
```typescript
api.updateListing("uuid-annonce", {
  title: "Nouveau Titre",
  price_per_unit: 600,
  status: "SOLD"
})
```

### DELETE `/listings/{id}` - Supprimer (🔒 Authentifié)
```typescript
api.deleteListing("uuid-annonce")
```

### GET `/listings/my/listings` - Mes annonces (🔒 Authentifié)
```typescript
api.getMyListings()
```

### GET `/listings/categories/all` - Toutes les catégories
```typescript
api.getCategories()
// Réponse: [{ "id": "uuid", "name_fr": "Céréales", "kind": "agriculture" }, ...]
```

### GET `/listings/products/all` - Tous les produits
```typescript
api.getProducts()
// Réponse: [{ "id": "uuid", "name_fr": "Maïs", "unit_default": "kg" }, ...]
```

---

## 💬 MESSAGES (`/api/messages`)

### GET `/messages/conversations` - Liste des conversations (🔒 Authentifié)
```typescript
api.getConversations()
// Réponse: [{ "id": "uuid", "participants": [...], "last_message": {...} }, ...]
```

### POST `/messages/conversations` - Créer une conversation (🔒 Authentifié)
```typescript
api.createConversation({
  participant_user_id: "uuid-vendeur",
  listing_id: "uuid-annonce",           // optionnel
  initial_message: "Bonjour, est-ce disponible?"
})
```

### GET `/messages/conversations/{id}/messages` - Messages d'une conversation
```typescript
api.getConversation("uuid-conversation")
// Réponse: [{ "id": "uuid", "content": "Bonjour", "sender_id": "uuid", "created_at": "..." }, ...]
```

### POST `/messages/conversations/{id}/messages` - Envoyer un message (🔒 Authentifié)
```typescript
api.sendMessage("uuid-conversation", "Mon message ici")
```

---

## 🛒 COMMANDES (`/api/orders`)

### POST `/orders` - Créer une commande (🔒 Authentifié)
```typescript
api.createOrder({
  listing_id: "uuid-annonce",
  quantity: 50,
  delivery_address: "Quartier Bastos, Yaoundé"  // optionnel
})
```

### GET `/orders/my-orders` - Mes commandes (🔒 Authentifié)
```typescript
api.getMyOrders()
```

### GET `/orders/{id}` - Une commande (🔒 Authentifié)
```typescript
api.getOrder("uuid-commande")
```

### PUT `/orders/{id}/status` - Mettre à jour le statut (🔒 Authentifié)
```typescript
api.updateOrderStatus("uuid-commande", "CONFIRMED")
// Statuts: PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
```

---

## 🖼️ IMAGES - RÈGLES CRITIQUES

### ✅ CHEMINS QUI FONCTIONNENT:
```
/images/agriculture/bonmanioc.jpg
/images/agriculture/poulet_de_chaire_35_jour.jpg
/images/livestock/chevre_de_bazou.jpg
/images/backgrounds/champs_de_maise.jpg
```

### ❌ CHEMINS QUI NE FONCTIONNENT PAS:
```
/images/products/...        ← Dossier inexistant
/src/assets/images/...      ← Vite ne sert pas ce chemin
/images/avec espaces.jpg    ← Espaces dans les noms
```

### Structure du dossier images:
```
frontend/public/images/
├── agriculture/
│   ├── bonmanioc.jpg
│   ├── bonne_qualite_de_macabo.jpg
│   ├── arivage_de_4_tone_de_macabo.jpg
│   ├── arivage_plat.jpg
│   ├── banane_cochon.jpg
│   ├── cacao_de_mr_etoga_750kg_dispo.jpg
│   ├── cafe_de_tolé.jpg
│   ├── cafe_selectioné.jpg
│   ├── ariivage_patate.jpg
│   ├── pomme_de_tonga.jpg
│   ├── plantain_mur.jpg
│   ├── tomate_de_haute_qualite.jpg
│   ├── letu_selectioné.jpg
│   ├── yam_for_batibo.jpg
│   ├── cotton_de_la_sodecoton.jpg
│   └── macabo-fresh.png (+ autres .png)
├── livestock/
│   ├── poulet_de_chaire_35_jour.jpg
│   ├── poulet_35_jour_ferme_ndefo.jpg
│   ├── vente_pousin_21_jour.jpg
│   ├── chevre_de_bazou.jpg
│   ├── chevre_de_louest.jpg
│   ├── porc_female_sans_graisse.jpg
│   ├── porcelet_race_selectioné.jpg
│   ├── porcellet_a_vendre.jpg
│   ├── lapin_de_chaire_a_vendre.jpg
│   ├── lapin_de_race_albinous.jpg
│   ├── bars_bossu_kribi.jpg
│   ├── bars_frais_kribi.jpg
│   ├── carpe_grise_de_la_benue.jpg
│   ├── carpe_rouge_du_lack.jpg
│   ├── pioson_frais.jpg
│   └── coq_de_ferme.jpg (+ autres)
└── backgrounds/
    ├── champs_de_maise.jpg
    └── champ_de_ndawara_tea.jpg (+ autres)
```

---

## 🗄️ BASE DE DONNÉES

### Scripts utiles:
```powershell
# Vérifier la DB complète
cd C:\Users\HP\Desktop\mboa-market\backend
python check_database_full.py

# Réinitialiser toutes les images
python update_db_with_new_names.py

# Créer un utilisateur de démo
python create_demo_user.py

# Afficher tous les utilisateurs
python show_all_users.py
```

### Comptes de connexion:
| Téléphone | Mot de passe | Nom |
|-----------|-------------|-----|
| +237123456789 | Demo@2026 | Démo Présentation |
| +237 695584290 | inconnu | Paul Auguste |

---

## 🚀 DÉMARRAGE DU PROJET

```powershell
# Terminal 1 - Backend
cd C:\Users\HP\Desktop\mboa-market\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd C:\Users\HP\Desktop\mboa-market\frontend
npm run dev
```

### URLs:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📊 SCHÉMA DES DONNÉES PRINCIPALES

```
User
├── id (UUID)
├── phone (string, unique)
├── email (string, optionnel)
├── password_hash (string)
├── status (ACTIVE | INACTIVE | SUSPENDED)
└── Profile
    ├── display_name
    ├── activity_type (producer | buyer | seed_provider)
    ├── domain (agriculture | elevage)
    ├── region
    └── locality

Listing
├── id (UUID)
├── seller_id (UUID → User)
├── category_id (UUID → Category)
├── title
├── quantity (Decimal)
├── unit (kg | tête | régime | etc.)
├── price_per_unit (Decimal)
├── currency (XAF)
├── region
├── status (PUBLISHED | DRAFT | SOLD)
└── ListingPhoto[]
    ├── id (UUID)
    ├── storage_key (chemin image: /images/agriculture/...)
    └── position (int)

Category
├── id (UUID)
├── name_fr
├── name_en
└── kind (agriculture | elevage)
```
