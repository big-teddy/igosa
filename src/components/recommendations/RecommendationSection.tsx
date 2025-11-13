'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecommendationCard } from './RecommendationCard';
import { recommendationService } from '@/lib/services/recommendation-service';
import type { ProductRecommendation, RecommendationType } from '@/types/recommendation';
import { Sparkles, ChevronRight, RefreshCw } from 'lucide-react';

interface RecommendationSectionProps {
  userId?: string;
  productId?: string;
  category?: string;
  type?: RecommendationType;
  title?: string;
  description?: string;
  limit?: number;
  showHeader?: boolean;
  onProductClick?: (productId: string) => void;
}

export function RecommendationSection({
  userId,
  productId,
  category,
  type = 'personalized',
  title,
  description,
  limit = 6,
  showHeader = true,
  onProductClick,
}: RecommendationSectionProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = () => {
    setLoading(true);
    try {
      const response = recommendationService.getRecommendations({
        userId,
        productId,
        category,
        type,
        limit,
      });

      setRecommendations(response.products);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [userId, productId, category, type, limit]);

  const handleProductClick = (recommendation: ProductRecommendation) => {
    // Track click
    if (userId) {
      recommendationService.trackInteraction(userId, 'click', {
        productId: recommendation.productId,
      });
    }

    onProductClick?.(recommendation.productId);
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const defaultTitle = title || getDefaultTitle(type);
  const defaultDescription = description || getDefaultDescription(type);

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">{defaultTitle}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{defaultDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.productId}
            recommendation={recommendation}
            onClick={() => handleProductClick(recommendation)}
          />
        ))}
      </div>
    </div>
  );
}

function getDefaultTitle(type: RecommendationType): string {
  switch (type) {
    case 'collaborative':
      return '비슷한 취향의 사용자들이 선택한 상품';
    case 'content_based':
      return '이 상품과 비슷한 상품';
    case 'popularity':
      return '지금 인기 있는 상품';
    case 'similar_products':
      return '유사한 다른 상품';
    case 'personalized':
    default:
      return '회원님을 위한 추천 상품';
  }
}

function getDefaultDescription(type: RecommendationType): string {
  switch (type) {
    case 'collaborative':
      return '같은 취향을 가진 사람들이 많이 구매한 상품이에요';
    case 'content_based':
      return '선택하신 상품과 유사한 속성을 가진 상품들입니다';
    case 'popularity':
      return '많은 사람들이 선택한 인기 상품을 확인해보세요';
    case 'similar_products':
      return '이 상품이 마음에 들지 않으신다면 이런 상품은 어떠세요?';
    case 'personalized':
    default:
      return 'AI가 회원님의 취향을 분석해 선택한 상품이에요';
  }
}
