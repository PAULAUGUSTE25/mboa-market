/**
 * AI-Powered Recommendation Engine for MBOA Market
 * Uses machine learning to provide personalized product recommendations
 */

export interface UserProfile {
  id: string;
  domain: 'agriculture' | 'elevage';
  activity_type: string;
  region: string;
  preferences: {
    categories: string[];
    price_range: { min: number; max: number };
    quality_preference: 'premium' | 'standard' | 'economy';
  };
  behavior: {
    view_history: string[];
    search_history: string[];
    purchase_history: Array<{
      product_id: string;
      category: string;
      price: number;
      date: Date;
      rating?: number;
    }>;
    favorites: string[];
  };
}

export interface ProductListing {
  id: string;
  title: string;
  category: string;
  price: number;
  quality_score: number;
  location: string;
  seller_id: string;
  seller_rating: number;
  images: string[];
  description: string;
  tags: string[];
  seasonal_relevance: number;
  market_trend: 'increasing' | 'stable' | 'decreasing';
}

export interface RecommendationScore {
  product_id: string;
  score: number;
  reasons: string[];
  confidence: number;
  category: 'behavioral' | 'collaborative' | 'content_based' | 'market_trend';
}

class AIRecommendationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private productListings: Map<string, ProductListing> = new Map();
  private userItemMatrix: Map<string, Map<string, number>> = new Map();

  /**
   * Initialize the recommendation engine with data
   */
  async initialize(users: UserProfile[], products: ProductListing[]) {
    // Load user profiles
    users.forEach(user => this.userProfiles.set(user.id, user));
    
    // Load product listings
    products.forEach(product => this.productListings.set(product.id, product));
    
    // Build user-item interaction matrix
    this.buildUserItemMatrix();
    
    console.log(`🤖 AI Recommendation Engine initialized with ${users.length} users and ${products.length} products`);
  }

  /**
   * Build collaborative filtering matrix
   */
  private buildUserItemMatrix() {
    this.userProfiles.forEach((user, userId) => {
      const interactions = new Map<string, number>();
      
      // Add purchase history with ratings
      user.behavior.purchase_history.forEach(purchase => {
        interactions.set(purchase.product_id, purchase.rating || 3);
      });
      
      // Add view history (lower weight)
      user.behavior.view_history.forEach(productId => {
        if (!interactions.has(productId)) {
          interactions.set(productId, 1);
        }
      });
      
      // Add favorites (medium weight)
      user.behavior.favorites.forEach(productId => {
        if (!interactions.has(productId)) {
          interactions.set(productId, 4);
        }
      });
      
      this.userItemMatrix.set(userId, interactions);
    });
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId: string, count: number = 10): Promise<RecommendationScore[]> {
    const user = this.userProfiles.get(userId);
    if (!user) {
      return this.getPopularProducts(count);
    }

    const recommendations: RecommendationScore[] = [];

    // 1. Collaborative Filtering Recommendations
    const collaborativeRecs = this.getCollaborativeRecommendations(user);
    recommendations.push(...collaborativeRecs);

    // 2. Content-Based Recommendations
    const contentRecs = this.getContentBasedRecommendations(user);
    recommendations.push(...contentRecs);

    // 3. Market Trend Recommendations
    const trendRecs = this.getMarketTrendRecommendations(user);
    recommendations.push(...trendRecs);

    // 4. Behavioral Recommendations
    const behavioralRecs = this.getBehavioralRecommendations(user);
    recommendations.push(...behavioralRecs);

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((rec, index) => ({
        ...rec,
        confidence: Math.max(0.5, 1 - (index * 0.1))
      }));
  }

  /**
   * Collaborative filtering based on similar users
   */
  private getCollaborativeRecommendations(user: UserProfile): RecommendationScore[] {
    const recommendations: RecommendationScore[] = [];
    const userInteractions = this.userItemMatrix.get(user.id) || new Map();
    
    // Find similar users
    const similarUsers = this.findSimilarUsers(user.id);
    
    // Get products liked by similar users
    const productScores = new Map<string, number>();
    
    similarUsers.forEach(({ userId, similarity }) => {
      const similarUserInteractions = this.userItemMatrix.get(userId) || new Map();
      
      similarUserInteractions.forEach((rating, productId) => {
        if (!userInteractions.has(productId)) {
          const currentScore = productScores.get(productId) || 0;
          productScores.set(productId, currentScore + (rating * similarity));
        }
      });
    });

    // Convert to recommendations
    productScores.forEach((score, productId) => {
      const product = this.productListings.get(productId);
      if (product && score > 0) {
        recommendations.push({
          product_id: productId,
          score: score / similarUsers.length,
          reasons: [
            'Populaire parmi des utilisateurs similaires',
            'Recommandé par des agriculteurs de votre région'
          ],
          confidence: 0.75,
          category: 'collaborative'
        });
      }
    });

    return recommendations;
  }

  /**
   * Content-based recommendations based on product attributes
   */
  private getContentBasedRecommendations(user: UserProfile): RecommendationScore[] {
    const recommendations: RecommendationScore[] = [];
    
    this.productListings.forEach((product, productId) => {
      // Skip if user already interacted with this product
      if (user.behavior.view_history.includes(productId) || 
          user.behavior.favorites.includes(productId) ||
          user.behavior.purchase_history.some(p => p.product_id === productId)) {
        return;
      }

      let score = 0;
      const reasons: string[] = [];

      // Category preference
      if (user.preferences.categories.includes(product.category)) {
        score += 0.3;
        reasons.push('Correspond à vos catégories préférées');
      }

      // Price range preference
      if (product.price >= user.preferences.price_range.min && 
          product.price <= user.preferences.price_range.max) {
        score += 0.2;
        reasons.push('Dans votre gamme de prix');
      }

      // Quality preference
      const qualityScore = this.getQualityScore(product, user.preferences.quality_preference);
      score += qualityScore * 0.2;
      if (qualityScore > 0.7) {
        reasons.push('Qualité exceptionnelle');
      }

      // Location preference
      if (product.location === user.region) {
        score += 0.15;
        reasons.push('Proche de votre localisation');
      }

      // Domain matching
      if (this.isDomainMatch(product, user.domain)) {
        score += 0.15;
        reasons.push('Adapté à votre domaine');
      }

      if (score > 0.3) {
        recommendations.push({
          product_id: productId,
          score,
          reasons,
          confidence: 0.8,
          category: 'content_based'
        });
      }
    });

    return recommendations;
  }

  /**
   * Market trend-based recommendations
   */
  private getMarketTrendRecommendations(user: UserProfile): RecommendationScore[] {
    const recommendations: RecommendationScore[] = [];
    
    this.productListings.forEach((product, productId) => {
      let score = 0;
      const reasons: string[] = [];

      // Trending products
      if (product.market_trend === 'increasing') {
        score += 0.4;
        reasons.push('Tendance à la hausse - bon moment pour acheter');
      }

      // Seasonal relevance
      if (product.seasonal_relevance > 0.8) {
        score += 0.3;
        reasons.push('Parfait pour la saison actuelle');
      }

      // High quality products
      if (product.quality_score > 0.9) {
        score += 0.2;
        reasons.push('Produit premium très demandé');
      }

      // Good seller rating
      if (product.seller_rating > 4.5) {
        score += 0.1;
        reasons.push('Vendeur très réputé');
      }

      if (score > 0.4) {
        recommendations.push({
          product_id: productId,
          score,
          reasons,
          confidence: 0.7,
          category: 'market_trend'
        });
      }
    });

    return recommendations;
  }

  /**
   * Behavioral recommendations based on user patterns
   */
  private getBehavioralRecommendations(user: UserProfile): RecommendationScore[] {
    const recommendations: RecommendationScore[] = [];
    
    // Analyze search patterns
    const searchPatterns = this.analyzeSearchPatterns(user);
    
    // Time-based recommendations
    const timeBasedRecs = this.getTimeBasedRecommendations(user);
    
    return [...recommendations, ...timeBasedRecs];
  }

  /**
   * Find similar users using cosine similarity
   */
  private findSimilarUsers(userId: string): Array<{ userId: string; similarity: number }> {
    const userInteractions = this.userItemMatrix.get(userId) || new Map();
    const similarities: Array<{ userId: string; similarity: number }> = [];

    this.userItemMatrix.forEach((interactions, otherUserId) => {
      if (otherUserId === userId) return;

      const similarity = this.cosineSimilarity(userInteractions, interactions);
      if (similarity > 0.1) {
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  }

  /**
   * Calculate cosine similarity between two users
   */
  private cosineSimilarity(user1: Map<string, number>, user2: Map<string, number>): number {
    const commonItems = Array.from(user1.keys()).filter(key => user2.has(key));
    
    if (commonItems.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    commonItems.forEach(item => {
      const rating1 = user1.get(item) || 0;
      const rating2 = user2.get(item) || 0;
      
      dotProduct += rating1 * rating2;
      norm1 += rating1 * rating1;
      norm2 += rating2 * rating2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Get quality score based on user preference
   */
  private getQualityScore(product: ProductListing, preference: string): number {
    switch (preference) {
      case 'premium':
        return product.quality_score;
      case 'standard':
        return product.quality_score > 0.6 ? 0.8 : product.quality_score;
      case 'economy':
        return product.quality_score < 0.8 ? 0.9 : 0.6;
      default:
        return product.quality_score;
    }
  }

  /**
   * Check if product matches user domain
   */
  private isDomainMatch(product: ProductListing, domain: string): boolean {
    // This would be implemented based on product categorization
    return product.tags.some(tag => tag.toLowerCase().includes(domain));
  }

  /**
   * Analyze user search patterns
   */
  private analyzeSearchPatterns(user: UserProfile): any {
    // Implementation for search pattern analysis
    return {};
  }

  /**
   * Get time-based recommendations
   */
  private getTimeBasedRecommendations(user: UserProfile): RecommendationScore[] {
    // Implementation for time-based recommendations
    return [];
  }

  /**
   * Get popular products for new users
   */
  private getPopularProducts(count: number): RecommendationScore[] {
    const recommendations: RecommendationScore[] = [];
    
    const popularProducts = Array.from(this.productListings.values())
      .sort((a, b) => (b.quality_score * b.seller_rating) - (a.quality_score * a.seller_rating))
      .slice(0, count);

    popularProducts.forEach((product, index) => {
      recommendations.push({
        product_id: product.id,
        score: 0.8 - (index * 0.1),
        reasons: ['Produit populaire', 'Bien noté par la communauté'],
        confidence: 0.6,
        category: 'behavioral'
      });
    });

    return recommendations;
  }

  /**
   * Update user profile with new interaction
   */
  updateUserInteraction(userId: string, productId: string, interaction: 'view' | 'favorite' | 'purchase', rating?: number) {
    const user = this.userProfiles.get(userId);
    if (!user) return;

    switch (interaction) {
      case 'view':
        if (!user.behavior.view_history.includes(productId)) {
          user.behavior.view_history.push(productId);
        }
        break;
      case 'favorite':
        if (!user.behavior.favorites.includes(productId)) {
          user.behavior.favorites.push(productId);
        }
        break;
      case 'purchase':
        user.behavior.purchase_history.push({
          product_id: productId,
          category: this.productListings.get(productId)?.category || '',
          price: this.productListings.get(productId)?.price || 0,
          date: new Date(),
          rating
        });
        break;
    }

    // Update user-item matrix
    const interactions = this.userItemMatrix.get(userId) || new Map();
    const score = interaction === 'purchase' ? (rating || 3) : 
                   interaction === 'favorite' ? 4 : 1;
    interactions.set(productId, score);
    this.userItemMatrix.set(userId, interactions);
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();
