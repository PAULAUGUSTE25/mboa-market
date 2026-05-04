# 📂 Structure du Frontend - MBOA Market

## 🎯 Organisation Propre et Optimisée

### 📁 `/src` - Code Source

```
src/
├── components/           # Composants réutilisables
│   ├── icons/           # Système d'icônes
│   │   └── UnifiedIcons.tsx    # ✅ Icônes unifiées (seul fichier nécessaire)
│   ├── AIAssistant.tsx         # Assistant IA
│   ├── AIChat.tsx              # Chat IA
│   ├── BackButton.tsx          # ✅ Bouton retour uniforme
│   ├── BackgroundSlideshow.tsx # Slideshow de fond
│   ├── ChatComponent.tsx       # Composant de chat
│   ├── ExpertCard.tsx          # Carte expert
│   ├── Logo.tsx                # Logo de l'app
│   ├── ScrollToTop.tsx         # Scroll to top
│   ├── ThemeToggle.tsx         # Toggle thème
│   └── ThemeToggleButton.tsx   # Bouton toggle thème
│
├── pages/                # Pages de l'application
│   ├── HomePage.tsx              # ✅ Page d'accueil
│   ├── LoginPage.tsx             # ✅ Connexion
│   ├── RegisterPage.tsx          # ✅ Inscription
│   ├── FeedPage.tsx              # ✅ Fil d'actualité
│   ├── ListingsPage.tsx          # ✅ Annonces
│   ├── ListingDetailPage.tsx    # Détail annonce
│   ├── ChatPage.tsx              # Chat
│   ├── ProfilePage.tsx           # Profil utilisateur
│   ├── MyActivityPage.tsx        # Activités
│   ├── AgriDashboardPage.tsx    # ✅ Dashboard agricole
│   ├── ProducerDashboard.tsx    # ✅ Dashboard producteur
│   ├── SeedProviderDashboard.tsx # ✅ Dashboard fournisseur
│   ├── SelectSectorPage.tsx     # Sélection secteur
│   ├── CommunityAgriculturePage.tsx # Communauté agriculture
│   ├── CommunityElevagePage.tsx    # Communauté élevage
│   ├── ExpertsPage.tsx          # Experts
│   ├── TipsPage.tsx             # Conseils
│   ├── AdvicePage.tsx           # Avis
│   └── PrivacyPolicyPage.tsx    # Politique de confidentialité
│
├── contexts/             # Contextes React
│   ├── DomainContext.tsx        # Contexte domaine (agriculture/élevage)
│   ├── ThemeContext.tsx         # Contexte thème
│   └── UserFarmContext.tsx      # Contexte ferme utilisateur
│
├── services/             # Services API et logique métier
│   ├── api.ts                   # ✅ API principale
│   ├── aiHealthMonitoring.ts   # Monitoring santé IA
│   ├── aiRecommendationEngine.ts # Moteur de recommandations
│   ├── computerVision.ts        # Vision par ordinateur
│   ├── gemini.ts                # Service Gemini AI
│   ├── localAuth.ts             # Authentification locale
│   ├── multiAI.ts               # Multi-IA
│   ├── predictiveAnalytics.ts   # Analyses prédictives
│   ├── smartMatchingAlgorithm.ts # Algorithme de matching
│   ├── smartPricePrediction.ts  # Prédiction de prix
│   ├── supplyChainOptimization.ts # Optimisation supply chain
│   └── voiceAssistant.ts        # Assistant vocal
│
├── store/                # State management
│   └── authStore.ts             # ✅ Store authentification
│
├── data/                 # Données de démo
│   ├── demoCommunityPosts.ts   # Posts communauté
│   ├── demoListings.ts         # Annonces démo
│   ├── expertAdvice.ts         # Conseils experts
│   ├── officialAlerts.ts       # Alertes officielles
│   └── officialNews.ts         # Actualités officielles
│
├── hooks/                # Custom hooks
│   └── useLocalStorage.ts      # Hook localStorage
│
├── types/                # Types TypeScript
│   └── index.ts                # Types globaux
│
├── utils/                # Utilitaires
│   ├── constants.ts            # Constantes
│   ├── helpers.ts              # Fonctions helper
│   └── validation.ts           # Validation
│
├── config/               # Configuration
│   └── theme.ts                # Configuration thème
│
├── App.tsx               # ✅ Composant principal
├── main.tsx              # ✅ Point d'entrée
└── index.css             # ✅ Styles globaux
```

### 📁 `/public` - Fichiers publics

```
public/
├── images/               # ✅ Images organisées
│   ├── agriculture/     # Produits agricoles (3)
│   ├── livestock/       # Animaux d'élevage (11)
│   ├── backgrounds/     # Fonds d'écran (4)
│   ├── products/        # Produits transformés (4)
│   ├── equipment/       # Équipements (8)
│   └── gemini/          # Images IA (10)
├── icons/               # Icônes de l'app
└── _redirects           # Redirections Netlify
```

## 🗑️ Fichiers Supprimés

### Pages de démo (inutiles en production):
- ❌ AllIconsShowcase.tsx
- ❌ CreativeIconsDemo.tsx
- ❌ CustomIconsDemo.tsx
- ❌ IconShowcasePage.tsx
- ❌ TablerIconsShowcase.tsx
- ❌ HomePage.backup.tsx
- ❌ LoginPage.backup.tsx
- ❌ RegisterPage.backup.tsx
- ❌ SelectSectorPage.backup.tsx
- ❌ LoginAgriculturePage.tsx
- ❌ LoginElevagePage.tsx

### Composants inutilisés:
- ❌ LiquidCarousel.tsx
- ❌ LiquidDistortion.tsx
- ❌ ParticleMorphing.tsx
- ❌ PortalDive.tsx
- ❌ SectorCard.tsx
- ❌ SectorLogo.tsx
- ❌ SectorSwitcher.tsx

### Fichiers d'icônes de démo:
- ❌ AgricultureIcons.tsx
- ❌ CreativeIcon.tsx
- ❌ CustomSVGIcons.tsx
- ❌ ICONS_GUIDE.md
- ❌ ModernIcons.tsx
- ❌ NavigationIcons.tsx
- ❌ TablerAgriIcons.tsx

## ✅ Système Unifié

### Icônes
- **Un seul fichier:** `UnifiedIcons.tsx`
- **Agriculture/Élevage:** React Icons (Game Icons)
- **UI/Navigation:** Lucide Icons

### Boutons Retour
- **Un seul composant:** `BackButton.tsx`
- **Couleur uniforme:** Vert principal (#3F441C → #4A4F23)
- **Utilisé partout:** Toutes les pages

### Images
- **Organisation thématique:** Par catégorie dans `/public/images/`
- **Chemins mis à jour:** Tous les imports corrigés

## 📊 Statistiques

- **Pages actives:** 20
- **Composants:** 12
- **Services:** 12
- **Fichiers supprimés:** 30+
- **Réduction:** ~40% de fichiers inutiles

---

**Structure propre, organisée et maintenable! ✨**
