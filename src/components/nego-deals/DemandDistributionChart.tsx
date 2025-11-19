/**
 * Demand Distribution Chart Component
 *
 * Visualizes price demand distribution using Recharts
 * Shows how many users want to buy at each price point
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
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { DemandAggregation } from '@/types/price-tracking';

interface DemandDistributionChartProps {
  demandData: DemandAggregation;
  currentPrice?: number;
  className?: string;
}

export function DemandDistributionChart({
  demandData,
  currentPrice,
  className = '',
}: DemandDistributionChartProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    return demandData.priceTiers.map((tier) => ({
      price: tier.price,
      users: tier.userCount,
      percentage: tier.percentage,
      priceLabel: `₩${(tier.price / 1000).toFixed(0)}K`,
      isPeak: tier.price === demandData.peakDemandPrice,
    }));
  }, [demandData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.priceLabel}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {data.users}명이 원해요 ({data.percentage.toFixed(1)}%)
          </p>
          {data.isPeak && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              🔥 최다 수요 가격
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (demandData.totalUsers === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            아직 희망 가격을 설정한 사용자가 없습니다
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            첫 번째로 희망 가격을 설정해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">총 사용자</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {demandData.totalUsers}명
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">평균 희망가</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₩{demandData.avgTargetPrice.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">최다 수요</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₩{demandData.peakDemandPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="priceLabel"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            label={{ value: '사용자 수', angle: -90, position: 'insideLeft' }}
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Current price reference line */}
          {currentPrice && (
            <ReferenceLine
              x={`₩${(currentPrice / 1000).toFixed(0)}K`}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: '현재가',
                position: 'top',
                fill: '#ef4444',
                fontSize: 12,
              }}
            />
          )}

          {/* Bars with conditional coloring */}
          <Bar dataKey="users" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.isPeak
                    ? '#10b981' // green for peak demand
                    : entry.price < (currentPrice || Infinity)
                    ? '#3b82f6' // blue for below current price
                    : '#6b7280' // gray for above current price
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">현재가 이하</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">최다 수요 가격</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">현재가 이상</span>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <span className="font-semibold">💡 인사이트:</span>{' '}
          {demandData.peakDemandPrice < (currentPrice || Infinity)
            ? `가장 많은 사용자(${chartData.find((d) => d.isPeak)?.users}명)가 ₩${demandData.peakDemandPrice.toLocaleString()}에 구매를 원합니다. 이 가격에 맞춰 협상하면 대량 판매 가능성이 높습니다!`
            : `대부분의 사용자가 현재가보다 높은 가격을 제시했습니다. 수요가 충분히 모이면 더 좋은 가격에 협상 가능합니다.`}
        </p>
      </div>
    </div>
  );
}
