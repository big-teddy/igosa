'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { OnboardingStep } from '@/types/onboarding';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface OnboardingTooltipProps {
  step: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function OnboardingTooltip({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
  onComplete,
}: OnboardingTooltipProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find target element if specified
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        // Highlight target element
        element.style.position = 'relative';
        element.style.zIndex = '9999';
        element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
        element.style.borderRadius = '8px';

        // Calculate position
        calculatePosition(element);
      }
    } else {
      setTargetElement(null);
      // Center position for steps without target
      setPosition(null);
    }

    return () => {
      // Clean up highlight
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [step.target]);

  const calculatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const tooltipHeight = 300; // Approximate tooltip height
    const tooltipWidth = 400; // Approximate tooltip width
    const padding = 20;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
      default:
        // Center on screen
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    setPosition({ top, left });
  };

  const handleAction = () => {
    if (stepIndex === totalSteps - 1) {
      onComplete();
    } else {
      onNext();
    }
  };

  const isLastStep = stepIndex === totalSteps - 1;
  const isCenterPosition = !step.target || step.position === 'center';

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[9999]"
      style={
        isCenterPosition
          ? {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }
          : position
            ? { top: `${position.top}px`, left: `${position.left}px` }
            : {}
      }
    >
      <Card className="w-[400px] shadow-2xl border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{step.title}</CardTitle>
            {step.skipable && (
              <Button variant="ghost" size="icon" onClick={onSkip} className="h-6 w-6 -mt-1">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* Progress indicator */}
          <div className="flex gap-1 mt-3">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index <= stepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-2">
          <div className="text-xs text-muted-foreground">
            {stepIndex + 1} / {totalSteps}
          </div>
          <div className="flex gap-2">
            {step.skipable && stepIndex < totalSteps - 1 && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                건너뛰기
              </Button>
            )}
            <Button onClick={handleAction} size="sm" className="gap-2">
              {step.actionLabel || (isLastStep ? '완료' : '다음')}
              {isLastStep ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
