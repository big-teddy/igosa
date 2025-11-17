'use client';

import { motion } from 'framer-motion';
import { Users, Star, Calendar } from 'lucide-react';
import { FriendReview } from '@/types/rich-card';
import Image from 'next/image';

interface FriendReviewSectionProps {
  reviews: FriendReview[];
  totalFriendPurchases?: number;
}

export function FriendReviewSection({ reviews, totalFriendPurchases }: FriendReviewSectionProps) {
  if (reviews.length === 0) return null;

  const getRelationshipLabel = (relationship?: string) => {
    switch (relationship) {
      case 'friend':
        return '친구';
      case 'family':
        return '가족';
      case 'colleague':
        return '동료';
      default:
        return '지인';
    }
  };

  const getRelationshipColor = (relationship?: string) => {
    switch (relationship) {
      case 'friend':
        return 'bg-blue-50 text-blue-700';
      case 'family':
        return 'bg-pink-50 text-pink-700';
      case 'colleague':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  // 평균 평점 계산
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              친구/지인 리뷰
            </h3>
            <p className="text-sm text-gray-500">
              {totalFriendPurchases ? `${totalFriendPurchases}명이 구매` : `${reviews.length}명의 리뷰`}
            </p>
          </div>
        </div>

        {/* 평균 평점 */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
        </div>
      </div>

      {/* 친구 아바타 그룹 (먼저 표시) */}
      {reviews.length > 1 && (
        <motion.div
          className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex -space-x-2.5">
            {reviews.slice(0, 5).map((review, index) => (
              <motion.div
                key={review.userId}
                className="relative"
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
              >
                <div className="w-9 h-9 rounded-full border-2 border-white bg-blue-400 flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden">
                  {review.userAvatar ? (
                    <Image
                      src={review.userAvatar}
                      alt={review.userName}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    review.userName.charAt(0)
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">
              {reviews[0].userName}
              {reviews.length > 1 && `님 외 ${reviews.length - 1}명`}이 구매했어요
            </p>
          </div>
        </motion.div>
      )}

      {/* 리뷰 카드들 */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.userId}
            className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-sm transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className="space-y-3">
              {/* 사용자 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-gray-900">{review.userName}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-medium ${getRelationshipColor(
                      review.relationship
                    )}`}
                  >
                    {getRelationshipLabel(review.relationship)}
                  </span>
                </div>

                {/* 구매 날짜 */}
                {review.purchaseDate && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.purchaseDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                    })}
                  </span>
                )}
              </div>

              {/* 평점 */}
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-sm font-medium text-gray-700 ml-1">{review.rating.toFixed(1)}</span>
              </div>

              {/* 리뷰 텍스트 */}
              <p className="text-sm text-gray-700 leading-relaxed">&quot;{review.content}&quot;</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
