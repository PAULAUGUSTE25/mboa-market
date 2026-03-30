# 🤖 Configuration de l'API Groq (IA Gratuite comme WhatsApp)

## 🎯 Pourquoi Groq ?

Groq offre une API IA **100% gratuite** avec :
- ✅ **Réponses ultra-rapides** (comme ChatGPT/WhatsApp)
- ✅ **Pas de carte bancaire requise**
- ✅ **Modèles puissants** (Llama 3.1, Mixtral, Gemma)
- ✅ **Limite généreuse** : 30 requêtes/minute gratuit

---

## 📝 Comment obtenir votre clé API Groq GRATUITE

### Étape 1 : Créer un compte
1. Allez sur : **https://console.groq.com**
2. Cliquez sur **"Sign Up"** (Inscription)
3. Utilisez votre email (Gmail, Outlook, etc.)
4. Vérifiez votre email et confirmez

### Étape 2 : Obtenir votre clé API
1. Une fois connecté, allez sur : **https://console.groq.com/keys**
2. Cliquez sur **"Create API Key"**
3. Donnez un nom : `MBOA Market`
4. Cliquez sur **"Submit"**
5. **COPIEZ LA CLÉ** (elle ressemble à : `gsk_xxxxxxxxxxxxx`)

⚠️ **IMPORTANT** : Copiez la clé immédiatement, vous ne pourrez plus la voir après !

---

## 🔧 Intégrer votre clé dans l'application

### Méthode 1 : Modifier le fichier multiAI.ts (Recommandé)

1. Ouvrez : `frontend/src/services/multiAI.ts`
2. Trouvez la ligne 25 :
```typescript
apiKey: 'gsk_8xQZJ3WqYKLmN4pRvT5sWGdyb3FYcH9jKlMnOpQrStUvWxYz',
```
3. Remplacez par **VOTRE clé** :
```typescript
apiKey: 'gsk_VOTRE_CLE_ICI',
```
4. Sauvegardez le fichier

### Méthode 2 : Variable d'environnement (Plus sécurisé)

1. Créez un fichier `.env` dans `frontend/` :
```bash
VITE_GROQ_API_KEY=gsk_VOTRE_CLE_ICI
```

2. Modifiez `multiAI.ts` ligne 25 :
```typescript
apiKey: import.meta.env.VITE_GROQ_API_KEY || 'gsk_fallback_key',
```

3. Sur Netlify, ajoutez la variable d'environnement :
   - Dashboard Netlify → Settings → Environment Variables
   - Nom : `VITE_GROQ_API_KEY`
   - Valeur : Votre clé Groq

---

## 🚀 Tester l'IA

### En local :
```bash
cd frontend
npm run dev
```
Allez sur http://localhost:5173, connectez-vous, et testez le chat IA.

### En ligne :
Après avoir ajouté votre clé, redéployez :
```bash
cd frontend
npm run build
netlify deploy --prod
```

---

## 📊 Limites du plan gratuit Groq

| Modèle | Requêtes/minute | Tokens/minute |
|--------|----------------|---------------|
| Llama 3.1 8B | 30 | 20,000 |
| Llama 3.1 70B | 30 | 6,000 |
| Mixtral 8x7B | 30 | 5,000 |

**Pour MBOA Market** : Le modèle `llama-3.1-8b-instant` est parfait (rapide et gratuit).

---

## 🔄 Alternatives gratuites si Groq ne suffit pas

### 1. **Cohere** (Gratuit)
- Site : https://cohere.com
- Limite : 100 requêtes/minute gratuit
- Modèles : Command, Command-Light

### 2. **Together AI** (Gratuit)
- Site : https://together.ai
- Limite : 60 requêtes/minute gratuit
- Modèles : Llama, Mixtral, Qwen

### 3. **Hugging Face** (Gratuit)
- Site : https://huggingface.co
- Limite : Variable selon le modèle
- Modèles : Mistral, Falcon, etc.

---

## ✅ Vérifier que l'IA fonctionne

### Test rapide :
1. Ouvrez la console du navigateur (F12)
2. Dans le chat IA, tapez : "Bonjour"
3. Regardez la console :
   - ✅ Si vous voyez : `Using provider: Groq AI (Free)` → **ÇA MARCHE !**
   - ❌ Si vous voyez : `Using provider: Local AI Fallback` → Vérifiez votre clé

### Test de la qualité :
Posez des questions complexes :
- "Comment cultiver le maïs au Cameroun ?"
- "Quels sont les meilleurs engrais pour les tomates ?"
- "Comment gérer une ferme de poulets ?"

Si les réponses sont **détaillées et naturelles** (pas juste des templates), l'IA en ligne fonctionne ! 🎉

---

## 🆘 Dépannage

### Erreur : "API key invalid"
- Vérifiez que vous avez bien copié la clé complète
- La clé commence par `gsk_`
- Pas d'espaces avant/après la clé

### Erreur : "Rate limit exceeded"
- Vous avez dépassé 30 requêtes/minute
- Attendez 1 minute et réessayez
- Ou créez un 2ème compte Groq avec un autre email

### L'IA répond en anglais
- Modifiez le `systemContext` dans `multiAI.ts` ligne 115 :
```typescript
const systemContext = context || "Tu es Léa, assistante agricole au Cameroun. RÉPONDS TOUJOURS EN FRANÇAIS. Sois naturelle et conversationnelle.";
```

### L'IA ne répond pas
1. Vérifiez votre connexion internet
2. Ouvrez la console (F12) pour voir les erreurs
3. Vérifiez que la clé API est valide sur https://console.groq.com/keys

---

## 💡 Conseils pour optimiser l'IA

### 1. Personnaliser le contexte système
Dans `multiAI.ts`, ligne 115, modifiez :
```typescript
const systemContext = context || "Tu es Léa, l'assistante IA de MBOA Market au Cameroun. Tu es experte en agriculture tropicale, élevage, et commerce agricole. Tu réponds en français avec des conseils pratiques et adaptés au contexte camerounais.";
```

### 2. Ajuster la température
- **Plus créative** (0.8-1.0) : Réponses variées et créatives
- **Plus précise** (0.3-0.5) : Réponses factuelles et cohérentes
- **Équilibrée** (0.7) : Bon compromis (actuel)

Dans `multiAI.ts` ligne 135 :
```typescript
temperature: 0.7, // Ajustez entre 0.3 et 1.0
```

### 3. Augmenter la longueur des réponses
Dans `multiAI.ts` ligne 136 :
```typescript
max_tokens: 2048, // Au lieu de 1024 pour des réponses plus longues
```

---

## 🎉 Résultat final

Avec Groq configuré, votre IA fonctionnera **exactement comme sur WhatsApp** :
- ✅ Réponses en temps réel
- ✅ Conversations naturelles
- ✅ Compréhension du contexte
- ✅ Conseils personnalisés
- ✅ 100% gratuit

**Votre MBOA Market aura une vraie IA intelligente !** 🚀

---

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez ce guide
2. Consultez la doc Groq : https://console.groq.com/docs
3. Testez avec un autre modèle (changez `llama-3.1-8b-instant` par `mixtral-8x7b-32768`)

**Bonne chance !** 🌟
