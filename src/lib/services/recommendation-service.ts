/**
 * Recommendation Service
 * AI 기반 상품 및 딜 추천 시스템
 *
 * Features:
 * - 협업 필터링 (Collaborative Filtering)
 * - 콘텐츠 기반 필터링 (Content-based Filtering)
 * - 인기도 기반 추천
 * - 개인화 추천
 * - 유사 상품 추천
 * - 함께 구매한 상품 추천
 */

import type {
  ProductRecommendation,
  DealRecommendation,
  UserPreference,
  RecommendationRequest,
  RecommendationResponse,
  UserInteraction,
  InteractionType,
  RecommendationType,
} from '@/types/recommendation';
import { mockProducts } from '@/lib/data/mock-products';
import { mockNegoDeals } from '@/lib/data/mock-nego-deals';

const PREFERENCES_KEY = 'igosa_user_preferences';
const INTERACTIONS_KEY = 'igosa_user_interactions';

class RecommendationService {
  private static instance: RecommendationService;

  private constructor() {}

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  // ==================== USER PREFERENCES ====================

  /**
   * Get or create user preferences
   */
  getUserPreferences(userId: string): UserPreference {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (!stored) return this.createDefaultPreferences(userId);

      const allPreferences: UserPreference[] = JSON.parse(stored);
      const userPref = allPreferences.find((p) => p.userId === userId);

      return userPref || this.createDefaultPreferences(userId);
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return this.createDefaultPreferences(userId);
    }
  }

  /**
   * Create default preferences
   */
  private createDefaultPreferences(userId: string): UserPreference {
    return {
      userId,
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 1000000 },
      keywords: [],
      viewedProducts: [],
      purchasedProducts: [],
      likedProducts: [],
      joinedDeals: [],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, updates: Partial<UserPreference>): void {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      let allPreferences: UserPreference[] = stored ? JSON.parse(stored) : [];

      const index = allPreferences.findIndex((p) => p.userId === userId);
      const current = index >= 0 ? allPreferences[index] : this.createDefaultPreferences(userId);

      const updated: UserPreference = {
        ...current,
        ...updates,
        userId,
        updatedAt: new Date().toISOString(),
      };

      if (index >= 0) {
        allPreferences[index] = updated;
      } else {
        allPreferences.push(updated);
      }

      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allPreferences));
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  }

  // ==================== USER INTERACTIONS ====================

  /**
   * Track user interaction
   */
  trackInteraction(
    userId: string,
    type: InteractionType,
    data: {
      productId?: string;
      dealId?: string;
      category?: string;
      brand?: string;
      keyword?: string;
      metadata?: Record<string, any>;
    }
  ): void {
    try {
      const interaction: UserInteraction = {
        id: this.generateId(),
        userId,
        type,
        ...data,
        timestamp: new Date().toISOString(),
      };

      const stored = localStorage.getItem(INTERACTIONS_KEY);
      const interactions: UserInteraction[] = stored ? JSON.parse(stored) : [];
      interactions.unshift(interaction);

      // Keep only last 1000 interactions
      const trimmed = interactions.slice(0, 1000);
      localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(trimmed));

      // Update preferences based on interaction
      this.updatePreferencesFromInteraction(userId, interaction);
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  /**
   * Update preferences from interaction
   */
  private updatePreferencesFromInteraction(userId: string, interaction: UserInteraction): void {
    const preferences = this.getUserPreferences(userId);

    if (interaction.productId) {
      // Add to viewed products (keep last 50)
      if (interaction.type === 'view') {
        preferences.viewedProducts = [
          interaction.productId,
          ...preferences.viewedProducts.filter((id) => id !== interaction.productId),
        ].slice(0, 50);
      }

      // Add to purchased products
      if (interaction.type === 'purchase') {
        if (!preferences.purchasedProducts.includes(interaction.productId)) {
          preferences.purchasedProducts.push(interaction.productId);
        }
      }

      // Add to liked products
      if (interaction.type === 'like') {
        if (!preferences.likedProducts.includes(interaction.productId)) {
          preferences.likedProducts.push(interaction.productId);
        }
      }
    }

    if (interaction.category && !preferences.categories.includes(interaction.category)) {
      preferences.categories.push(interaction.category);
    }

    if (interaction.brand && !preferences.brands.includes(interaction.brand)) {
      preferences.brands.push(interaction.brand);
    }

    if (interaction.keyword && !preferences.keywords.includes(interaction.keyword)) {
      preferences.keywords = [interaction.keyword, ...preferences.keywords].slice(0, 20);
    }

    if (interaction.dealId && interaction.type === 'purchase') {
      if (!preferences.joinedDeals.includes(interaction.dealId)) {
        preferences.joinedDeals.push(interaction.dealId);
      }
    }

    this.updateUserPreferences(userId, preferences);
  }

  /**
   * Get user interactions
   */
  getUserInteractions(userId: string, limit = 100): UserInteraction[] {
    try {
      const stored = localStorage.getItem(INTERACTIONS_KEY);
      if (!stored) return [];

      const interactions: UserInteraction[] = JSON.parse(stored);
      return interactions.filter((i) => i.userId === userId).slice(0, limit);
    } catch (error) {
      console.error('Failed to get user interactions:', error);
      return [];
    }
  }

  // ==================== RECOMMENDATION ALGORITHMS ====================

  /**
   * Get personalized recommendations
   */
  getRecommendations(request: RecommendationRequest): RecommendationResponse {
    const {
      userId,
      productId,
      dealId,
      category,
      type = 'personalized',
      limit = 10,
      excludeIds = [],
    } = request;

    let products: ProductRecommendation[] = [];
    let deals: DealRecommendation[] = [];

    try {
      switch (type) {
        case 'collaborative':
          products = this.getCollaborativeRecommendations(userId, limit, excludeIds);
          break;
        case 'content_based':
          products = this.getContentBasedRecommendations(productId, limit, excludeIds);
          break;
        case 'popularity':
          products = this.getPopularityRecommendations(category, limit, excludeIds);
          break;
        case 'similar_products':
          products = this.getSimilarProducts(productId, limit, excludeIds);
          break;
        case 'personalized':
        default:
          products = this.getPersonalizedRecommendations(userId, limit, excludeIds);
          deals = this.getPersonalizedDealRecommendations(userId, 5, excludeIds);
          break;
      }

      return {
        products,
        deals,
        type,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return {
        products: [],
        deals: [],
        type,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Collaborative filtering recommendations
   * 유사한 사용자가 구매/좋아한 상품 추천
   */
  private getCollaborativeRecommendations(
    userId?: string,
    limit = 10,
    excludeIds: string[] = []
  ): ProductRecommendation[] {
    if (!userId) return [];

    try {
      const userPrefs = this.getUserPreferences(userId);
      const allInteractions = this.getAllInteractions();

      // Find similar users (users who purchased/liked similar products)
      const similarUsers = this.findSimilarUsers(userId, allInteractions);

      // Get products that similar users liked but current user hasn't seen
      const recommendedProducts = new Map<string, number>();

      similarUsers.forEach(({ userId: similarUserId, similarity }) => {
        const similarUserPrefs = this.getUserPreferences(similarUserId);

        [...similarUserPrefs.purchasedProducts, ...similarUserPrefs.likedProducts].forEach(
          (productId) => {
            if (
              !excludeIds.includes(productId) &&
              !userPrefs.viewedProducts.includes(productId) &&
              !userPrefs.purchasedProducts.includes(productId)
            ) {
              const currentScore = recommendedProducts.get(productId) || 0;
              recommendedProducts.set(productId, currentScore + similarity);
            }
          }
        );
      });

      // Convert to recommendations
      const recommendations: ProductRecommendation[] = [];
      recommendedProducts.forEach((score, productId) => {
        const product = mockProducts.find((p) => p.id === productId);
        if (product) {
          recommendations.push({
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl,
            price: product.price,
            originalPrice: product.originalPrice,
            discountRate: product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : undefined,
            score: Math.min(score, 1),
            reason: '비슷한 취향의 사용자들이 선택했어요',
            type: 'collaborative',
          });
        }
      });

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get collaborative recommendations:', error);
      return [];
    }
  }

  /**
   * Content-based filtering recommendations
   * 상품 속성 기반 유사 상품 추천
   */
  private getContentBasedRecommendations(
    productId?: string,
    limit = 10,
    excludeIds: string[] = []
  ): ProductRecommendation[] {
    if (!productId) return [];

    const targetProduct = mockProducts.find((p) => p.id === productId);
    if (!targetProduct) return [];

    const recommendations: ProductRecommendation[] = mockProducts
      .filter((p) => p.id !== productId && !excludeIds.includes(p.id))
      .map((product) => {
        const score = this.calculateProductSimilarity(targetProduct, product);

        return {
          productId: product.id,
          productName: product.name,
          productImage: product.imageUrl,
          price: product.price,
          originalPrice: product.originalPrice,
          discountRate: product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : undefined,
          score,
          reason: '이 상품과 비슷한 상품이에요',
          type: 'content_based' as RecommendationType,
        };
      })
      .filter((r) => r.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Popularity-based recommendations
   * 인기 상품 추천
   */
  private getPopularityRecommendations(
    category?: string,
    limit = 10,
    excludeIds: string[] = []
  ): ProductRecommendation[] {
    let products = mockProducts.filter((p) => !excludeIds.includes(p.id));

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    const recommendations: ProductRecommendation[] = products
      .map((product) => {
        // Calculate popularity score based on rating and sales
        const ratingScore = (product.rating || 0) / 5;
        const salesScore = Math.min((product.reviewCount || 0) / 1000, 1);
        const discountRate = product.originalPrice
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0;
        const discountScore = discountRate / 100;

        const score = ratingScore * 0.5 + salesScore * 0.3 + discountScore * 0.2;

        return {
          productId: product.id,
          productName: product.name,
          productImage: product.imageUrl,
          price: product.price,
          originalPrice: product.originalPrice,
          discountRate,
          score,
          reason: '많은 사람들이 선택한 인기 상품이에요',
          type: 'popularity' as RecommendationType,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Similar products recommendations
   */
  private getSimilarProducts(
    productId?: string,
    limit = 10,
    excludeIds: string[] = []
  ): ProductRecommendation[] {
    return this.getContentBasedRecommendations(productId, limit, excludeIds);
  }

  /**
   * Personalized recommendations
   * 사용자 프로필 기반 개인화 추천
   */
  private getPersonalizedRecommendations(
    userId?: string,
    limit = 10,
    excludeIds: string[] = []
  ): ProductRecommendation[] {
    if (!userId) {
      return this.getPopularityRecommendations(undefined, limit, excludeIds);
    }

    try {
      const preferences = this.getUserPreferences(userId);
      const interactions = this.getUserInteractions(userId, 50);

      // Calculate personalized scores
      const recommendations: ProductRecommendation[] = mockProducts
        .filter((p) => !excludeIds.includes(p.id))
        .filter((p) => !preferences.purchasedProducts.includes(p.id))
        .map((product) => {
          let score = 0;

          // Category match (30%)
          if (preferences.categories.includes(product.category || '')) {
            score += 0.3;
          }

          // Brand match (20%)
          if (preferences.brands.includes(product.brand || '')) {
            score += 0.2;
          }

          // Price range match (10%)
          if (
            product.price >= preferences.priceRange.min &&
            product.price <= preferences.priceRange.max
          ) {
            score += 0.1;
          }

          // Keyword match (10%)
          const nameWords = product.name.toLowerCase().split(' ');
          const keywordMatch = preferences.keywords.some((keyword) =>
            nameWords.some((word) => word.includes(keyword.toLowerCase()))
          );
          if (keywordMatch) {
            score += 0.1;
          }

          // Popularity (15%)
          const popularityScore = ((product.rating || 0) / 5) * 0.15;
          score += popularityScore;

          // Discount (15%)
          const discountRate = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;
          const discountScore = (discountRate / 100) * 0.15;
          score += discountScore;

          // Similar to viewed products
          const viewedSimilarity = preferences.viewedProducts
            .slice(0, 5)
            .map((viewedId) => {
              const viewedProduct = mockProducts.find((p) => p.id === viewedId);
              return viewedProduct ? this.calculateProductSimilarity(viewedProduct, product) : 0;
            })
            .reduce((max, score) => Math.max(max, score), 0);

          score = Math.max(score, viewedSimilarity);

          return {
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl,
            price: product.price,
            originalPrice: product.originalPrice,
            discountRate,
            score: Math.min(score, 1),
            reason: this.getPersonalizedReason(preferences, product),
            type: 'personalized' as RecommendationType,
          };
        })
        .filter((r) => r.score > 0.2)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return this.getPopularityRecommendations(undefined, limit, excludeIds);
    }
  }

  /**
   * Personalized deal recommendations
   */
  private getPersonalizedDealRecommendations(
    userId?: string,
    limit = 5,
    excludeIds: string[] = []
  ): DealRecommendation[] {
    if (!userId) return [];

    try {
      const preferences = this.getUserPreferences(userId);

      const recommendations: DealRecommendation[] = mockNegoDeals
        .filter((d) => !excludeIds.includes(d.id))
        .filter((d) => !preferences.joinedDeals.includes(d.id))
        .map((deal) => {
          let score = 0;

          // Category match (if available)
          const dealCategory = (deal as any).category;
          if (dealCategory && preferences.categories.includes(dealCategory)) {
            score += 0.3;
          }

          // Brand match
          if (preferences.brands.includes(deal.brand || '')) {
            score += 0.2;
          }

          // Price range match
          if (
            deal.targetPrice >= preferences.priceRange.min &&
            deal.targetPrice <= preferences.priceRange.max
          ) {
            score += 0.1;
          }

          // Discount rate (higher is better)
          score += (deal.discountRate / 100) * 0.2;

          // Progress (closer to goal is better)
          score += (deal.progress / 100) * 0.2;

          return {
            dealId: deal.id,
            dealName: deal.productName,
            productImage: deal.productImage,
            targetPrice: deal.targetPrice,
            originalPrice: deal.originalPrice,
            discountRate: deal.discountRate,
            currentParticipants: deal.currentParticipants,
            targetParticipants: deal.targetParticipants,
            score: Math.min(score, 1),
            reason: this.getDealRecommendationReason(preferences, deal),
            type: 'personalized' as RecommendationType,
          };
        })
        .filter((r) => r.score > 0.2)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Failed to get personalized deal recommendations:', error);
      return [];
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Calculate product similarity (0-1)
   */
  private calculateProductSimilarity(product1: any, product2: any): number {
    let similarity = 0;

    // Same category (40%)
    if (product1.category === product2.category) {
      similarity += 0.4;
    }

    // Same brand (30%)
    if (product1.brand === product2.brand) {
      similarity += 0.3;
    }

    // Similar price range (20%)
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const priceSimlarity = Math.max(0, 1 - priceDiff / avgPrice);
    similarity += priceSimlarity * 0.2;

    // Similar name (10%)
    const name1Words = product1.name.toLowerCase().split(' ');
    const name2Words = product2.name.toLowerCase().split(' ');
    const commonWords = name1Words.filter((word: string) => name2Words.includes(word));
    const nameSimlarity = commonWords.length / Math.max(name1Words.length, name2Words.length);
    similarity += nameSimlarity * 0.1;

    return similarity;
  }

  /**
   * Find similar users (collaborative filtering)
   */
  private findSimilarUsers(
    userId: string,
    allInteractions: UserInteraction[]
  ): Array<{ userId: string; similarity: number }> {
    const userPrefs = this.getUserPreferences(userId);
    const userProducts = new Set([
      ...userPrefs.purchasedProducts,
      ...userPrefs.likedProducts,
    ]);

    // Group interactions by user
    const userInteractionsMap = new Map<string, Set<string>>();
    allInteractions.forEach((interaction) => {
      if (
        interaction.userId !== userId &&
        (interaction.type === 'purchase' || interaction.type === 'like') &&
        interaction.productId
      ) {
        if (!userInteractionsMap.has(interaction.userId)) {
          userInteractionsMap.set(interaction.userId, new Set());
        }
        userInteractionsMap.get(interaction.userId)!.add(interaction.productId);
      }
    });

    // Calculate Jaccard similarity
    const similarities: Array<{ userId: string; similarity: number }> = [];
    userInteractionsMap.forEach((products, otherUserId) => {
      const intersection = Array.from(products).filter((p) => userProducts.has(p)).length;
      const union = userProducts.size + products.size - intersection;
      const similarity = union > 0 ? intersection / union : 0;

      if (similarity > 0.1) {
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  }

  /**
   * Get all interactions
   */
  private getAllInteractions(): UserInteraction[] {
    try {
      const stored = localStorage.getItem(INTERACTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get all interactions:', error);
      return [];
    }
  }

  /**
   * Get personalized reason
   */
  private getPersonalizedReason(preferences: UserPreference, product: any): string {
    if (preferences.categories.includes(product.category || '')) {
      return `${product.category} 카테고리를 좋아하시는군요!`;
    }
    if (preferences.brands.includes(product.brand || '')) {
      return `${product.brand} 브랜드를 선호하시는군요!`;
    }
    const discountRate = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
    if (discountRate > 30) {
      return '높은 할인율의 특가 상품이에요!';
    }
    if (product.rating && product.rating >= 4.5) {
      return '고객 평점이 높은 인기 상품이에요!';
    }
    return '회원님께 딱 맞는 상품이에요!';
  }

  /**
   * Get deal recommendation reason
   */
  private getDealRecommendationReason(preferences: UserPreference, deal: any): string {
    const dealCategory = (deal as any).category;
    if (dealCategory && preferences.categories.includes(dealCategory)) {
      return `관심 카테고리의 네고딜이에요!`;
    }
    if (preferences.brands.includes(deal.brand || '')) {
      return `좋아하는 브랜드의 네고딜이에요!`;
    }
    if (deal.progress >= 80) {
      return '곧 목표 달성! 지금 참여하세요!';
    }
    if (deal.discountRate >= 40) {
      return `최대 ${deal.discountRate}% 할인 찬스!`;
    }
    return '인기 있는 네고딜이에요!';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(PREFERENCES_KEY);
    localStorage.removeItem(INTERACTIONS_KEY);
  }
}

// Export singleton instance
export const recommendationService = RecommendationService.getInstance();
