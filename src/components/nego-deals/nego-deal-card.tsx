'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, TrendingDown, Zap, TrendingUp, ArrowUp } from 'lucide-react';
import { NegoDeal } from '@/types/nego-deal';
import { negoDealService } from '@/lib/services/nego-deal-service';
import { motion } from 'framer-motion';

interface NegoDealCardProps {
  deal: NegoDeal;
  onUpdate?: () => void;
}

export function NegoDealCard({ deal: initialDeal, onUpdate }: NegoDealCardProps) {
  const [deal, setDeal] = useState<NegoDeal>(initialDeal);
  const [isJoined, setIsJoined] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // 로그인 사용자 확인
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const uid = userData.email || userData.id || 'user-1';
      setUserId(uid);

      // 참여 여부 확인
      setIsJoined(negoDealService.hasJoined(deal.id, uid));
    }

    // 서비스에서 최신 데이터로 업데이트
    const updatedDeal = negoDealService.updateDealWithParticipants(initialDeal);
    setDeal(updatedDeal);
  }, [initialDeal, deal.id]);

  const timeUrgent = deal.hoursRemaining <= 24;
  const nearGoal = deal.progress >= 90;
  const nextTier = negoDealService.getNextTierInfo(deal);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={deal.productImage}
            alt={deal.productName}
            fill
            className="object-cover"
          />
          {deal.status === 'goal_reached' && (
            <Badge className="absolute top-3 right-3 bg-green-600">
              <Zap className="h-3 w-3 mr-1" />
              목표 달성!
            </Badge>
          )}
          {timeUrgent && deal.status === 'active' && (
            <Badge className="absolute top-3 right-3 bg-red-600">
              <Clock className="h-3 w-3 mr-1" />
              마감 임박
            </Badge>
          )}
          {nearGoal && deal.status === 'active' && !timeUrgent && (
            <Badge className="absolute top-3 right-3 bg-orange-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              거의 달성!
            </Badge>
          )}
          {isJoined && (
            <Badge className="absolute top-3 left-3 bg-blue-600">
              <Users className="h-3 w-3 mr-1" />
              참여 중
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white font-semibold text-sm">{deal.brand}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{deal.productName}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{deal.description}</p>
        </div>

        {/* 가격 정보 */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              ₩{deal.targetPrice.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ₩{deal.originalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {deal.discountRate}% 할인
            </Badge>
            <span className="text-sm text-green-600 font-medium">
              ₩{deal.savings.toLocaleString()} 절약
            </span>
          </div>
        </div>

        {/* 할인 단계 진행 (Discount Tiers) */}
        {deal.discountTiers && deal.discountTiers.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>할인 단계</span>
              {nextTier && (
                <span className="text-primary font-medium">
                  {nextTier.count}명 더 모으면 {nextTier.discount}% 할인!
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {deal.discountTiers.map((tier, idx) => {
                const isReached = deal.currentParticipants >= tier.participantCount;
                const isCurrent =
                  deal.currentParticipants >= tier.participantCount &&
                  (idx === deal.discountTiers!.length - 1 ||
                    deal.currentParticipants < deal.discountTiers![idx + 1].participantCount);

                return (
                  <motion.div
                    key={idx}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      isReached
                        ? isCurrent
                          ? 'bg-gradient-to-r from-primary to-accent'
                          : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {isCurrent && (
                      <div className="relative">
                        <ArrowUp className="h-3 w-3 text-primary absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs">
              {deal.discountTiers.map((tier, idx) => (
                <span
                  key={idx}
                  className={`${
                    deal.currentParticipants >= tier.participantCount
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {tier.discountRate}%
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 진행 상황 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {deal.currentParticipants}/{deal.targetParticipants}명 참여
              </span>
            </div>
            <span className="font-medium">{Math.round(deal.progress)}%</span>
          </div>
          <Progress value={deal.progress} className="h-2" />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{deal.hoursRemaining}시간 남음</span>
          </div>
        </div>

        {/* 하이라이트 */}
        <div className="flex flex-wrap gap-1">
          {deal.highlights.slice(0, 2).map((highlight, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {highlight}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/nego-deals/${deal.id}`} className="w-full">
          <Button className="w-full" size="lg">
            {isJoined
              ? '참여 완료 - 상세 보기'
              : deal.status === 'goal_reached'
                ? '목표 달성 - 지금 참여하기'
                : '지금 참여하기'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
