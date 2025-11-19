/**
 * Seller Insights Dashboard
 *
 * Phase 2: Real-time demand insights for sellers
 * Shows aggregated buyer demand and AI negotiation recommendations
 */

'use client';

import { useEffect, useState } from 'react';
import { DemandDistributionChart } from '@/components/nego-deals/DemandDistributionChart';
import type { DemandAggregation } from '@/types/price-tracking';
import { TrendingUp, Users, DollarSign, Target, AlertCircle } from 'lucide-react';

interface SellerInsightsDashboardProps {
  productId: string;
  currentPrice: number;
  productName: string;
}

export function SellerInsightsDashboard({
  productId,
  currentPrice,
  productName,
}: SellerInsightsDashboardProps) {
  const [demandData, setDemandData] = useState<DemandAggregation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDemandData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDemandData, 30000);
    return () => clearInterval(interval);
  }, [productId]);

  const fetchDemandData = async () => {
    try {
      const response = await fetch(`/api/demand/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch demand data');
      const result = await response.json();
      setDemandData(result.data);
      setError(null);
    } catch (err) {
      setError('수요 데이터를 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate negotiation recommendations
  const recommendations = demandData
    ? calculateRecommendations(demandData, currentPrice)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !demandData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{error || '데이터를 불러올 수 없습니다'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {productName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          실시간 구매 수요 분석 및 AI 협상 추천
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="총 관심 구매자"
          value={`${demandData.totalUsers}명`}
          color="blue"
        />
        <MetricCard
          icon={<DollarSign className="w-6 h-6" />}
          label="평균 희망가"
          value={`₩${demandData.avgTargetPrice.toLocaleString()}`}
          color="green"
        />
        <MetricCard
          icon={<Target className="w-6 h-6" />}
          label="최다 수요 가격"
          value={`₩${demandData.peakDemandPrice.toLocaleString()}`}
          color="purple"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="잠재 판매량"
          value={`${recommendations?.potentialSales || 0}개`}
          color="orange"
        />
      </div>

      {/* Demand Distribution Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          가격대별 수요 분포
        </h3>
        <DemandDistributionChart demandData={demandData} currentPrice={currentPrice} />
      </div>

      {/* AI Recommendations */}
      {recommendations && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🤖 AI 협상 추천
          </h3>

          <div className="space-y-4">
            {/* Primary Recommendation */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                💎 최적 협상 가격
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₩{recommendations.optimalPrice.toLocaleString()}
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  ({recommendations.discount}% 할인)
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                예상 판매량: <span className="font-semibold">{recommendations.potentialSales}개</span>
                {' • '}
                예상 매출: <span className="font-semibold">₩{recommendations.estimatedRevenue.toLocaleString()}</span>
              </p>
            </div>

            {/* Alternative Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    옵션 {index + 1}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    ₩{alt.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {alt.users}명 • ₩{alt.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                AI 협상 시작하기
              </button>
              <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors">
                분석 보고서 다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Market Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 시장 인사이트
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <InsightItem
            text={`현재 가격 대비 평균 희망가는 ${((1 - demandData.avgTargetPrice / currentPrice) * 100).toFixed(1)}% 낮습니다.`}
          />
          <InsightItem
            text={`가격대 분포: ₩${demandData.priceRange.min.toLocaleString()} ~ ₩${demandData.priceRange.max.toLocaleString()}`}
          />
          <InsightItem
            text={`최다 수요 가격(₩${demandData.peakDemandPrice.toLocaleString()})에 ${
              demandData.priceTiers.find((t) => t.price === demandData.peakDemandPrice)?.userCount || 0
            }명이 몰려있습니다.`}
          />
        </div>
      </div>

      {/* Real-time Update Indicator */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-500">
        <p>실시간 업데이트 • 마지막 갱신: {new Date(demandData.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className={`inline-flex p-3 rounded-lg mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function InsightItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
      <p>{text}</p>
    </div>
  );
}

// Calculate AI recommendations
function calculateRecommendations(demandData: DemandAggregation, currentPrice: number) {
  // Find optimal price (peak demand price)
  const optimalPrice = demandData.peakDemandPrice;
  const discount = ((currentPrice - optimalPrice) / currentPrice) * 100;

  // Calculate potential sales at optimal price
  const potentialSales = demandData.priceTiers
    .filter((tier) => tier.price >= optimalPrice)
    .reduce((sum, tier) => sum + tier.userCount, 0);

  const estimatedRevenue = optimalPrice * potentialSales;

  // Generate alternative options
  const alternatives = demandData.priceTiers
    .filter((tier) => tier.price !== optimalPrice)
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, 2)
    .map((tier) => {
      const users = demandData.priceTiers
        .filter((t) => t.price >= tier.price)
        .reduce((sum, t) => sum + t.userCount, 0);
      return {
        price: tier.price,
        users,
        revenue: tier.price * users,
      };
    });

  return {
    optimalPrice,
    discount: discount.toFixed(1),
    potentialSales,
    estimatedRevenue,
    alternatives,
  };
}
