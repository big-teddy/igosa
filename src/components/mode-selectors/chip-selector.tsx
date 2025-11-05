"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ChipSelectorProps {
  mode: "price" | "recommend";
  onModeChange: (mode: "price" | "recommend") => void;
}

export function ChipSelector({ mode, onModeChange }: ChipSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <motion.button
          onClick={() => onModeChange('price')}
          className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            mode === 'price'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            {mode === 'price' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check className="h-4 w-4" />
              </motion.div>
            )}
            <span className="text-base">💰</span>
            <span>가격비교</span>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onModeChange('recommend')}
          className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            mode === 'recommend'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            {mode === 'recommend' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check className="h-4 w-4" />
              </motion.div>
            )}
            <span className="text-base">✨</span>
            <span>추천템</span>
          </div>
        </motion.button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {mode === 'price' ? '여러 쇼핑몰 최저가 한눈에' : 'AI 맞춤 제품 추천'}
      </p>
    </div>
  );
}
