'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, ShoppingCart, Star, TrendingDown } from 'lucide-react';
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

  const { product, trustScore, friendReviews, influencerReviews, influencerSummary, reasoningChain, mode } = card;

  // 할인율 계산
  const discountRate = product.basePrice > 0
    ? Math.round(((product.basePrice - product.lowestPrice.total) / product.basePrice) * 100)
    : 0;

  return (
    <motion.div
      className="relative w-full max-w-3xl mx-auto my-4"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* 메인 카드 */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow">
        {/* 헤더 - 제품 정보 */}
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-start gap-6">
            {/* 제품 이미지 */}
            <motion.div
              className="relative flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg bg-white"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
              {discountRate > 0 && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-md">
                  -{discountRate}%
                </div>
              )}
            </motion.div>

            {/* 제품 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-500">{product.brand}</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h2>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                </div>

                {/* 신뢰 점수 (작은 버전) */}
                <div className="flex-shrink-0">
                  <TrustIndicator trustScore={trustScore} size="sm" />
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="mt-4 space-y-2">
                <div className="flex items-baseline gap-3">
                  {mode === 'price' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">최저가</span>
                      </div>
                      <span className="text-3xl font-bold text-green-600">
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
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-600">추천가</span>
                      </div>
                      <span className="text-3xl font-bold text-gray-900">
                        ₩{product.lowestPrice.total.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{product.lowestPrice.platform}</span>
                  {product.lowestPrice.shipping === 0 ? (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      무료배송
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      배송비 +₩{product.lowestPrice.shipping.toLocaleString()}
                    </span>
                  )}
                  {product.lowestPrice.inStock ? (
                    <span className="text-sm text-green-600">재고 있음</span>
                  ) : (
                    <span className="text-sm text-red-600">일시 품절</span>
                  )}
                </div>

                {/* 구매 버튼 */}
                <div className="flex gap-2 mt-3">
                  <motion.a
                    href={product.lowestPrice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    최저가로 구매하기
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>

                  {product.allPrices.length > 1 && (
                    <motion.button
                      onClick={() => setShowAllPrices(!showAllPrices)}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
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
                className="mt-6 pt-6 border-t border-gray-200"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-sm font-semibold text-gray-700 mb-3">전체 가격 비교</h4>
                <div className="space-y-2">
                  {product.allPrices.map((price, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        price.platform === product.lowestPrice.platform
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{price.platform}</span>
                        {price.platform === product.lowestPrice.platform && (
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            최저가
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
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
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-700">AI 추천:</span> {card.recommendationText}
            </p>
          </div>
        )}

        {/* 추천 근거 (항상 표시) */}
        {reasoningChain.length > 0 && (
          <div className="px-6 py-6 border-b border-gray-100">
            <ReasoningChain steps={reasoningChain} compact={!isExpanded} />
          </div>
        )}

        {/* 확장/축소 버튼 */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
          whileHover={{ backgroundColor: 'rgb(243 244 246)' }}
        >
          <span>{isExpanded ? '자세한 리뷰 접기' : '자세한 리뷰 보기'}</span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </motion.button>

        {/* 확장 영역 - 상세 리뷰 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="border-t border-gray-200"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="p-6 space-y-8">
                {/* 신뢰도 상세 분석 */}
                <div>
                  <TrustIndicator trustScore={trustScore} size="lg" showBreakdown />
                </div>

                {/* 친구 리뷰 */}
                {friendReviews.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <FriendReviewSection reviews={friendReviews} />
                  </div>
                )}

                {/* 인플루언서 리뷰 */}
                {influencerReviews.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <InfluencerReviewSection reviews={influencerReviews} summary={influencerSummary} />
                  </div>
                )}

                {/* 추천 근거 상세 */}
                {reasoningChain.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <ReasoningChain steps={reasoningChain} />
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
