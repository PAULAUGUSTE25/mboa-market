# 🚀 DÉPLOIEMENT DU BACKEND - MBOA MARKET

## 📋 ÉTAPES POUR DÉPLOYER LE BACKEND SUR RENDER (GRATUIT)

### **1. Créer un compte Render**
1. Allez sur : **https://render.com**
2. Cliquez sur **"Get Started"**
3. Inscrivez-vous avec GitHub ou votre email
4. Vérifiez votre email

### **2. Déployer le backend**

#### **Option A : Via GitHub (Recommandé)**

1. **Créez un repo GitHub** (si pas déjà fait) :
   ```bash
   cd c:\Users\HP\Desktop\mboa-market
   git init
   git add .
   git commit -m "Initial commit - MBOA Market"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/mboa-market.git
   git push -u origin main
   ```

2. **Sur Render Dashboard** :
   - Cliquez **"New +"** → **"Web Service"**
   - Connectez votre compte GitHub
   - Sélectionnez le repo `mboa-market`
   - Configurez :
     - **Name** : `mboa-market-backend`
     - **Region** : Frankfurt (ou le plus proche)
     - **Root Directory** : `backend`
     - **Environment** : Python 3
     - **Build Command** : `pip install -r requirements.txt`
     - **Start Command** : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Plan** : Free

3. **Variables d'environnement** :
   Ajoutez ces variables :
   ```
   DATABASE_URL=sqlite:///./mboa_market.db
   SECRET_KEY=mboa-market-secret-key-2024-production
   FRONTEND_URL=https://mboa-market.netlify.app
   ```

4. **Déployez** :
   - Cliquez **"Create Web Service"**
   - Attendez 5-10 minutes

#### **Option B : Via CLI Render**

```bash
# Installer Render CLI
npm install -g render-cli

# Se connecter
render login

# Déployer
cd backend
render deploy
```

### **3. Récupérer l'URL du backend**

Une fois déployé, vous aurez une URL comme :
```
https://mboa-market-backend.onrender.com
```

### **4. Configurer le frontend pour utiliser le backend**

#### **Sur Netlify** :
1. Allez sur : https://app.netlify.com
2. Sélectionnez votre site `mboa-market`
3. **Site settings** → **Environment variables**
4. Ajoutez :
   ```
   VITE_API_URL=https://mboa-market-backend.onrender.com/api
   ```
5. **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

#### **Localement** :
Créez `.env` dans `frontend/` :
```bash
VITE_API_URL=https://mboa-market-backend.onrender.com/api
```

### **5. Redéployer le frontend**

```bash
cd frontend
npm run build
netlify deploy --prod
```

---

## ✅ VÉRIFICATION

### **Tester le backend** :
```bash
curl https://mboa-market-backend.onrender.com/health
```

Réponse attendue :
```json
{"status": "ok"}
```

### **Tester l'inscription** :
1. Allez sur https://mboa-market.netlify.app
2. Cliquez "S'inscrire"
3. Remplissez le formulaire
4. Vérifiez que ça fonctionne !

---

## 🔧 CONFIGURATION CORS

Le backend doit autoriser les requêtes depuis Netlify. Vérifiez dans `backend/app/main.py` :

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://mboa-market.netlify.app",
        "https://*.netlify.app"  # Pour les preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 URLS FINALES

- **Frontend** : https://mboa-market.netlify.app
- **Backend** : https://mboa-market-backend.onrender.com
- **API** : https://mboa-market-backend.onrender.com/api

---

## 🆓 PLAN GRATUIT RENDER

- ✅ 750 heures/mois gratuit
- ✅ 512 MB RAM
- ✅ Base de données SQLite incluse
- ⚠️ Le service s'endort après 15 min d'inactivité (redémarre en 30s)

---

## 🆘 DÉPANNAGE

### **Erreur : "Application failed to respond"**
- Vérifiez que le port est `$PORT` dans la commande start
- Vérifiez les logs sur Render Dashboard

### **Erreur : "CORS error"**
- Ajoutez l'URL Netlify dans les origins CORS
- Redéployez le backend

### **Erreur : "Database locked"**
- SQLite peut avoir des problèmes en production
- Considérez PostgreSQL gratuit sur Render

---

## 🎯 RÉSULTAT ATTENDU

Après déploiement :
- ✅ Inscription fonctionne en ligne
- ✅ Connexion fonctionne en ligne
- ✅ API accessible depuis le frontend
- ✅ Tout est 100% gratuit

**Votre application MBOA Market sera entièrement fonctionnelle en ligne !** 🚀
