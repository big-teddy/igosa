import { NegoDeal } from '@/types/nego-deal';

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
    currentParticipants: 0, // 서비스에서 동적으로 계산
    targetParticipants: 10,
    participantGoal: 10,
    status: 'active',
    progress: 0, // 서비스에서 동적으로 계산
    startDate: '2025-11-01T00:00:00Z',
    endDate: '2025-11-05T23:59:59Z',
    hoursRemaining: 48,
    platform: 'coupang',
    description: '베스트셀러 러닝화를 함께 구매하고 최대 20% 할인받으세요!',
    highlights: ['로켓배송 무료', '최대 20% 할인', '반품 무료', '정품 보증'],
    discountTiers: [
      { participantCount: 5, discountRate: 10, price: 134100 },
      { participantCount: 10, discountRate: 15, price: 126650 },
      { participantCount: 15, discountRate: 20, price: 119200 },
    ],
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
    currentParticipants: 0,
    targetParticipants: 20,
    participantGoal: 20,
    status: 'active',
    progress: 0,
    startDate: '2025-10-30T00:00:00Z',
    endDate: '2025-11-06T23:59:59Z',
    hoursRemaining: 72,
    platform: 'naver',
    description: '대학생 필수템! 맥북 에어를 단체 할인가로 만나보세요',
    highlights: ['애플케어+ 추가 할인', '무이자 할부 가능', '교육 할인 중복 가능', '정품 인증서 제공'],
    discountTiers: [
      { participantCount: 5, discountRate: 5, price: 1510500 },
      { participantCount: 10, discountRate: 10, price: 1431000 },
      { participantCount: 20, discountRate: 15, price: 1351500 },
    ],
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
    currentParticipants: 0,
    targetParticipants: 30,
    participantGoal: 30,
    status: 'active',
    progress: 0,
    startDate: '2025-11-02T00:00:00Z',
    endDate: '2025-11-04T23:59:59Z',
    hoursRemaining: 24,
    platform: 'coupang',
    description: '노이즈 캔슬링 최강자! 에어팟 프로를 저렴하게',
    highlights: ['당일배송 가능', '애플 정품', '1년 무상 A/S', '사은품 증정'],
    discountTiers: [
      { participantCount: 10, discountRate: 5, price: 341050 },
      { participantCount: 20, discountRate: 10, price: 323100 },
      { participantCount: 30, discountRate: 15, price: 305150 },
    ],
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
    currentParticipants: 0,
    targetParticipants: 25,
    participantGoal: 25,
    status: 'active',
    progress: 0,
    startDate: '2025-11-01T00:00:00Z',
    endDate: '2025-11-07T23:59:59Z',
    hoursRemaining: 96,
    platform: '11st',
    description: '건강 관리의 시작! 애플워치와 함께하세요',
    highlights: ['추가 스트랩 증정', '무료 배송', '14일 반품 보장', '정품 등록 지원'],
    discountTiers: [
      { participantCount: 10, discountRate: 5, price: 569050 },
      { participantCount: 15, discountRate: 10, price: 539100 },
      { participantCount: 25, discountRate: 15, price: 509150 },
    ],
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
    currentParticipants: 0,
    targetParticipants: 30,
    participantGoal: 30,
    status: 'active',
    progress: 0,
    startDate: '2025-10-28T00:00:00Z',
    endDate: '2025-11-15T23:59:59Z', // 아직 진행 중
    hoursRemaining: 36,
    platform: 'coupang',
    description: '갤럭시 유저 필수템! 버즈2 프로를 저렴하게',
    highlights: ['당일배송 가능', '삼성 정품', '추가 케이스 증정', '1년 무상 A/S'],
    discountTiers: [
      { participantCount: 10, discountRate: 10, price: 233100 },
      { participantCount: 20, discountRate: 15, price: 220150 },
      { participantCount: 30, discountRate: 20, price: 207200 },
    ],
  },
  {
    id: 'nego-006',
    productId: 'lg-gram-17',
    productName: 'LG 그램 17인치 2024',
    productImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
    brand: 'LG',
    originalPrice: 2390000,
    targetPrice: 2031500,
    discountRate: 15,
    savings: 358500,
    currentParticipants: 0,
    targetParticipants: 15,
    participantGoal: 15,
    status: 'active',
    progress: 0,
    startDate: '2025-11-05T00:00:00Z',
    endDate: '2025-11-12T23:59:59Z',
    hoursRemaining: 120,
    platform: 'naver',
    description: '초경량 17인치 노트북의 정석! 그램과 함께하세요',
    highlights: ['사은품 풍성', '무이자 할부', '정품 등록', 'LG Care+ 할인'],
    discountTiers: [
      { participantCount: 5, discountRate: 8, price: 2198800 },
      { participantCount: 10, discountRate: 12, price: 2103200 },
      { participantCount: 15, discountRate: 15, price: 2031500 },
    ],
  },
];

// 네고딜 필터링 및 정렬 함수
export function getActiveNegoDeals(): NegoDeal[] {
  return mockNegoDeals.filter((deal) => deal.status === 'active' || deal.status === 'goal_reached');
}

export function getNegoDealsEndingSoon(): NegoDeal[] {
  return mockNegoDeals
    .filter((deal) => deal.status === 'active')
    .filter((deal) => deal.hoursRemaining <= 48)
    .sort((a, b) => a.hoursRemaining - b.hoursRemaining);
}

export function getNegoDealsNearGoal(): NegoDeal[] {
  return mockNegoDeals
    .filter((deal) => deal.status === 'active')
    .filter((deal) => deal.progress >= 70)
    .sort((a, b) => b.progress - a.progress);
}

export function getNegoDealById(id: string): NegoDeal | undefined {
  return mockNegoDeals.find((deal) => deal.id === id);
}

export function getNegoDealsForProduct(productId: string): NegoDeal[] {
  return mockNegoDeals.filter((deal) => deal.productId === productId);
}

// Export the NegoDeal type for backward compatibility
export type { NegoDeal } from '@/types/nego-deal';
