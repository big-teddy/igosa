"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, DollarSign, Sparkles } from "lucide-react";

interface FloatingActionButtonProps {
  mode: "price" | "recommend";
  onModeChange: (mode: "price" | "recommend") => void;
}

export function FloatingActionButton({ mode, onModeChange }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const selectMode = (newMode: "price" | "recommend") => {
    onModeChange(newMode);
    setIsOpen(false);
  };

  return (
    <>
      {/* Main FAB */}
      <motion.button
        onClick={toggleMenu}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Settings2 className="h-6 w-6" />
      </motion.button>

      {/* Menu Options */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Menu Items */}
            <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3">
              <motion.button
                initial={{ scale: 0, opacity: 0, x: 20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0, opacity: 0, x: 20 }}
                transition={{ delay: 0.05 }}
                onClick={() => selectMode('price')}
                className={`group flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all ${
                  mode === 'price'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-card text-foreground hover:shadow-xl'
                }`}
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">가격비교</span>
              </motion.button>

              <motion.button
                initial={{ scale: 0, opacity: 0, x: 20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0, opacity: 0, x: 20 }}
                transition={{ delay: 0.1 }}
                onClick={() => selectMode('recommend')}
                className={`group flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all ${
                  mode === 'recommend'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-card text-foreground hover:shadow-xl'
                }`}
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">추천템</span>
              </motion.button>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Mode indicator */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 z-40 px-3 py-1.5 rounded-full bg-card shadow-md text-xs font-medium"
        >
          {mode === 'price' ? '💰 가격비교' : '✨ 추천템'}
        </motion.div>
      )}
    </>
  );
}
