/**
 * Intelligent Supply Chain Optimization and Logistics Planning
 * MBOA Market - Excellence Platform
 */

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_time_hours: number;
  cost_fcfa: number;
  route_quality: 'excellent' | 'good' | 'fair' | 'poor';
  waypoints: string[];
}

export interface LogisticsPlan {
  plan_id: string;
  total_distance_km: number;
  total_time_hours: number;
  total_cost_fcfa: number;
  routes: Route[];
  delivery_sequence: string[];
  optimization_score: number;
  fuel_efficiency: number;
  carbon_footprint_kg: number;
  recommendations: string[];
}

export interface InventoryOptimization {
  product: string;
  current_stock: number;
  optimal_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  holding_cost_fcfa: number;
  stockout_risk: 'low' | 'medium' | 'high';
  days_until_stockout: number;
  recommendations: string[];
}

export interface SupplierPerformance {
  supplier_id: string;
  supplier_name: string;
  reliability_score: number;
  quality_score: number;
  delivery_time_avg_days: number;
  price_competitiveness: number;
  overall_rating: number;
  strengths: string[];
  weaknesses: string[];
}

class SupplyChainOptimizer {
  /**
   * Optimize delivery routes using advanced algorithms
   */
  async optimizeRoutes(
    deliveries: Array<{ destination: string; priority: number; weight_kg: number }>
  ): Promise<LogisticsPlan> {
    // Sort deliveries by priority and location clustering
    const sortedDeliveries = this.clusterAndPrioritize(deliveries);
    
    // Calculate optimal routes
    const routes = this.calculateOptimalRoutes(sortedDeliveries);
    
    // Calculate totals
    const totalDistance = routes.reduce((sum, r) => sum + r.distance_km, 0);
    const totalTime = routes.reduce((sum, r) => sum + r.estimated_time_hours, 0);
    const totalCost = routes.reduce((sum, r) => sum + r.cost_fcfa, 0);
    
    // Calculate optimization metrics
    const optimizationScore = this.calculateOptimizationScore(routes, deliveries);
    const fuelEfficiency = this.calculateFuelEfficiency(totalDistance, deliveries);
    const carbonFootprint = this.calculateCarbonFootprint(totalDistance);
    
    // Generate recommendations
    const recommendations = this.generateLogisticsRecommendations(
      routes,
      optimizationScore,
      fuelEfficiency
    );
    
    return {
      plan_id: `PLAN-${Date.now()}`,
      total_distance_km: Math.round(totalDistance),
      total_time_hours: Math.round(totalTime * 10) / 10,
      total_cost_fcfa: Math.round(totalCost),
      routes,
      delivery_sequence: sortedDeliveries.map(d => d.destination),
      optimization_score: optimizationScore,
      fuel_efficiency: fuelEfficiency,
      carbon_footprint_kg: carbonFootprint,
      recommendations
    };
  }

  /**
   * Optimize inventory levels
   */
  async optimizeInventory(
    product: string,
    currentStock: number,
    avgDailySales: number,
    leadTimeDays: number
  ): Promise<InventoryOptimization> {
    // Calculate optimal stock using Economic Order Quantity (EOQ) principles
    const optimalStock = this.calculateOptimalStock(avgDailySales, leadTimeDays);
    
    // Calculate reorder point (safety stock + lead time demand)
    const safetyStock = avgDailySales * 3; // 3 days safety
    const reorderPoint = Math.round(safetyStock + (avgDailySales * leadTimeDays));
    
    // Calculate reorder quantity
    const reorderQuantity = Math.round(optimalStock - reorderPoint);
    
    // Calculate holding cost (simplified)
    const holdingCostPerUnit = 50; // FCFA per unit per month
    const holdingCost = currentStock * holdingCostPerUnit;
    
    // Assess stockout risk
    const daysUntilStockout = currentStock / avgDailySales;
    const stockoutRisk = this.assessStockoutRisk(daysUntilStockout, leadTimeDays);
    
    // Generate recommendations
    const recommendations = this.generateInventoryRecommendations(
      currentStock,
      optimalStock,
      daysUntilStockout,
      stockoutRisk
    );
    
    return {
      product,
      current_stock: currentStock,
      optimal_stock: optimalStock,
      reorder_point: reorderPoint,
      reorder_quantity: Math.max(0, reorderQuantity),
      holding_cost_fcfa: holdingCost,
      stockout_risk: stockoutRisk,
      days_until_stockout: Math.round(daysUntilStockout),
      recommendations
    };
  }

  /**
   * Evaluate supplier performance
   */
  async evaluateSupplier(
    supplierId: string,
    supplierName: string,
    deliveryHistory: Array<{ onTime: boolean; quality: number; price: number }>
  ): Promise<SupplierPerformance> {
    // Calculate reliability (on-time delivery rate)
    const onTimeDeliveries = deliveryHistory.filter(d => d.onTime).length;
    const reliabilityScore = (onTimeDeliveries / deliveryHistory.length) * 100;
    
    // Calculate average quality
    const avgQuality = deliveryHistory.reduce((sum, d) => sum + d.quality, 0) / deliveryHistory.length;
    const qualityScore = avgQuality;
    
    // Calculate average delivery time (simulated)
    const deliveryTimeAvg = 3 + Math.random() * 4; // 3-7 days
    
    // Calculate price competitiveness (simulated)
    const avgPrice = deliveryHistory.reduce((sum, d) => sum + d.price, 0) / deliveryHistory.length;
    const marketAvgPrice = avgPrice * (0.95 + Math.random() * 0.1);
    const priceCompetitiveness = (marketAvgPrice / avgPrice) * 100;
    
    // Calculate overall rating
    const overallRating = (
      reliabilityScore * 0.35 +
      qualityScore * 0.35 +
      priceCompetitiveness * 0.30
    );
    
    // Identify strengths and weaknesses
    const { strengths, weaknesses } = this.analyzeSupplierPerformance(
      reliabilityScore,
      qualityScore,
      deliveryTimeAvg,
      priceCompetitiveness
    );
    
    return {
      supplier_id: supplierId,
      supplier_name: supplierName,
      reliability_score: Math.round(reliabilityScore),
      quality_score: Math.round(qualityScore),
      delivery_time_avg_days: Math.round(deliveryTimeAvg * 10) / 10,
      price_competitiveness: Math.round(priceCompetitiveness),
      overall_rating: Math.round(overallRating),
      strengths,
      weaknesses
    };
  }

  /**
   * Predict demand for supply chain planning
   */
  async predictDemand(
    product: string,
    historicalSales: number[],
    seasonalFactors?: number[]
  ): Promise<{
    next_week: number;
    next_month: number;
    next_quarter: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    // Calculate moving average
    const recentSales = historicalSales.slice(-7);
    const movingAvg = recentSales.reduce((a, b) => a + b, 0) / recentSales.length;
    
    // Detect trend
    const firstHalf = historicalSales.slice(0, Math.floor(historicalSales.length / 2));
    const secondHalf = historicalSales.slice(Math.floor(historicalSales.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (avgSecond > avgFirst * 1.05) trend = 'increasing';
    else if (avgSecond < avgFirst * 0.95) trend = 'decreasing';
    
    // Apply seasonal factors if provided
    const seasonalFactor = seasonalFactors?.[new Date().getMonth()] || 1.0;
    
    // Predict future demand
    let nextWeek = movingAvg * seasonalFactor;
    let nextMonth = movingAvg * seasonalFactor * 4;
    let nextQuarter = movingAvg * seasonalFactor * 12;
    
    if (trend === 'increasing') {
      nextWeek *= 1.05;
      nextMonth *= 1.10;
      nextQuarter *= 1.15;
    } else if (trend === 'decreasing') {
      nextWeek *= 0.95;
      nextMonth *= 0.90;
      nextQuarter *= 0.85;
    }
    
    // Calculate confidence
    const variance = historicalSales.reduce((sum, val) => 
      sum + Math.pow(val - movingAvg, 2), 0
    ) / historicalSales.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / movingAvg;
    const confidence = Math.max(0.3, Math.min(0.95, 1 - cv));
    
    return {
      next_week: Math.round(nextWeek),
      next_month: Math.round(nextMonth),
      next_quarter: Math.round(nextQuarter),
      confidence: Math.round(confidence * 100) / 100,
      trend
    };
  }

  /**
   * Private helper methods
   */
  private clusterAndPrioritize(
    deliveries: Array<{ destination: string; priority: number; weight_kg: number }>
  ): typeof deliveries {
    // Sort by priority first, then by location clustering
    return deliveries.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.destination.localeCompare(b.destination);
    });
  }

  private calculateOptimalRoutes(
    deliveries: Array<{ destination: string; priority: number; weight_kg: number }>
  ): Route[] {
    const routes: Route[] = [];
    let currentOrigin = 'Douala'; // Default starting point
    
    deliveries.forEach((delivery, index) => {
      const distance = this.calculateDistance(currentOrigin, delivery.destination);
      const time = this.estimateTime(distance, delivery.weight_kg);
      const cost = this.calculateCost(distance, delivery.weight_kg);
      const quality = this.assessRouteQuality(distance, time);
      
      routes.push({
        id: `ROUTE-${index + 1}`,
        origin: currentOrigin,
        destination: delivery.destination,
        distance_km: distance,
        estimated_time_hours: time,
        cost_fcfa: cost,
        route_quality: quality,
        waypoints: this.generateWaypoints(currentOrigin, delivery.destination)
      });
      
      currentOrigin = delivery.destination;
    });
    
    return routes;
  }

  private calculateDistance(origin: string, destination: string): number {
    // Simplified distance calculation (would use real mapping API)
    const distances: Record<string, Record<string, number>> = {
      'Douala': { 'Yaoundé': 250, 'Bafoussam': 280, 'Garoua': 950, 'Bamenda': 370 },
      'Yaoundé': { 'Douala': 250, 'Bafoussam': 270, 'Garoua': 850, 'Bamenda': 380 },
      'Bafoussam': { 'Douala': 280, 'Yaoundé': 270, 'Garoua': 720, 'Bamenda': 120 }
    };
    
    return distances[origin]?.[destination] || 100 + Math.random() * 400;
  }

  private estimateTime(distance: number, weight: number): number {
    const baseSpeed = 60; // km/h
    const weightFactor = 1 + (weight / 1000) * 0.1; // Slower with more weight
    return (distance / baseSpeed) * weightFactor;
  }

  private calculateCost(distance: number, weight: number): number {
    const fuelCostPerKm = 150; // FCFA
    const weightCostPerKg = 50; // FCFA
    return (distance * fuelCostPerKm) + (weight * weightCostPerKg);
  }

  private assessRouteQuality(distance: number, time: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const efficiency = distance / time;
    if (efficiency > 50) return 'excellent';
    if (efficiency > 40) return 'good';
    if (efficiency > 30) return 'fair';
    return 'poor';
  }

  private generateWaypoints(origin: string, destination: string): string[] {
    // Simplified waypoint generation
    return [`${origin} Centre`, `Route ${destination}`, `${destination} Entrée`];
  }

  private calculateOptimizationScore(
    routes: Route[],
    deliveries: Array<{ destination: string; priority: number; weight_kg: number }>
  ): number {
    // Score based on route efficiency and priority alignment
    let score = 100;
    
    // Penalize long routes
    const avgDistance = routes.reduce((sum, r) => sum + r.distance_km, 0) / routes.length;
    if (avgDistance > 300) score -= 10;
    if (avgDistance > 500) score -= 20;
    
    // Reward good route quality
    const excellentRoutes = routes.filter(r => r.route_quality === 'excellent').length;
    score += excellentRoutes * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateFuelEfficiency(totalDistance: number, deliveries: any[]): number {
    const totalWeight = deliveries.reduce((sum, d) => sum + d.weight_kg, 0);
    const efficiency = (totalWeight / totalDistance) * 10; // kg per km
    return Math.round(efficiency * 10) / 10;
  }

  private calculateCarbonFootprint(distance: number): number {
    const co2PerKm = 0.12; // kg CO2 per km (average truck)
    return Math.round(distance * co2PerKm);
  }

  private generateLogisticsRecommendations(
    routes: Route[],
    optimizationScore: number,
    fuelEfficiency: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (optimizationScore < 70) {
      recommendations.push('🚚 Regrouper les livraisons par zone géographique');
      recommendations.push('📅 Planifier les livraisons aux heures creuses');
    }
    
    if (fuelEfficiency < 5) {
      recommendations.push('⛽ Optimiser le chargement pour améliorer l\'efficacité');
    }
    
    const poorRoutes = routes.filter(r => r.route_quality === 'poor' || r.route_quality === 'fair');
    if (poorRoutes.length > 0) {
      recommendations.push('🗺️ Rechercher des itinéraires alternatifs plus rapides');
    }
    
    recommendations.push('💡 Utiliser un système de suivi GPS en temps réel');
    recommendations.push('📊 Analyser les données historiques pour améliorer la planification');
    
    return recommendations;
  }

  private calculateOptimalStock(avgDailySales: number, leadTimeDays: number): number {
    // EOQ-inspired calculation
    const demandPerMonth = avgDailySales * 30;
    const orderingCost = 5000; // FCFA per order
    const holdingCostPerUnit = 50; // FCFA per unit per month
    
    const eoq = Math.sqrt((2 * demandPerMonth * orderingCost) / holdingCostPerUnit);
    return Math.round(eoq);
  }

  private assessStockoutRisk(daysUntilStockout: number, leadTimeDays: number): 'low' | 'medium' | 'high' {
    if (daysUntilStockout > leadTimeDays * 2) return 'low';
    if (daysUntilStockout > leadTimeDays) return 'medium';
    return 'high';
  }

  private generateInventoryRecommendations(
    currentStock: number,
    optimalStock: number,
    daysUntilStockout: number,
    risk: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations: string[] = [];
    
    if (risk === 'high') {
      recommendations.push('🚨 URGENT: Commander immédiatement pour éviter la rupture de stock');
      recommendations.push('📞 Contacter les fournisseurs pour une livraison express');
    } else if (risk === 'medium') {
      recommendations.push('⚠️ Planifier une commande dans les prochains jours');
    }
    
    if (currentStock > optimalStock * 1.5) {
      recommendations.push('📦 Stock excédentaire - Envisager une promotion');
      recommendations.push('💰 Réduire les coûts de stockage en écoulant le surplus');
    } else if (currentStock < optimalStock * 0.5) {
      recommendations.push('📈 Augmenter le stock pour atteindre le niveau optimal');
    }
    
    recommendations.push(`📊 Jours de stock restants: ${Math.round(daysUntilStockout)}`);
    recommendations.push('🔄 Mettre en place un système de réapprovisionnement automatique');
    
    return recommendations;
  }

  private analyzeSupplierPerformance(
    reliability: number,
    quality: number,
    deliveryTime: number,
    priceComp: number
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (reliability > 90) strengths.push('Excellente fiabilité de livraison');
    else if (reliability < 70) weaknesses.push('Retards de livraison fréquents');
    
    if (quality > 85) strengths.push('Qualité des produits supérieure');
    else if (quality < 70) weaknesses.push('Problèmes de qualité récurrents');
    
    if (deliveryTime < 3) strengths.push('Délais de livraison rapides');
    else if (deliveryTime > 5) weaknesses.push('Délais de livraison trop longs');
    
    if (priceComp > 95) strengths.push('Prix très compétitifs');
    else if (priceComp < 85) weaknesses.push('Prix au-dessus du marché');
    
    return { strengths, weaknesses };
  }
}

export const supplyChainOptimizer = new SupplyChainOptimizer();
