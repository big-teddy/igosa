import { FeedPost, Comment, FeedInteraction } from '@/types/social-feed';

const LIKES_KEY = 'igosa-feed-likes';
const COMMENTS_KEY = 'igosa-feed-comments';
const BOOKMARKS_KEY = 'igosa-feed-bookmarks';

/**
 * Social Feed Service
 * Manages social interactions (likes, comments, bookmarks) with localStorage
 */
class SocialFeedService {
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
      let likes: FeedInteraction[] = stored ? JSON.parse(stored) : [];

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
      let bookmarks: FeedInteraction[] = stored ? JSON.parse(stored) : [];

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
   * Clear all data (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(LIKES_KEY);
    localStorage.removeItem(COMMENTS_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
  }
}

// Export singleton instance
export const socialFeedService = new SocialFeedService();
