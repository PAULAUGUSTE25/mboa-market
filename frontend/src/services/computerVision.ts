/**
 * Computer Vision for Real-time Quality Assessment
 * MBOA Market - Excellence Platform
 */

export interface QualityAssessment {
  product_id: string;
  product_name: string;
  overall_score: number;
  quality_grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  freshness: number;
  appearance: number;
  size_consistency: number;
  color_quality: number;
  defects: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    location: string;
  }[];
  recommendations: string[];
  price_adjustment: number;
  confidence: number;
}

export interface ImageAnalysis {
  image_url: string;
  detected_objects: {
    label: string;
    confidence: number;
    bounding_box: { x: number; y: number; width: number; height: number };
  }[];
  dominant_colors: string[];
  brightness: number;
  contrast: number;
  sharpness: number;
}

class ComputerVisionEngine {
  /**
   * Assess product quality from images
   */
  async assessProductQuality(
    productName: string,
    images: string[],
    category: string
  ): Promise<QualityAssessment> {
    // Simulate image analysis
    const imageAnalysis = await this.analyzeImages(images);
    
    // Calculate quality metrics
    const freshness = this.assessFreshness(imageAnalysis, category);
    const appearance = this.assessAppearance(imageAnalysis);
    const sizeConsistency = this.assessSizeConsistency(imageAnalysis);
    const colorQuality = this.assessColorQuality(imageAnalysis, category);
    
    // Detect defects
    const defects = this.detectDefects(imageAnalysis, category);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(
      freshness,
      appearance,
      sizeConsistency,
      colorQuality,
      defects
    );
    
    // Determine quality grade
    const qualityGrade = this.determineGrade(overallScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      freshness,
      appearance,
      defects,
      qualityGrade
    );
    
    // Calculate price adjustment
    const priceAdjustment = this.calculatePriceAdjustment(overallScore, qualityGrade);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(imageAnalysis);
    
    return {
      product_id: Date.now().toString(),
      product_name: productName,
      overall_score: overallScore,
      quality_grade: qualityGrade,
      freshness,
      appearance,
      size_consistency: sizeConsistency,
      color_quality: colorQuality,
      defects,
      recommendations,
      price_adjustment: priceAdjustment,
      confidence
    };
  }

  /**
   * Analyze images using computer vision
   */
  private async analyzeImages(images: string[]): Promise<ImageAnalysis[]> {
    return images.map(image => ({
      image_url: image,
      detected_objects: this.detectObjects(image),
      dominant_colors: this.extractDominantColors(image),
      brightness: 0.5 + Math.random() * 0.5,
      contrast: 0.5 + Math.random() * 0.5,
      sharpness: 0.5 + Math.random() * 0.5
    }));
  }

  /**
   * Detect objects in image
   */
  private detectObjects(imageUrl: string): any[] {
    // Simulate object detection
    const objects = [
      { label: 'product', confidence: 0.85 + Math.random() * 0.15 },
      { label: 'container', confidence: 0.7 + Math.random() * 0.3 }
    ];
    
    return objects.map(obj => ({
      ...obj,
      bounding_box: {
        x: Math.random() * 100,
        y: Math.random() * 100,
        width: 50 + Math.random() * 50,
        height: 50 + Math.random() * 50
      }
    }));
  }

  /**
   * Extract dominant colors from image
   */
  private extractDominantColors(imageUrl: string): string[] {
    const colors = [
      '#2D5016', '#4A7C2C', '#6B9D3E', // Green tones
      '#8B4513', '#A0522D', '#CD853F', // Brown tones
      '#FFD700', '#FFA500', '#FF8C00', // Yellow/Orange tones
      '#DC143C', '#FF0000', '#8B0000'  // Red tones
    ];
    
    // Return 3-5 random colors
    const count = 3 + Math.floor(Math.random() * 3);
    return colors.sort(() => Math.random() - 0.5).slice(0, count);
  }

  /**
   * Assess freshness based on visual cues
   */
  private assessFreshness(analysis: ImageAnalysis[], category: string): number {
    // Freshness indicators:
    // - Color vibrancy
    // - Surface texture
    // - Absence of wilting/browning
    
    const avgBrightness = analysis.reduce((sum, a) => sum + a.brightness, 0) / analysis.length;
    const avgContrast = analysis.reduce((sum, a) => sum + a.contrast, 0) / analysis.length;
    
    let freshnessScore = (avgBrightness * 0.6 + avgContrast * 0.4) * 100;
    
    // Category-specific adjustments
    if (category === 'légumes' || category === 'fruits') {
      freshnessScore *= 1.1; // Higher weight for produce
    }
    
    return Math.min(100, Math.round(freshnessScore));
  }

  /**
   * Assess appearance quality
   */
  private assessAppearance(analysis: ImageAnalysis[]): number {
    const avgSharpness = analysis.reduce((sum, a) => sum + a.sharpness, 0) / analysis.length;
    const avgContrast = analysis.reduce((sum, a) => sum + a.contrast, 0) / analysis.length;
    
    const appearanceScore = (avgSharpness * 0.5 + avgContrast * 0.5) * 100;
    return Math.round(appearanceScore);
  }

  /**
   * Assess size consistency
   */
  private assessSizeConsistency(analysis: ImageAnalysis[]): number {
    if (analysis.length === 0) return 50;
    
    // Simulate size variance detection
    const sizes = analysis.map(a => 
      a.detected_objects.reduce((sum, obj) => sum + obj.bounding_box.width * obj.bounding_box.height, 0)
    );
    
    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgSize;
    
    // Lower coefficient of variation = higher consistency
    const consistencyScore = Math.max(0, 100 - cv * 100);
    return Math.round(consistencyScore);
  }

  /**
   * Assess color quality
   */
  private assessColorQuality(analysis: ImageAnalysis[], category: string): number {
    // Expected colors for different categories
    const expectedColors: Record<string, string[]> = {
      'légumes': ['#2D5016', '#4A7C2C', '#6B9D3E'],
      'fruits': ['#FFD700', '#FFA500', '#FF8C00', '#DC143C'],
      'céréales': ['#FFD700', '#F4A460', '#DEB887'],
      'viande': ['#DC143C', '#8B0000', '#A52A2A']
    };
    
    const expected = expectedColors[category] || expectedColors['légumes'];
    
    // Calculate color match score
    let matchScore = 0;
    analysis.forEach(a => {
      a.dominant_colors.forEach(color => {
        if (expected.some(exp => this.colorDistance(color, exp) < 50)) {
          matchScore += 10;
        }
      });
    });
    
    return Math.min(100, matchScore);
  }

  /**
   * Calculate color distance (simplified)
   */
  private colorDistance(color1: string, color2: string): number {
    // Simple hex color distance
    return Math.abs(parseInt(color1.slice(1), 16) - parseInt(color2.slice(1), 16)) / 16777215 * 100;
  }

  /**
   * Detect defects in products
   */
  private detectDefects(analysis: ImageAnalysis[], category: string): any[] {
    const defects: any[] = [];
    
    // Simulate defect detection
    const defectProbability = Math.random();
    
    if (defectProbability < 0.3) {
      defects.push({
        type: 'Taches de surface',
        severity: 'low' as const,
        location: 'Surface supérieure'
      });
    }
    
    if (defectProbability < 0.15) {
      defects.push({
        type: 'Décoloration',
        severity: 'medium' as const,
        location: 'Zone centrale'
      });
    }
    
    if (defectProbability < 0.05) {
      defects.push({
        type: 'Dommages physiques',
        severity: 'high' as const,
        location: 'Bord gauche'
      });
    }
    
    return defects;
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(
    freshness: number,
    appearance: number,
    sizeConsistency: number,
    colorQuality: number,
    defects: any[]
  ): number {
    // Weighted average
    let score = (
      freshness * 0.35 +
      appearance * 0.25 +
      sizeConsistency * 0.20 +
      colorQuality * 0.20
    );
    
    // Deduct points for defects
    defects.forEach(defect => {
      if (defect.severity === 'high') score -= 15;
      else if (defect.severity === 'medium') score -= 8;
      else score -= 3;
    });
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Determine quality grade
   */
  private determineGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B+';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  }

  /**
   * Generate quality improvement recommendations
   */
  private generateRecommendations(
    freshness: number,
    appearance: number,
    defects: any[],
    grade: string
  ): string[] {
    const recommendations: string[] = [];
    
    if (freshness < 70) {
      recommendations.push('🌡️ Améliorer les conditions de stockage (température et humidité)');
      recommendations.push('⏱️ Réduire le temps entre la récolte et la vente');
    }
    
    if (appearance < 70) {
      recommendations.push('📸 Améliorer la présentation et le nettoyage des produits');
      recommendations.push('📦 Utiliser un emballage plus approprié');
    }
    
    if (defects.length > 0) {
      recommendations.push('🔍 Effectuer un tri plus rigoureux avant la mise en vente');
      recommendations.push('🛡️ Améliorer la protection pendant le transport');
    }
    
    if (grade === 'A+' || grade === 'A') {
      recommendations.push('⭐ Excellente qualité ! Mettez en avant ce produit premium');
      recommendations.push('💰 Prix recommandé: +15% à +25% au-dessus du marché');
    } else if (grade === 'B+' || grade === 'B') {
      recommendations.push('✅ Bonne qualité standard pour le marché');
      recommendations.push('💰 Prix recommandé: Prix du marché');
    } else {
      recommendations.push('⚠️ Qualité à améliorer avant la vente');
      recommendations.push('💰 Prix recommandé: -10% à -20% en dessous du marché');
    }
    
    return recommendations;
  }

  /**
   * Calculate price adjustment based on quality
   */
  private calculatePriceAdjustment(score: number, grade: string): number {
    const adjustments: Record<string, number> = {
      'A+': 25,
      'A': 15,
      'B+': 5,
      'B': 0,
      'C': -10,
      'D': -20
    };
    
    return adjustments[grade] || 0;
  }

  /**
   * Calculate confidence in assessment
   */
  private calculateConfidence(analysis: ImageAnalysis[]): number {
    if (analysis.length === 0) return 0.3;
    
    // More images = higher confidence
    const imageCountFactor = Math.min(1, analysis.length / 5);
    
    // Higher quality images = higher confidence
    const avgSharpness = analysis.reduce((sum, a) => sum + a.sharpness, 0) / analysis.length;
    const avgBrightness = analysis.reduce((sum, a) => sum + a.brightness, 0) / analysis.length;
    
    const qualityFactor = (avgSharpness + avgBrightness) / 2;
    
    const confidence = (imageCountFactor * 0.4 + qualityFactor * 0.6);
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Compare products for quality ranking
   */
  async compareProducts(
    products: Array<{ name: string; images: string[]; category: string }>
  ): Promise<QualityAssessment[]> {
    const assessments = await Promise.all(
      products.map(p => this.assessProductQuality(p.name, p.images, p.category))
    );
    
    // Sort by overall score
    return assessments.sort((a, b) => b.overall_score - a.overall_score);
  }

  /**
   * Get quality statistics
   */
  getQualityStatistics(assessments: QualityAssessment[]): {
    average_score: number;
    grade_distribution: Record<string, number>;
    common_defects: string[];
    avg_price_adjustment: number;
  } {
    const avgScore = assessments.reduce((sum, a) => sum + a.overall_score, 0) / assessments.length;
    
    const gradeDistribution: Record<string, number> = {};
    assessments.forEach(a => {
      gradeDistribution[a.quality_grade] = (gradeDistribution[a.quality_grade] || 0) + 1;
    });
    
    const allDefects = assessments.flatMap(a => a.defects.map(d => d.type));
    const defectCounts: Record<string, number> = {};
    allDefects.forEach(d => {
      defectCounts[d] = (defectCounts[d] || 0) + 1;
    });
    const commonDefects = Object.entries(defectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([defect]) => defect);
    
    const avgPriceAdjustment = assessments.reduce((sum, a) => sum + a.price_adjustment, 0) / assessments.length;
    
    return {
      average_score: Math.round(avgScore),
      grade_distribution: gradeDistribution,
      common_defects: commonDefects,
      avg_price_adjustment: Math.round(avgPriceAdjustment)
    };
  }
}

export const computerVision = new ComputerVisionEngine();
