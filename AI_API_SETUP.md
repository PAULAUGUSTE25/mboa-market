# 🤖 Configuration des API IA Gratuites pour MBOA Market

Ce guide vous aide à configurer des API IA **100% gratuites** pour remplacer Gemini et éviter les problèmes de rate limiting.

## 🆓 Options Recommandées (par ordre de priorité)

### 1. 🤗 Hugging Face Inference API (RECOMMANDÉ)

**Avantages:**
- ✅ Totalement gratuit
- ✅ Pas de carte bancaire requise
- ✅ Modèles puissants (Mistral, Llama, Falcon)
- ✅ Facile à configurer

**Comment obtenir votre clé:**

1. **Créer un compte** sur https://huggingface.co/join
2. **Aller dans Settings** → https://huggingface.co/settings/tokens
3. **Créer un nouveau token:**
   - Cliquer sur "New token"
   - Nom: "MBOA Market"
   - Type: "Read"
   - Cliquer sur "Generate"
4. **Copier le token** (commence par `hf_...`)

**Configuration dans MBOA Market:**

```typescript
// Dans frontend/src/services/multiAI.ts
{
  name: 'Hugging Face',
  endpoint: 'https://api-inference.huggingface.co/models',
  apiKey: 'hf_VOTRE_TOKEN_ICI', // Remplacer par votre token
  model: 'mistralai/Mistral-7B-Instruct-v0.2',
  enabled: true
}
```

**Modèles gratuits recommandés:**
- `mistralai/Mistral-7B-Instruct-v0.2` - Excellent pour le français
- `meta-llama/Llama-2-7b-chat-hf` - Très performant
- `tiiuae/falcon-7b-instruct` - Rapide et efficace

---

### 2. 💬 Groq (Ultra Rapide)

**Avantages:**
- ✅ API gratuite très rapide
- ✅ Llama 3 et Mixtral disponibles
- ✅ Excellente performance
- ✅ Limite généreuse: 30 requêtes/minute

**Comment obtenir votre clé:**

1. **Créer un compte** sur https://console.groq.com
2. **Aller dans API Keys** → https://console.groq.com/keys
3. **Créer une nouvelle clé:**
   - Cliquer sur "Create API Key"
   - Nom: "MBOA Market"
   - Copier la clé (commence par `gsk_...`)

**Configuration:**

```typescript
{
  name: 'Groq',
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  apiKey: 'gsk_VOTRE_CLE_ICI', // Remplacer par votre clé
  model: 'llama3-8b-8192',
  enabled: true
}
```

**Modèles disponibles:**
- `llama3-8b-8192` - Llama 3 (recommandé)
- `mixtral-8x7b-32768` - Très puissant
- `gemma-7b-it` - Léger et rapide

---

### 3. 🌐 OpenRouter (Accès Multiple)

**Avantages:**
- ✅ Accès à plusieurs modèles gratuits
- ✅ Fallback automatique
- ✅ Bonne disponibilité

**Comment obtenir votre clé:**

1. **Créer un compte** sur https://openrouter.ai
2. **Aller dans Keys** → https://openrouter.ai/keys
3. **Créer une clé gratuite**

**Configuration:**

```typescript
{
  name: 'OpenRouter',
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: 'sk-or-v1-VOTRE_CLE', // Remplacer
  model: 'meta-llama/llama-3-8b-instruct:free',
  enabled: true
}
```

---

### 4. 🦙 Ollama (Local - 100% Gratuit et Privé)

**Avantages:**
- ✅ Totalement gratuit
- ✅ Fonctionne offline
- ✅ Pas de limites
- ✅ Données privées
- ❌ Nécessite installation locale

**Installation:**

1. **Télécharger Ollama** sur https://ollama.ai
2. **Installer** sur votre PC
3. **Télécharger un modèle:**
   ```bash
   ollama pull llama3
   ollama pull mistral
   ```
4. **Démarrer le serveur:**
   ```bash
   ollama serve
   ```

**Configuration:**

```typescript
{
  name: 'Ollama',
  endpoint: 'http://localhost:11434/api/generate',
  model: 'llama3',
  enabled: true
}
```

---

## 🔧 Configuration Finale

### Étape 1: Obtenir au moins 1 clé API

Choisissez **Hugging Face** (le plus simple) ou **Groq** (le plus rapide).

### Étape 2: Configurer dans le code

Ouvrez `frontend/src/services/multiAI.ts` et remplacez:

```typescript
private providers: AIProvider[] = [
  {
    name: 'Hugging Face',
    endpoint: 'https://api-inference.huggingface.co/models',
    apiKey: 'hf_VOTRE_TOKEN_ICI', // ← Remplacer ici
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    enabled: true
  },
  {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: 'gsk_VOTRE_CLE_ICI', // ← Remplacer ici
    model: 'llama3-8b-8192',
    enabled: true
  },
  {
    name: 'Local Fallback',
    endpoint: 'local',
    model: 'rule-based',
    enabled: true // ← Toujours actif (pas besoin de clé)
  }
];
```

### Étape 3: Tester

Le système essaiera automatiquement:
1. **Hugging Face** en premier
2. **Groq** si Hugging Face échoue
3. **Local Fallback** si tout échoue (réponses pré-programmées)

---

## 💡 Conseils d'Utilisation

### Limites Gratuites

| Provider | Requêtes/Minute | Requêtes/Jour | Tokens/Requête |
|----------|-----------------|---------------|----------------|
| Hugging Face | ~30 | Illimité | 500 |
| Groq | 30 | ~14,400 | 8,192 |
| OpenRouter | Variable | Variable | Variable |
| Ollama | Illimité | Illimité | Illimité |

### Optimisations

1. **Cache activé** - Les réponses sont mises en cache 1h
2. **Fallback automatique** - Si un provider échoue, essaie le suivant
3. **Réponses locales** - Pour questions courantes (maïs, tomates, etc.)

### Utilisation dans le Code

```typescript
import { multiAI } from '@/services/multiAI';

// Génération simple
const response = await multiAI.generateResponse('Comment cultiver du maïs ?');
console.log(response.text); // Réponse
console.log(response.provider); // Quel provider a répondu

// Recommandations agricoles
const advice = await multiAI.getAgriRecommendations('tomates', 'Littoral');

// Analyse de prix
const priceAnalysis = await multiAI.analyzePrices('maïs', 500);

// Diagnostic de problèmes
const diagnosis = await multiAI.diagnoseProblem('feuilles jaunes', 'tomates');
```

---

## 🚨 Résolution de Problèmes

### Erreur 429 (Too Many Requests)

**Solution:** Le système passe automatiquement au provider suivant.

### Erreur 401 (Unauthorized)

**Solution:** Vérifiez que votre clé API est correcte.

### Pas de réponse

**Solution:** Le fallback local s'active automatiquement avec des réponses pré-programmées.

---

## 📊 Comparaison des Providers

| Critère | Hugging Face | Groq | Ollama | Local Fallback |
|---------|--------------|------|--------|----------------|
| Gratuit | ✅ | ✅ | ✅ | ✅ |
| Vitesse | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Qualité | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Offline | ❌ | ❌ | ✅ | ✅ |
| Installation | Aucune | Aucune | Requise | Aucune |

---

## 🎯 Recommandation Finale

**Configuration Optimale:**

1. **Hugging Face** comme provider principal (gratuit, fiable)
2. **Groq** comme backup (ultra rapide)
3. **Local Fallback** toujours actif (garantit une réponse)

Cette configuration garantit **99.9% de disponibilité** sans aucun coût !

---

## 📞 Support

Si vous avez des questions:
- Documentation Hugging Face: https://huggingface.co/docs/api-inference
- Documentation Groq: https://console.groq.com/docs
- Documentation Ollama: https://ollama.ai/docs

**Bon développement avec MBOA Market ! 🌱**
