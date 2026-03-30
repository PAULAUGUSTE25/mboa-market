# 🚀 Déploiement Rapide - MBOA Market (100% Gratuit)

## ⚡ Méthode la Plus Rapide (5 minutes)

### **Étape 1 : Installer Vercel CLI**
```bash
npm install -g vercel
```

### **Étape 2 : Déployer le Frontend**
```bash
cd frontend
vercel login
vercel --prod
```

Répondez aux questions :
- Project name: `mboa-market`
- Directory: `./`
- Override settings: `No`

✅ **Votre frontend sera sur : `https://mboa-market.vercel.app`**

---

### **Étape 3 : Déployer le Backend sur Render**

#### **Option A : Via Dashboard (Recommandé)**
1. Allez sur https://render.com
2. Créez un compte (gratuit)
3. Cliquez **New +** → **Web Service**
4. Connectez votre GitHub ou utilisez **Public Git Repository**
5. Configuration :
   - **Name** : `mboa-market-backend`
   - **Root Directory** : `backend`
   - **Runtime** : Python 3
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan** : Free
6. Ajoutez ces variables d'environnement :
   ```
   DATABASE_URL=sqlite:///./mboa_market.db
   SECRET_KEY=mboa-market-secret-key-2024
   FRONTEND_URL=https://mboa-market.vercel.app
   ```
7. Cliquez **Create Web Service**

✅ **Votre backend sera sur : `https://mboa-market-backend.onrender.com`**

#### **Option B : Via GitHub (Automatique)**
1. Poussez votre code sur GitHub
2. Sur Render, connectez votre repo
3. Le fichier `render.yaml` sera détecté automatiquement
4. Cliquez **Apply**

---

### **Étape 4 : Connecter Frontend et Backend**

Dans Vercel Dashboard (https://vercel.com/dashboard) :
1. Sélectionnez votre projet `mboa-market`
2. **Settings** → **Environment Variables**
3. Ajoutez :
   ```
   VITE_API_URL = https://mboa-market-backend.onrender.com
   ```
4. **Redéployez** : Allez dans **Deployments** → Cliquez sur les 3 points → **Redeploy**

---

## 🎉 C'EST FAIT !

Votre application est en ligne :
- 🌐 **Frontend** : https://mboa-market.vercel.app
- 🔧 **Backend** : https://mboa-market-backend.onrender.com

---

## 🆓 Domaine Personnalisé Gratuit (Optionnel)

### **Option 1 : Sous-domaine Vercel (Déjà inclus)**
Votre app est déjà sur `mboa-market.vercel.app` - gratuit à vie !

### **Option 2 : Domaine .tk/.ml gratuit (Freenom)**
1. Allez sur https://www.freenom.com
2. Cherchez `mboa-market.tk` ou `mboa-market.ml`
3. Enregistrez gratuitement (12 mois)
4. Dans Vercel : **Settings** → **Domains** → Ajoutez votre domaine
5. Configurez les DNS chez Freenom :
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   ```

---

## 📱 Tester Votre Application

1. Ouvrez https://mboa-market.vercel.app
2. Connectez-vous avec :
   - Téléphone : `+237695584290`
   - Mot de passe : `password123`
3. Testez le tableau de bord agricole
4. Testez le chat IA

---

## 🔧 Commandes Utiles

### **Redéployer le Frontend**
```bash
cd frontend
vercel --prod
```

### **Voir les logs du Backend**
Sur Render Dashboard → Votre service → **Logs**

### **Mettre à jour le code**
```bash
git add .
git commit -m "Update"
git push
```
Render et Vercel redéploieront automatiquement !

---

## 💰 Coûts : 0 FCFA / 0€

Tout est 100% gratuit :
- ✅ Vercel : Gratuit à vie
- ✅ Render : Gratuit (750h/mois)
- ✅ Domaine .vercel.app : Gratuit
- ✅ SSL/HTTPS : Gratuit (automatique)

---

## 🚨 Note Importante

Le backend sur Render (plan gratuit) :
- ⏰ S'endort après 15 minutes d'inactivité
- 🔄 Se réveille automatiquement (prend ~30 secondes)
- 💡 Pour éviter ça : Utilisez un service de ping gratuit comme https://uptimerobot.com

---

**Votre application MBOA Market est maintenant accessible partout dans le monde ! 🌍**
