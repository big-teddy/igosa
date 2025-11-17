'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ReasoningStep } from '@/types/rich-card';

interface ReasoningChainProps {
  steps: ReasoningStep[];
  compact?: boolean;
}

export function ReasoningChain({ steps, compact = false }: ReasoningChainProps) {
  if (steps.length === 0) return null;

  // 신뢰 레벨별 색상
  const getStepColor = (type: string) => {
    switch (type) {
      case 'friend':
        return {
          bg: 'bg-blue-500',
          light: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-500',
        };
      case 'influencer':
        return {
          bg: 'bg-purple-500',
          light: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          icon: 'text-purple-500',
        };
      case 'general':
        return {
          bg: 'bg-gray-500',
          light: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-500',
        };
      default:
        return {
          bg: 'bg-green-500',
          light: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-500',
        };
    }
  };

  // 가중치에 따른 강조 표시
  const getWeightOpacity = (weight: number) => {
    if (weight >= 0.7) return 'opacity-100';
    if (weight >= 0.4) return 'opacity-90';
    return 'opacity-75';
  };

  const sortedSteps = [...steps].sort((a, b) => b.weight - a.weight);

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">추천 근거</h3>
          <p className="text-sm text-gray-500">이 제품을 추천하는 이유</p>
        </div>
      </div>

      {/* Compact 모드 */}
      {compact ? (
        <div className="flex items-center gap-2 flex-wrap">
          {sortedSteps.map((step, index) => {
            const colors = getStepColor(step.type);
            return (
              <motion.div
                key={step.order}
                className={`flex items-center gap-2 px-3 py-2 ${colors.light} ${colors.border} border rounded-lg ${getWeightOpacity(
                  step.weight
                )}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.08 }}
              >
                <span className="text-lg">{step.icon}</span>
                <span className={`text-sm font-medium ${colors.text}`}>{step.title}</span>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Full 모드 - 플로우 차트 스타일 */
        <div className="space-y-4">
          {sortedSteps.map((step, index) => {
            const colors = getStepColor(step.type);
            const isLastStep = index === sortedSteps.length - 1;

            return (
              <motion.div
                key={step.order}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.12 }}
              >
                {/* 연결선 */}
                {!isLastStep && (
                  <div className="absolute left-6 top-full w-0.5 h-4 bg-gray-200" />
                )}

                <div
                  className={`flex items-start gap-4 p-5 ${colors.light} ${colors.border} border rounded-xl ${getWeightOpacity(
                    step.weight
                  )} hover:shadow-sm transition-shadow`}
                >
                  {/* 아이콘 & 순서 */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-white shadow-sm`}
                    >
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    {/* 순서 배지 */}
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                      {index + 1}
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h4 className={`font-semibold ${colors.text}`}>{step.title}</h4>
                      {/* 가중치 표시 (간소화) */}
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md">
                        {(step.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* 최종 결론 */}
          <motion.div
            className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + sortedSteps.length * 0.12 }}
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">
              위의 {sortedSteps.length}가지 근거를 종합하여 이 제품을 추천합니다
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
