'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, ShoppingCart, Star, TrendingDown, MessageCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProductRecommendationCard as ProductCard } from '@/types/rich-card';
import { TrustIndicator } from './TrustIndicator';
import { FriendReviewSection } from './FriendReviewSection';
import { InfluencerReviewSection } from './InfluencerReviewSection';
import { ReasoningChain } from './ReasoningChain';
import Image from 'next/image';

interface ProductRecommendationCardProps {
  card: ProductCard;
  index?: number;
}

export function ProductRecommendationCard({ card, index = 0 }: ProductRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllPrices, setShowAllPrices] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const router = useRouter();

  const handleStartNegotiation = async () => {
    setIsNegotiating(true);
    try {
      // Mock user ID for now - in real app, use auth context
      const userId = 'user-1';

      const response = await fetch('/api/negotiations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: card.product.id,
          initialPrice: card.product.lowestPrice.total,
          productName: card.product.name,
          productImage: card.product.image,
          forceTrigger: true, // For MVP/Demo: Allow immediate trigger
        }),
      });

      if (response.status === 409) {
        // Already exists, redirect to it
        const data = await response.json();
        if (data.negotiationId) {
          toast.info('이미 진행 중인 협상으로 이동합니다.');
          router.push(`/negotiations/${data.negotiationId}`);
          return;
        }
      }

      if (!response.ok) {
        throw new Error('Failed to start negotiation');
      }

      const data = await response.json();
      if (data.success && data.negotiationId) {
        toast.success('AI 협상을 시작합니다!');
        console.log('[Debug] Navigating to:', `/negotiations/${data.negotiationId}`);
        router.push(`/negotiations/${data.negotiationId}`);
      } else {
        throw new Error(data.error || 'Failed to start negotiation');
      }
    } catch (error) {
      console.error('Negotiation error:', error);
      toast.error('협상을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsNegotiating(false);
    }
  };

  const { product, trustScore, friendReviews, influencerReviews, influencerSummary, reasoningChain, mode } = card;

  // 할인율 계산
  const discountRate = product.basePrice > 0
    ? Math.round(((product.basePrice - product.lowestPrice.total) / product.basePrice) * 100)
    : 0;

  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto my-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      {/* 메인 카드 */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">

        {/* 헤더 - 제품 정보 */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row items-start gap-6">

            {/* 제품 이미지 */}
            <motion.div
              className="relative flex-shrink-0 w-full md:w-36 h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Image
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                width={144}
                height={144}
                className="w-full h-full object-cover"
              />
              {discountRate > 0 && (
                <div className="absolute top-2 right-2 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-sm">
                  -{discountRate}%
                </div>
              )}
            </motion.div>

            {/* 제품 정보 & 신뢰도 */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* 브랜드 & 제품명 & 신뢰도 */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-500">{product.brand}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1 leading-tight line-clamp-2">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* 신뢰 점수 (컴팩트) */}
                <div className="flex-shrink-0">
                  <TrustIndicator trustScore={trustScore} size="sm" />
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  {mode === 'price' ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">최저가</span>
                      </div>
                      <span className="text-3xl font-bold text-gray-900">
                        ₩{product.lowestPrice.total.toLocaleString()}
                      </span>
                      {product.basePrice > product.lowestPrice.total && (
                        <span className="text-lg text-gray-400 line-through">
                          ₩{product.basePrice.toLocaleString()}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
                        <span className="text-sm font-medium text-gray-700">추천가</span>
                      </div>
                      <span className="text-3xl font-bold text-gray-900">
                        ₩{product.lowestPrice.total.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600">{product.lowestPrice.platform}</span>
                  {product.lowestPrice.shipping === 0 ? (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md">
                      무료배송
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      배송비 +₩{product.lowestPrice.shipping.toLocaleString()}
                    </span>
                  )}
                  {product.lowestPrice.inStock ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      재고 있음
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      일시 품절
                    </span>
                  )}
                </div>

                {/* 구매 버튼 */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <motion.a
                    href={product.lowestPrice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="whitespace-nowrap">최저가로 구매하기</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>

                  <motion.button
                    onClick={handleStartNegotiation}
                    disabled={isNegotiating}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isNegotiating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                    <span className="whitespace-nowrap">AI 네고 시작하기</span>
                  </motion.button>

                  {product.allPrices.length > 1 && (
                    <motion.button
                      onClick={() => setShowAllPrices(!showAllPrices)}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      가격 비교 ({product.allPrices.length})
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 가격 비교 테이블 (확장) */}
          <AnimatePresence>
            {showAllPrices && product.allPrices.length > 1 && (
              <motion.div
                className="mt-6 pt-6 border-t border-gray-100"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h4 className="text-sm font-semibold text-gray-800 mb-3">전체 가격 비교</h4>
                <div className="space-y-2">
                  {product.allPrices.map((price, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${price.platform === product.lowestPrice.platform
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-transparent hover:border-gray-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{price.platform}</span>
                        {price.platform === product.lowestPrice.platform && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                            최저가
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base font-bold text-gray-900">
                            ₩{price.total.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {price.shipping === 0 ? '무료배송' : `배송비 +₩${price.shipping.toLocaleString()}`}
                          </div>
                        </div>
                        <a
                          href={price.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          구매
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI 추천 텍스트 */}
        {card.recommendationText && (
          <div className="px-8 py-4 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-700">AI 추천:</span> {card.recommendationText}
            </p>
          </div>
        )}

        {/* 추천 근거 (컴팩트 모드) */}
        {reasoningChain.length > 0 && !isExpanded && (
          <div className="px-8 py-5 border-b border-gray-100">
            <ReasoningChain steps={reasoningChain} compact={true} />
          </div>
        )}

        {/* 확장/축소 버튼 */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-8 py-4 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
        >
          <span>{isExpanded ? '자세한 리뷰 접기' : '자세한 리뷰 보기'}</span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </motion.button>

        {/* 확장 영역 - 상세 리뷰 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="border-t border-gray-100"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-8 space-y-10">

                {/* 신뢰도 상세 분석 */}
                <div>
                  <TrustIndicator trustScore={trustScore} size="lg" showBreakdown />
                </div>

                {/* 친구 리뷰 */}
                {friendReviews.length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <FriendReviewSection reviews={friendReviews} />
                  </div>
                )}

                {/* 인플루언서 리뷰 */}
                {influencerReviews.length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <InfluencerReviewSection reviews={influencerReviews} summary={influencerSummary} />
                  </div>
                )}

                {/* 추천 근거 상세 */}
                {reasoningChain.length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <ReasoningChain steps={reasoningChain} compact={false} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
