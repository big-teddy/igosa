'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, Users, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingIndicatorProps {
  mode?: 'price' | 'recommend';
}

const loadingTips = {
  price: [
    '💰 여러 쇼핑몰의 가격을 실시간으로 비교하고 있어요',
    '🔍 최저가를 찾기 위해 데이터를 분석 중이에요',
    '📊 할인 정보와 배송비를 확인하고 있어요',
    '⚡ 곧 최고의 가격 정보를 보여드릴게요',
  ],
  recommend: [
    '✨ 친구들의 구매 내역을 확인하고 있어요',
    '🎯 인플루언서 리뷰를 분석 중이에요',
    '💡 맞춤 추천을 위해 AI가 생각하고 있어요',
    '🌟 최고의 추천을 준비하고 있어요',
  ],
};

export function LoadingIndicator({ mode = 'price' }: LoadingIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const tips = loadingTips[mode];

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Don't reach 100% until actually done
        return prev + Math.random() * 15;
      });
    }, 500);

    // Rotate tips
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [tips.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="p-6 bg-card rounded-2xl border border-border shadow-lg">
        {/* Icon and Title */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              mode === 'price' ? 'bg-blue-100' : 'bg-purple-100'
            }`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className={`h-5 w-5 ${mode === 'price' ? 'text-blue-600' : 'text-purple-600'}`} />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">AI가 분석하고 있어요</h3>
            <p className="text-xs text-gray-500">잠시만 기다려주세요</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">진행 중</span>
            <span className="text-xs font-bold text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                mode === 'price'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Tip */}
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
        >
          <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700 leading-relaxed">{tips[tipIndex]}</p>
        </motion.div>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${mode === 'price' ? 'bg-blue-500' : 'bg-purple-500'}`}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
