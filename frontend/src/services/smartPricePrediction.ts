/**
 * Smart Price Prediction System for MBOA Market
 * Uses machine learning and market analysis to predict optimal pricing
 */

export interface MarketData {
  product_id: string;
  category: string;
  region: string;
  historical_prices: Array<{
    date: Date;
    price: number;
    volume: number;
    quality_score: number;
  }>;
  seasonal_factors: {
    month: number;
    demand_multiplier: number;
    supply_multiplier: number;
  }[];
  market_trends: {
    trend: 'increasing' | 'stable' | 'decreasing';
    confidence: number;
    factors: string[];
  };
}

export interface PricePrediction {
  product_id: string;
  current_price: number;
  predicted_prices: Array<{
    date: Date;
    price: number;
    confidence: number;
    recommendation: 'buy_now' | 'wait' | 'sell_now' | 'hold';
    reasons: string[];
  }>;
  optimal_price_range: {
    min: number;
    max: number;
    confidence: number;
  };
  market_insights: {
    trend_direction: 'bullish' | 'bearish' | 'neutral';
    volatility: 'low' | 'medium' | 'high';
    key_factors: string[];
  };
}

class SmartPricePrediction {
  private marketData: Map<string, MarketData> = new Map();
  private seasonalPatterns: Map<string, number[]> = new Map();
  private priceModels: Map<string, any> = new Map();

  /**
   * Initialize the price prediction system
   */
  async initialize(marketData: MarketData[]) {
    this.marketData = new Map(marketData.map(data => [data.product_id, data]));
    
    // Build seasonal patterns
    this.buildSeasonalPatterns();
    
    // Train price prediction models
    await this.trainPriceModels();
    
    console.log(`💰 Smart Price Prediction initialized with ${marketData.length} products`);
  }

  /**
   * Get price predictions for a product
   */
  async getPricePredictions(productId: string, daysAhead: number = 30): Promise<PricePrediction | null> {
    const marketData = this.marketData.get(productId);
    if (!marketData) return null;

    const currentPrice = this.getCurrentPrice(marketData);
    const predictions = await this.generatePredictions(marketData, daysAhead);
    const optimalRange = this.calculateOptimalPriceRange(marketData, predictions);
    const insights = this.generateMarketInsights(marketData, predictions);

    return {
      product_id: productId,
      current_price: currentPrice,
      predicted_prices: predictions,
      optimal_price_range: optimalRange,
      market_insights: insights
    };
  }

  /**
   * Generate price predictions using multiple models
   */
  private async generatePredictions(marketData: MarketData, daysAhead: number): Promise<any[]> {
    const predictions: any[] = [];
    const currentDate = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const futureDate = new Date(currentDate.getTime() + (i * 24 * 60 * 60 * 1000));
      
      // Use ensemble of prediction models
      const arimaPrediction = this.arimaPrediction(marketData, i);
      const seasonalPrediction = this.seasonalPrediction(marketData, futureDate);
      const trendPrediction = this.trendPrediction(marketData, i);
      const mlPrediction = this.mlPrediction(marketData, i);

      // Ensemble prediction (weighted average)
      const ensemblePrice = (
        arimaPrediction.price * 0.3 +
        seasonalPrediction.price * 0.25 +
        trendPrediction.price * 0.25 +
        mlPrediction.price * 0.2
      );

      const confidence = Math.min(
        arimaPrediction.confidence,
        seasonalPrediction.confidence,
        trendPrediction.confidence,
        mlPrediction.confidence
      );

      const recommendation = this.getRecommendation(ensemblePrice, marketData, i);
      const reasons = this.generatePredictionReasons(arimaPrediction, seasonalPrediction, trendPrediction, mlPrediction);

      predictions.push({
        date: futureDate,
        price: ensemblePrice,
        confidence,
        recommendation,
        reasons
      });
    }

    return predictions;
  }

  /**
   * ARIMA time series prediction
   */
  private arimaPrediction(marketData: MarketData, daysAhead: number): { price: number; confidence: number } {
    const prices = marketData.historical_prices.map(p => p.price);
    
    if (prices.length < 10) {
      // Fallback to simple moving average
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      return { price: avgPrice, confidence: 0.3 };
    }

    // Simple ARIMA-like prediction (simplified for demo)
    const recentPrices = prices.slice(-10);
    const trend = this.calculateTrend(recentPrices);
    const seasonality = this.getSeasonalityFactor(marketData, daysAhead);
    
    const lastPrice = recentPrices[recentPrices.length - 1];
    const predictedPrice = lastPrice * (1 + trend) * seasonality;

    return {
      price: predictedPrice,
      confidence: 0.75
    };
  }

  /**
   * Seasonal prediction based on historical patterns
   */
  private seasonalPrediction(marketData: MarketData, date: Date): { price: number; confidence: number } {
    const month = date.getMonth();
    const seasonalFactor = marketData.seasonal_factors.find(f => f.month === month);
    
    if (!seasonalFactor) {
      const avgPrice = this.getCurrentPrice(marketData);
      return { price: avgPrice, confidence: 0.4 };
    }

    const basePrice = this.getCurrentPrice(marketData);
    const demandMultiplier = seasonalFactor.demand_multiplier;
    const supplyMultiplier = seasonalFactor.supply_multiplier;
    
    // Price = base * demand / supply
    const seasonalPrice = basePrice * (demandMultiplier / supplyMultiplier);

    return {
      price: seasonalPrice,
      confidence: 0.8
    };
  }

  /**
   * Trend-based prediction
   */
  private trendPrediction(marketData: MarketData, daysAhead: number): { price: number; confidence: number } {
    const trend = marketData.market_trends;
    const currentPrice = this.getCurrentPrice(marketData);
    
    let priceChange = 0;
    
    switch (trend.trend) {
      case 'increasing':
        priceChange = 0.02 * daysAhead * trend.confidence; // 2% per day
        break;
      case 'decreasing':
        priceChange = -0.015 * daysAhead * trend.confidence; // -1.5% per day
        break;
      case 'stable':
        priceChange = 0.001 * daysAhead; // 0.1% per day (minor fluctuations)
        break;
    }

    const predictedPrice = currentPrice * (1 + priceChange);

    return {
      price: predictedPrice,
      confidence: trend.confidence
    };
  }

  /**
   * Machine Learning prediction (simplified)
   */
  private mlPrediction(marketData: MarketData, daysAhead: number): { price: number; confidence: number } {
    // This would use a trained ML model in production
    // For demo, we'll use a simple regression based on multiple factors
    
    const features = this.extractFeatures(marketData);
    const weights = [0.4, 0.3, 0.2, 0.1]; // Feature weights
    
    let prediction = 0;
    features.forEach((feature, index) => {
      prediction += feature * weights[index];
    });

    const currentPrice = this.getCurrentPrice(marketData);
    const mlPrice = currentPrice * prediction;

    return {
      price: mlPrice,
      confidence: 0.7
    };
  }

  /**
   * Extract features for ML prediction
   */
  private extractFeatures(marketData: MarketData): number[] {
    const prices = marketData.historical_prices.map(p => p.price);
    const volumes = marketData.historical_prices.map(p => p.volume);
    const qualities = marketData.historical_prices.map(p => p.quality_score);

    // Feature 1: Price momentum
    const priceMomentum = this.calculateMomentum(prices.slice(-7));
    
    // Feature 2: Volume trend
    const volumeTrend = this.calculateTrend(volumes.slice(-7));
    
    // Feature 3: Quality impact
    const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
    
    // Feature 4: Volatility
    const volatility = this.calculateVolatility(prices.slice(-30));

    return [priceMomentum, volumeTrend, avgQuality, volatility];
  }

  /**
   * Calculate optimal price range
   */
  private calculateOptimalPriceRange(marketData: MarketData, predictions: any[]): { min: number; max: number; confidence: number } {
    const prices = predictions.map(p => p.price);
    const currentPrice = this.getCurrentPrice(marketData);
    
    // Calculate percentiles
    const sortedPrices = prices.sort((a, b) => a - b);
    const p25 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
    const p75 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
    
    // Add buffer for market uncertainty
    const buffer = 0.05; // 5% buffer
    const min = Math.min(p25, currentPrice) * (1 - buffer);
    const max = Math.max(p75, currentPrice) * (1 + buffer);

    // Calculate confidence based on prediction spread
    const spread = (max - min) / currentPrice;
    const confidence = Math.max(0.5, 1 - spread);

    return { min, max, confidence };
  }

  /**
   * Generate market insights
   */
  private generateMarketInsights(marketData: MarketData, predictions: any[]): any {
    const prices = predictions.map(p => p.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const overallChange = (lastPrice - firstPrice) / firstPrice;

    let trendDirection: 'bullish' | 'bearish' | 'neutral';
    if (overallChange > 0.05) trendDirection = 'bullish';
    else if (overallChange < -0.05) trendDirection = 'bearish';
    else trendDirection = 'neutral';

    const volatility = this.calculateVolatility(prices);
    let volatilityLevel: 'low' | 'medium' | 'high';
    if (volatility < 0.1) volatilityLevel = 'low';
    else if (volatility < 0.2) volatilityLevel = 'medium';
    else volatilityLevel = 'high';

    const keyFactors = this.identifyKeyFactors(marketData, predictions);

    return {
      trend_direction: trendDirection,
      volatility: volatilityLevel,
      key_factors: keyFactors
    };
  }

  /**
   * Get recommendation based on prediction
   */
  private getRecommendation(predictedPrice: number, marketData: MarketData, daysAhead: number): 'buy_now' | 'wait' | 'sell_now' | 'hold' {
    const currentPrice = this.getCurrentPrice(marketData);
    const priceChange = (predictedPrice - currentPrice) / currentPrice;

    if (priceChange > 0.1 && daysAhead <= 7) {
      return 'buy_now'; // Price expected to rise significantly soon
    } else if (priceChange < -0.1 && daysAhead <= 7) {
      return 'sell_now'; // Price expected to drop significantly soon
    } else if (priceChange > 0.05 && daysAhead > 14) {
      return 'wait'; // Price will rise but not immediately
    } else {
      return 'hold'; // No significant change expected
    }
  }

  /**
   * Generate prediction reasons
   */
  private generatePredictionReasons(arima: any, seasonal: any, trend: any, ml: any): string[] {
    const reasons: string[] = [];

    if (arima.price > seasonal.price * 1.1) {
      reasons.push('Tendance historique forte à la hausse');
    }
    
    if (seasonal.confidence > 0.8) {
      reasons.push('Facteurs saisonniers très favorables');
    }
    
    if (trend.confidence > 0.7) {
      reasons.push('Tendance de marché confirmée');
    }
    
    if (ml.confidence > 0.6) {
      reasons.push('Modèle ML détecte une opportunité');
    }

    return reasons;
  }

  /**
   * Utility functions
   */
  private getCurrentPrice(marketData: MarketData): number {
    const latestPrice = marketData.historical_prices[marketData.historical_prices.length - 1];
    return latestPrice ? latestPrice.price : 0;
  }

  private calculateTrend(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    return (lastPrice - firstPrice) / firstPrice;
  }

  private calculateMomentum(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const recent = prices.slice(-3);
    const older = prices.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p, 0) / older.length;
    
    return (recentAvg - olderAvg) / olderAvg;
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private getSeasonalityFactor(marketData: MarketData, daysAhead: number): number {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const month = futureDate.getMonth();
    
    const seasonalFactor = marketData.seasonal_factors.find(f => f.month === month);
    return seasonalFactor ? (seasonalFactor.demand_multiplier / seasonalFactor.supply_multiplier) : 1;
  }

  private identifyKeyFactors(marketData: MarketData, predictions: any[]): string[] {
    const factors: string[] = [];
    
    if (marketData.market_trends.confidence > 0.8) {
      factors.push(`Tendance ${marketData.market_trends.trend} forte`);
    }
    
    const avgQuality = marketData.historical_prices.reduce((sum, p) => sum + p.quality_score, 0) / marketData.historical_prices.length;
    if (avgQuality > 0.8) {
      factors.push('Haute qualité des produits');
    }
    
    const recentVolume = marketData.historical_prices.slice(-7).reduce((sum, p) => sum + p.volume, 0) / 7;
    if (recentVolume > 100) {
      factors.push('Volume de transactions élevé');
    }
    
    return factors;
  }

  private buildSeasonalPatterns(): void {
    // Build seasonal patterns from historical data
    this.marketData.forEach((data, productId) => {
      const monthlyPrices: number[][] = Array(12).fill(null).map(() => []);
      
      data.historical_prices.forEach(price => {
        const month = new Date(price.date).getMonth();
        monthlyPrices[month].push(price.price);
      });
      
      const monthlyAverages = monthlyPrices.map(prices => 
        prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0
      );
      
      this.seasonalPatterns.set(productId, monthlyAverages);
    });
  }

  private async trainPriceModels(): Promise<void> {
    // Train ML models for price prediction
    // In production, this would use actual ML libraries
    
    this.marketData.forEach((data, productId) => {
      // Simple model training simulation
      const model = {
        type: 'linear_regression',
        features: ['price_momentum', 'volume_trend', 'quality_score', 'seasonality'],
        weights: [0.4, 0.3, 0.2, 0.1],
        accuracy: 0.85
      };
      
      this.priceModels.set(productId, model);
    });
  }

  /**
   * Update market data with new price information
   */
  updateMarketData(productId: string, newPrice: number, volume: number, qualityScore: number): void {
    const marketData = this.marketData.get(productId);
    if (marketData) {
      marketData.historical_prices.push({
        date: new Date(),
        price: newPrice,
        volume,
        quality_score: qualityScore
      });
      
      // Keep only last 365 days of data
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365);
      marketData.historical_prices = marketData.historical_prices.filter(p => p.date >= cutoffDate);
    }
  }
}

export const smartPricePrediction = new SmartPricePrediction();
