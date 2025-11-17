'use client';

import { motion } from 'framer-motion';
import { Users, Sparkles, MessageCircle, Shield } from 'lucide-react';
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
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 40) return 'bg-yellow-50';
    return 'bg-orange-50';
  };

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#10b981'; // emerald-500
    if (score >= 60) return '#3b82f6'; // blue-500
    if (score >= 40) return '#f59e0b'; // yellow-500
    return '#f97316'; // orange-500
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '높은 신뢰';
    if (score >= 60) return '신뢰';
    if (score >= 40) return '보통';
    return '낮음';
  };

  const sizeClasses = {
    sm: 'w-14 h-14 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-28 h-28 text-base',
  };

  const strokeWidth = {
    sm: '6',
    md: '7',
    lg: '8',
  };

  return (
    <div className="space-y-5">
      {/* 전체 신뢰 점수 게이지 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {/* 배경 원 */}
          <svg className={`${sizeClasses[size]} transform -rotate-90`}>
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth[size]}
              className="text-gray-100"
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
              strokeWidth={strokeWidth[size]}
              strokeLinecap="round"
              stroke={getScoreStroke(overall)}
              initial={{ strokeDasharray: '0 1000' }}
              animate={{
                strokeDasharray: `${overall * 2.51} 1000`,
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </motion.svg>

          {/* 점수 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`font-bold ${getScoreColor(overall)}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              {overall}
            </motion.span>
          </div>
        </div>

        {/* 신뢰 레벨 라벨 */}
        {size !== 'sm' && (
          <div className="flex-1">
            <motion.div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${getScoreBgColor(overall)} ${getScoreColor(overall)} text-sm font-semibold`}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Shield className="w-3.5 h-3.5" />
              {getScoreLabel(overall)}
            </motion.div>
            <p className="text-xs text-gray-500 mt-1.5">다층 신뢰 소스 평가</p>
          </div>
        )}
      </div>

      {/* 신뢰도 세부 분석 (선택적) */}
      {showBreakdown && (
        <motion.div
          className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gray-600" />
            신뢰도 구성
          </h4>

          {/* 친구 신뢰도 */}
          {friendScore > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700 font-medium">
                  <Users className="w-4 h-4 text-blue-500" />
                  친구/지인
                </span>
                <span className="font-semibold text-blue-600">{friendScore}점</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${friendScore}%` }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                />
              </div>
              <span className="text-xs text-gray-500">가중치: {(breakdown.friendWeight * 100).toFixed(0)}%</span>
            </div>
          )}

          {/* 인플루언서 신뢰도 */}
          {influencerScore > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700 font-medium">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  인플루언서
                </span>
                <span className="font-semibold text-purple-600">{influencerScore}점</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${influencerScore}%` }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                />
              </div>
              <span className="text-xs text-gray-500">가중치: {(breakdown.influencerWeight * 100).toFixed(0)}%</span>
            </div>
          )}

          {/* 일반 리뷰 신뢰도 */}
          {generalScore > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700 font-medium">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  일반 리뷰
                </span>
                <span className="font-semibold text-gray-600">{generalScore}점</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gray-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${generalScore}%` }}
                  transition={{ delay: 1.3, duration: 0.6 }}
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
