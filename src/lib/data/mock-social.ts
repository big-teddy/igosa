// 사용자 프로필
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string; // 고유 사용자명 (@username)
  avatar?: string;
  bio?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  purchaseCount: number;
  reviewCount: number;
  trustScore: number; // 0-100, 신뢰도 점수
}

// 친구 관계
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// 소셜 활동 (친구의 구매, 리뷰, 추천)
export interface SocialActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'purchase' | 'review' | 'recommendation' | 'wishlist';
  productId: string;
  productName: string;
  productImage: string;
  content?: string; // 리뷰 내용 또는 추천 이유
  rating?: number; // 1-5
  timestamp: string;
  likesCount: number;
  commentsCount: number;
}

// 소셜 리뷰
export interface SocialReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number; // 1-5
  content: string;
  pros: string[];
  cons: string[];
  recommended: boolean;
  verified: boolean; // 구매 인증
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  helpfulCount: number;
}

// Mock 사용자 데이터
export const mockUsers: UserProfile[] = [
  {
    id: 'user-1',
    email: 'test@example.com',
    name: '김테스트',
    username: 'testuser',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    bio: '가성비 제품을 찾는 쇼핑 매니아',
    joinedDate: '2024-01-15',
    followersCount: 12,
    followingCount: 8,
    purchaseCount: 24,
    reviewCount: 18,
    trustScore: 85,
  },
  {
    id: 'user-2',
    email: 'johndoe@example.com',
    name: '이준호',
    username: 'junho_lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=junho',
    bio: '테크 얼리어답터 | 가젯 리뷰어',
    joinedDate: '2024-02-01',
    followersCount: 156,
    followingCount: 45,
    purchaseCount: 67,
    reviewCount: 52,
    trustScore: 92,
  },
  {
    id: 'user-3',
    email: 'minsu@example.com',
    name: '박민수',
    username: 'minsu_park',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minsu',
    bio: '운동 좋아하는 직장인',
    joinedDate: '2024-03-10',
    followersCount: 34,
    followingCount: 28,
    purchaseCount: 41,
    reviewCount: 29,
    trustScore: 78,
  },
  {
    id: 'user-4',
    email: 'sora@example.com',
    name: '최소라',
    username: 'sora_choi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sora',
    bio: '뷰티 & 패션 인플루언서',
    joinedDate: '2024-01-20',
    followersCount: 892,
    followingCount: 123,
    purchaseCount: 134,
    reviewCount: 98,
    trustScore: 95,
  },
  {
    id: 'user-5',
    email: 'jiyoung@example.com',
    name: '김지영',
    username: 'jiyoung_k',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jiyoung',
    bio: '홈트 & 헬스케어',
    joinedDate: '2024-02-15',
    followersCount: 67,
    followingCount: 52,
    purchaseCount: 38,
    reviewCount: 31,
    trustScore: 82,
  },
];

// Mock 친구 관계 (현재 로그인 유저: user-1)
export const mockFriendships: Friendship[] = [
  {
    id: 'friend-1',
    userId: 'user-1',
    friendId: 'user-2',
    status: 'accepted',
    createdAt: '2024-02-10',
  },
  {
    id: 'friend-2',
    userId: 'user-1',
    friendId: 'user-3',
    status: 'accepted',
    createdAt: '2024-03-15',
  },
  {
    id: 'friend-3',
    userId: 'user-1',
    friendId: 'user-4',
    status: 'accepted',
    createdAt: '2024-01-25',
  },
  {
    id: 'friend-4',
    userId: 'user-1',
    friendId: 'user-5',
    status: 'pending',
    createdAt: '2025-01-28',
  },
];

// Mock 소셜 활동 피드
export const mockSocialActivities: SocialActivity[] = [
  {
    id: 'activity-1',
    userId: 'user-2',
    userName: '이준호',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=junho',
    type: 'review',
    productId: 'airpods-pro-2',
    productName: '애플 에어팟 프로 2세대',
    productImage: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    content: '노이즈캔슬링이 정말 좋아요! 지하철에서도 음악만 들립니다. 강력 추천합니다.',
    rating: 5,
    timestamp: '2025-01-30T14:30:00',
    likesCount: 23,
    commentsCount: 5,
  },
  {
    id: 'activity-2',
    userId: 'user-3',
    userName: '박민수',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minsu',
    type: 'purchase',
    productId: 'nike-pegasus-40',
    productName: '나이키 에어 줌 페가수스 40',
    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    content: '드디어 샀다! 내일부터 러닝 시작',
    timestamp: '2025-01-29T09:15:00',
    likesCount: 8,
    commentsCount: 2,
  },
  {
    id: 'activity-3',
    userId: 'user-4',
    userName: '최소라',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sora',
    type: 'recommendation',
    productId: 'dyson-airwrap',
    productName: '다이슨 에어랩 컴플리트',
    productImage: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    content: '헤어 손상 걱정 없이 스타일링할 수 있어요. 비싸지만 그만한 가치 있어요!',
    rating: 5,
    timestamp: '2025-01-28T16:45:00',
    likesCount: 45,
    commentsCount: 12,
  },
  {
    id: 'activity-4',
    userId: 'user-2',
    userName: '이준호',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=junho',
    type: 'purchase',
    productId: 'macbook-air-m3',
    productName: '맥북 에어 M3',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    content: 'M3 칩 성능 미쳤다... 개발하기 너무 좋음',
    timestamp: '2025-01-27T11:20:00',
    likesCount: 34,
    commentsCount: 8,
  },
  {
    id: 'activity-5',
    userId: 'user-5',
    userName: '김지영',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jiyoung',
    type: 'wishlist',
    productId: 'sony-wh-1000xm5',
    productName: '소니 WH-1000XM5 헤드폰',
    productImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
    content: '다음 달 급여 타면 살 예정! 누가 써본 사람?',
    timestamp: '2025-01-26T19:30:00',
    likesCount: 5,
    commentsCount: 3,
  },
];

// Mock 소셜 리뷰
export const mockSocialReviews: SocialReview[] = [
  {
    id: 'social-review-1',
    userId: 'user-2',
    userName: '이준호',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=junho',
    productId: 'airpods-pro-2',
    rating: 5,
    content: '에어팟 프로 1세대 쓰다가 업그레이드했는데 노캔 성능이 확실히 좋아졌어요. 배터리도 오래가고 착용감도 편합니다.',
    pros: ['강력한 노이즈캔슬링', '긴 배터리 수명', '편안한 착용감'],
    cons: ['가격이 비쌈'],
    recommended: true,
    verified: true,
    timestamp: '2025-01-30T14:30:00',
    likesCount: 23,
    commentsCount: 5,
    helpfulCount: 18,
  },
  {
    id: 'social-review-2',
    userId: 'user-4',
    userName: '최소라',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sora',
    productId: 'dyson-airwrap',
    rating: 5,
    content: '3개월 사용 후기입니다. 헤어 손상 없이 다양한 스타일링이 가능해요. 처음엔 사용법이 어려웠지만 익숙해지면 편해요.',
    pros: ['모발 손상 최소화', '다양한 스타일링 가능', '프리미엄 품질'],
    cons: ['높은 가격', '초반 사용법 어려움', '무거운 편'],
    recommended: true,
    verified: true,
    timestamp: '2025-01-28T16:45:00',
    likesCount: 45,
    commentsCount: 12,
    helpfulCount: 38,
  },
];

// 유틸리티 함수들
export function getUserById(userId: string): UserProfile | undefined {
  return mockUsers.find(u => u.id === userId);
}

export function getUserByUsername(username: string): UserProfile | undefined {
  return mockUsers.find(u => u.username === username);
}

export function searchUsers(query: string): UserProfile[] {
  const lowerQuery = query.toLowerCase();
  return mockUsers.filter(
    u =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.username.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery)
  );
}

export function getFriends(userId: string): UserProfile[] {
  const friendships = mockFriendships.filter(
    f => (f.userId === userId || f.friendId === userId) && f.status === 'accepted'
  );

  return friendships.map(f => {
    const friendId = f.userId === userId ? f.friendId : f.userId;
    return getUserById(friendId);
  }).filter(Boolean) as UserProfile[];
}

export function getPendingFriendRequests(userId: string): UserProfile[] {
  const pending = mockFriendships.filter(
    f => f.friendId === userId && f.status === 'pending'
  );

  return pending.map(f => getUserById(f.userId)).filter(Boolean) as UserProfile[];
}

export function getSocialActivityFeed(userId: string): SocialActivity[] {
  const friends = getFriends(userId);
  const friendIds = friends.map(f => f.id);

  // 친구들의 활동만 필터링
  return mockSocialActivities
    .filter(a => friendIds.includes(a.userId))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getSocialReviewsByProduct(productId: string): SocialReview[] {
  return mockSocialReviews.filter(r => r.productId === productId);
}

export function getFriendPurchases(userId: string, productId: string): UserProfile[] {
  const friends = getFriends(userId);
  const friendIds = friends.map(f => f.id);

  const purchases = mockSocialActivities.filter(
    a => a.productId === productId &&
         a.type === 'purchase' &&
         friendIds.includes(a.userId)
  );

  return purchases.map(p => getUserById(p.userId)).filter(Boolean) as UserProfile[];
}

export function areFriends(userId1: string, userId2: string): boolean {
  return mockFriendships.some(
    f =>
      ((f.userId === userId1 && f.friendId === userId2) ||
        (f.userId === userId2 && f.friendId === userId1)) &&
      f.status === 'accepted'
  );
}
