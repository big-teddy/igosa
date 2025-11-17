/**
 * PostHog Dashboard Query Templates
 *
 * 이 파일은 PostHog 대시보드 설정을 위한 쿼리 템플릿을 제공합니다.
 * PostHog Console에서 Insights를 생성할 때 참고할 수 있습니다.
 */

export const POSTHOG_QUERIES = {
  // ==================== Funnel Queries ====================

  /**
   * 메인 전환 퍼널: 검색 → 구매
   */
  conversionFunnel: {
    name: '사용자 구매 여정',
    type: 'funnel',
    steps: [
      { event: 'Search Performed' },
      { event: 'Product Viewed' },
      { event: 'Add to Cart' },
      { event: 'Checkout Started' },
      { event: 'Purchase Completed' },
    ],
    timeWindow: '7 days',
    description: '검색부터 구매까지의 전체 전환 퍼널',
  },

  /**
   * 간소화된 퍼널: 상품 조회 → 구매
   */
  productToPurchaseFunnel: {
    name: '상품 조회 → 구매 전환',
    type: 'funnel',
    steps: [
      { event: 'Product Viewed' },
      { event: 'Add to Cart' },
      { event: 'Purchase Completed' },
    ],
    timeWindow: '3 days',
  },

  // ==================== Trend Queries ====================

  /**
   * 검색 성과 트렌드
   */
  searchTrends: {
    name: '검색 수행 트렌드',
    type: 'trend',
    events: [
      { event: 'Search Performed' },
    ],
    breakdown: 'search_mode',
    interval: 'day',
  },

  /**
   * 검색 성공률
   */
  searchSuccessRate: {
    name: '검색 성공률',
    type: 'trend',
    formula: {
      numerator: {
        event: 'Search Performed',
        filter: { property: 'results_count', operator: '>', value: 0 },
      },
      denominator: {
        event: 'Search Performed',
      },
      operation: 'percentage',
    },
    interval: 'day',
  },

  /**
   * 매출 트렌드
   */
  revenueTrend: {
    name: '일일 매출',
    type: 'trend',
    events: [
      {
        event: 'Purchase Completed',
        math: 'sum',
        math_property: 'total_amount',
      },
    ],
    interval: 'day',
  },

  /**
   * 주문 수 트렌드
   */
  ordersTrend: {
    name: '일일 주문 수',
    type: 'trend',
    events: [
      { event: 'Purchase Completed' },
    ],
    interval: 'day',
  },

  /**
   * DAU (Daily Active Users)
   */
  dailyActiveUsers: {
    name: 'Daily Active Users',
    type: 'trend',
    events: [
      { event: '$pageview' },
    ],
    math: 'unique_users',
    interval: 'day',
  },

  // ==================== Breakdown Queries ====================

  /**
   * 인기 검색어
   */
  popularSearches: {
    name: '인기 검색어 Top 20',
    type: 'trend',
    events: [
      { event: 'Search Performed' },
    ],
    breakdown: 'query',
    limit: 20,
    interval: 'week',
  },

  /**
   * 가장 많이 조회된 상품
   */
  mostViewedProducts: {
    name: '상품 조회 Top 20',
    type: 'trend',
    events: [
      { event: 'Product Viewed' },
    ],
    breakdown: 'product_name',
    limit: 20,
    interval: 'week',
  },

  /**
   * 가장 많이 장바구니에 담긴 상품
   */
  mostAddedToCart: {
    name: '장바구니 추가 Top 20',
    type: 'trend',
    events: [
      { event: 'Add to Cart' },
    ],
    breakdown: 'product_name',
    limit: 20,
    interval: 'week',
  },

  // ==================== Metric Queries ====================

  /**
   * 평균 주문 금액 (AOV)
   */
  averageOrderValue: {
    name: 'Average Order Value',
    type: 'trend',
    events: [
      {
        event: 'Purchase Completed',
        math: 'avg',
        math_property: 'total_amount',
      },
    ],
    interval: 'week',
  },

  /**
   * 검색당 평균 결과 수
   */
  avgResultsPerSearch: {
    name: '검색당 평균 결과 수',
    type: 'trend',
    events: [
      {
        event: 'Search Performed',
        math: 'avg',
        math_property: 'results_count',
      },
    ],
    interval: 'day',
  },

  /**
   * 장바구니 포기율
   */
  cartAbandonmentRate: {
    name: '장바구니 포기율',
    type: 'trend',
    formula: {
      numerator: {
        event: 'Checkout Started',
        operation: 'subtract',
        event2: 'Purchase Completed',
      },
      denominator: {
        event: 'Checkout Started',
      },
      operation: 'percentage',
    },
    interval: 'day',
  },

  // ==================== Retention Queries ====================

  /**
   * 사용자 리텐션
   */
  userRetention: {
    name: '사용자 리텐션',
    type: 'retention',
    target_event: { event: '$pageview' },
    returning_event: { event: '$pageview' },
    date_range: '30 days',
  },

  // ==================== Path Queries ====================

  /**
   * 사용자 경로 분석
   */
  userPaths: {
    name: '사용자 페이지 경로',
    type: 'path',
    start_point: { event: '$pageview' },
    end_point: { event: 'Purchase Completed' },
    max_steps: 5,
  },
};

/**
 * Dashboard Configurations
 */
export const DASHBOARDS = {
  businessOverview: {
    name: '비즈니스 개요',
    description: '핵심 비즈니스 지표 요약',
    insights: [
      'revenueTrend',
      'ordersTrend',
      'averageOrderValue',
      'conversionFunnel',
      'mostViewedProducts',
      'mostAddedToCart',
    ],
  },

  userBehavior: {
    name: '사용자 행동 분석',
    description: '사용자 참여 및 행동 패턴',
    insights: [
      'dailyActiveUsers',
      'userRetention',
      'searchTrends',
      'searchSuccessRate',
      'popularSearches',
      'avgResultsPerSearch',
    ],
  },

  conversionOptimization: {
    name: '전환 최적화',
    description: '전환율 분석 및 최적화 포인트',
    insights: [
      'conversionFunnel',
      'productToPurchaseFunnel',
      'cartAbandonmentRate',
      'userPaths',
    ],
  },

  negoDealAnalysis: {
    name: '네고딜 분석',
    description: '네고딜 성과 및 참여 분석',
    insights: [
      // 네고딜 전용 인사이트는 필터링을 통해 생성
      // 예: Product Viewed에서 URL에 '/nego-deals' 포함된 것만 필터링
    ],
  },
};

/**
 * Alert Configurations
 */
export const ALERTS = {
  critical: [
    {
      name: '전환율 급락',
      metric: 'Overall Conversion Rate',
      condition: '< 2%',
      notification: ['email', 'slack'],
    },
    {
      name: '매출 급락',
      metric: 'Daily Revenue',
      condition: '< 70% of 7-day average',
      notification: ['email', 'slack'],
    },
    {
      name: '높은 장바구니 포기율',
      metric: 'Cart Abandonment Rate',
      condition: '> 80%',
      notification: ['email', 'slack'],
    },
    {
      name: '검색 실패 급증',
      metric: 'Search Success Rate',
      condition: '< 60%',
      notification: ['email', 'slack'],
    },
  ],

  warning: [
    {
      name: 'DAU 감소',
      metric: 'Daily Active Users',
      condition: '< 80% of previous week',
      notification: ['email'],
    },
    {
      name: '체크아웃 이탈 증가',
      metric: 'Checkout to Purchase Rate',
      condition: '< 50%',
      notification: ['email'],
    },
    {
      name: '세션 지속시간 감소',
      metric: 'Average Session Duration',
      condition: '< 2 minutes',
      notification: ['email'],
    },
  ],
};

/**
 * Helper function to generate PostHog API-compatible query
 */
export function generatePostHogQuery(queryTemplate: any) {
  // This would convert our template to PostHog API format
  // For now, it's a placeholder for future API integration
  return queryTemplate;
}

/**
 * Insights that should be pinned to main dashboard
 */
export const PINNED_INSIGHTS = [
  'revenueTrend',
  'ordersTrend',
  'dailyActiveUsers',
  'conversionFunnel',
];
