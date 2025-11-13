'use client';

import { motion } from 'framer-motion';
import { Bell, BellOff, Trash2, Edit, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceAlert } from '@/types/price-alert';
import Link from 'next/link';

interface PriceAlertCardProps {
  alert: PriceAlert;
  onToggle?: (alertId: string) => void;
  onDelete?: (alertId: string) => void;
  onEdit?: (alertId: string) => void;
}

export function PriceAlertCard({ alert, onToggle, onDelete, onEdit }: PriceAlertCardProps) {
  const priceDropPercentage =
    alert.currentPrice > 0
      ? ((alert.targetPrice - alert.currentPrice) / alert.currentPrice) * 100
      : 0;

  const isTargetReached = alert.currentPrice <= alert.targetPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 ${isTargetReached ? 'border-2 border-green-500 bg-green-50/50' : ''}`}>
        <div className="flex gap-4">
          {/* Product Image */}
          <Link href={`/products/${alert.productId}`}>
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
              <img
                src={alert.productImage}
                alt={alert.productName}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link href={`/products/${alert.productId}`}>
                <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                  {alert.productName}
                </h4>
              </Link>

              {/* Status Badge */}
              {isTargetReached ? (
                <Badge className="bg-green-600 text-white flex-shrink-0">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  목표 달성!
                </Badge>
              ) : alert.isActive ? (
                <Badge variant="secondary" className="flex-shrink-0">
                  <Bell className="h-3 w-3 mr-1" />
                  추적 중
                </Badge>
              ) : (
                <Badge variant="outline" className="flex-shrink-0">
                  <BellOff className="h-3 w-3 mr-1" />
                  일시정지
                </Badge>
              )}
            </div>

            {/* Prices */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">현재가:</span>
                <span className="font-bold text-gray-900">
                  ₩{alert.currentPrice.toLocaleString()}
                </span>
                {priceDropPercentage !== 0 && (
                  <span
                    className={`text-xs font-medium ${
                      priceDropPercentage < 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {priceDropPercentage > 0 ? '+' : ''}
                    {priceDropPercentage.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">목표가:</span>
                <span className="font-bold text-primary">
                  ₩{alert.targetPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {!isTargetReached && (
              <div className="mb-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        (alert.targetPrice / alert.currentPrice) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
              </div>
            )}

            {/* Target Reached Message */}
            {isTargetReached && (
              <div className="mb-3 p-2 bg-green-100 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800 font-medium">
                  🎉 목표 가격에 도달했습니다! 지금 구매하세요.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle?.(alert.id)}
                className="gap-1 h-8 px-2"
              >
                {alert.isActive ? (
                  <>
                    <BellOff className="h-3 w-3" />
                    <span className="text-xs">일시정지</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-3 w-3" />
                    <span className="text-xs">다시 추적</span>
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(alert.id)}
                className="gap-1 h-8 px-2"
              >
                <Edit className="h-3 w-3" />
                <span className="text-xs">수정</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(alert.id)}
                className="gap-1 h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
                <span className="text-xs">삭제</span>
              </Button>

              <Link href={`/products/${alert.productId}`} className="ml-auto">
                <Button size="sm" className="h-8">
                  <span className="text-xs">제품 보기</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
