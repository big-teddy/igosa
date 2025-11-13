/**
 * Onboarding Service
 * 신규 사용자 온보딩 투어 관리
 *
 * Features:
 * - 온보딩 진행 상태 저장
 * - 투어 완료 추적
 * - 단계별 진행 관리
 */

import { OnboardingProgress, OnboardingStep, DEFAULT_ONBOARDING_STEPS } from '@/types/onboarding';

const ONBOARDING_KEY = 'igosa_onboarding_progress';

class OnboardingService {
  private static instance: OnboardingService;

  private constructor() {}

  static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  // ==================== PROGRESS MANAGEMENT ====================

  /**
   * Get user's onboarding progress
   */
  getProgress(userId: string): OnboardingProgress | null {
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY);
      if (!stored) return null;

      const allProgress: OnboardingProgress[] = JSON.parse(stored);
      return allProgress.find((p) => p.userId === userId) || null;
    } catch (error) {
      console.error('Failed to get onboarding progress:', error);
      return null;
    }
  }

  /**
   * Initialize onboarding for new user
   */
  initializeOnboarding(userId: string): OnboardingProgress {
    try {
      const progress: OnboardingProgress = {
        userId,
        completedTours: [],
        currentTour: 'main',
        currentStep: 0,
        skipped: false,
        lastUpdated: new Date().toISOString(),
      };

      this.saveProgress(progress);
      return progress;
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
      throw error;
    }
  }

  /**
   * Save onboarding progress
   */
  private saveProgress(progress: OnboardingProgress): void {
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY);
      let allProgress: OnboardingProgress[] = stored ? JSON.parse(stored) : [];

      // Remove existing progress for this user
      allProgress = allProgress.filter((p) => p.userId !== progress.userId);

      // Add updated progress
      allProgress.push(progress);

      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  }

  /**
   * Check if user should see onboarding
   */
  shouldShowOnboarding(userId: string): boolean {
    const progress = this.getProgress(userId);

    // Show if no progress exists (new user)
    if (!progress) return true;

    // Don't show if skipped or completed
    if (progress.skipped || progress.completedTours.includes('main')) {
      return false;
    }

    return true;
  }

  /**
   * Get current step
   */
  getCurrentStep(userId: string): { step: OnboardingStep; index: number } | null {
    const progress = this.getProgress(userId);
    if (!progress || progress.currentStep === undefined) return null;

    const step = DEFAULT_ONBOARDING_STEPS[progress.currentStep];
    if (!step) return null;

    return { step, index: progress.currentStep };
  }

  /**
   * Move to next step
   */
  nextStep(userId: string): OnboardingStep | null {
    try {
      const progress = this.getProgress(userId) || this.initializeOnboarding(userId);
      const currentStep = progress.currentStep ?? 0;

      // Check if there's a next step
      if (currentStep + 1 >= DEFAULT_ONBOARDING_STEPS.length) {
        // Complete the tour
        this.completeTour(userId);
        return null;
      }

      // Move to next step
      progress.currentStep = currentStep + 1;
      progress.lastUpdated = new Date().toISOString();
      this.saveProgress(progress);

      return DEFAULT_ONBOARDING_STEPS[progress.currentStep];
    } catch (error) {
      console.error('Failed to move to next step:', error);
      return null;
    }
  }

  /**
   * Go to specific step
   */
  goToStep(userId: string, stepIndex: number): OnboardingStep | null {
    try {
      if (stepIndex < 0 || stepIndex >= DEFAULT_ONBOARDING_STEPS.length) {
        return null;
      }

      const progress = this.getProgress(userId) || this.initializeOnboarding(userId);
      progress.currentStep = stepIndex;
      progress.lastUpdated = new Date().toISOString();
      this.saveProgress(progress);

      return DEFAULT_ONBOARDING_STEPS[stepIndex];
    } catch (error) {
      console.error('Failed to go to step:', error);
      return null;
    }
  }

  /**
   * Skip onboarding
   */
  skipOnboarding(userId: string): void {
    try {
      const progress = this.getProgress(userId) || this.initializeOnboarding(userId);
      progress.skipped = true;
      progress.currentTour = undefined;
      progress.currentStep = undefined;
      progress.lastUpdated = new Date().toISOString();
      this.saveProgress(progress);
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  }

  /**
   * Complete current tour
   */
  completeTour(userId: string): void {
    try {
      const progress = this.getProgress(userId) || this.initializeOnboarding(userId);

      if (progress.currentTour && !progress.completedTours.includes(progress.currentTour)) {
        progress.completedTours.push(progress.currentTour);
      }

      progress.currentTour = undefined;
      progress.currentStep = undefined;
      progress.lastUpdated = new Date().toISOString();
      this.saveProgress(progress);
    } catch (error) {
      console.error('Failed to complete tour:', error);
    }
  }

  /**
   * Reset onboarding (for testing)
   */
  resetOnboarding(userId: string): void {
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY);
      if (!stored) return;

      let allProgress: OnboardingProgress[] = JSON.parse(stored);
      allProgress = allProgress.filter((p) => p.userId !== userId);
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  }

  /**
   * Get total steps count
   */
  getTotalSteps(): number {
    return DEFAULT_ONBOARDING_STEPS.length;
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(ONBOARDING_KEY);
  }
}

// Export singleton instance
export const onboardingService = OnboardingService.getInstance();
