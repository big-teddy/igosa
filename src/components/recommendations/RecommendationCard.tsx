'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';
import type { ProductRecommendation } from '@/types/recommendation';

interface RecommendationCardProps {
  recommendation: ProductRecommendation;
  onClick?: () => void;
}

export function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const discountAmount = recommendation.originalPrice
    ? recommendation.originalPrice - recommendation.price
    : 0;

  return (
    <Link href={`/products/${recommendation.productId}`} onClick={onClick}>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer h-full">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            <Image
              src={recommendation.productImage}
              alt={recommendation.productName}
              fill
              className="object-cover rounded-t-lg"
            />
            {recommendation.discountRate && recommendation.discountRate > 0 && (
              <div className="absolute top-2 left-2">
                <Badge variant="destructive" className="font-bold">
                  {recommendation.discountRate}%
                </Badge>
              </div>
            )}
            {/* Recommendation score indicator */}
            {recommendation.score > 0.7 && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5">
                <Sparkles className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-2 md:p-3 space-y-1.5 md:space-y-2">
            {/* Recommendation reason */}
            <div className="flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span className="font-medium truncate">{recommendation.reason}</span>
            </div>

            {/* Product name */}
            <h3 className="font-semibold text-xs md:text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {recommendation.productName}
            </h3>

            {/* Price */}
            <div className="space-y-0.5 md:space-y-1">
              <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
                <span className="text-base md:text-lg font-bold">
                  ₩{recommendation.price.toLocaleString()}
                </span>
                {recommendation.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₩{recommendation.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  ₩{discountAmount.toLocaleString()} 절약
                </div>
              )}
            </div>

            {/* Match score */}
            {recommendation.score >= 0.5 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${recommendation.score * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-primary">
                  {Math.round(recommendation.score * 100)}% 일치
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
