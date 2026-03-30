/**
 * Smart Matching Algorithm for MBOA Market
 * Uses AI to connect buyers with perfect suppliers based on multiple factors
 */

export interface BuyerProfile {
  id: string;
  user_id: string;
  preferences: {
    categories: string[];
    price_range: { min: number; max: number };
    quality_requirement: 'premium' | 'standard' | 'economy';
    location_preference: 'local' | 'regional' | 'national' | 'international';
    delivery_speed: 'urgent' | 'standard' | 'flexible';
  };
  behavior: {
    purchase_history: Array<{
      product_id: string;
      seller_id: string;
      rating: number;
      date: Date;
      category: string;
    }>;
    search_patterns: string[];
    response_time: number; // Average response time in hours
  };
  requirements: {
    quantity: number;
    frequency: 'one_time' | 'weekly' | 'monthly' | 'quarterly';
    specifications: Record<string, any>;
  };
}

export interface SellerProfile {
  id: string;
  user_id: string;
  business_info: {
    company_name: string;
    location: string;
    delivery_radius: number; // in km
    specialties: string[];
    certifications: string[];
  };
  performance: {
    rating: number;
    total_sales: number;
    response_time: number; // Average response time in hours
    on_time_delivery: number; // Percentage
    quality_score: number;
  };
  inventory: {
    products: Array<{
      id: string;
      category: string;
      price: number;
      quality_score: number;
      available_quantity: number;
      location: string;
    }>;
    capacity: number; // Maximum production capacity
  };
  reliability: {
    verification_status: 'verified' | 'pending' | 'unverified';
    years_in_business: number;
    insurance_coverage: boolean;
    return_policy: boolean;
  };
}

export interface MatchResult {
  buyer_id: string;
  seller_id: string;
  product_id: string;
  match_score: number;
  confidence: number;
  compatibility_factors: {
    price_match: number;
    quality_match: number;
    location_match: number;
    timing_match: number;
    reputation_match: number;
    category_match: number;
  };
  recommendations: string[];
  potential_issues: string[];
  estimated_success_probability: number;
}

class SmartMatchingAlgorithm {
  private buyerProfiles: Map<string, BuyerProfile> = new Map();
  private sellerProfiles: Map<string, SellerProfile> = new Map();
  private matchHistory: Map<string, MatchResult[]> = new Map();
  private learningWeights: Map<string, number> = new Map();

  /**
   * Initialize the smart matching system
   */
  async initialize(buyers: BuyerProfile[], sellers: SellerProfile[]) {
    this.buyerProfiles = new Map(buyers.map(buyer => [buyer.id, buyer]));
    this.sellerProfiles = new Map(sellers.map(seller => [seller.id, seller]));
    
    // Initialize learning weights
    this.initializeLearningWeights();
    
    // Analyze historical matches for learning
    await this.analyzeHistoricalMatches();
    
    console.log(`🔄 Smart Matching initialized with ${buyers.length} buyers and ${sellers.length} sellers`);
  }

  /**
   * Find best matches for a buyer
   */
  async findMatchesForBuyer(buyerId: string, limit: number = 10): Promise<MatchResult[]> {
    const buyer = this.buyerProfiles.get(buyerId);
    if (!buyer) return [];

    const matches: MatchResult[] = [];

    // Evaluate each seller
    for (const [sellerId, seller] of this.sellerProfiles) {
      const matchResults = await this.evaluateBuyerSellerMatch(buyer, seller);
      matches.push(...matchResults);
    }

    // Sort by match score and return top matches
    return matches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  }

  /**
   * Find best buyers for a seller's product
   */
  async findBuyersForSeller(sellerId: string, productId: string, limit: number = 10): Promise<MatchResult[]> {
    const seller = this.sellerProfiles.get(sellerId);
    if (!seller) return [];

    const product = seller.inventory.products.find(p => p.id === productId);
    if (!product) return [];

    const matches: MatchResult[] = [];

    // Evaluate each buyer
    for (const [buyerId, buyer] of this.buyerProfiles) {
      const matchResult = await this.evaluateBuyerProductMatch(buyer, seller, product);
      if (matchResult) {
        matches.push(matchResult);
      }
    }

    // Sort by match score and return top matches
    return matches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  }

  /**
   * Evaluate match between buyer and seller
   */
  private async evaluateBuyerSellerMatch(buyer: BuyerProfile, seller: SellerProfile): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];

    // Check each product in seller's inventory
    for (const product of seller.inventory.products) {
      // Check basic compatibility
      if (!this.isBasicCompatible(buyer, product)) continue;

      const matchResult = await this.calculateMatchScore(buyer, seller, product);
      if (matchResult.match_score > 0.3) { // Minimum threshold
        matches.push(matchResult);
      }
    }

    return matches;
  }

  /**
   * Evaluate match between buyer and specific product
   */
  private async evaluateBuyerProductMatch(buyer: BuyerProfile, seller: SellerProfile, product: any): Promise<MatchResult | null> {
    if (!this.isBasicCompatible(buyer, product)) return null;

    return await this.calculateMatchScore(buyer, seller, product);
  }

  /**
   * Calculate comprehensive match score
   */
  private async calculateMatchScore(buyer: BuyerProfile, seller: SellerProfile, product: any): Promise<MatchResult> {
    const factors = {
      price_match: this.calculatePriceMatch(buyer, product),
      quality_match: this.calculateQualityMatch(buyer, product),
      location_match: this.calculateLocationMatch(buyer, seller),
      timing_match: this.calculateTimingMatch(buyer, seller),
      reputation_match: this.calculateReputationMatch(buyer, seller),
      category_match: this.calculateCategoryMatch(buyer, product)
    };

    // Apply learning weights
    const weightedFactors = this.applyLearningWeights(factors);

    // Calculate overall match score
    const match_score = Object.values(weightedFactors).reduce((sum, score) => sum + score, 0) / Object.keys(weightedFactors).length;

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(buyer, seller, product);

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, buyer, seller, product);
    
    // Identify potential issues
    const potential_issues = this.identifyPotentialIssues(factors, buyer, seller, product);

    // Estimate success probability
    const estimated_success_probability = this.estimateSuccessProbability(match_score, confidence, seller);

    return {
      buyer_id: buyer.id,
      seller_id: seller.id,
      product_id: product.id,
      match_score,
      confidence,
      compatibility_factors: factors,
      recommendations,
      potential_issues,
      estimated_success_probability
    };
  }

  /**
   * Calculate price compatibility
   */
  private calculatePriceMatch(buyer: BuyerProfile, product: any): number {
    const { min, max } = buyer.preferences.price_range;
    
    if (product.price < min) return 0.2; // Too cheap - might indicate quality issues
    if (product.price > max) return 0.1; // Too expensive
    
    // Optimal price range
    const optimalRange = max - min;
    const pricePosition = (product.price - min) / optimalRange;
    
    // Prefer slightly lower prices (0.3-0.7 range)
    if (pricePosition >= 0.3 && pricePosition <= 0.7) return 1.0;
    if (pricePosition >= 0.2 && pricePosition <= 0.8) return 0.8;
    
    return 0.6;
  }

  /**
   * Calculate quality compatibility
   */
  private calculateQualityMatch(buyer: BuyerProfile, product: any): number {
    const requiredQuality = buyer.preferences.quality_requirement;
    const productQuality = product.quality_score;

    switch (requiredQuality) {
      case 'premium':
        return productQuality >= 0.9 ? 1.0 : productQuality >= 0.8 ? 0.7 : 0.3;
      case 'standard':
        return productQuality >= 0.7 ? 1.0 : productQuality >= 0.6 ? 0.8 : 0.5;
      case 'economy':
        return productQuality >= 0.5 ? 1.0 : 0.8;
      default:
        return 0.5;
    }
  }

  /**
   * Calculate location compatibility
   */
  private calculateLocationMatch(buyer: BuyerProfile, seller: SellerProfile): number {
    const preference = buyer.preferences.location_preference;
    
    // This would use actual geolocation in production
    const distance = this.calculateDistance(buyer, seller);
    
    switch (preference) {
      case 'local':
        return distance <= 50 ? 1.0 : distance <= 100 ? 0.7 : 0.3;
      case 'regional':
        return distance <= 200 ? 1.0 : distance <= 500 ? 0.8 : 0.5;
      case 'national':
        return distance <= 1000 ? 1.0 : 0.7;
      case 'international':
        return 1.0; // No location restriction
      default:
        return 0.5;
    }
  }

  /**
   * Calculate timing compatibility
   */
  private calculateTimingMatch(buyer: BuyerProfile, seller: SellerProfile): number {
    const buyerSpeed = buyer.preferences.delivery_speed;
    const sellerResponse = seller.performance.response_time;
    const buyerResponse = buyer.behavior.response_time;

    // Calculate communication speed compatibility
    const responseCompatibility = Math.max(0, 1 - Math.abs(sellerResponse - buyerResponse) / 24);

    // Check delivery speed requirements
    let deliveryScore = 0.5;
    switch (buyerSpeed) {
      case 'urgent':
        deliveryScore = sellerResponse <= 2 ? 1.0 : sellerResponse <= 6 ? 0.7 : 0.3;
        break;
      case 'standard':
        deliveryScore = sellerResponse <= 12 ? 1.0 : sellerResponse <= 24 ? 0.8 : 0.6;
        break;
      case 'flexible':
        deliveryScore = 0.9; // Flexible buyers are more forgiving
        break;
    }

    return (responseCompatibility + deliveryScore) / 2;
  }

  /**
   * Calculate reputation compatibility
   */
  private calculateReputationMatch(buyer: BuyerProfile, seller: SellerProfile): number {
    const sellerRating = seller.performance.rating;
    const sellerSales = seller.performance.total_sales;
    const sellerReliability = this.calculateReliabilityScore(seller);

    // Check buyer's past experience with similar sellers
    const buyerPreference = this.analyzeBuyerReputationPreference(buyer);

    // Base score from seller rating
    let ratingScore = sellerRating / 5.0;

    // Boost for experienced sellers
    if (sellerSales > 100) ratingScore *= 1.1;
    if (sellerSales > 500) ratingScore *= 1.1;

    // Factor in reliability
    const finalScore = (ratingScore * 0.7) + (sellerReliability * 0.3);

    return Math.min(1.0, finalScore);
  }

  /**
   * Calculate category compatibility
   */
  private calculateCategoryMatch(buyer: BuyerProfile, product: any): number {
    const buyerCategories = buyer.preferences.categories;
    const productCategory = product.category;

    if (buyerCategories.includes(productCategory)) {
      return 1.0;
    }

    // Check for related categories
    const relatedCategories = this.getRelatedCategories(productCategory);
    const hasRelatedCategory = buyerCategories.some(cat => relatedCategories.includes(cat));

    return hasRelatedCategory ? 0.7 : 0.2;
  }

  /**
   * Apply machine learning weights to factors
   */
  private applyLearningWeights(factors: Record<string, number>): Record<string, number> {
    const weightedFactors: Record<string, number> = {};

    Object.entries(factors).forEach(([factor, score]) => {
      const weight = this.learningWeights.get(factor) || 1.0;
      weightedFactors[factor] = score * weight;
    });

    return weightedFactors;
  }

  /**
   * Calculate confidence in the match
   */
  private calculateConfidence(buyer: BuyerProfile, seller: SellerProfile, product: any): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence with more data
    if (buyer.behavior.purchase_history.length > 5) confidence += 0.1;
    if (seller.performance.total_sales > 50) confidence += 0.1;
    if (seller.reliability.verification_status === 'verified') confidence += 0.1;
    if (product.quality_score > 0.8) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  /**
   * Generate recommendations for the match
   */
  private generateRecommendations(factors: Record<string, number>, buyer: BuyerProfile, seller: SellerProfile, product: any): string[] {
    const recommendations: string[] = [];

    if (factors.price_match > 0.8) {
      recommendations.push('Prix très compétitif pour vos exigences');
    }

    if (factors.quality_match > 0.9) {
      recommendations.push('Qualité exceptionnelle garantissant satisfaction');
    }

    if (factors.location_match > 0.8) {
      recommendations.push('Proximité géographique idéale pour livraison rapide');
    }

    if (factors.reputation_match > 0.8) {
      recommendations.push('Vendeur très réputé avec excellents avis');
    }

    if (seller.performance.on_time_delivery > 0.95) {
      recommendations.push('Taux de livraison à temps exceptionnel');
    }

    if (seller.reliability.years_in_business > 5) {
      recommendations.push('Expérience solide et fiabilité prouvée');
    }

    return recommendations;
  }

  /**
   * Identify potential issues with the match
   */
  private identifyPotentialIssues(factors: Record<string, number>, buyer: BuyerProfile, seller: SellerProfile, product: any): string[] {
    const issues: string[] = [];

    if (factors.price_match < 0.3) {
      issues.push('Prix en dehors de votre gamme de préférence');
    }

    if (factors.quality_match < 0.5) {
      issues.push('Qualité inférieure à vos exigences');
    }

    if (factors.location_match < 0.4) {
      issues.push('Distance importante - coûts de livraison élevés');
    }

    if (seller.performance.response_time > 24) {
      issues.push('Temps de réponse relativement long');
    }

    if (seller.reliability.verification_status !== 'verified') {
      issues.push('Vendeur non vérifié - prudence recommandée');
    }

    if (product.available_quantity < buyer.requirements.quantity) {
      issues.push('Quantité disponible insuffisante');
    }

    return issues;
  }

  /**
   * Estimate success probability
   */
  private estimateSuccessProbability(matchScore: number, confidence: number, seller: SellerProfile): number {
    const baseProbability = matchScore * 0.7 + confidence * 0.3;
    
    // Adjust based on seller's historical success
    const sellerSuccess = seller.performance.on_time_delivery / 100;
    
    // Adjust based on reliability
    const reliabilityBonus = seller.reliability.verification_status === 'verified' ? 0.1 : 0;
    
    return Math.min(1.0, baseProbability * sellerSuccess + reliabilityBonus);
  }

  /**
   * Check basic compatibility
   */
  private isBasicCompatible(buyer: BuyerProfile, product: any): boolean {
    // Check category compatibility
    if (!buyer.preferences.categories.includes(product.category)) {
      const relatedCategories = this.getRelatedCategories(product.category);
      if (!buyer.preferences.categories.some(cat => relatedCategories.includes(cat))) {
        return false;
      }
    }

    // Check price range
    const { min, max } = buyer.preferences.price_range;
    if (product.price < min * 0.5 || product.price > max * 1.5) {
      return false; // Too far outside price range
    }

    // Check quantity availability
    if (product.available_quantity < buyer.requirements.quantity * 0.5) {
      return false; // Not enough quantity
    }

    return true;
  }

  /**
   * Utility functions
   */
  private calculateDistance(buyer: BuyerProfile, seller: SellerProfile): number {
    // In production, this would use actual geolocation
    // For demo, return random distance
    return Math.random() * 1000; // km
  }

  private calculateReliabilityScore(seller: SellerProfile): number {
    let score = 0.5;

    if (seller.reliability.verification_status === 'verified') score += 0.2;
    if (seller.reliability.years_in_business > 3) score += 0.1;
    if (seller.reliability.insurance_coverage) score += 0.1;
    if (seller.reliability.return_policy) score += 0.1;

    return Math.min(1.0, score);
  }

  private analyzeBuyerReputationPreference(buyer: BuyerProfile): number {
    // Analyze buyer's past ratings to understand reputation preferences
    const pastRatings = buyer.behavior.purchase_history.map(p => p.rating);
    if (pastRatings.length === 0) return 0.5;

    const avgRating = pastRatings.reduce((sum, rating) => sum + rating, 0) / pastRatings.length;
    return avgRating / 5.0;
  }

  private getRelatedCategories(category: string): string[] {
    // Define related categories
    const categoryMap: Record<string, string[]> = {
      'cereals': ['grains', 'seeds', 'crops'],
      'vegetables': ['produce', 'fresh', 'organic'],
      'livestock': ['animals', 'cattle', 'poultry'],
      'dairy': ['milk', 'cheese', 'products'],
      'machinery': ['equipment', 'tools', 'technology']
    };

    return categoryMap[category] || [];
  }

  private initializeLearningWeights(): void {
    // Initialize weights for different factors
    this.learningWeights.set('price_match', 1.0);
    this.learningWeights.set('quality_match', 1.2);
    this.learningWeights.set('location_match', 0.8);
    this.learningWeights.set('timing_match', 0.9);
    this.learningWeights.set('reputation_match', 1.1);
    this.learningWeights.set('category_match', 1.0);
  }

  private async analyzeHistoricalMatches(): Promise<void> {
    // Analyze historical match data to improve weights
    // In production, this would use actual match history and outcomes
    
    // Simulate learning from historical data
    this.learningWeights.set('price_match', 1.1);
    this.learningWeights.set('quality_match', 1.3);
    this.learningWeights.set('reputation_match', 1.2);
  }

  /**
   * Update learning based on match outcomes
   */
  updateLearningFromOutcome(matchId: string, success: boolean): void {
    // Update weights based on actual match outcomes
    // This would implement reinforcement learning in production
    
    console.log(`📚 Learning from match ${matchId}: ${success ? 'Success' : 'Failure'}`);
  }

  /**
   * Add new buyer profile
   */
  addBuyerProfile(buyer: BuyerProfile): void {
    this.buyerProfiles.set(buyer.id, buyer);
  }

  /**
   * Add new seller profile
   */
  addSellerProfile(seller: SellerProfile): void {
    this.sellerProfiles.set(seller.id, seller);
  }

  /**
   * Get market insights
   */
  getMarketInsights(): {
    total_matches: number;
    average_match_score: number;
    top_categories: string[];
    common_issues: string[];
  } {
    const allMatches = Array.from(this.matchHistory.values()).flat();
    
    return {
      total_matches: allMatches.length,
      average_match_score: allMatches.reduce((sum, match) => sum + match.match_score, 0) / allMatches.length,
      top_categories: [], // Would be calculated from match data
      common_issues: [] // Would be calculated from match data
    };
  }
}

export const smartMatchingAlgorithm = new SmartMatchingAlgorithm();
