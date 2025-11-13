'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  DollarSign,
  Users,
  ShoppingBag,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeedPost as FeedPostType } from '@/types/social-feed';
import { socialFeedService } from '@/lib/services/social-feed-service';
import { referralService } from '@/lib/services/referral-service';
import { toast } from 'sonner';

interface FeedPostProps {
  post: FeedPostType;
  currentUserId: string;
  onLike?: (postId: string, isLiked: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string, referralCode: string) => void;
}

export function FeedPost({ post, currentUserId, onLike, onComment, onShare }: FeedPostProps) {
  const [isLiked, setIsLiked] = useState(
    post.isLiked || socialFeedService.hasLiked(post.id, currentUserId)
  );
  const [isBookmarked, setIsBookmarked] = useState(
    post.isBookmarked || socialFeedService.hasBookmarked(post.id, currentUserId)
  );
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = () => {
    const newLikeState = socialFeedService.toggleLike(post.id, currentUserId);
    setIsLiked(newLikeState);
    setLikesCount((prev) => (newLikeState ? prev + 1 : prev - 1));
    onLike?.(post.id, newLikeState);
  };

  const handleBookmark = () => {
    const newBookmarkState = socialFeedService.toggleBookmark(post.id, currentUserId);
    setIsBookmarked(newBookmarkState);
    toast.success(newBookmarkState ? '저장되었습니다' : '저장 취소되었습니다');
  };

  const handleShare = () => {
    // Get or create referral link
    const referralLink = referralService.getOrCreateReferralLink(
      post.userId,
      post.id,
      post.productId
    );

    // Copy to clipboard
    const shareUrl = `${window.location.origin}/products/${post.productId}?ref=${referralLink.referralCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('링크가 복사되었습니다!');
    onShare?.(post.id, referralLink.referralCode);
  };

  const handleProductClick = () => {
    // Get or create referral link and track click
    const referralLink = referralService.getOrCreateReferralLink(
      post.userId,
      post.id,
      post.productId
    );
    referralService.trackClick(referralLink.referralCode);
  };

  const getActivityIcon = () => {
    switch (post.type) {
      case 'purchase':
        return <ShoppingBag className="h-4 w-4 text-green-600" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'recommendation':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'wishlist':
        return <Bookmark className="h-4 w-4 text-purple-600" />;
    }
  };

  const getActivityLabel = () => {
    switch (post.type) {
      case 'purchase':
        return '구매했어요';
      case 'review':
        return '리뷰를 남겼어요';
      case 'recommendation':
        return '추천해요';
      case 'wishlist':
        return '찜했어요';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden flex-shrink-0">
              {post.userAvatar ? (
                <img
                  src={post.userAvatar}
                  alt={post.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="h-5 w-5 text-primary" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{post.userName}</span>
                <span className="text-xs text-muted-foreground">{getActivityLabel()}</span>
                {getActivityIcon()}
              </div>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(post.timestamp)}</p>
            </div>
          </div>

          {/* Referral Badge */}
          <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
            <DollarSign className="h-3 w-3" />
            <span className="text-xs">추천 수익</span>
          </Badge>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">&quot;{post.content}&quot;</p>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/products/${post.productId}`} onClick={handleProductClick}>
        <div className="relative aspect-square bg-muted overflow-hidden cursor-pointer group">
          <img
            src={post.productImage}
            alt={post.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <Button
              size="lg"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              제품 보기
            </Button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 bg-muted/30">
        <Link href={`/products/${post.productId}`} onClick={handleProductClick}>
          <h4 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
            {post.productName}
          </h4>
        </Link>

        <div className="flex items-center justify-between">
          {post.productPrice && (
            <span className="text-lg font-bold text-primary">
              {post.productPrice.toLocaleString()}원
            </span>
          )}
          {post.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < post.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{post.rating}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like */}
            <motion.button
              onClick={handleLike}
              className="flex items-center gap-2 group"
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isLiked
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground group-hover:text-red-500'
                }`}
              />
              <span className="text-sm text-muted-foreground">{likesCount}</span>
            </motion.button>

            {/* Comment */}
            <button
              onClick={() => onComment?.(post.id)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{post.commentsCount}</span>
            </button>

            {/* Share */}
            <motion.button
              onClick={handleShare}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm">공유</span>
            </motion.button>
          </div>

          {/* Bookmark */}
          <motion.button onClick={handleBookmark} whileTap={{ scale: 0.9 }}>
            <Bookmark
              className={`h-5 w-5 transition-colors ${
                isBookmarked
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            />
          </motion.button>
        </div>
      </div>

      {/* Referral Info */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span>이 추천으로 구매 시 {post.userName}님에게 수수료가 지급됩니다</span>
        </div>
      </div>
    </Card>
  );
}
