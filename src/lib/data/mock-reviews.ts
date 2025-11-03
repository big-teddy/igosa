export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  images?: string[];
}

export const mockReviews: Review[] = [
  // Nike Pegasus 40
  {
    id: 'rev-1',
    productId: 'nike-pegasus-40',
    userId: 'user-1',
    userName: '김**',
    rating: 5,
    title: '일상 러닝화로 최고입니다',
    content: '매일 5km씩 달리는데 발이 전혀 안 아파요. 쿠셔닝이 정말 좋고 가벼워서 장거리 러닝에도 좋습니다. 디자인도 깔끔해서 평상시에도 신고 다니기 좋아요.',
    pros: ['뛰어난 쿠셔닝', '가벼운 무게', '세련된 디자인'],
    cons: ['가격이 조금 비싼 편'],
    verified: true,
    helpful: 45,
    createdAt: '2025-01-28',
  },
  {
    id: 'rev-2',
    productId: 'nike-pegasus-40',
    userId: 'user-2',
    userName: '이**',
    rating: 4,
    title: '만족스러운 구매',
    content: '처음엔 조금 딱딱한 느낌이었는데 길들이니까 편해졌어요. 통기성도 좋고 발이 잘 안 뜨거워집니다.',
    pros: ['좋은 통기성', '내구성 우수'],
    cons: ['초반 적응 기간 필요'],
    verified: true,
    helpful: 23,
    createdAt: '2025-01-25',
  },

  // AirPods Pro 2
  {
    id: 'rev-3',
    productId: 'airpods-pro-2',
    userId: 'user-3',
    userName: '박**',
    rating: 5,
    title: '노이즈캔슬링 끝판왕',
    content: '1세대에서 업그레이드했는데 노캔 성능이 확실히 좋아졌어요. 지하철에서도 음악만 들리고 주변 소음이 거의 안 들립니다. 배터리도 오래 가고요.',
    pros: ['강력한 노이즈캔슬링', '긴 배터리 수명', '편안한 착용감'],
    cons: ['높은 가격'],
    verified: true,
    helpful: 67,
    createdAt: '2025-01-30',
  },
  {
    id: 'rev-4',
    productId: 'airpods-pro-2',
    userId: 'user-4',
    userName: '최**',
    rating: 5,
    title: '아이폰 유저라면 필수',
    content: '아이폰과 연동이 너무 편리해요. 케이스만 열면 자동으로 연결되고 배터리 상태도 바로 확인 가능합니다. 음질도 훌륭합니다.',
    pros: ['완벽한 애플 생태계 연동', '우수한 음질'],
    cons: [],
    verified: true,
    helpful: 52,
    createdAt: '2025-01-27',
  },

  // Sony WH-1000XM5
  {
    id: 'rev-5',
    productId: 'sony-wh-1000xm5',
    userId: 'user-5',
    userName: '정**',
    rating: 5,
    title: '프리미엄 헤드폰의 정석',
    content: '노캔 성능이 정말 대단합니다. 비행기 타고 장거리 여행할 때 필수품이에요. 음질도 최상급이고 착용감도 편안합니다.',
    pros: ['최고의 노캔', '뛰어난 음질', '30시간 배터리'],
    cons: ['휴대성이 떨어짐'],
    verified: true,
    helpful: 89,
    createdAt: '2025-01-26',
  },

  // MacBook Air M3
  {
    id: 'rev-6',
    productId: 'macbook-air-m3',
    userId: 'user-6',
    userName: '강**',
    rating: 5,
    title: '대학생에게 완벽한 노트북',
    content: '개발 공부하면서 사용 중인데 M3 칩 성능이 정말 좋아요. 팬 소음도 전혀 없고 배터리가 하루종일 갑니다. 가볍고 얇아서 들고 다니기도 편해요.',
    pros: ['강력한 성능', '조용함', '긴 배터리', '가벼움'],
    cons: ['포트가 적음'],
    verified: true,
    helpful: 103,
    createdAt: '2025-01-29',
  },

  // iPad Pro 12.9
  {
    id: 'rev-7',
    productId: 'ipad-pro-12',
    userId: 'user-7',
    userName: '윤**',
    rating: 5,
    title: '디자인 작업용으로 최고',
    content: 'Procreate로 그림 그리는데 압박 감지가 너무 좋아요. M2 칩 덕분에 무거운 파일도 가볍게 처리합니다. 디스플레이 색감도 정확해요.',
    pros: ['뛰어난 디스플레이', '강력한 M2 칩', '완벽한 애플펜슬 지원'],
    cons: ['무게가 꽤 나감'],
    verified: true,
    helpful: 71,
    createdAt: '2025-01-24',
  },

  // Samsung Galaxy Buds3 Pro
  {
    id: 'rev-8',
    productId: 'galaxy-buds3-pro',
    userId: 'user-8',
    userName: '임**',
    rating: 4,
    title: '갤럭시 유저에게 추천',
    content: '갤럭시폰과 연동이 편리하고 노캔 성능도 좋습니다. 에어팟 프로와 비교해도 손색없는 수준이에요. 가성비가 좋은 편입니다.',
    pros: ['좋은 가성비', '강력한 노캔', '갤럭시 연동'],
    cons: ['통화 품질이 아쉬움'],
    verified: true,
    helpful: 34,
    createdAt: '2025-01-22',
  },

  // LG 그램 16
  {
    id: 'rev-9',
    productId: 'lg-gram-16',
    userId: 'user-9',
    userName: '한**',
    rating: 5,
    title: '가벼움이 최고의 장점',
    content: '16인치인데 1.2kg밖에 안 나가요. 출퇴근할 때 가방에 넣고 다니는데 전혀 무겁지 않습니다. 배터리도 정말 오래 가고요.',
    pros: ['초경량', '긴 배터리', '넓은 화면'],
    cons: ['빌드 품질이 약해 보임'],
    verified: true,
    helpful: 56,
    createdAt: '2025-01-20',
  },

  // Dyson Airwrap
  {
    id: 'rev-10',
    productId: 'dyson-airwrap',
    userId: 'user-10',
    userName: '오**',
    rating: 5,
    title: '비싸지만 그만한 가치가 있어요',
    content: '헤어 손상 없이 스타일링할 수 있어서 좋아요. 컬도 잘 나오고 볼륨도 살아납니다. 처음엔 사용법이 어려웠지만 익숙해지니 편해요.',
    pros: ['모발 손상 최소화', '다양한 스타일링', '프리미엄 품질'],
    cons: ['높은 가격', '초반 사용법 어려움'],
    verified: true,
    helpful: 92,
    createdAt: '2025-01-18',
  },
];

export function getProductReviews(productId: string): Review[] {
  return mockReviews.filter(review => review.productId === productId);
}

export function getReviewStats(productId: string) {
  const reviews = getProductReviews(productId);

  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return {
    totalReviews: reviews.length,
    averageRating: Number(averageRating.toFixed(1)),
    ratingDistribution: {
      5: ratingDistribution[5] || 0,
      4: ratingDistribution[4] || 0,
      3: ratingDistribution[3] || 0,
      2: ratingDistribution[2] || 0,
      1: ratingDistribution[1] || 0,
    },
  };
}
