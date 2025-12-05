import { FeedPost, Comment, FeedInteraction } from '@/types/social-feed';
import { notificationService } from './notification-service';

const LIKES_KEY = 'igosa-feed-likes';
const COMMENTS_KEY = 'igosa-feed-comments';
const BOOKMARKS_KEY = 'igosa-feed-bookmarks';
const POSTS_KEY = 'igosa-feed-posts';

/**
 * Social Feed Service
 * Manages social interactions (likes, comments, bookmarks) with localStorage
 */
class SocialFeedService {
  // ==================== POSTS ====================

  /**
   * Create a new post
   */
  createPost(
    userId: string,
    userName: string,
    productId: string,
    productName: string,
    productImage: string,
    content: string,
    type: FeedPost['type'] = 'recommendation',
    productPrice?: number,
    userAvatar?: string
  ): FeedPost {
    try {
      const newPost: FeedPost = {
        id: this.generateId(),
        userId,
        userName,
        userAvatar,
        type,
        productId,
        productName,
        productImage,
        productPrice,
        content,
        timestamp: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        isBookmarked: false,
      };

      const stored = localStorage.getItem(POSTS_KEY);
      const posts: FeedPost[] = stored ? JSON.parse(stored) : [];
      posts.unshift(newPost); // Add to beginning
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

      return newPost;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  /**
   * Get all posts
   */
  getPosts(): FeedPost[] {
    try {
      const stored = localStorage.getItem(POSTS_KEY);
      if (!stored) return [];

      const posts: FeedPost[] = JSON.parse(stored);
      return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get posts:', error);
      return [];
    }
  }

  /**
   * Get posts by user
   */
  getUserPosts(userId: string): FeedPost[] {
    try {
      const posts = this.getPosts();
      return posts.filter((post) => post.userId === userId);
    } catch (error) {
      console.error('Failed to get user posts:', error);
      return [];
    }
  }

  /**
   * Delete a post
   */
  deletePost(postId: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(POSTS_KEY);
      if (!stored) return false;

      let posts: FeedPost[] = JSON.parse(stored);
      const post = posts.find((p) => p.id === postId);

      // Only allow user to delete their own posts
      if (!post || post.userId !== userId) {
        return false;
      }

      posts = posts.filter((p) => p.id !== postId);
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
      return true;
    } catch (error) {
      console.error('Failed to delete post:', error);
      return false;
    }
  }

  // ==================== LIKES ====================

  /**
   * Check if user has liked a post
   */
  hasLiked(postId: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(LIKES_KEY);
      if (!stored) return false;

      const likes: FeedInteraction[] = JSON.parse(stored);
      return likes.some((like) => like.postId === postId && like.userId === userId);
    } catch (error) {
      console.error('Failed to check like status:', error);
      return false;
    }
  }

  /**
   * Toggle like on a post
   */
  toggleLike(postId: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(LIKES_KEY);
      const likes: FeedInteraction[] = stored ? JSON.parse(stored) : [];

      const existingIndex = likes.findIndex(
        (like) => like.postId === postId && like.userId === userId
      );

      if (existingIndex >= 0) {
        // Unlike
        likes.splice(existingIndex, 1);
        localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
        return false;
      } else {
        // Like
        likes.push({
          postId,
          userId,
          type: 'like',
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(LIKES_KEY, JSON.stringify(likes));

        // Notify post author about the like
        const post = this.getPostById(postId);
        if (post && post.userId !== userId) {
          // Don't notify if user likes their own post
          const liker = this.getUserInfo(userId);
          notificationService.createNotification(
            post.userId,
            'like',
            '❤️ 좋아요 알림',
            `${liker.name}님이 회원님의 게시물을 좋아합니다.`,
            {
              fromUserId: userId,
              fromUserName: liker.name,
              productId: post.productId,
              productName: post.productName,
              productImage: post.productImage,
            },
            `/feed?post=${postId}`
          );
        }

        return true;
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      return false;
    }
  }

  /**
   * Get like count for a post
   */
  getLikeCount(postId: string): number {
    try {
      const stored = localStorage.getItem(LIKES_KEY);
      if (!stored) return 0;

      const likes: FeedInteraction[] = JSON.parse(stored);
      return likes.filter((like) => like.postId === postId).length;
    } catch (error) {
      console.error('Failed to get like count:', error);
      return 0;
    }
  }

  // ==================== BOOKMARKS ====================

  /**
   * Check if user has bookmarked a post
   */
  hasBookmarked(postId: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (!stored) return false;

      const bookmarks: FeedInteraction[] = JSON.parse(stored);
      return bookmarks.some((bm) => bm.postId === postId && bm.userId === userId);
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
      return false;
    }
  }

  /**
   * Toggle bookmark on a post
   */
  toggleBookmark(postId: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      const bookmarks: FeedInteraction[] = stored ? JSON.parse(stored) : [];

      const existingIndex = bookmarks.findIndex(
        (bm) => bm.postId === postId && bm.userId === userId
      );

      if (existingIndex >= 0) {
        // Remove bookmark
        bookmarks.splice(existingIndex, 1);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        return false;
      } else {
        // Add bookmark
        bookmarks.push({
          postId,
          userId,
          type: 'bookmark',
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      return false;
    }
  }

  /**
   * Get user's bookmarked posts
   */
  getBookmarkedPosts(userId: string): string[] {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (!stored) return [];

      const bookmarks: FeedInteraction[] = JSON.parse(stored);
      return bookmarks
        .filter((bm) => bm.userId === userId)
        .map((bm) => bm.postId);
    } catch (error) {
      console.error('Failed to get bookmarked posts:', error);
      return [];
    }
  }

  // ==================== COMMENTS ====================

  /**
   * Get comments for a post
   */
  getComments(postId: string): Comment[] {
    try {
      const stored = localStorage.getItem(COMMENTS_KEY);
      if (!stored) return [];

      const allComments: Comment[] = JSON.parse(stored);
      return allComments
        .filter((comment) => comment.postId === postId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get comments:', error);
      return [];
    }
  }

  /**
   * Add a comment to a post
   */
  addComment(comment: Omit<Comment, 'id' | 'timestamp'>): Comment {
    try {
      const newComment: Comment = {
        ...comment,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
      };

      const stored = localStorage.getItem(COMMENTS_KEY);
      const allComments: Comment[] = stored ? JSON.parse(stored) : [];
      allComments.push(newComment);

      localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));

      // Notify post author about the comment
      const post = this.getPostById(comment.postId);
      if (post && post.userId !== comment.userId) {
        // Don't notify if user comments on their own post
        notificationService.createNotification(
          post.userId,
          'comment',
          '💬 댓글 알림',
          `${comment.userName}님이 회원님의 게시물에 댓글을 남겼습니다: "${newComment.content.substring(0, 50)}${newComment.content.length > 50 ? '...' : ''}"`,
          {
            fromUserId: comment.userId,
            fromUserName: comment.userName,
            productId: post.productId,
            productName: post.productName,
            productImage: post.productImage,
          },
          `/feed?post=${comment.postId}`
        );
      }

      return newComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  deleteComment(commentId: string, userId: string): boolean {
    try {
      const stored = localStorage.getItem(COMMENTS_KEY);
      if (!stored) return false;

      let allComments: Comment[] = JSON.parse(stored);
      const comment = allComments.find((c) => c.id === commentId);

      // Only allow user to delete their own comments
      if (!comment || comment.userId !== userId) {
        return false;
      }

      allComments = allComments.filter((c) => c.id !== commentId);
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
      return true;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return false;
    }
  }

  /**
   * Get comment count for a post
   */
  getCommentCount(postId: string): number {
    try {
      const stored = localStorage.getItem(COMMENTS_KEY);
      if (!stored) return 0;

      const allComments: Comment[] = JSON.parse(stored);
      return allComments.filter((comment) => comment.postId === postId).length;
    } catch (error) {
      console.error('Failed to get comment count:', error);
      return 0;
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get post by ID
   */
  private getPostById(postId: string): FeedPost | null {
    try {
      const stored = localStorage.getItem(POSTS_KEY);
      if (!stored) return null;

      const posts: FeedPost[] = JSON.parse(stored);
      return posts.find((post) => post.id === postId) || null;
    } catch (error) {
      console.error('Failed to get post by ID:', error);
      return null;
    }
  }

  /**
   * Get user info from localStorage
   */
  private getUserInfo(userId: string): { name: string; avatar?: string } {
    try {
      // Try to get user info from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.id === userId) {
          return {
            name: userData.name || userData.email || '사용자',
            avatar: userData.avatar,
          };
        }
      }

      // If user not found, return default
      return {
        name: '사용자',
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return {
        name: '사용자',
      };
    }
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(LIKES_KEY);
    localStorage.removeItem(COMMENTS_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
    localStorage.removeItem(POSTS_KEY);
  }
}

// Export singleton instance
export const socialFeedService = new SocialFeedService();
