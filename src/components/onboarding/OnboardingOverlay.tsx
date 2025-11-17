'use client';

import { motion } from 'framer-motion';

export function OnboardingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[9998] pointer-events-auto"
      style={{ backdropFilter: 'blur(2px)' }}
    />
  );
}
