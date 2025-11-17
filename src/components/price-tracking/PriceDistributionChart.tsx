/**
 * Price Distribution Chart
 *
 * Visualizes demand distribution across price tiers
 * Shows how many users want each price point
 */

'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { DemandAggregation } from '@/types/price-tracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Users, Target } from 'lucide-react';

interface PriceDistributionChartProps {
  demandData: DemandAggregation;
  currentPrice?: number;
  userTargetPrice?: number;
}

export function PriceDistributionChart({
  demandData,
  currentPrice,
  userTargetPrice,
}: PriceDistributionChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    return demandData.priceTiers.map((tier) => ({
      price: `₩${(tier.price / 1000).toFixed(0)}K`,
      priceValue: tier.price,
      users: tier.userCount,
      percentage: tier.percentage,
    }));
  }, [demandData]);

  // Find peak demand tier
  const peakTier = useMemo(() => {
    return demandData.priceTiers.reduce((max, tier) =>
      tier.userCount > max.userCount ? tier : max
    );
  }, [demandData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.price}</p>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span>{data.users}명 추적 중</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            전체의 {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              가격 수요 분포
            </CardTitle>
            <CardDescription>
              사용자들이 원하는 가격대별 수요 현황
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">총 추적자</div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              <Users className="h-4 w-4 mr-1" />
              {demandData.totalUsers}명
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistics Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">피크 수요 가격</div>
            <div className="text-lg font-bold text-primary">
              ₩{peakTier.price.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {peakTier.userCount}명 ({peakTier.percentage.toFixed(1)}%)
            </div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">평균 희망가</div>
            <div className="text-lg font-bold">
              ₩{demandData.avgTargetPrice.toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">중간 희망가</div>
            <div className="text-lg font-bold">
              ₩{demandData.medianTargetPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="price"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: '추적자 수', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />

              {/* Reference lines for current and target prices */}
              {currentPrice && (
                <ReferenceLine
                  x={`₩${(currentPrice / 1000).toFixed(0)}K`}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="3 3"
                  label={{
                    value: '현재가',
                    position: 'top',
                    fill: 'hsl(var(--destructive))',
                    fontSize: 12,
                  }}
                />
              )}

              {userTargetPrice && (
                <ReferenceLine
                  x={`₩${(userTargetPrice / 1000).toFixed(0)}K`}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="3 3"
                  label={{
                    value: '내 희망가',
                    position: 'top',
                    fill: 'hsl(var(--primary))',
                    fontSize: 12,
                  }}
                />
              )}

              <Bar
                dataKey="users"
                name="추적자 수"
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.priceValue === peakTier.price
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted-foreground))'
                    }
                    opacity={entry.priceValue === peakTier.price ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Info */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>피크 수요</span>
          </div>
          {currentPrice && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full" />
              <span>현재 가격</span>
            </div>
          )}
          {userTargetPrice && (
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 text-primary" />
              <span>내 희망 가격</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
