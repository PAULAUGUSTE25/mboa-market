/**
 * Advanced Voice Assistant for MBOA Market
 * Enables hands-free farming operations with voice commands
 */

export interface VoiceCommand {
  id: string;
  command: string;
  intent: 'search' | 'navigate' | 'create' | 'analyze' | 'compare' | 'help' | 'general';
  parameters: Record<string, any>;
  confidence: number;
  language: 'fr' | 'en';
}

export interface VoiceResponse {
  text: string;
  audio_url?: string;
  actions?: Array<{
    type: 'navigate' | 'search' | 'highlight' | 'show_modal';
    target: string;
    parameters?: Record<string, any>;
  }>;
  follow_up_questions?: string[];
}

export interface VoiceAssistantConfig {
  language: 'fr' | 'en';
  voice_type: 'male' | 'female';
  speed: number; // 0.5 to 2.0
  auto_response: boolean;
  wake_word: string;
}

class VoiceAssistant {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private config: VoiceAssistantConfig;
  private commandHistory: VoiceCommand[] = [];
  private contextMemory: Map<string, any> = new Map();

  constructor(config: Partial<VoiceAssistantConfig> = {}) {
    this.synthesis = window.speechSynthesis;
    this.config = {
      language: 'fr',
      voice_type: 'female',
      speed: 1.0,
      auto_response: true,
      wake_word: 'bigiss',
      ...config
    };

    this.initializeSpeechRecognition();
  }

  /**
   * Initialize speech recognition
   */
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognitionConstructor();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.config.language === 'fr' ? 'fr-FR' : 'en-US';
      
      this.recognition.onresult = (event) => {
        this.handleSpeechResult(event);
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          this.speak("Je n'ai pas entendu ce que vous avez dit. Pouvez-vous répéter ?");
        } else if (event.error === 'not-allowed') {
          this.speak("L'accès au microphone est refusé. Veuillez autoriser l'utilisation du microphone.");
        }
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        console.log('🔇 Voice recognition ended');
        // Don't auto-restart to prevent infinite loops
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  /**
   * Start listening for voice commands
   */
  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
      console.log('🎤 Voice assistant started listening...');
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
      console.log('🔇 Voice assistant stopped listening');
    }
  }

  /**
   * Handle speech recognition results
   */
  private handleSpeechResult(event: SpeechRecognitionEvent): void {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.toLowerCase();
    
    console.log('🗣️ Speech recognized:', transcript);
    
    // Check for wake word
    if (transcript.includes(this.config.wake_word)) {
      this.processCommand(transcript.replace(this.config.wake_word, '').trim());
    }
    
    // Process final results
    if (event.results[last].isFinal) {
      this.processCommand(transcript);
    }
  }

  /**
   * Process voice command
   */
  private async processCommand(command: string): Promise<void> {
    const voiceCommand = this.parseCommand(command);
    this.commandHistory.push(voiceCommand);
    
    console.log('🤖 Processing command:', voiceCommand);
    
    const response = await this.generateResponse(voiceCommand);
    
    if (this.config.auto_response) {
      this.speak(response.text);
    }
    
    // Execute actions
    if (response.actions) {
      response.actions.forEach(action => this.executeAction(action));
    }
  }

  /**
   * Parse voice command into structured format
   */
  private parseCommand(command: string): VoiceCommand {
    const intent = this.detectIntent(command);
    const parameters = this.extractParameters(command, intent);
    const confidence = this.calculateConfidence(command, intent);
    
    return {
      id: Date.now().toString(),
      command,
      intent,
      parameters,
      confidence,
      language: this.config.language
    };
  }

  /**
   * Detect intent from command
   */
  private detectIntent(command: string): VoiceCommand['intent'] {
    const searchKeywords = ['cherche', 'recherche', 'trouve', 'montre', 'search', 'find', 'show'];
    const navigateKeywords = ['va', 'navigate', 'ouvre', 'go', 'navigate', 'open'];
    const createKeywords = ['crée', 'nouveau', 'ajoute', 'create', 'new', 'add'];
    const analyzeKeywords = ['analyse', 'évalue', 'compare', 'analyze', 'evaluate', 'compare'];
    const helpKeywords = ['aide', 'help', 'comment', 'comment faire'];
    
    if (searchKeywords.some(keyword => command.includes(keyword))) return 'search';
    if (navigateKeywords.some(keyword => command.includes(keyword))) return 'navigate';
    if (createKeywords.some(keyword => command.includes(keyword))) return 'create';
    if (analyzeKeywords.some(keyword => command.includes(keyword))) return 'analyze';
    if (helpKeywords.some(keyword => command.includes(keyword))) return 'help';
    
    return 'general';
  }

  /**
   * Extract parameters based on intent
   */
  private extractParameters(command: string, intent: VoiceCommand['intent']): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    switch (intent) {
      case 'search':
        // Extract product names, categories, locations
        parameters.query = this.extractSearchQuery(command);
        parameters.category = this.extractCategory(command);
        parameters.location = this.extractLocation(command);
        parameters.price_range = this.extractPriceRange(command);
        break;
        
      case 'navigate':
        parameters.destination = this.extractDestination(command);
        break;
        
      case 'create':
        parameters.item_type = this.extractItemType(command);
        parameters.details = this.extractDetails(command);
        break;
        
      case 'analyze':
        parameters.target = this.extractAnalysisTarget(command);
        parameters.metric = this.extractMetric(command);
        break;
    }
    
    return parameters;
  }

  /**
   * Generate response based on command
   */
  private async generateResponse(command: VoiceCommand): Promise<VoiceResponse> {
    const { intent, parameters } = command;
    
    switch (intent) {
      case 'search':
        return this.handleSearchCommand(parameters);
      case 'navigate':
        return this.handleNavigateCommand(parameters);
      case 'create':
        return this.handleCreateCommand(parameters);
      case 'analyze':
        return this.handleAnalyzeCommand(parameters);
      case 'help':
        return this.handleHelpCommand();
      default:
        return this.handleGeneralCommand(command);
    }
  }

  /**
   * Handle search commands
   */
  private handleSearchCommand(params: Record<string, any>): VoiceResponse {
    const { query, category, location, price_range } = params;
    
    let response = "Je recherche ";
    if (query) response += `${query}`;
    if (category) response += ` dans la catégorie ${category}`;
    if (location) response += ` à ${location}`;
    if (price_range) response += ` avec un prix entre ${price_range.min} et ${price_range.max}`;
    
    response += ". Voici ce que j'ai trouvé.";
    
    return {
      text: response,
      actions: [{
        type: 'search',
        target: 'listings',
        parameters: { query, category, location, price_range }
      }],
      follow_up_questions: [
        "Voulez-vous filtrer par prix ?",
        "Quelle qualité recherchez-vous ?",
        "Est-ce pour livraison ou retrait ?"
      ]
    };
  }

  /**
   * Handle navigation commands
   */
  private handleNavigateCommand(params: Record<string, any>): VoiceResponse {
    const { destination } = params;
    
    const destinations: Record<string, string> = {
      'accueil': '/',
      'feed': '/feed',
      'profil': '/profile',
      'messages': '/chat',
      'favoris': '/listings?favorites=true',
      'créer': '/create-listing'
    };
    
    const path = destinations[destination.toLowerCase()] || '/feed';
    
    return {
      text: `Je vous emmène vers ${destination}.`,
      actions: [{
        type: 'navigate',
        target: path
      }]
    };
  }

  /**
   * Handle create commands
   */
  private handleCreateCommand(params: Record<string, any>): VoiceResponse {
    const { item_type, details } = params;
    
    return {
      text: `Je vais vous aider à créer une nouvelle ${item_type}. ${details ? `Voici les détails: ${details}.` : ''}`,
      actions: [{
        type: 'show_modal',
        target: 'create-listing',
        parameters: { type: item_type, details }
      }],
      follow_up_questions: [
        "Quel est le prix de vente ?",
        "Quelle est la quantité disponible ?",
        "Y a-t-il des photos à ajouter ?"
      ]
    };
  }

  /**
   * Handle analyze commands
   */
  private handleAnalyzeCommand(params: Record<string, any>): VoiceResponse {
    const { target, metric } = params;
    
    return {
      text: `J'analyse ${target} pour vous. Voici les tendances pour ${metric}.`,
      actions: [{
        type: 'show_modal',
        target: 'analytics',
        parameters: { target, metric }
      }]
    };
  }

  /**
   * Handle help commands
   */
  private handleHelpCommand(): VoiceResponse {
    return {
      text: "Je suis Bigiss, votre assistant vocal. Vous pouvez me demander: 'cherche du maïs', 'va au profil', 'crée une annonce', ou 'analyse les prix'. Dites 'Bigiss' suivi de votre commande.",
      follow_up_questions: [
        "Que souhaitez-vous faire ?",
        "Besoin d'aide pour trouver des produits ?",
        "Voulez-vous créer une nouvelle annonce ?"
      ]
    };
  }

  /**
   * Handle general commands
   */
  private handleGeneralCommand(command: VoiceCommand): VoiceResponse {
    const lowerCommand = command.command.toLowerCase();
    
    if (lowerCommand.includes('bonjour') || lowerCommand.includes('salut')) {
      return {
        text: "Bonjour ! Je suis Bigiss, votre assistant IA. Comment puis-je vous aider aujourd'hui ?"
      };
    }
    
    if (lowerCommand.includes('merci')) {
      return {
        text: "De rien ! Je suis là pour vous aider. N'hésitez pas si vous avez besoin d'autre chose."
      };
    }
    
    if (lowerCommand.includes('au revoir')) {
      return {
        text: "Au revoir ! Bonne journée et à bientôt sur MBOA Market !"
      };
    }
    
    return {
      text: "Je n'ai pas bien compris. Pouvez-vous reformuler votre commande ? Dites 'aide' pour voir ce que je peux faire."
    };
  }

  /**
   * Execute action from response
   */
  private executeAction(action: any): void {
    switch (action.type) {
      case 'navigate':
        // Navigate to the specified path
        console.log('🧭 Navigating to:', action.target);
        // This would integrate with React Router
        break;
        
      case 'search':
        // Perform search with parameters
        console.log('🔍 Searching with:', action.parameters);
        // This would trigger a search in the app
        break;
        
      case 'show_modal':
        // Show a modal dialog
        console.log('📋 Showing modal:', action.target);
        // This would show a modal
        break;
        
      case 'highlight':
        // Highlight an element
        console.log('✨ Highlighting:', action.target);
        // This would highlight an element in the UI
        break;
    }
  }

  /**
   * Text-to-speech
   */
  speak(text: string): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.config.language === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = this.config.speed;
    
    // Select voice based on preference
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes(this.config.language) && 
      (this.config.voice_type === 'female' ? voice.name.includes('Female') : voice.name.includes('Male'))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    this.synthesis.speak(utterance);
    console.log('🔊 Speaking:', text);
  }

  /**
   * Get command history
   */
  getCommandHistory(): VoiceCommand[] {
    return this.commandHistory;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VoiceAssistantConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.recognition) {
      this.recognition.lang = this.config.language === 'fr' ? 'fr-FR' : 'en-US';
    }
  }

  /**
   * Utility functions for parameter extraction
   */
  private extractSearchQuery(command: string): string {
    // Simple extraction - would use NLP in production
    const patterns = [
      /cherche\s+(.+?)(?:\s+dans|\s+à|\s+entre|$)/i,
      /trouve\s+(.+?)(?:\s+dans|\s+à|\s+entre|$)/i,
      /montre\s+(.+?)(?:\s+dans|\s+à|\s+entre|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) return match[1].trim();
    }
    
    return '';
  }

  private extractCategory(command: string): string {
    const categories = ['céréales', 'légumes', 'fruits', 'viande', 'lait', 'volaille', 'engrais', 'semences'];
    return categories.find(cat => command.includes(cat)) || '';
  }

  private extractLocation(command: string): string {
    const locations = ['douala', 'yaoundé', 'bafoussam', 'garoua', 'maroua', 'bamenda'];
    return locations.find(loc => command.includes(loc)) || '';
  }

  private extractPriceRange(command: string): { min: number; max: number } | null {
    const match = command.match(/entre\s+(\d+)\s*et\s+(\d+)/i);
    if (match) {
      return {
        min: parseInt(match[1]),
        max: parseInt(match[2])
      };
    }
    return null;
  }

  private extractDestination(command: string): string {
    const destinations = ['accueil', 'feed', 'profil', 'messages', 'favoris', 'créer'];
    return destinations.find(dest => command.includes(dest)) || 'feed';
  }

  private extractItemType(command: string): string {
    const types = ['annonce', 'produit', 'service', 'demande'];
    return types.find(type => command.includes(type)) || 'annonce';
  }

  private extractDetails(command: string): string {
    // Extract details after create command keywords
    const match = command.match(/(crée|nouveau|ajoute)\s+(.+)/i);
    return match ? match[2] : '';
  }

  private extractAnalysisTarget(command: string): string {
    const targets = ['prix', 'marché', 'produits', 'ventes', 'demande'];
    return targets.find(target => command.includes(target)) || 'marché';
  }

  private extractMetric(command: string): string {
    const metrics = ['tendance', 'moyenne', 'maximum', 'minimum', 'évolution'];
    return metrics.find(metric => command.includes(metric)) || 'tendance';
  }

  private calculateConfidence(command: string, intent: VoiceCommand['intent']): number {
    // Simple confidence calculation based on command clarity
    let confidence = 0.5;
    
    if (command.length > 5) confidence += 0.1;
    if (command.length > 10) confidence += 0.1;
    if (intent !== 'general') confidence += 0.2;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Get voice assistant status
   */
  getStatus(): {
    isListening: boolean;
    isSupported: boolean;
    config: VoiceAssistantConfig;
    commandCount: number;
  } {
    return {
      isListening: this.isListening,
      isSupported: !!this.recognition,
      config: this.config,
      commandCount: this.commandHistory.length
    };
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.commandHistory = [];
    this.contextMemory.clear();
  }

  /**
   * Get supported commands
   */
  getSupportedCommands(): Array<{
    command: string;
    description: string;
    example: string;
  }> {
    return [
      {
        command: 'search',
        description: 'Rechercher des produits',
        example: 'Bigiss, cherche du maïs à Douala'
      },
      {
        command: 'navigate',
        description: 'Naviguer dans l\'application',
        example: 'Bigiss, va au profil'
      },
      {
        command: 'create',
        description: 'Créer une nouvelle annonce',
        example: 'Bigiss, crée une annonce pour des tomates'
      },
      {
        command: 'analyze',
        description: 'Analyser les tendances du marché',
        example: 'Bigiss, analyse les prix du maïs'
      },
      {
        command: 'help',
        description: 'Obtenir de l\'aide',
        example: 'Bigiss, aide'
      }
    ];
  }
}

export const voiceAssistant = new VoiceAssistant();
