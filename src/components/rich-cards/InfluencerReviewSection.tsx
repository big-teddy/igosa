'use client';

import { motion } from 'framer-motion';
import { Sparkles, BadgeCheck, Users as UsersIcon, ThumbsUp, ThumbsDown, ExternalLink, Youtube, Instagram } from 'lucide-react';
import { InfluencerReview, InfluencerSummary } from '@/types/rich-card';
import Image from 'next/image';

interface InfluencerReviewSectionProps {
  reviews: InfluencerReview[];
  summary?: InfluencerSummary;
}

export function InfluencerReviewSection({ reviews, summary }: InfluencerReviewSectionProps) {
  if (reviews.length === 0) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'bg-red-100 text-red-700';
      case 'instagram':
        return 'bg-purple-100 text-purple-700';
      case 'blog':
        return 'bg-green-100 text-green-700';
      case 'tiktok':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFollowers = (followers: number) => {
    if (followers >= 10000) {
      return `${(followers / 10000).toFixed(1)}만`;
    }
    return followers.toLocaleString();
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              인플루언서 리뷰
              <span className="text-sm font-normal text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                전문성
              </span>
            </h3>
            <p className="text-sm text-gray-500">{reviews.length}개의 전문가 리뷰</p>
          </div>
        </div>
      </div>

      {/* 인플루언서 요약 통계 */}
      {summary && (
        <motion.div
          className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">전문가 평가 요약</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <ThumbsUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">{summary.recommendPercent}% 추천</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 주요 장점 */}
            {summary.topPros.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                  <ThumbsUp className="w-4 h-4" />
                  주요 장점
                </div>
                <ul className="space-y-1">
                  {summary.topPros.map((pro, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 주요 단점 */}
            {summary.topCons.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium text-orange-700">
                  <ThumbsDown className="w-4 h-4" />
                  고려사항
                </div>
                <ul className="space-y-1">
                  {summary.topCons.map((con, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">!</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 인플루언서 리뷰 카드들 */}
      <div className="space-y-3">
        {reviews.map((review, index) => (
          <motion.div
            key={review.influencerId}
            className="relative p-4 bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <div className="flex items-start gap-3">
              {/* 인플루언서 프로필 */}
              <div className="flex-shrink-0 relative">
                <div className="w-14 h-14 rounded-full border-2 border-purple-200 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                  {review.influencerAvatar ? (
                    <Image
                      src={review.influencerAvatar}
                      alt={review.influencerName}
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    review.influencerName.charAt(0)
                  )}
                </div>
                {review.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                    <BadgeCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* 리뷰 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{review.influencerName}</span>
                      {review.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${getPlatformColor(
                          review.platform
                        )}`}
                      >
                        {getPlatformIcon(review.platform)}
                        {review.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        구독자 {formatFollowers(review.followers)}
                      </span>
                    </div>
                  </div>

                  {/* 비디오 링크 */}
                  {review.videoUrl && (
                    <a
                      href={review.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors group-hover:scale-105 transition-transform"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      리뷰 보기
                    </a>
                  )}
                </div>

                {/* 리뷰 요약 */}
                <p className="text-sm text-gray-700 leading-relaxed">{review.summary}</p>

                {/* 썸네일 (있는 경우) */}
                {review.thumbnailUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={review.thumbnailUrl}
                      alt={`${review.influencerName} 리뷰`}
                      width={400}
                      height={225}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 더보기 버튼 (3개 이상일 때) */}
      {reviews.length > 3 && (
        <motion.button
          className="w-full py-2.5 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          모든 인플루언서 리뷰 보기 ({reviews.length}개)
        </motion.button>
      )}
    </motion.div>
  );
}
