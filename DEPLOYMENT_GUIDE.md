# 🚀 Guide de Déploiement Gratuit - MBOA Market

Ce guide vous permet de déployer MBOA Market **100% gratuitement** avec un domaine gratuit.

## 📋 Vue d'ensemble

- **Frontend** : Vercel (gratuit + domaine .vercel.app)
- **Backend** : Render (gratuit)
- **Base de données** : SQLite (incluse)
- **Domaine** : Gratuit (.vercel.app)

---

## 🎯 OPTION 1 : Déploiement avec Vercel (RECOMMANDÉ)

### **A. Déployer le Frontend sur Vercel**

#### **1. Créer un compte Vercel**
- Allez sur https://vercel.com/signup
- Inscrivez-vous avec GitHub (gratuit)

#### **2. Installer Vercel CLI**
```bash
npm install -g vercel
```

#### **3. Se connecter à Vercel**
```bash
vercel login
```

#### **4. Déployer le Frontend**
```bash
cd frontend
vercel
```

Suivez les instructions :
- **Set up and deploy?** → Yes
- **Which scope?** → Votre compte
- **Link to existing project?** → No
- **Project name?** → mboa-market
- **Directory?** → ./
- **Override settings?** → No

**Votre frontend sera déployé sur : `https://mboa-market.vercel.app`**

#### **5. Configuration des variables d'environnement**

Dans le dashboard Vercel (https://vercel.com/dashboard) :
1. Sélectionnez votre projet `mboa-market`
2. Allez dans **Settings** → **Environment Variables**
3. Ajoutez :
   - `VITE_API_URL` = `https://votre-backend.onrender.com` (voir section Backend)

---

### **B. Déployer le Backend sur Render**

#### **1. Créer un compte Render**
- Allez sur https://render.com/register
- Inscrivez-vous avec GitHub (gratuit)

#### **2. Créer un nouveau Web Service**
1. Cliquez sur **New +** → **Web Service**
2. Connectez votre repository GitHub
3. Ou utilisez **Public Git Repository** et collez l'URL de votre repo

#### **3. Configuration du service**
- **Name** : `mboa-market-backend`
- **Region** : Frankfurt (ou le plus proche)
- **Branch** : `main`
- **Root Directory** : `backend`
- **Runtime** : `Python 3`
- **Build Command** : `pip install -r requirements.txt`
- **Start Command** : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Plan** : **Free**

#### **4. Variables d'environnement**
Dans **Environment** → **Environment Variables**, ajoutez :
```
DATABASE_URL=sqlite:///./mboa_market.db
SECRET_KEY=votre-secret-key-super-securisee-ici
FRONTEND_URL=https://mboa-market.vercel.app
```

#### **5. Déployer**
Cliquez sur **Create Web Service**

**Votre backend sera déployé sur : `https://mboa-market-backend.onrender.com`**

---

## 🎯 OPTION 2 : Déploiement avec Netlify

### **Frontend sur Netlify**

#### **1. Créer un compte Netlify**
- Allez sur https://app.netlify.com/signup
- Inscrivez-vous avec GitHub

#### **2. Installer Netlify CLI**
```bash
npm install -g netlify-cli
```

#### **3. Se connecter**
```bash
netlify login
```

#### **4. Déployer**
```bash
cd frontend
npm run build
netlify deploy --prod
```

Suivez les instructions :
- **Create & configure a new site** → Yes
- **Team** : Votre équipe
- **Site name** : `mboa-market`
- **Publish directory** : `dist`

**Votre site sera sur : `https://mboa-market.netlify.app`**

---

## 🎯 OPTION 3 : Déploiement avec Railway (Backend + Frontend)

### **1. Créer un compte Railway**
- Allez sur https://railway.app
- Inscrivez-vous avec GitHub

### **2. Nouveau projet**
1. Cliquez sur **New Project**
2. Sélectionnez **Deploy from GitHub repo**
3. Choisissez votre repository

### **3. Configuration**
Railway détectera automatiquement :
- **Frontend** : Vite/React
- **Backend** : FastAPI/Python

**Domaines gratuits :**
- Frontend : `https://mboa-market.up.railway.app`
- Backend : `https://mboa-market-api.up.railway.app`

---

## 📝 Fichiers de Configuration Nécessaires

### **1. `vercel.json` (Frontend)**
Créez ce fichier dans `frontend/` :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### **2. `netlify.toml` (Alternative pour Netlify)**
Créez ce fichier dans `frontend/` :

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### **3. `render.yaml` (Backend sur Render)**
Créez ce fichier dans `backend/` :

```yaml
services:
  - type: web
    name: mboa-market-backend
    env: python
    region: frankfurt
    plan: free
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: DATABASE_URL
        value: sqlite:///./mboa_market.db
      - key: SECRET_KEY
        generateValue: true
      - key: PYTHON_VERSION
        value: 3.11.0
```

### **4. `Procfile` (Alternative pour Heroku)**
Créez ce fichier dans `backend/` :

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## 🔧 Configuration Post-Déploiement

### **1. Mettre à jour l'URL du Backend dans le Frontend**

Éditez `frontend/src/services/api.ts` :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mboa-market-backend.onrender.com';
```

### **2. Configurer CORS dans le Backend**

Éditez `backend/app/main.py` :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mboa-market.vercel.app",
        "https://mboa-market.netlify.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🌐 Domaines Personnalisés Gratuits

### **Option 1 : Freenom (Domaine .tk, .ml, .ga gratuit)**
1. Allez sur https://www.freenom.com
2. Cherchez un domaine disponible (ex: mboa-market.tk)
3. Enregistrez-le gratuitement (12 mois)
4. Configurez les DNS pour pointer vers Vercel/Netlify

### **Option 2 : Sous-domaines gratuits**
- **Vercel** : `mboa-market.vercel.app` (automatique)
- **Netlify** : `mboa-market.netlify.app` (automatique)
- **Render** : `mboa-market-backend.onrender.com` (automatique)

---

## ✅ Checklist de Déploiement

- [ ] Compte Vercel/Netlify créé
- [ ] Compte Render/Railway créé
- [ ] Frontend buildé sans erreurs (`npm run build`)
- [ ] Backend testé localement
- [ ] Variables d'environnement configurées
- [ ] CORS configuré correctement
- [ ] Base de données initialisée
- [ ] Frontend déployé
- [ ] Backend déployé
- [ ] URLs mises à jour
- [ ] Application testée en ligne

---

## 🚨 Résolution de Problèmes

### **Erreur : Build Failed**
```bash
# Vérifier les dépendances
npm install
npm run build
```

### **Erreur : CORS**
Vérifiez que l'URL du frontend est dans la liste `allow_origins` du backend.

### **Erreur : Database**
Sur Render/Railway, la base de données SQLite est éphémère. Pour une solution permanente :
- Utilisez **Supabase** (PostgreSQL gratuit)
- Ou **PlanetScale** (MySQL gratuit)

### **Erreur : API non accessible**
Vérifiez que `VITE_API_URL` pointe vers le bon backend déployé.

---

## 💰 Coûts

| Service | Plan Gratuit | Limites |
|---------|--------------|---------|
| **Vercel** | Gratuit | 100 GB bandwidth/mois |
| **Netlify** | Gratuit | 100 GB bandwidth/mois |
| **Render** | Gratuit | 750h/mois, sleep après 15min inactivité |
| **Railway** | Gratuit | $5 crédit/mois |
| **Freenom** | Gratuit | Domaine .tk/.ml/.ga 12 mois |

**Total : 0€ / 0 FCFA** 🎉

---

## 📞 Support

- **Vercel Docs** : https://vercel.com/docs
- **Render Docs** : https://render.com/docs
- **Netlify Docs** : https://docs.netlify.com

---

**Votre application MBOA Market sera accessible 24/7 gratuitement !** 🌍
