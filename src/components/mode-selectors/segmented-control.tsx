"use client";

import { motion } from "framer-motion";

interface SegmentedControlProps {
  mode: "price" | "recommend";
  onModeChange: (mode: "price" | "recommend") => void;
}

export function SegmentedControl({ mode, onModeChange }: SegmentedControlProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex p-1 rounded-xl bg-muted/50 backdrop-blur">
        <motion.div
          className="absolute inset-y-1 rounded-lg bg-card shadow-md"
          animate={{
            x: mode === 'price' ? 4 : '50%',
            width: mode === 'price' ? 'calc(50% - 4px)' : 'calc(50% - 4px)'
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />

        <button
          onClick={() => onModeChange('price')}
          className={`relative z-10 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            mode === 'price' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">💰</span>
            <span>가격비교</span>
          </div>
        </button>

        <button
          onClick={() => onModeChange('recommend')}
          className={`relative z-10 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            mode === 'recommend' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span>추천템</span>
          </div>
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {mode === 'price' ? '여러 쇼핑몰 최저가 한눈에' : 'AI 맞춤 제품 추천'}
      </p>
    </div>
  );
}
