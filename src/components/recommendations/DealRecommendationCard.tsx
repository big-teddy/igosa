'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, Users } from 'lucide-react';
import type { DealRecommendation } from '@/types/recommendation';

interface DealRecommendationCardProps {
  recommendation: DealRecommendation;
  onClick?: () => void;
}

export function DealRecommendationCard({ recommendation, onClick }: DealRecommendationCardProps) {
  const progress =
    (recommendation.currentParticipants / recommendation.targetParticipants) * 100;
  const remainingSlots = recommendation.targetParticipants - recommendation.currentParticipants;

  return (
    <Link href={`/nego-deals/${recommendation.dealId}`} onClick={onClick}>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer h-full">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            <Image
              src={recommendation.productImage}
              alt={recommendation.dealName}
              fill
              className="object-cover rounded-t-lg"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="font-bold">
                {recommendation.discountRate}% 할인
              </Badge>
            </div>
            {recommendation.score > 0.7 && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5">
                <Sparkles className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Recommendation reason */}
            <div className="flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium">{recommendation.reason}</span>
            </div>

            {/* Deal name */}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {recommendation.dealName}
            </h3>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  ₩{recommendation.targetPrice.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ₩{recommendation.originalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-green-600 font-medium">
                ₩{(recommendation.originalPrice - recommendation.targetPrice).toLocaleString()} 절약
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>
                    {recommendation.currentParticipants}/{recommendation.targetParticipants}명
                  </span>
                </div>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{remainingSlots}명 더 필요</p>
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
