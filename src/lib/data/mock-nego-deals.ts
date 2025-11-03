export interface NegoDeal {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;

  // 가격 정보
  originalPrice: number;
  targetPrice: number;
  discountRate: number; // 퍼센트
  savings: number; // 절약 금액

  // 참여 정보
  currentParticipants: number;
  targetParticipants: number;
  participantGoal: number; // 목표 인원

  // 진행 상태
  status: 'active' | 'goal_reached' | 'expired' | 'completed';
  progress: number; // 0-100 퍼센트

  // 시간 정보
  startDate: Date;
  endDate: Date;
  hoursRemaining: number;

  // 플랫폼 정보
  platform: 'coupang' | 'naver' | '11st';

  // 추가 정보
  description: string;
  highlights: string[];
}

export const mockNegoDeals: NegoDeal[] = [
  {
    id: 'nego-001',
    productId: 'nike-pegasus-40',
    productName: '나이키 에어 줌 페가수스 40',
    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    brand: '나이키',
    originalPrice: 149000,
    targetPrice: 126650,
    discountRate: 15,
    savings: 22350,
    currentParticipants: 7,
    targetParticipants: 10,
    participantGoal: 10,
    status: 'active',
    progress: 70,
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-05'),
    hoursRemaining: 48,
    platform: 'coupang',
    description: '베스트셀러 러닝화를 함께 구매하고 15% 할인받으세요!',
    highlights: [
      '로켓배송 무료',
      '최대 15% 할인',
      '반품 무료',
      '정품 보증'
    ]
  },
  {
    id: 'nego-002',
    productId: 'macbook-air-m2',
    productName: '맥북 에어 M2 13인치',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    brand: '애플',
    originalPrice: 1590000,
    targetPrice: 1431000,
    discountRate: 10,
    savings: 159000,
    currentParticipants: 15,
    targetParticipants: 20,
    participantGoal: 20,
    status: 'active',
    progress: 75,
    startDate: new Date('2025-10-30'),
    endDate: new Date('2025-11-06'),
    hoursRemaining: 72,
    platform: 'naver',
    description: '대학생 필수템! 맥북 에어를 단체 할인가로 만나보세요',
    highlights: [
      '애플케어+ 추가 할인',
      '무이자 할부 가능',
      '교육 할인 중복 가능',
      '정품 인증서 제공'
    ]
  },
  {
    id: 'nego-003',
    productId: 'airpods-pro-2',
    productName: '에어팟 프로 2세대',
    productImage: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    brand: '애플',
    originalPrice: 359000,
    targetPrice: 323100,
    discountRate: 10,
    savings: 35900,
    currentParticipants: 23,
    targetParticipants: 30,
    participantGoal: 30,
    status: 'active',
    progress: 77,
    startDate: new Date('2025-11-02'),
    endDate: new Date('2025-11-04'),
    hoursRemaining: 24,
    platform: 'coupang',
    description: '노이즈 캔슬링 최강자! 에어팟 프로를 저렴하게',
    highlights: [
      '당일배송 가능',
      '애플 정품',
      '1년 무상 A/S',
      '사은품 증정'
    ]
  },
  {
    id: 'nego-004',
    productId: 'apple-watch-9',
    productName: '애플워치 시리즈 9 GPS 45mm',
    productImage: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    brand: '애플',
    originalPrice: 599000,
    targetPrice: 539100,
    discountRate: 10,
    savings: 59900,
    currentParticipants: 18,
    targetParticipants: 25,
    participantGoal: 25,
    status: 'active',
    progress: 72,
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-07'),
    hoursRemaining: 96,
    platform: '11st',
    description: '건강 관리의 시작! 애플워치와 함께하세요',
    highlights: [
      '추가 스트랩 증정',
      '무료 배송',
      '14일 반품 보장',
      '정품 등록 지원'
    ]
  },
  {
    id: 'nego-005',
    productId: 'galaxy-buds-2-pro',
    productName: '갤럭시 버즈2 프로',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    brand: '삼성',
    originalPrice: 259000,
    targetPrice: 207200,
    discountRate: 20,
    savings: 51800,
    currentParticipants: 30,
    targetParticipants: 30,
    participantGoal: 30,
    status: 'goal_reached',
    progress: 100,
    startDate: new Date('2025-10-28'),
    endDate: new Date('2025-11-03'),
    hoursRemaining: 12,
    platform: 'coupang',
    description: '🎉 목표 달성! 최종 주문 마감 임박',
    highlights: [
      '✅ 20% 할인 확정',
      '내일 도착 보장',
      '삼성 정품',
      '추가 케이스 증정'
    ]
  }
];

// 네고딜 필터링 및 정렬 함수
export function getActiveNegoDeals(): NegoDeal[] {
  return mockNegoDeals.filter(deal =>
    deal.status === 'active' || deal.status === 'goal_reached'
  );
}

export function getNegoDealsEndingSoon(): NegoDeal[] {
  return mockNegoDeals
    .filter(deal => deal.status === 'active')
    .filter(deal => deal.hoursRemaining <= 48)
    .sort((a, b) => a.hoursRemaining - b.hoursRemaining);
}

export function getNegoDealsNearGoal(): NegoDeal[] {
  return mockNegoDeals
    .filter(deal => deal.status === 'active')
    .filter(deal => deal.progress >= 70)
    .sort((a, b) => b.progress - a.progress);
}

export function getNegoDealById(id: string): NegoDeal | undefined {
  return mockNegoDeals.find(deal => deal.id === id);
}

export function getNegoDealsForProduct(productId: string): NegoDeal[] {
  return mockNegoDeals.filter(deal => deal.productId === productId);
}
