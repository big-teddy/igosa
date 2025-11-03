// 인플루언서 프로필
export interface InfluencerProfile {
  id: string;
  name: string;
  username: string; // @username
  platform: 'instagram' | 'youtube' | 'blog' | 'tiktok';
  avatar?: string;
  followers: number;
  category: string; // 전문 분야 (테크, 뷰티, 패션, 스포츠 등)
  trustScore: number; // 0-100
  verified: boolean;
}

// 인플루언서 리뷰
export interface InfluencerReview {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  influencerFollowers: number;
  platform: 'instagram' | 'youtube' | 'blog' | 'tiktok';
  productId: string;
  productName: string;
  rating?: number; // 1-5 (옵션)
  summary: string; // 리뷰 요약
  pros: string[];
  cons: string[];
  keyPoints: string[]; // 주요 포인트
  contentUrl: string; // 원본 콘텐츠 URL
  thumbnail?: string;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
  recommended: boolean;
}

// 유튜브 리뷰 (타임스탬프 포함)
export interface YouTubeReview extends InfluencerReview {
  platform: 'youtube';
  duration: string; // "12:34"
  timestamps: {
    time: string; // "2:15"
    description: string;
  }[];
  channelName: string;
  subscriberCount: number;
}

// Mock 인플루언서 데이터
export const mockInfluencers: InfluencerProfile[] = [
  {
    id: 'inf-1',
    name: '테크리뷰어',
    username: 'techreview_kr',
    platform: 'youtube',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techrev',
    followers: 245000,
    category: '테크/가젯',
    trustScore: 92,
    verified: true,
  },
  {
    id: 'inf-2',
    name: '운동하는개발자',
    username: 'fitcoder',
    platform: 'youtube',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitcoder',
    followers: 128000,
    category: '스포츠/피트니스',
    trustScore: 88,
    verified: true,
  },
  {
    id: 'inf-3',
    name: '뷰티인사이트',
    username: 'beauty_insight',
    platform: 'instagram',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beauty',
    followers: 892000,
    category: '뷰티/패션',
    trustScore: 95,
    verified: true,
  },
  {
    id: 'inf-4',
    name: '가성비킹',
    username: 'valueking',
    platform: 'blog',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=valueking',
    followers: 56000,
    category: '리빙/가전',
    trustScore: 85,
    verified: false,
  },
];

// Mock 인플루언서 리뷰
export const mockInfluencerReviews: InfluencerReview[] = [
  {
    id: 'inf-rev-1',
    influencerId: 'inf-1',
    influencerName: '테크리뷰어',
    influencerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techrev',
    influencerFollowers: 245000,
    platform: 'youtube',
    productId: 'airpods-pro-2',
    productName: '애플 에어팟 프로 2세대',
    rating: 5,
    summary: '1세대 대비 노이즈캔슬링 2배 향상, 배터리 수명 30% 증가. 애플 생태계 사용자라면 필수템',
    pros: ['강력한 ANC', '긴 배터리', '공간음향', 'H2 칩 성능'],
    cons: ['높은 가격', '안드로이드 호환성 제한'],
    keyPoints: [
      '1세대 대비 노캔 성능 2배 향상',
      '배터리 6시간 (1세대 4.5시간)',
      '케이스 스피커로 분실 방지',
    ],
    contentUrl: 'https://youtube.com/watch?v=example1',
    thumbnail: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    publishedAt: '2024-12-15',
    viewCount: 458000,
    likeCount: 12400,
    recommended: true,
  },
  {
    id: 'inf-rev-2',
    influencerId: 'inf-2',
    influencerName: '운동하는개발자',
    influencerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitcoder',
    influencerFollowers: 128000,
    platform: 'youtube',
    productId: 'nike-pegasus-40',
    productName: '나이키 에어 줌 페가수스 40',
    rating: 4,
    summary: '일상 러닝화로 완벽. 쿠셔닝 좋고 내구성 우수. 장거리보다는 5-10km 러닝에 최적',
    pros: ['편안한 쿠셔닝', '가벼운 무게', '내구성', '데일리 러닝 최적'],
    cons: ['장거리는 부족', '디자인 호불호'],
    keyPoints: [
      '페가수스 39 대비 쿠셔닝 15% 향상',
      '500km 이상 내구성 테스트 통과',
      '발볼 넓은 사람에게 추천',
    ],
    contentUrl: 'https://youtube.com/watch?v=example2',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    publishedAt: '2025-01-10',
    viewCount: 89000,
    likeCount: 3200,
    recommended: true,
  },
  {
    id: 'inf-rev-3',
    influencerId: 'inf-3',
    influencerName: '뷰티인사이트',
    influencerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beauty',
    influencerFollowers: 892000,
    platform: 'instagram',
    productId: 'dyson-airwrap',
    productName: '다이슨 에어랩 컴플리트',
    rating: 5,
    summary: '3개월 사용 후기. 헤어 손상 없이 다양한 스타일링 가능. 비싸지만 그만한 가치 있음',
    pros: ['모발 손상 최소화', '다양한 스타일링', '프리미엄 품질', '시간 절약'],
    cons: ['높은 가격', '무게감', '소음'],
    keyPoints: [
      '열 손상 없는 코안다 효과 기술',
      '6가지 어태치먼트로 다양한 스타일',
      '드라이+스타일링 동시 가능',
    ],
    contentUrl: 'https://instagram.com/p/example',
    thumbnail: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    publishedAt: '2025-01-20',
    likeCount: 45600,
    recommended: true,
  },
  {
    id: 'inf-rev-4',
    influencerId: 'inf-1',
    influencerName: '테크리뷰어',
    influencerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techrev',
    influencerFollowers: 245000,
    platform: 'youtube',
    productId: 'macbook-air-m3',
    productName: '맥북 에어 M3',
    rating: 5,
    summary: 'M3 칩 성능 미쳤음. 개발, 영상편집 모두 문제없음. 발열/소음 거의 없고 배터리 15시간+',
    pros: ['M3 칩 성능', '긴 배터리', '팬리스 설계', '가벼움'],
    cons: ['16GB 램 권장 (추가비용)', '포트 2개만'],
    keyPoints: [
      'M2 대비 CPU 20%, GPU 25% 성능 향상',
      '4K 영상 편집 가능',
      '배터리 15-18시간 실사용',
    ],
    contentUrl: 'https://youtube.com/watch?v=example4',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    publishedAt: '2024-11-20',
    viewCount: 1240000,
    likeCount: 38900,
    recommended: true,
  },
];

// 유튜브 리뷰 (타임스탬프 포함)
export const mockYouTubeReviews: YouTubeReview[] = [
  {
    id: 'yt-rev-1',
    influencerId: 'inf-1',
    influencerName: '테크리뷰어',
    influencerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techrev',
    influencerFollowers: 245000,
    platform: 'youtube',
    productId: 'airpods-pro-2',
    productName: '애플 에어팟 프로 2세대',
    rating: 5,
    summary: '1세대 대비 노이즈캔슬링 2배 향상, 배터리 수명 30% 증가',
    pros: ['강력한 ANC', '긴 배터리', '공간음향'],
    cons: ['높은 가격', '안드로이드 호환성'],
    keyPoints: ['노캔 성능 2배', '배터리 6시간', '케이스 스피커'],
    contentUrl: 'https://youtube.com/watch?v=example1',
    thumbnail: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    publishedAt: '2024-12-15',
    viewCount: 458000,
    likeCount: 12400,
    recommended: true,
    duration: '12:34',
    channelName: '테크리뷰어',
    subscriberCount: 245000,
    timestamps: [
      { time: '0:00', description: '인트로 및 개봉기' },
      { time: '2:15', description: '디자인 및 빌드 품질' },
      { time: '5:30', description: '노이즈캔슬링 테스트' },
      { time: '8:45', description: '음질 비교 (1세대 vs 2세대)' },
      { time: '10:20', description: '배터리 테스트 결과' },
      { time: '11:50', description: '최종 결론 및 추천' },
    ],
  },
];

// 유틸리티 함수
export function getInfluencerById(id: string): InfluencerProfile | undefined {
  return mockInfluencers.find(inf => inf.id === id);
}

export function getInfluencerReviewsByProduct(productId: string): InfluencerReview[] {
  return mockInfluencerReviews.filter(r => r.productId === productId);
}

export function getYouTubeReviewsByProduct(productId: string): YouTubeReview[] {
  return mockYouTubeReviews.filter(r => r.productId === productId);
}

export function getTopInfluencersByCategory(category: string, limit = 5): InfluencerProfile[] {
  return mockInfluencers
    .filter(inf => inf.category.includes(category))
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, limit);
}

export function getInfluencerReviewSummary(productId: string) {
  const reviews = getInfluencerReviewsByProduct(productId);
  
  if (reviews.length === 0) {
    return null;
  }

  const totalReviews = reviews.length;
  const avgRating = reviews
    .filter(r => r.rating)
    .reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.filter(r => r.rating).length;
  
  const recommendCount = reviews.filter(r => r.recommended).length;
  const totalViews = reviews.reduce((sum, r) => sum + (r.viewCount || 0), 0);

  // 가장 많이 언급된 장점/단점
  const allPros = reviews.flatMap(r => r.pros);
  const allCons = reviews.flatMap(r => r.cons);

  const prosCount: Record<string, number> = {};
  const consCount: Record<string, number> = {};

  allPros.forEach(pro => {
    prosCount[pro] = (prosCount[pro] || 0) + 1;
  });

  allCons.forEach(con => {
    consCount[con] = (consCount[con] || 0) + 1;
  });

  const topPros = Object.entries(prosCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([pro]) => pro);

  const topCons = Object.entries(consCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([con]) => con);

  return {
    totalReviews,
    avgRating: Math.round(avgRating * 10) / 10,
    recommendCount,
    recommendPercent: Math.round((recommendCount / totalReviews) * 100),
    totalViews,
    topPros,
    topCons,
    reviews: reviews.slice(0, 3), // 상위 3개만
  };
}
