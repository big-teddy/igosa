"use client";

import { motion } from "framer-motion";

interface ToggleSwitchProps {
  mode: "price" | "recommend";
  onModeChange: (mode: "price" | "recommend") => void;
}

export function ToggleSwitch({ mode, onModeChange }: ToggleSwitchProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium transition-colors ${mode === 'price' ? 'text-foreground' : 'text-muted-foreground'}`}>
          💰 가격비교
        </span>

        <button
          onClick={() => onModeChange(mode === 'price' ? 'recommend' : 'price')}
          className="relative w-14 h-8 rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="모드 전환"
        >
          <motion.div
            className="absolute top-1 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent shadow-md"
            animate={{
              left: mode === 'price' ? '4px' : 'calc(100% - 28px)'
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        </button>

        <span className={`text-sm font-medium transition-colors ${mode === 'recommend' ? 'text-foreground' : 'text-muted-foreground'}`}>
          ✨ 추천템
        </span>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {mode === 'price' ? '여러 쇼핑몰 최저가 한눈에' : 'AI 맞춤 제품 추천'}
      </p>
    </div>
  );
}
