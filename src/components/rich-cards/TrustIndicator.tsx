'use client';

import { motion } from 'framer-motion';
import { Users, Sparkles, MessageCircle } from 'lucide-react';
import { TrustScore } from '@/types/rich-card';

interface TrustIndicatorProps {
  trustScore: TrustScore;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export function TrustIndicator({ trustScore, size = 'md', showBreakdown = false }: TrustIndicatorProps) {
  const { overall, friendScore, influencerScore, generalScore, breakdown } = trustScore;

  // 신뢰도에 따른 색상 결정
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-orange-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '최고 신뢰';
    if (score >= 60) return '높은 신뢰';
    if (score >= 40) return '보통 신뢰';
    return '낮은 신뢰';
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-base',
    lg: 'w-32 h-32 text-lg',
  };

  return (
    <div className="space-y-4">
      {/* 전체 신뢰 점수 게이지 */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {/* 배경 원 */}
          <svg className={`${sizeClasses[size]} transform -rotate-90`}>
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200"
            />
          </svg>

          {/* 진행 원 */}
          <motion.svg
            className={`${sizeClasses[size]} absolute inset-0 transform -rotate-90`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={`bg-gradient-to-br ${getScoreColor(overall)}`}
              stroke="url(#trustGradient)"
              initial={{ strokeDasharray: '0 1000' }}
              animate={{
                strokeDasharray: `${overall * 2.51} 1000`, // 2.51 = circumference / 100
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={overall >= 80 ? '#10b981' : overall >= 60 ? '#3b82f6' : '#f59e0b'} />
                <stop offset="100%" stopColor={overall >= 80 ? '#059669' : overall >= 60 ? '#0ea5e9' : '#f97316'} />
              </linearGradient>
            </defs>
          </motion.svg>

          {/* 점수 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`font-bold bg-gradient-to-br ${getScoreColor(overall)} bg-clip-text text-transparent`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              {overall}
            </motion.span>
            <span className="text-xs text-gray-500">신뢰도</span>
          </div>
        </div>

        {/* 신뢰 레벨 라벨 */}
        <div className="flex-1">
          <motion.div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getScoreColor(
              overall
            )} text-white text-sm font-medium shadow-lg`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Sparkles className="w-4 h-4" />
            {getScoreLabel(overall)}
          </motion.div>
          <p className="text-xs text-gray-500 mt-2">다층 신뢰 소스 기반 평가</p>
        </div>
      </div>

      {/* 신뢰도 세부 분석 (선택적) */}
      {showBreakdown && (
        <motion.div
          className="space-y-3 p-4 bg-gray-50 rounded-xl"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            신뢰도 구성
          </h4>

          {/* 친구 신뢰도 */}
          {friendScore > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  친구/지인
                </span>
                <span className="font-medium text-blue-600">{friendScore}점</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${friendScore}%` }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-gray-500">가중치: {(breakdown.friendWeight * 100).toFixed(0)}%</span>
            </div>
          )}

          {/* 인플루언서 신뢰도 */}
          {influencerScore > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  인플루언서
                </span>
                <span className="font-medium text-purple-600">{influencerScore}점</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${influencerScore}%` }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-gray-500">
                가중치: {(breakdown.influencerWeight * 100).toFixed(0)}%
              </span>
            </div>
          )}

          {/* 일반 리뷰 신뢰도 */}
          {generalScore > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                  일반 리뷰
                </span>
                <span className="font-medium text-gray-600">{generalScore}점</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-400 to-gray-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${generalScore}%` }}
                  transition={{ delay: 1.6, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-gray-500">가중치: {(breakdown.generalWeight * 100).toFixed(0)}%</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
