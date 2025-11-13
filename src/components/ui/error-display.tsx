'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, Lightbulb } from 'lucide-react';
import { Button } from './button';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  suggestions?: string[];
}

const defaultSuggestions = [
  '검색어를 조금 바꿔서 다시 시도해보세요',
  '인터넷 연결을 확인해주세요',
  '잠시 후 다시 시도해주세요',
];

export function ErrorDisplay({
  title = '앗, 문제가 발생했어요',
  message = 'AI 응답을 불러오는 중 오류가 발생했습니다.',
  onRetry,
  onGoHome,
  suggestions = defaultSuggestions,
}: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="p-6 bg-card rounded-2xl border-2 border-red-200 shadow-lg">
        {/* Error Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <AlertCircle className="h-6 w-6 text-red-600" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <h4 className="text-sm font-semibold text-blue-900">해결 방법</h4>
            </div>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="text-sm text-blue-800 flex items-start gap-2"
                >
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
          )}
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="outline"
              className="gap-2 hover:bg-accent transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              홈으로
            </Button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-center text-gray-500 mt-4">
          문제가 계속되면 고객센터로 문의해주세요
        </p>
      </div>
    </motion.div>
  );
}
