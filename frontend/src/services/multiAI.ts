/**
 * Multi-AI Service avec Fallback Automatique
 * Utilise plusieurs providers gratuits pour garantir la disponibilité
 */

interface AIProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  model: string;
  enabled: boolean;
}

interface AIResponse {
  text: string;
  provider: string;
  cached: boolean;
}

class MultiAIService {
  private providers: AIProvider[] = [
    {
      name: 'Groq',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: 'gsk_8xQZJ3WqYKLmN4pRvT5sWGdyb3FYcH9jKlMnOpQrStUvWxYz',
      model: 'mixtral-8x7b-32768',
      enabled: true
    }
  ];

  private cache: Map<string, { response: string; timestamp: number }> = new Map();
  private cacheExpiry = 3600000; // 1 heure

  /**
   * Génère une réponse IA avec fallback automatique
   */
  async generateResponse(prompt: string, context?: string): Promise<AIResponse> {
    console.log('🤖 Bigiss generating response for:', prompt.substring(0, 50) + '...');
    console.log('📋 Available providers:', this.providers.map(p => `${p.name} (${p.enabled ? 'enabled' : 'disabled'})`));
    
    // Essayer chaque provider dans l'ordre
    for (const provider of this.providers) {
      if (!provider.enabled) {
        console.log(`⏭️ Skipping disabled provider: ${provider.name}`);
        continue;
      }

      try {
        console.log(`🔄 Trying provider: ${provider.name}`);
        console.log(`🔗 Endpoint: ${provider.endpoint}`);
        console.log(`🔑 API Key present: ${provider.apiKey ? 'YES' : 'NO'}`);
        
        const response = await this.callProvider(provider, prompt, context);
        
        console.log(`✅ Success with ${provider.name}!`);
        console.log(`📝 Response preview: ${response.substring(0, 100)}...`);
        
        return {
          text: response,
          provider: provider.name,
          cached: false
        };
      } catch (error) {
        console.error(`❌ ${provider.name} failed:`, error);
        console.error(`❌ Error details:`, error instanceof Error ? error.message : String(error));
        // Continue avec le prochain provider
        continue;
      }
    }

    // Si tous échouent
    console.error('❌ All providers failed!');
    throw new Error('Impossible de générer une réponse. Veuillez réessayer.');
  }

  /**
   * Appelle un provider spécifique
   */
  private async callProvider(provider: AIProvider, prompt: string, context?: string): Promise<string> {
    // Groq AI uniquement
    return await this.callGroq(provider, prompt, context);
  }

  /**
   * Appel à Groq API (format OpenAI compatible)
   */
  private async callGroq(provider: AIProvider, prompt: string, context?: string): Promise<string> {
    const systemContext = context || "Tu es Bigiss, un assistant agricole expert basé au Cameroun. Tu réponds en français de manière naturelle, conversationnelle et utile. Tu donnes des conseils pratiques sur l'agriculture, l'élevage, et le commerce agricole.";
    
    console.log('🚀 Calling Groq API...');
    console.log('📍 Endpoint:', provider.endpoint);
    console.log('🤖 Model:', provider.model);
    console.log('💬 Prompt:', prompt.substring(0, 100) + '...');
    
    try {
      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: systemContext
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.9,
          stream: false
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Groq API response received successfully');
      console.log('📦 Response data structure:', Object.keys(data));
      
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.error('❌ No content in response:', data);
        throw new Error('Groq API returned empty response');
      }
      
      console.log('✨ Generated response length:', content.length);
      return content;
    } catch (error) {
      console.error('❌ Groq API call failed:', error);
      throw error;
    }
  }

  /**
   * Système d'IA local avancé - Génère des réponses contextuelles intelligentes
   */
  private localFallback(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Salutations et conversations de base
    if (lowerPrompt.match(/^(bonjour|salut|hello|hi|bonsoir|hey)/)) {
      const greetings = [
        "Bonjour ! Je suis votre assistant agricole intelligent. Comment puis-je vous aider aujourd'hui ?",
        "Salut ! Ravi de vous parler. Que puis-je faire pour vous ?",
        "Bonjour ! Je suis là pour répondre à toutes vos questions sur l'agriculture. Posez-moi une question !",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (lowerPrompt.match(/(comment ça va|comment vas-tu|ça va)/)) {
      return "Je vais très bien, merci ! Je suis prêt à vous aider avec vos questions agricoles. Comment puis-je vous assister ?";
    }

    if (lowerPrompt.match(/(merci|thank)/)) {
      return "De rien ! C'est un plaisir de vous aider. N'hésitez pas si vous avez d'autres questions !";
    }

    if (lowerPrompt.match(/(au revoir|bye|à bientôt)/)) {
      return "Au revoir ! Bonne journée et à bientôt sur MBOA Market. N'hésitez pas à revenir si vous avez besoin d'aide !";
    }

    // Questions sur les cultures
    if (lowerPrompt.includes('maïs') || lowerPrompt.includes('mais')) {
      return this.generateCropAdvice('maïs', lowerPrompt);
    }

    if (lowerPrompt.includes('tomate')) {
      return this.generateCropAdvice('tomates', lowerPrompt);
    }

    if (lowerPrompt.includes('manioc')) {
      return this.generateCropAdvice('manioc', lowerPrompt);
    }

    if (lowerPrompt.includes('riz')) {
      return this.generateCropAdvice('riz', lowerPrompt);
    }

    if (lowerPrompt.includes('arachide')) {
      return this.generateCropAdvice('arachides', lowerPrompt);
    }

    // Questions sur l'élevage
    if (lowerPrompt.match(/(poulet|volaille|poule)/)) {
      return this.generateLivestockAdvice('volaille', lowerPrompt);
    }

    if (lowerPrompt.match(/(vache|bovin|bœuf)/)) {
      return this.generateLivestockAdvice('bovins', lowerPrompt);
    }

    if (lowerPrompt.match(/(porc|cochon)/)) {
      return this.generateLivestockAdvice('porcs', lowerPrompt);
    }

    if (lowerPrompt.match(/(chèvre|caprin)/)) {
      return this.generateLivestockAdvice('caprins', lowerPrompt);
    }

    // Questions sur les techniques agricoles
    if (lowerPrompt.match(/(irrigation|arrosage|eau)/)) {
      return "Pour l'irrigation, je recommande le système goutte-à-goutte qui économise jusqu'à 60% d'eau. Arrosez tôt le matin ou en soirée pour réduire l'évaporation. Adaptez la fréquence selon la culture et la saison. Voulez-vous des conseils spécifiques pour une culture ?";
    }

    if (lowerPrompt.match(/(engrais|fertilisant|npk)/)) {
      return "Les engrais NPK sont essentiels : N (azote) pour la croissance, P (phosphore) pour les racines, K (potassium) pour les fruits. Pour le Cameroun, je recommande NPK 20-10-10 au semis, puis urée (46% N) après 4 semaines. Le compost organique est aussi excellent. Quelle culture fertilisez-vous ?";
    }

    if (lowerPrompt.match(/(maladie|parasite|traitement)/)) {
      return "Les maladies courantes au Cameroun incluent le mildiou, la fusariose et les nématodes. Prévention : rotation des cultures, variétés résistantes, espacement adéquat. Traitement : fongicides bio (bouillie bordelaise) ou chimiques selon la gravité. Décrivez les symptômes pour un diagnostic précis.";
    }

    if (lowerPrompt.match(/(prix|vendre|marché|commerce)/)) {
      return "Pour maximiser vos revenus : 1) Vendez en groupement pour de meilleurs prix, 2) Stockez pour vendre hors-saison, 3) Diversifiez vos canaux (marchés locaux, grossistes, vente directe), 4) Négociez des contrats à l'avance. Les prix varient selon la saison et la demande. Quel produit vendez-vous ?";
    }

    if (lowerPrompt.match(/(météo|pluie|saison|climat)/)) {
      return "Au Cameroun, la saison des pluies va de mars à novembre (2 saisons au Sud). Plantez au début des pluies pour profiter de l'humidité. Surveillez les prévisions météo pour planifier semis et récoltes. Le changement climatique affecte les cycles - adaptez vos pratiques. Quelle région vous concerne ?";
    }

    // Questions sur MBOA Market
    if (lowerPrompt.match(/(mboa|plateforme|application|site)/)) {
      return "MBOA Market est votre plateforme agricole complète au Cameroun. Vous pouvez : acheter/vendre des produits agricoles, obtenir des conseils d'experts, suivre les prix du marché, gérer votre ferme avec des outils intelligents, et connecter avec d'autres agriculteurs. Comment puis-je vous aider à utiliser la plateforme ?";
    }

    // Questions générales sur l'agriculture
    if (lowerPrompt.match(/(cultiver|planter|semer)/)) {
      return "Pour bien cultiver : 1) Choisissez une culture adaptée à votre région et sol, 2) Préparez bien le terrain (labour, fumure), 3) Utilisez des semences de qualité, 4) Respectez les espacements recommandés, 5) Entretenez régulièrement (désherbage, arrosage). Quelle culture vous intéresse ?";
    }

    if (lowerPrompt.match(/(rendement|production|récolte)/)) {
      return "Pour améliorer vos rendements : utilisez des variétés améliorées, fertilisez correctement, gérez bien l'eau, contrôlez les maladies/parasites, et récoltez au bon moment. Au Cameroun, les rendements moyens sont : maïs 2-4 t/ha, riz 3-5 t/ha, manioc 15-25 t/ha. Quelle culture cultivez-vous ?";
    }

    // Réponse par défaut intelligente
    return this.generateSmartResponse(lowerPrompt);
  }

  /**
   * Génère des conseils spécifiques pour une culture
   */
  private generateCropAdvice(crop: string, prompt: string): string {
    const cropData: Record<string, any> = {
      'maïs': {
        saison: 'mars-avril (début des pluies)',
        cycle: '90-120 jours',
        espacement: '75cm x 25cm',
        fertilisation: 'NPK 20-10-10 au semis, urée après 4 semaines',
        rendement: '2-4 tonnes/hectare',
        conseils: 'Désherbage crucial les 6 premières semaines. Irrigation pendant la floraison.'
      },
      'tomates': {
        saison: 'toute l\'année avec irrigation',
        cycle: '60-80 jours après repiquage',
        espacement: '50cm x 80cm',
        fertilisation: 'Compost + NPK 15-15-15',
        rendement: '20-40 tonnes/hectare',
        conseils: 'Tuteurage obligatoire. Tailler les gourmands. Traiter contre le mildiou.'
      },
      'manioc': {
        saison: 'début des pluies',
        cycle: '9-12 mois',
        espacement: '1m x 1m',
        fertilisation: 'Peu exigeant, compost suffit',
        rendement: '15-25 tonnes/hectare',
        conseils: 'Résistant à la sécheresse. Buttage après 3 mois. Récolte échelonnée possible.'
      },
      'riz': {
        saison: 'mars-avril (pluvial) ou toute l\'année (irrigué)',
        cycle: '120-150 jours',
        espacement: '20cm x 20cm',
        fertilisation: 'NPK 15-15-15 + urée en couverture',
        rendement: '3-5 tonnes/hectare',
        conseils: 'Maintenir 5-10cm d\'eau en riziculture irriguée. Désherbage important.'
      },
      'arachides': {
        saison: 'avril-mai',
        cycle: '90-120 jours',
        espacement: '40cm x 15cm',
        fertilisation: 'Phosphore important, peu d\'azote',
        rendement: '1-2 tonnes/hectare',
        conseils: 'Buttage à la floraison. Sol léger préférable. Séchage crucial après récolte.'
      }
    };

    const data = cropData[crop];
    if (!data) return `Je peux vous aider avec ${crop}. Que voulez-vous savoir spécifiquement ?`;

    if (prompt.match(/(quand|saison|période|planter|semer)/)) {
      return `Pour ${crop}, la meilleure période de plantation est ${data.saison}. Le cycle complet dure ${data.cycle}. ${data.conseils}`;
    }

    if (prompt.match(/(comment|cultiver|faire pousser)/)) {
      return `Pour cultiver ${crop} : Plantez en ${data.saison}, espacez à ${data.espacement}, fertilisez avec ${data.fertilisation}. ${data.conseils} Rendement attendu : ${data.rendement}.`;
    }

    if (prompt.match(/(engrais|fertiliser|npk)/)) {
      return `Pour ${crop}, utilisez ${data.fertilisation}. ${data.conseils}`;
    }

    if (prompt.match(/(rendement|production|récolte)/)) {
      return `Le rendement moyen pour ${crop} est de ${data.rendement}. Cycle de ${data.cycle}. ${data.conseils}`;
    }

    return `Pour ${crop} : Saison ${data.saison}, espacement ${data.espacement}, cycle ${data.cycle}. ${data.conseils} Que voulez-vous savoir de plus ?`;
  }

  /**
   * Génère des conseils pour l'élevage
   */
  private generateLivestockAdvice(animal: string, prompt: string): string {
    const livestockData: Record<string, any> = {
      'volaille': {
        type: 'poulets de chair ou pondeuses',
        durée: '45-60 jours (chair), 18 mois (pondeuses)',
        alimentation: 'Aliment commercial ou maïs + tourteau + minéraux',
        logement: 'Poulailler ventilé, 8-10 poulets/m²',
        conseils: 'Vaccination obligatoire (Newcastle, Gumboro). Eau propre en permanence.'
      },
      'bovins': {
        type: 'races locales ou améliorées',
        durée: '2-3 ans pour l\'engraissement',
        alimentation: 'Pâturage + compléments (tourteau, minéraux)',
        logement: 'Étable avec aire de couchage propre',
        conseils: 'Déparasitage tous les 3 mois. Vaccination contre la fièvre aphteuse.'
      },
      'porcs': {
        type: 'Large White, Landrace',
        durée: '5-6 mois pour 100kg',
        alimentation: 'Aliment complet ou maïs + soja + minéraux',
        logement: 'Porcherie avec zone de couchage et zone de déjection',
        conseils: 'Hygiène stricte. Castration des mâles. Vaccination contre la peste porcine.'
      },
      'caprins': {
        type: 'chèvres naines ou Sahéliennes',
        durée: '8-12 mois pour l\'engraissement',
        alimentation: 'Pâturage + feuillages + compléments',
        logement: 'Chèvrerie surélevée, bien ventilée',
        conseils: 'Résistantes et peu exigeantes. Déparasitage régulier important.'
      }
    };

    const data = livestockData[animal];
    if (!data) return `Je peux vous conseiller sur l'élevage de ${animal}. Que voulez-vous savoir ?`;

    if (prompt.match(/(comment|élever|démarrer)/)) {
      return `Pour élever des ${animal} : Choisissez ${data.type}. Durée d'élevage : ${data.durée}. Alimentation : ${data.alimentation}. Logement : ${data.logement}. ${data.conseils}`;
    }

    if (prompt.match(/(alimentation|nourrir|aliment)/)) {
      return `Pour nourrir vos ${animal} : ${data.alimentation}. ${data.conseils}`;
    }

    if (prompt.match(/(maladie|santé|vaccin)/)) {
      return `Santé des ${animal} : ${data.conseils} Consultez un vétérinaire régulièrement.`;
    }

    return `Élevage de ${animal} : ${data.type}, durée ${data.durée}. ${data.conseils} Besoin de plus de détails ?`;
  }

  /**
   * Génère une réponse intelligente basée sur le contexte
   */
  private generateSmartResponse(prompt: string): string {
    // Analyse le type de question
    if (prompt.includes('?')) {
      return "C'est une excellente question ! Pour vous donner la meilleure réponse, pourriez-vous préciser : s'agit-il d'une culture spécifique (maïs, tomates, etc.), d'élevage, de techniques agricoles, ou de commercialisation ? Je suis là pour vous aider !";
    }

    if (prompt.match(/(aide|help|besoin)/)) {
      return "Je suis votre assistant agricole intelligent. Je peux vous aider avec : les cultures (maïs, tomates, manioc, riz), l'élevage (volaille, bovins, porcs), les techniques (irrigation, fertilisation), les maladies, et la commercialisation. Posez-moi une question spécifique !";
    }

    return "Je suis là pour vous aider avec vos questions agricoles ! Vous pouvez me demander des conseils sur les cultures, l'élevage, les techniques agricoles, les maladies, ou la commercialisation. N'hésitez pas à être plus spécifique dans votre question.";
  }

  /**
   * Gestion du cache
   */
  private getFromCache(prompt: string): string | null {
    const key = this.hashPrompt(prompt);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.response;
    }
    
    return null;
  }

  private saveToCache(prompt: string, response: string): void {
    const key = this.hashPrompt(prompt);
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });

    // Nettoyer les vieux caches
    this.cleanCache();
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }

  private hashPrompt(prompt: string): string {
    // Simple hash pour le cache
    return prompt.toLowerCase().trim().substring(0, 100);
  }

  /**
   * Recommandations agricoles basées sur le contexte
   */
  async getAgriRecommendations(crop: string, region: string): Promise<string> {
    const prompt = `Donne des recommandations pour cultiver ${crop} dans la région de ${region} au Cameroun. Inclus: période de plantation, entretien, et rendement attendu.`;
    
    const response = await this.generateResponse(prompt, 'Tu es un expert agricole camerounais.');
    return response.text;
  }

  /**
   * Analyse de prix de marché
   */
  async analyzePrices(product: string, currentPrice: number): Promise<string> {
    const prompt = `Le prix actuel de ${product} est ${currentPrice} FCFA. Est-ce un bon prix ? Donne des conseils de vente.`;
    
    const response = await this.generateResponse(prompt, 'Tu es un expert en commercialisation agricole au Cameroun.');
    return response.text;
  }

  /**
   * Diagnostic de problèmes agricoles
   */
  async diagnoseProblem(symptoms: string, crop: string): Promise<string> {
    const prompt = `Ma culture de ${crop} présente ces symptômes: ${symptoms}. Quel est le problème et comment le traiter ?`;
    
    const response = await this.generateResponse(prompt, 'Tu es un phytopathologiste expert.');
    return response.text;
  }
}

// Export singleton
export const multiAI = new MultiAIService();
