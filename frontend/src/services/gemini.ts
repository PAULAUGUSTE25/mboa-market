import axios from 'axios';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// List of models to try in order of preference
const MODELS = [
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash'
];

// Simple rate limiting - track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests to avoid rate limiting

export const generateGeminiResponse = async (prompt: string, context?: string) => {
  if (!API_KEY) {
    console.warn('Gemini API Key is missing');
    return 'Désolé, le service d\'IA n\'est pas configuré correctement.';
  }

  // Simple rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const fullPrompt = context 
    ? `Contexte: ${context}\n\nQuestion utilisateur: ${prompt}\n\nRéponds de manière utile, concise et professionnelle en français. Tu es Bigiss, l'assistant IA de MBOA Market, une plateforme agricole au Cameroun.`
    : `Tu es Bigiss, l'assistant IA de MBOA Market, une plateforme agricole au Cameroun. Question utilisateur: ${prompt}\n\nRéponds de manière utile, concise et professionnelle en français.`;

  let lastError = null;

  // Try models in sequence until one works
  for (const model of MODELS) {
    try {
      console.log(`Attempting Gemini API with model: ${model}`);
      const response = await axios.post(
        `${BASE_URL}/${model}:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          return candidate.content.parts[0].text;
        }
      }
    } catch (error: any) {
      console.error(`Error with model ${model}:`, error?.response?.data || error?.message);
      lastError = error;
      
      // If it's not a 404 or 429, it might be a request format issue, so maybe don't retry? 
      // But for now, we'll assume safer to retry on most errors unless we run out of models.
      // Specifically 404 (model not found) and 429 (rate limit) are good candidates for retry.
      if (error?.response?.status !== 404 && error?.response?.status !== 429 && error?.response?.status !== 503) {
         // If it's a 400 (Bad Request), retrying might not help, but let's try just in case different models accept different params.
      }
      
      continue; // Try next model
    }
  }

  // If we get here, all models failed
  console.error('All Gemini models failed. Last error:', lastError);
  
  if (lastError?.response?.status === 429) {
    return "Trop de requêtes. Veuillez patienter quelques secondes et réessayer.";
  } else if (lastError?.response?.status === 403) {
    return "Désolé, l'accès à l'IA est temporairement indisponible (problème de clé API).";
  }
  
  // Smart fallback responses based on common queries
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('prix') || lowerPrompt.includes('coût')) {
    return "Les prix sur MBOA Market sont compétitifs et varient selon la qualité et la quantité. Je vous recommande de comparer les offres disponibles et de contacter directement les vendeurs pour négocier.";
  } else if (lowerPrompt.includes('produit') || lowerPrompt.includes('article')) {
    return "MBOA Market propose une large gamme de produits agricoles et d'élevage. Utilisez la barre de recherche pour trouver ce dont vous avez besoin, ou naviguez par catégories.";
  } else if (lowerPrompt.includes('vendre') || lowerPrompt.includes('vend')) {
    return "Pour vendre sur MBOA Market, créez une annonce avec des photos claires, une description détaillée et un prix compétitif. Les acheteurs pourront vous contacter directement.";
  } else if (lowerPrompt.includes('livraison') || lowerPrompt.includes('transport')) {
    return "La livraison dépend des vendeurs. Certains proposent des services de livraison, d'autres préfèrent le retrait sur place. Discutez directement avec le vendeur des options disponibles.";
  } else if (lowerPrompt.includes('bonjour') || lowerPrompt.includes('salut')) {
    return "Bonjour ! Je suis Bigiss, votre assistant IA pour MBOA Market. Comment puis-je vous aider aujourd'hui dans vos activités agricoles ou d'élevage ?";
  } else if (lowerPrompt.includes('aide') || lowerPrompt.includes('help')) {
    return "Je suis là pour vous aider ! Vous pouvez me poser des questions sur les produits, les prix, la vente, l'achat ou toute autre question sur MBOA Market.";
  } else {
    return "Je suis Bigiss, votre assistant IA MBOA Market. Je suis temporairement indisponible, mais je vous invite à explorer notre plateforme et à contacter les vendeurs directement. Merci de votre compréhension !";
  }
};

export const generateAutoReply = async (message: string, listingTitle: string, sellerName: string) => {
  const context = `Tu agis en tant que ${sellerName}, un vendeur sur MBOA Market. Tu vends "${listingTitle}". 
  L'utilisateur t'envoie un message concernant ce produit.
  Réponds poliment et professionnellement à la place du vendeur.
  Si la question porte sur le prix, la disponibilité ou la livraison, sois encourageant mais invite à discuter des détails.
  Reste bref (max 2-3 phrases).`;

  return generateGeminiResponse(message, context);
};
