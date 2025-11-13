'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ShoppingBag, Award, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReferralStats, UserReferralLevel } from '@/types/referral';

interface ReferralDashboardProps {
  stats: ReferralStats;
  level: UserReferralLevel;
  onViewDetails?: () => void;
}

export function ReferralDashboard({ stats, level, onViewDetails }: ReferralDashboardProps) {
  const getLevelColor = (levelName: string) => {
    switch (levelName) {
      case 'bronze':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'silver':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'platinum':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getLevelIcon = (levelName: string) => {
    switch (levelName) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '⭐';
    }
  };

  const progressToNextLevel =
    ((level.totalReferrals - (level.requiredReferrals - 1)) /
      (level.requiredReferrals - (level.requiredReferrals - 1))) *
    100;

  return (
    <div className="space-y-4">
      {/* Level Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{getLevelIcon(level.level)}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${getLevelColor(level.level)} font-bold uppercase`}>
                    {level.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">레벨</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  수수료율: <span className="font-bold text-primary">{level.commissionRate * 100}%</span>
                </p>
              </div>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>

          {/* Progress to next level */}
          {level.level !== 'platinum' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>다음 레벨까지</span>
                <span className="font-semibold">
                  {level.totalReferrals} / {level.requiredReferrals} 추천
                </span>
              </div>
              <Progress value={progressToNextLevel} className="h-2" />
            </div>
          )}

          {/* Benefits */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-2">혜택</p>
            <div className="flex flex-wrap gap-2">
              {level.benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">총 수익</p>
                <p className="text-lg font-bold text-green-600 truncate">
                  ₩{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Total Purchases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">추천 구매</p>
                <p className="text-lg font-bold truncate">{stats.totalPurchases}건</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pending Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">정산 대기</p>
                <p className="text-lg font-bold text-yellow-600 truncate">
                  ₩{stats.pendingRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Conversion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">전환율</p>
                <p className="text-lg font-bold truncate">{stats.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Products */}
      {stats.topProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">💰 인기 추천 제품</h3>
              {onViewDetails && (
                <Button variant="ghost" size="sm" onClick={onViewDetails} className="gap-1">
                  <span className="text-xs">더보기</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {stats.topProducts.slice(0, 3).map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.purchases}건 구매
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-2">
                    ₩{product.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
