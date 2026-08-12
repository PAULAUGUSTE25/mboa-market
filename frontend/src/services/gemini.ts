import axios from 'axios';

const DEFAULT_GEMINI_KEY = typeof atob === 'function' ? atob('QVEuQWI4Uk42SnBuVW9kYlp2UWhXR3NZcHI1YXg4VjZoblJmTjg0RlFtZkNlTXdUOVpQOXc=') : '';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
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
      continue; // Try next model
    }
  }

  // If we get here, all models failed
  console.error('All Gemini models failed. Last error:', lastError);
  
  if (lastError?.response?.status === 429) {
    return "Trop de requêtes vers Gemini. Veuillez patienter quelques secondes et réessayer.";
  } else if (lastError?.response?.status === 403) {
    return "Désolé, l'accès à l'IA Gemini est temporairement indisponible (erreur de clé API).";
  }
  
  return "Erreur lors de la connexion à l'IA Google Gemini Cloud. Impossible d'obtenir une réponse de l'IA.";
};

export const generateAutoReply = async (message: string, listingTitle: string, sellerName: string) => {
  const context = `Tu agis en tant que ${sellerName}, un vendeur sur MBOA Market. Tu vends "${listingTitle}". 
  L'utilisateur t'envoie un message concernant ce produit.
  Réponds poliment et professionnellement à la place du vendeur.
  Si la question porte sur le prix, la disponibilité ou la livraison, sois encourageant mais invite à discuter des détails.
  Reste bref (max 2-3 phrases).`;

  return generateGeminiResponse(message, context);
};
