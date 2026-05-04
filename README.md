# 🌾 MBOA Market - Plateforme Agro-Pastorale

## 📁 Structure du Projet

### Frontend (`/frontend`)
```
frontend/
├── public/
│   ├── images/
│   │   ├── agriculture/     # Images de produits agricoles
│   │   ├── livestock/       # Images d'élevage (animaux)
│   │   ├── backgrounds/     # Images de fond
│   │   ├── products/        # Images de produits (aliments, etc.)
│   │   ├── equipment/       # Images d'équipements agricoles
│   │   └── gemini/          # Images générées par IA
│   ├── icons/               # Icônes de l'application
│   └── images/              # Dossier legacy (à migrer)
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── icons/          # Système d'icônes unifié
│   │   └── BackButton.tsx  # Bouton retour uniforme
│   ├── pages/              # Pages de l'application
│   ├── contexts/           # Contextes React
│   ├── services/           # Services API
│   └── store/              # State management
└── ...

### Backend (`/backend`)
```
backend/
├── app/
│   ├── api/                # Routes API
│   ├── models/             # Modèles de données
│   ├── schemas/            # Schémas Pydantic
│   └── core/               # Configuration
└── ...
```

## 🎨 Système de Design

### Couleurs Principales
- **Vert principal:** `#3F441C` → `#4A4F23` (gradient)
- **Vert clair:** `#A0B96B` → `#829952`
- **Beige:** `#F5F5F0`
- **Texte:** `#3F441C`

### Icônes
- **Agriculture/Élevage:** React Icons (Game Icons)
- **UI/Navigation:** Lucide Icons
- **Centralisé dans:** `src/components/icons/UnifiedIcons.tsx`

## 🚀 Démarrage Rapide

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📝 Conventions

### Nommage des fichiers
- **Composants:** PascalCase (`BackButton.tsx`)
- **Pages:** PascalCase avec suffixe Page (`HomePage.tsx`)
- **Utilitaires:** camelCase (`api.ts`)

### Images
- Utiliser les dossiers thématiques dans `public/images/`
- Noms descriptifs en kebab-case
- Formats: PNG pour transparence, JPG pour photos

## 🔧 Technologies

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- Framer Motion
- React Icons + Lucide

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic

## 📦 Déploiement

- **Frontend:** Netlify/Vercel
- **Backend:** Render/Railway

---

**Version:** 1.0.0  
**Dernière mise à jour:** Avril 2026
