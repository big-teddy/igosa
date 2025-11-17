'use client';

import { useState, useEffect } from 'react';
import { onboardingService } from '@/lib/services/onboarding-service';
import { OnboardingStep } from '@/types/onboarding';
import { OnboardingTooltip } from './OnboardingTooltip';
import { OnboardingOverlay } from './OnboardingOverlay';

interface OnboardingTourProps {
  userId: string;
}

export function OnboardingTour({ userId }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    // Check if user should see onboarding
    if (onboardingService.shouldShowOnboarding(userId)) {
      // Small delay to let the page load
      setTimeout(() => {
        startTour();
      }, 1000);
    }
  }, [userId]);

  const startTour = () => {
    const stepInfo = onboardingService.getCurrentStep(userId);
    if (!stepInfo) {
      // Initialize if needed
      onboardingService.initializeOnboarding(userId);
      const newStepInfo = onboardingService.getCurrentStep(userId);
      if (newStepInfo) {
        setCurrentStep(newStepInfo.step);
        setCurrentStepIndex(newStepInfo.index);
      }
    } else {
      setCurrentStep(stepInfo.step);
      setCurrentStepIndex(stepInfo.index);
    }

    setTotalSteps(onboardingService.getTotalSteps());
    setIsActive(true);
  };

  const handleNext = () => {
    const nextStep = onboardingService.nextStep(userId);
    if (nextStep) {
      setCurrentStep(nextStep);
      setCurrentStepIndex(currentStepIndex + 1);

      // If step has actionHref, navigate to it
      if (nextStep.actionHref) {
        // Small delay to show the tooltip first
        setTimeout(() => {
          window.location.href = nextStep.actionHref!;
        }, 300);
      }
    } else {
      // Tour completed
      handleComplete();
    }
  };

  const handleSkip = () => {
    onboardingService.skipOnboarding(userId);
    setIsActive(false);
    setCurrentStep(null);
  };

  const handleComplete = () => {
    onboardingService.completeTour(userId);
    setIsActive(false);
    setCurrentStep(null);
  };

  if (!isActive || !currentStep) {
    return null;
  }

  return (
    <>
      {/* Overlay to dim background and prevent interaction */}
      <OnboardingOverlay />

      {/* Tooltip with step info */}
      <OnboardingTooltip
        step={currentStep}
        stepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onNext={handleNext}
        onSkip={handleSkip}
        onComplete={handleComplete}
      />
    </>
  );
}
