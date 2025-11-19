/**
 * Demand Aggregation Demo Page
 *
 * Development tool to test and visualize demand aggregation features
 */

'use client';

import { useState } from 'react';
import { DemandDistributionChart } from '@/components/nego-deals/DemandDistributionChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DemandAggregation } from '@/types/price-tracking';

export default function DemandDemoPage() {
  const [productId, setProductId] = useState('PROD001');
  const [demandData, setDemandData] = useState<DemandAggregation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDemandData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/demand/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch demand data');
      }

      const result = await response.json();
      setDemandData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDemand = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate mock demand entries
      const mockPrices = [
        { price: 230000, users: 45 },
        { price: 240000, users: 123 },
        { price: 250000, users: 89 },
        { price: 260000, users: 34 },
        { price: 270000, users: 12 },
      ];

      // Create mock demand aggregation
      const totalUsers = mockPrices.reduce((sum, p) => sum + p.users, 0);
      const avgPrice = mockPrices.reduce((sum, p) => sum + p.price * p.users, 0) / totalUsers;

      const mockData: DemandAggregation = {
        productId,
        productName: `갤럭시 버즈3 Pro`,
        timestamp: new Date(),
        priceTiers: mockPrices.map((p) => ({
          price: p.price,
          userCount: p.users,
          percentage: (p.users / totalUsers) * 100,
        })),
        totalUsers,
        peakDemandPrice: 240000,
        avgTargetPrice: Math.round(avgPrice),
        medianTargetPrice: 240000,
        priceRange: {
          min: 230000,
          max: 270000,
        },
      };

      setDemandData(mockData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">수요 집계 데모</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Phase 2: Redis 기반 실시간 수요 집계 및 시각화
        </p>
      </div>

      <div className="grid gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>테스트 컨트롤</CardTitle>
            <CardDescription>제품 ID를 입력하고 수요 데이터를 불러오세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Product ID (e.g., PROD001)"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={fetchDemandData} disabled={loading}>
                {loading ? '로딩 중...' : '수요 데이터 불러오기'}
              </Button>
              <Button onClick={generateMockDemand} variant="outline" disabled={loading}>
                Mock 데이터 생성
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demand Distribution Chart */}
        {demandData && (
          <Card>
            <CardHeader>
              <CardTitle>가격 분포 시각화</CardTitle>
              <CardDescription>
                실시간 수요 집계 결과 (마지막 업데이트: {new Date(demandData.timestamp).toLocaleTimeString()})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemandDistributionChart demandData={demandData} currentPrice={259000} />
            </CardContent>
          </Card>
        )}

        {/* Raw Data */}
        {demandData && (
          <Card>
            <CardHeader>
              <CardTitle>Raw JSON Data</CardTitle>
              <CardDescription>API 응답 데이터</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto text-xs">
                {JSON.stringify(demandData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
