/**
 * 희망 가격 설정 위젯
 *
 * 네고딜 2.0: 사용자가 원하는 가격을 직접 설정
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Bell, Check, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface SetTargetPriceWidgetProps {
  productId: string;
  productName: string;
  currentPrice: number;
  minPrice: number;  // 최근 30일 최저가
  avgPrice: number;  // 평균 가격
}

export function SetTargetPriceWidget({
  productId,
  productName,
  currentPrice,
  minPrice,
  avgPrice,
}: SetTargetPriceWidgetProps) {
  // 초기값: 최저가 근처
  const [targetPrice, setTargetPrice] = useState(minPrice);
  const [isTracking, setIsTracking] = useState(false);

  // 가격 범위: 현재가의 -30% ~ +10%
  const priceMin = Math.floor(currentPrice * 0.7);
  const priceMax = Math.ceil(currentPrice * 1.1);

  // 절감액 계산
  const savings = currentPrice - targetPrice;
  const savingsPercent = ((savings / currentPrice) * 100).toFixed(1);

  // 달성 확률 계산 (간단한 휴리스틱)
  const calculateProbability = (target: number) => {
    if (target >= currentPrice) return 0.95;
    if (target >= avgPrice) return 0.75;
    if (target >= minPrice) return 0.50;
    return 0.25;
  };

  const probability = calculateProbability(targetPrice);

  const handleSetPrice = () => {
    // TODO: API 호출
    // await fetch('/api/price-tracking/set-target', { ... })

    setIsTracking(true);

    toast.success('가격 알림 설정 완료!', {
      description: `₩${targetPrice.toLocaleString()} 이하로 떨어지면 알려드릴게요`,
    });

    // 수요 집계 시뮬레이션 (Mock)
    setTimeout(() => {
      const similarUsers = Math.floor(Math.random() * 500) + 100;
      toast.info(`${similarUsers}명이 비슷한 가격을 원해요`, {
        description: 'AI가 판매자와 협상 중입니다...',
      });
    }, 2000);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          원하는 가격에 구매하기
        </CardTitle>
        <CardDescription>
          희망 가격을 설정하면 AI가 자동으로 협상해드려요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 현재 가격 정보 */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
          <div>
            <p className="text-muted-foreground mb-1">현재 가격</p>
            <p className="font-bold">₩{currentPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">최저가</p>
            <p className="font-bold text-green-600">₩{minPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">평균</p>
            <p className="font-bold text-blue-600">₩{avgPrice.toLocaleString()}</p>
          </div>
        </div>

        {/* 희망 가격 슬라이더 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">희망 가격</label>
            <div className="text-right">
              <Input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-32 text-right font-bold"
                min={priceMin}
                max={priceMax}
              />
            </div>
          </div>

          <Slider
            value={[targetPrice]}
            onValueChange={([value]) => setTargetPrice(value)}
            min={priceMin}
            max={priceMax}
            step={1000}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₩{priceMin.toLocaleString()}</span>
            <span>₩{priceMax.toLocaleString()}</span>
          </div>
        </div>

        {/* 절감 정보 */}
        {savings > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                  예상 절감액
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ₩{savings.toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {savingsPercent}% 할인
              </Badge>
            </div>
          </div>
        )}

        {/* 달성 확률 */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">30일 내 달성 확률</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${probability * 100}%` }}
              />
            </div>
            <span className="font-bold">{(probability * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* CTA 버튼 */}
        {isTracking ? (
          <div className="space-y-3">
            <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="font-bold text-primary">가격 알림 활성화됨</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ₩{targetPrice.toLocaleString()} 이하로 떨어지면 바로 알려드릴게요
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsTracking(false)}
            >
              알림 취소
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSetPrice}
            size="lg"
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            ₩{targetPrice.toLocaleString()} 가격 알림 받기
          </Button>
        )}

        {/* 수요 정보 (Phase 2 preview) */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💡 현재 <span className="font-bold text-foreground">234명</span>이 비슷한 가격을 원해요
            <br />
            AI가 판매자와 협상 중입니다
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
