'use client';

import { motion } from 'framer-motion';
import { Users, Star, Calendar, UserCheck } from 'lucide-react';
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
        return 'bg-blue-100 text-blue-700';
      case 'family':
        return 'bg-pink-100 text-pink-700';
      case 'colleague':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              친구/지인 리뷰
              <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                최고 신뢰도
              </span>
            </h3>
            <p className="text-sm text-gray-500">
              {totalFriendPurchases ? `${totalFriendPurchases}명이 구매` : `${reviews.length}명의 리뷰`}
            </p>
          </div>
        </div>
      </div>

      {/* 친구 아바타 그룹 */}
      {reviews.length > 1 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {reviews.slice(0, 5).map((review, index) => (
              <motion.div
                key={review.userId}
                className="relative"
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {review.userAvatar ? (
                    <Image
                      src={review.userAvatar}
                      alt={review.userName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    review.userName.charAt(0)
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          {reviews.length > 5 && (
            <span className="text-sm text-gray-500 font-medium">외 {reviews.length - 5}명</span>
          )}
        </div>
      )}

      {/* 리뷰 카드들 */}
      <div className="space-y-3">
        {reviews.map((review, index) => (
          <motion.div
            key={review.userId}
            className="relative p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            {/* 신뢰 배지 */}
            <div className="absolute -top-2 -right-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-full shadow-md">
                <UserCheck className="w-3 h-3" />
                신뢰
              </div>
            </div>

            <div className="flex items-start gap-3">
              {/* 아바타 */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-md">
                {review.userAvatar ? (
                  <Image
                    src={review.userAvatar}
                    alt={review.userName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  review.userName.charAt(0)
                )}
              </div>

              {/* 리뷰 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-semibold text-gray-900">{review.userName}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRelationshipColor(
                      review.relationship
                    )}`}
                  >
                    {getRelationshipLabel(review.relationship)}
                  </span>
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
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-gray-700 ml-1">{review.rating.toFixed(1)}</span>
                </div>

                {/* 리뷰 텍스트 */}
                <p className="text-sm text-gray-700 leading-relaxed">&quot;{review.content}&quot;</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 요약 통계 */}
      {reviews.length > 0 && (
        <motion.div
          className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              평균 {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}점
            </span>
          </div>
          <div className="w-px h-4 bg-blue-200" />
          <span className="text-sm text-gray-600">총 {reviews.length}개 리뷰</span>
        </motion.div>
      )}
    </motion.div>
  );
}
