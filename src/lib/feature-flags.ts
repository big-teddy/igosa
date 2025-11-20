/**
 * Feature Flags Configuration
 *
 * 점진적 기능 배포를 위한 Feature Flag 시스템
 */

export type FeatureFlag =
  | 'unified_negodeal'      // 통합 네고딜 위젯
  | 'negodeal_v2_page'      // 새로운 네고딜 전용 페이지
  | 'new_navigation'        // 업데이트된 헤더 네비게이션
  | 'ai_recommendations';   // AI 추천 가격 기능

interface FeatureFlags {
  [key: string]: boolean;
}

// 환경변수 기반 Feature Flags
const envFlags: FeatureFlags = {
  unified_negodeal: process.env.NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL === 'true',
  negodeal_v2_page: process.env.NEXT_PUBLIC_ENABLE_NEGODEAL_V2_PAGE === 'true',
  new_navigation: process.env.NEXT_PUBLIC_ENABLE_NEW_NAVIGATION === 'true',
  ai_recommendations: process.env.NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS === 'true',
};

// 개발 환경 기본값 (로컬에서는 모두 활성화)
const devDefaults: FeatureFlags = {
  unified_negodeal: true,
  negodeal_v2_page: true,
  new_navigation: true,
  ai_recommendations: true,
};

/**
 * Feature Flag 확인
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // 환경변수가 명시적으로 설정된 경우 우선
  if (envFlags[flag] !== undefined) {
    return envFlags[flag];
  }

  // 개발 환경에서는 기본값 사용
  if (process.env.NODE_ENV === 'development') {
    return devDefaults[flag] ?? false;
  }

  // 프로덕션에서는 기본적으로 비활성화
  return false;
}

/**
 * 사용자 기반 Feature Flag (A/B 테스트용)
 *
 * @param userId - 사용자 ID
 * @param flag - Feature Flag 이름
 * @param rolloutPercent - 활성화할 사용자 비율 (0-100)
 */
export function isFeatureEnabledForUser(
  userId: string,
  flag: FeatureFlag,
  rolloutPercent: number = 100
): boolean {
  // 먼저 전역 플래그 확인
  if (!isFeatureEnabled(flag)) {
    return false;
  }

  // 100% 롤아웃이면 모두 활성화
  if (rolloutPercent >= 100) {
    return true;
  }

  // 사용자 ID 기반 해시로 일관된 롤아웃
  const hash = simpleHash(userId + flag);
  const userPercent = hash % 100;

  return userPercent < rolloutPercent;
}

/**
 * 간단한 문자열 해시 함수
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Feature Flag 상태 가져오기 (디버깅용)
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  return {
    unified_negodeal: isFeatureEnabled('unified_negodeal'),
    negodeal_v2_page: isFeatureEnabled('negodeal_v2_page'),
    new_navigation: isFeatureEnabled('new_navigation'),
    ai_recommendations: isFeatureEnabled('ai_recommendations'),
  };
}

/**
 * Feature Flag 설정 (개발 환경에서만)
 */
export function setFeatureFlag(flag: FeatureFlag, enabled: boolean): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Feature flags can only be set in development mode');
    return;
  }

  if (typeof window !== 'undefined') {
    const flags = JSON.parse(localStorage.getItem('featureFlags') || '{}');
    flags[flag] = enabled;
    localStorage.setItem('featureFlags', JSON.stringify(flags));
    console.log(`Feature flag "${flag}" set to ${enabled}`);
  }
}

/**
 * 로컬 스토리지에서 Feature Flag 읽기 (개발용)
 */
export function getLocalFeatureFlag(flag: FeatureFlag): boolean | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const flags = JSON.parse(localStorage.getItem('featureFlags') || '{}');
  return flags[flag] ?? null;
}
