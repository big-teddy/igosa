import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * LikeService - Product Watchlist Management
 * Replaces localStorage-based likes with database storage
 */
export class LikeService {
    /**
     * Toggle like on a product (add/remove from watchlist)
     * @param userId User ID
     * @param productId Product ID
     * @param targetPrice Optional price threshold for auto-negotiation
     */
    async toggleLike(userId: string, productId: string, targetPrice?: number) {
        try {
            // Check if like exists
            const existing = await prisma.productLike.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });

            if (existing) {
                // Unlike: Remove from watchlist
                await prisma.productLike.delete({
                    where: { id: existing.id },
                });
                return { liked: false, like: null };
            } else {
                // Like: Add to watchlist
                const like = await prisma.productLike.create({
                    data: {
                        userId,
                        productId,
                        targetPrice,
                    },
                });
                return { liked: true, like };
            }
        } catch (error) {
            console.error('LikeService.toggleLike failed:', error);
            throw error;
        }
    }

    /**
     * Get user's liked products (watchlist)
     */
    async getUserLikes(userId: string) {
        try {
            return await prisma.productLike.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            console.error('LikeService.getUserLikes failed:', error);
            throw error;
        }
    }

    /**
     * Check if user has liked a product
     */
    async hasLiked(userId: string, productId: string): Promise<boolean> {
        try {
            const like = await prisma.productLike.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            return !!like;
        } catch (error) {
            console.error('LikeService.hasLiked failed:', error);
            return false;
        }
    }

    /**
     * Get like count for a product
     */
    async getLikeCount(productId: string): Promise<number> {
        try {
            return await prisma.productLike.count({
                where: { productId },
            });
        } catch (error) {
            console.error('LikeService.getLikeCount failed:', error);
            return 0;
        }
    }

    /**
     * Update target price for a liked product
     */
    async updateTargetPrice(userId: string, productId: string, targetPrice: number) {
        try {
            return await prisma.productLike.update({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
                data: { targetPrice },
            });
        } catch (error) {
            console.error('LikeService.updateTargetPrice failed:', error);
            throw error;
        }
    }

    /**
     * Get all users watching a product (for background jobs)
     * Used by Auto-Negotiation worker
     */
    async getProductWatchers(productId: string) {
        try {
            return await prisma.productLike.findMany({
                where: { productId },
                select: {
                    userId: true,
                    targetPrice: true,
                },
            });
        } catch (error) {
            console.error('LikeService.getProductWatchers failed:', error);
            return [];
        }
    }
}

// Export singleton
export const likeService = new LikeService();
