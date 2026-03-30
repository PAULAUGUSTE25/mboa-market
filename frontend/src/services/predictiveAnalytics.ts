/**
 * Predictive Analytics for Market Demand and Yield Forecasting
 * MBOA Market - Excellence Platform
 */

export interface MarketDemandForecast {
  product: string;
  category: string;
  current_demand: number;
  predicted_demand_7d: number;
  predicted_demand_30d: number;
  predicted_demand_90d: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  seasonal_factor: number;
  price_impact: number;
}

export interface YieldForecast {
  crop: string;
  region: string;
  current_yield: number;
  predicted_yield: number;
  optimal_yield: number;
  factors: {
    weather: number;
    soil_quality: number;
    irrigation: number;
    pest_control: number;
    fertilization: number;
  };
  recommendations: string[];
  confidence: number;
}

export interface MarketTrend {
  product: string;
  price_trend: 'up' | 'down' | 'stable';
  volume_trend: 'up' | 'down' | 'stable';
  demand_score: number;
  supply_score: number;
  competition_level: 'low' | 'medium' | 'high';
  opportunity_score: number;
}

class PredictiveAnalyticsEngine {
  private historicalData: Map<string, any[]> = new Map();
  private seasonalPatterns: Map<string, number[]> = new Map();

  /**
   * Forecast market demand for a product
   */
  async forecastMarketDemand(
    product: string,
    category: string,
    historicalSales?: number[]
  ): Promise<MarketDemandForecast> {
    // Simulate historical data if not provided
    const sales = historicalSales || this.generateHistoricalSales(product);
    
    // Calculate trends using time series analysis
    const trend = this.calculateTrend(sales);
    const seasonalFactor = this.getSeasonalFactor(product, category);
    
    // Predict future demand using ARIMA-like approach
    const currentDemand = sales[sales.length - 1];
    const predicted7d = this.predictDemand(sales, 7, seasonalFactor);
    const predicted30d = this.predictDemand(sales, 30, seasonalFactor);
    const predicted90d = this.predictDemand(sales, 90, seasonalFactor);
    
    // Calculate confidence based on data variance
    const confidence = this.calculateConfidence(sales);
    
    // Estimate price impact
    const priceImpact = this.estimatePriceImpact(trend, predicted30d, currentDemand);
    
    return {
      product,
      category,
      current_demand: currentDemand,
      predicted_demand_7d: predicted7d,
      predicted_demand_30d: predicted30d,
      predicted_demand_90d: predicted90d,
      trend,
      confidence,
      seasonal_factor: seasonalFactor,
      price_impact: priceImpact
    };
  }

  /**
   * Forecast crop yield
   */
  async forecastYield(
    crop: string,
    region: string,
    environmentalData?: any
  ): Promise<YieldForecast> {
    // Get baseline yield for the crop
    const baselineYield = this.getBaselineYield(crop, region);
    
    // Environmental factors (simulated or from real data)
    const factors = environmentalData || this.getEnvironmentalFactors(crop, region);
    
    // Calculate predicted yield based on factors
    const predictedYield = this.calculatePredictedYield(baselineYield, factors);
    const optimalYield = this.calculateOptimalYield(crop, region);
    
    // Generate recommendations
    const recommendations = this.generateYieldRecommendations(
      crop,
      factors,
      predictedYield,
      optimalYield
    );
    
    // Calculate confidence
    const confidence = this.calculateYieldConfidence(factors);
    
    return {
      crop,
      region,
      current_yield: baselineYield,
      predicted_yield: predictedYield,
      optimal_yield: optimalYield,
      factors,
      recommendations,
      confidence
    };
  }

  /**
   * Analyze market trends
   */
  async analyzeMarketTrends(product: string): Promise<MarketTrend> {
    // Simulate market data analysis
    const priceTrend = this.analyzePriceTrend(product);
    const volumeTrend = this.analyzeVolumeTrend(product);
    const demandScore = this.calculateDemandScore(product);
    const supplyScore = this.calculateSupplyScore(product);
    const competitionLevel = this.assessCompetition(product);
    const opportunityScore = this.calculateOpportunityScore(
      demandScore,
      supplyScore,
      competitionLevel
    );
    
    return {
      product,
      price_trend: priceTrend,
      volume_trend: volumeTrend,
      demand_score: demandScore,
      supply_score: supplyScore,
      competition_level: competitionLevel,
      opportunity_score: opportunityScore
    };
  }

  /**
   * Get seasonal recommendations
   */
  getSeasonalRecommendations(category: string, month?: number): string[] {
    const currentMonth = month || new Date().getMonth();
    const recommendations: string[] = [];
    
    // Seasonal planting recommendations
    const seasonalCrops: Record<number, string[]> = {
      0: ['Maïs', 'Haricots', 'Arachides'], // January
      1: ['Tomates', 'Piments', 'Oignons'], // February
      2: ['Manioc', 'Ignames', 'Patates'], // March
      3: ['Riz', 'Maïs', 'Sorgho'], // April
      4: ['Légumes verts', 'Carottes', 'Choux'], // May
      5: ['Maïs', 'Haricots', 'Courges'], // June
      6: ['Tomates', 'Aubergines', 'Poivrons'], // July
      7: ['Manioc', 'Plantain', 'Bananes'], // August
      8: ['Riz', 'Maïs', 'Mil'], // September
      9: ['Arachides', 'Soja', 'Niébé'], // October
      10: ['Légumes', 'Herbes', 'Épinards'], // November
      11: ['Maïs', 'Haricots', 'Pois'] // December
    };
    
    const crops = seasonalCrops[currentMonth] || [];
    
    if (category === 'agriculture') {
      recommendations.push(
        `🌱 Saison idéale pour: ${crops.join(', ')}`,
        `💧 Assurez un bon système d'irrigation`,
        `🌡️ Surveillez les conditions météorologiques`,
        `🐛 Préparez la lutte antiparasitaire`
      );
    } else if (category === 'elevage') {
      recommendations.push(
        `🐔 Augmentez la production de volaille`,
        `🐄 Optimisez l'alimentation du bétail`,
        `💉 Planifiez les vaccinations`,
        `🏠 Améliorez les conditions d'élevage`
      );
    }
    
    return recommendations;
  }

  /**
   * Private helper methods
   */
  private generateHistoricalSales(product: string): number[] {
    // Generate realistic historical sales data
    const baseValue = 1000;
    const trend = Math.random() * 0.1 - 0.05; // -5% to +5% trend
    const seasonality = Math.sin(Date.now() / 1000000) * 200;
    
    return Array.from({ length: 30 }, (_, i) => {
      const trendValue = baseValue * (1 + trend * i);
      const seasonal = seasonality * Math.sin(i / 7);
      const noise = (Math.random() - 0.5) * 100;
      return Math.max(0, trendValue + seasonal + noise);
    });
  }

  private calculateTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (avgSecond - avgFirst) / avgFirst;
    
    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  private getSeasonalFactor(product: string, category: string): number {
    const month = new Date().getMonth();
    
    // Seasonal factors for different products
    const seasonalFactors: Record<string, number[]> = {
      'maïs': [0.8, 0.9, 1.0, 1.2, 1.3, 1.2, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1],
      'tomates': [1.2, 1.3, 1.2, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2],
      'poulet': [1.0, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.2, 1.3],
      'default': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
    };
    
    const factors = seasonalFactors[product.toLowerCase()] || seasonalFactors['default'];
    return factors[month];
  }

  private predictDemand(sales: number[], daysAhead: number, seasonalFactor: number): number {
    const recentAvg = sales.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const trend = this.calculateTrend(sales);
    
    let prediction = recentAvg * seasonalFactor;
    
    if (trend === 'increasing') {
      prediction *= (1 + 0.02 * (daysAhead / 7));
    } else if (trend === 'decreasing') {
      prediction *= (1 - 0.02 * (daysAhead / 7));
    }
    
    return Math.round(prediction);
  }

  private calculateConfidence(data: number[]): number {
    if (data.length < 2) return 0.5;
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // Coefficient of variation
    
    // Lower CV = higher confidence
    return Math.max(0.3, Math.min(0.95, 1 - cv));
  }

  private estimatePriceImpact(
    trend: 'increasing' | 'decreasing' | 'stable',
    predictedDemand: number,
    currentDemand: number
  ): number {
    const demandChange = (predictedDemand - currentDemand) / currentDemand;
    
    // Price elasticity of demand (simplified)
    const elasticity = -0.5;
    const priceChange = demandChange / elasticity;
    
    return Math.round(priceChange * 100); // Percentage
  }

  private getBaselineYield(crop: string, region: string): number {
    // Baseline yields in kg/hectare
    const yields: Record<string, number> = {
      'maïs': 2500,
      'riz': 3000,
      'manioc': 15000,
      'tomates': 25000,
      'haricots': 1500,
      'arachides': 2000
    };
    
    return yields[crop.toLowerCase()] || 2000;
  }

  private getEnvironmentalFactors(crop: string, region: string): any {
    return {
      weather: 0.7 + Math.random() * 0.3,
      soil_quality: 0.6 + Math.random() * 0.4,
      irrigation: 0.5 + Math.random() * 0.5,
      pest_control: 0.7 + Math.random() * 0.3,
      fertilization: 0.6 + Math.random() * 0.4
    };
  }

  private calculatePredictedYield(baseline: number, factors: any): number {
    const avgFactor = Object.values(factors).reduce((a: any, b: any) => a + b, 0) / Object.keys(factors).length;
    return Math.round(baseline * avgFactor);
  }

  private calculateOptimalYield(crop: string, region: string): number {
    return this.getBaselineYield(crop, region) * 1.3; // 30% above baseline
  }

  private generateYieldRecommendations(
    crop: string,
    factors: any,
    predicted: number,
    optimal: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (factors.weather < 0.7) {
      recommendations.push('☔ Installer un système de protection contre les intempéries');
    }
    
    if (factors.soil_quality < 0.7) {
      recommendations.push('🌱 Améliorer la qualité du sol avec du compost organique');
    }
    
    if (factors.irrigation < 0.7) {
      recommendations.push('💧 Optimiser le système d\'irrigation goutte-à-goutte');
    }
    
    if (factors.pest_control < 0.7) {
      recommendations.push('🐛 Renforcer la lutte antiparasitaire biologique');
    }
    
    if (factors.fertilization < 0.7) {
      recommendations.push('🌾 Appliquer des engrais organiques adaptés');
    }
    
    if (predicted < optimal * 0.8) {
      recommendations.push('📈 Potentiel d\'amélioration de 20-30% avec optimisation');
    }
    
    return recommendations;
  }

  private calculateYieldConfidence(factors: any): number {
    const values = Object.values(factors) as number[];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.min(0.95, avg + 0.1);
  }

  private analyzePriceTrend(product: string): 'up' | 'down' | 'stable' {
    const trends = ['up', 'down', 'stable'] as const;
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private analyzeVolumeTrend(product: string): 'up' | 'down' | 'stable' {
    const trends = ['up', 'down', 'stable'] as const;
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private calculateDemandScore(product: string): number {
    return Math.round(50 + Math.random() * 50);
  }

  private calculateSupplyScore(product: string): number {
    return Math.round(50 + Math.random() * 50);
  }

  private assessCompetition(product: string): 'low' | 'medium' | 'high' {
    const levels = ['low', 'medium', 'high'] as const;
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private calculateOpportunityScore(
    demand: number,
    supply: number,
    competition: 'low' | 'medium' | 'high'
  ): number {
    let score = demand - supply;
    
    if (competition === 'low') score += 20;
    else if (competition === 'high') score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }
}

export const predictiveAnalytics = new PredictiveAnalyticsEngine();
