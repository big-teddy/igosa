export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'purchase' | 'review' | 'recommendation' | 'wishlist';
  productId: string;
  productName: string;
  productImage: string;
  productPrice?: number;
  content?: string;
  rating?: number;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likesCount?: number;
}

export interface FeedInteraction {
  postId: string;
  userId: string;
  type: 'like' | 'bookmark';
  timestamp: string;
}

export interface FeedFilters {
  type?: FeedPost['type'];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}
