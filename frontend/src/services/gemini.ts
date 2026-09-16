import httpClient from '@/api/client';

export const generateGeminiResponse = async (prompt: string, context?: string) => {
  const promptStr = (prompt || '').trim();
  if (!promptStr) return 'Veuillez poser une question précise pour que je puisse vous aider.';

  try {
    const resp = await httpClient.post('/ai/chat', { prompt: promptStr, context });
    if (resp && resp.data && resp.data.text) return resp.data.text;
    return 'Le serveur IA a répondu sans contenu. Veuillez réessayer.';
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 429) return "Trop de requêtes vers le service d'IA. Réessayez plus tard.";
    if (status === 403) return "Accès au service d'IA refusé (clé API manquante ou invalide).";
    console.error('generateGeminiResponse error:', err?.response?.data || err?.message || err);
    return "Erreur lors de la connexion au service d'IA. Contactez l'administrateur.";
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
