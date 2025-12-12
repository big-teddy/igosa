import { likeService } from './like-service';
import { NegotiationService } from './negotiation-service';
import { scheduleJob } from '@/lib/background-jobs';

/**
 * AutoNegoService - Autonomous Negotiation Logic
 * Monitors watchlists and triggers negotiations automatically
 */
export class AutoNegoService {
    /**
     * Check if a product should trigger auto-negotiation
     * Called by background worker (QStash job)
     */
    async checkProduct(productId: string, currentPrice: number) {
        try {
            // Get all users watching this product
            const watchers = await likeService.getProductWatchers(productId);

            if (watchers.length === 0) {
                return { shouldTrigger: false, reason: 'No watchers' };
            }

            // Check if any watcher's target price is met
            const interestedWatchers = watchers.filter(
                (w: { targetPrice: number | null }) => w.targetPrice && currentPrice <= w.targetPrice
            );

            if (interestedWatchers.length === 0) {
                return { shouldTrigger: false, reason: 'Target price not met' };
            }

            // Check if negotiation is viable using NegotiationService logic
            const negoCheck = await NegotiationService.canTriggerNegotiation(productId);

            if (!negoCheck.canTrigger) {
                return { shouldTrigger: false, reason: negoCheck.reason };
            }

            // Trigger negotiation
            return { shouldTrigger: true, watchers: interestedWatchers };
        } catch (error) {
            console.error('AutoNegoService.checkProduct failed:', error);
            return { shouldTrigger: false, reason: 'Error' };
        }
    }

    /**
     * Schedule periodic watchlist checks for a product
     * @param productId Product to monitor
     * @param intervalHours How often to check (default: 24 hours)
     */
    async scheduleWatchlistCheck(productId: string, intervalHours: number = 24) {
        try {
            const delaySeconds = intervalHours * 3600;

            await scheduleJob(
                'check-watchlist',
                { productId },
                delaySeconds
            );

            return { success: true };
        } catch (error) {
            console.error('AutoNegoService.scheduleWatchlistCheck failed:', error);
            return { success: false, error };
        }
    }

    /**
     * Batch check all popular products
     * Called by a daily cron job
     */
    async batchCheckWatchlists() {
        try {
            // TODO: Query products with most watchers
            // For now, this is a placeholder
            console.log('AutoNegoService.batchCheckWatchlists: Not yet implemented');
            return { success: true, checked: 0 };
        } catch (error) {
            console.error('AutoNegoService.batchCheckWatchlists failed:', error);
            return { success: false, error };
        }
    }
}

// Export singleton
export const autoNegoService = new AutoNegoService();
