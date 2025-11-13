/**
 * Onboarding Types
 * 신규 사용자 온보딩 투어 시스템
 */

export type OnboardingStepId =
  | 'welcome'
  | 'feed'
  | 'nego-deals'
  | 'price-alerts'
  | 'referral'
  | 'notifications'
  | 'complete';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  target?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionLabel?: string;
  actionHref?: string;
  skipable?: boolean;
}

export interface OnboardingTour {
  id: string;
  name: string;
  steps: OnboardingStep[];
  completedAt?: string;
}

export interface OnboardingProgress {
  userId: string;
  completedTours: string[];
  currentTour?: string;
  currentStep?: number;
  skipped: boolean;
  lastUpdated: string;
}

export const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '이거사에 오신 것을 환영합니다! 👋',
    description:
      '이거사는 친구들과 함께 더 저렴하게 쇼핑할 수 있는 소셜 커머스 플랫폼입니다. 주요 기능을 소개해드릴게요!',
    position: 'center',
    actionLabel: '시작하기',
    skipable: true,
  },
  {
    id: 'feed',
    title: '친구 피드 🤝',
    description:
      '친구들이 공유한 상품과 딜을 확인하세요. 좋아요와 댓글로 소통하고, 레퍼럴 링크로 함께 구매하면 수익도 얻을 수 있어요!',
    target: '[href="/feed"]',
    position: 'bottom',
    actionLabel: '다음',
    actionHref: '/feed',
  },
  {
    id: 'nego-deals',
    title: '공동구매 (네고딜) 🎯',
    description:
      '친구들과 함께 모여서 더 큰 할인을 받으세요! 참여 인원이 많을수록 가격이 내려갑니다. 레퍼럴 링크로 친구를 초대하면 추가 수익도!',
    target: '[href="/nego-deals"]',
    position: 'bottom',
    actionLabel: '다음',
    actionHref: '/nego-deals',
  },
  {
    id: 'price-alerts',
    title: '가격 알림 ⏰',
    description:
      '원하는 상품의 목표 가격을 설정하세요. 가격이 목표에 도달하면 바로 알림을 보내드립니다!',
    target: '[href="/price-alerts"]',
    position: 'bottom',
    actionLabel: '다음',
    actionHref: '/price-alerts',
  },
  {
    id: 'referral',
    title: '레퍼럴 수익 💰',
    description:
      '상품이나 딜을 공유하고 친구가 구매하면 수익을 얻을 수 있어요. 더 많이 공유할수록 레벨이 올라가고 수수료율도 높아집니다!',
    position: 'center',
    actionLabel: '다음',
  },
  {
    id: 'notifications',
    title: '알림 받기 🔔',
    description:
      '가격 알림, 딜 목표 달성, 레퍼럴 수익 등 중요한 소식을 실시간으로 받아보세요!',
    target: 'button[aria-label="알림"]',
    position: 'bottom',
    actionLabel: '다음',
  },
  {
    id: 'complete',
    title: '모든 준비가 끝났어요! 🎉',
    description:
      '이제 이거사의 모든 기능을 사용할 수 있습니다. 친구들과 함께 스마트한 쇼핑을 시작해보세요!',
    position: 'center',
    actionLabel: '완료',
  },
];
