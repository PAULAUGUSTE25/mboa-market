# Architecture du Frontend — MBOA Market

## Stack technique
- **Framework UI** : React 18 + TypeScript
- **Outil de build** : Vite
- **Styles** : Tailwind CSS
- **Gestion d'état** : Zustand (avec persistance localStorage)
- **Client HTTP** : Axios
- **Routage** : React Router v6

---

## Structure des dossiers

```
src/
├── api/                        # Couche d'accès aux données (API REST)
│   ├── client.ts               # Instance Axios + intercepteurs (token, erreurs)
│   ├── auth.api.ts             # Inscription, connexion, déconnexion
│   ├── users.api.ts            # Profil utilisateur
│   ├── listings.api.ts         # Annonces, catégories, produits
│   ├── messages.api.ts         # Conversations et messages
│   ├── orders.api.ts           # Commandes
│   └── index.ts                # Barrel export (point d'entrée unique)
│
├── types/                      # Interfaces TypeScript par domaine
│   ├── auth.types.ts           # User, LoginRequest, RegisterRequest
│   ├── listing.types.ts        # Listing, Category, Product, Filters
│   ├── message.types.ts        # Conversation, Message
│   ├── order.types.ts          # Order, OrderStatus
│   └── index.ts                # Barrel export
│
├── constants/                  # Constantes globales de l'application
│   ├── routes.ts               # Chemins de navigation (ROUTES.FEED, etc.)
│   ├── api.routes.ts           # Endpoints API (API_ROUTES.LISTINGS.BASE, etc.)
│   └── index.ts                # Barrel export
│
├── store/                      # État global (Zustand)
│   └── authStore.ts            # État d'authentification (user, login, logout)
│
├── contexts/                   # Contextes React
│   ├── DomainContext.tsx        # Secteur sélectionné (agriculture / élevage)
│   ├── ThemeContext.tsx         # Thème clair / sombre
│   └── UserFarmContext.tsx      # Données de l'exploitation agricole
│
├── pages/                      # Pages de l'application (une par route)
│   ├── FeedPage.tsx            # Fil d'actualité principal
│   ├── AgriDashboardPage.tsx   # Tableau de bord agricole
│   ├── ListingsPage.tsx        # Liste des annonces
│   ├── LoginPage.tsx           # Connexion
│   ├── RegisterPage.tsx        # Inscription
│   └── ...
│
├── components/                 # Composants réutilisables
│   ├── BackButton.tsx          # Bouton retour
│   ├── Logo.tsx                # Logo de l'application
│   ├── ThemeToggle.tsx         # Bascule thème
│   └── ...
│
├── services/                   # Services (pont vers src/api/ pour compatibilité)
│   └── api.ts                  # Réexporte tous les modules api/
│
├── utils/                      # Fonctions utilitaires pures
│   ├── colors.ts               # Couleurs par domaine
│   ├── themeStyles.ts          # Styles selon le thème
│   └── cardStyles.ts           # Styles des cartes
│
├── data/                       # Données statiques et de démonstration
│   └── demoListings.ts         # Publications de démonstration pour le feed
│
├── hooks/                      # Hooks React personnalisés
│
├── App.tsx                     # Composant racine + définition des routes
└── main.tsx                    # Point d'entrée de l'application
```

---

## Flux de données

```
Page (FeedPage.tsx)
  └── appelle api.getListings()          ← services/api.ts
        └── délègue à listingsApi.getAll() ← api/listings.api.ts
              └── httpClient.get('/listings') ← api/client.ts (Axios)
                    └── Backend FastAPI : GET /api/listings
```

---

## Conventions de nommage

| Type          | Convention        | Exemple                  |
|---------------|-------------------|--------------------------|
| Fichiers API  | `*.api.ts`        | `listings.api.ts`        |
| Types         | `*.types.ts`      | `listing.types.ts`       |
| Pages         | `*Page.tsx`       | `FeedPage.tsx`           |
| Composants    | `PascalCase.tsx`  | `BackButton.tsx`         |
| Hooks         | `use*.ts`         | `useAuth.ts`             |
| Constantes    | `SCREAMING_SNAKE` | `ROUTES.FEED`            |

---

## Images statiques

Les images sont servies par Vite depuis le dossier `public/` :

```
public/images/
├── agriculture/    → /images/agriculture/bonmanioc.jpg
├── livestock/      → /images/livestock/chevre_de_bazou.jpg
└── backgrounds/    → /images/backgrounds/champs_de_maise.jpg
```

**Règle** : noms de fichiers sans espaces (underscores `_` à la place).
