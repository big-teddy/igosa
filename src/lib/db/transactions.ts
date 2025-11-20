/**
 * Database Transaction Utilities
 * Ensures data consistency for critical business operations
 *
 * Use Cases:
 * - Price tracking creation (DB + Redis)
 * - Order processing (DB + Payment gateway)
 * - Inventory management (DB + Cache)
 */

import { createClient } from '@/lib/supabase/server';
import { addDemandEntry, removeDemandEntry } from '@/lib/services/demand-aggregation-service';

/**
 * Price Tracking Creation Transaction
 * Ensures atomic operation across DB and Redis
 *
 * Workflow:
 * 1. Insert to price_tracking table
 * 2. Add demand entry to Redis
 * 3. If Redis fails, rollback DB insert
 */
export async function createPriceTrackingTransaction(data: {
  userId: string;
  productId: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  notificationChannels: string[];
}) {
  const supabase = await createClient();
  let trackingId: string | null = null;

  try {
    // Step 1: Insert to database
    const { data: tracking, error: dbError } = await supabase
      .from('price_tracking')
      .insert({
        user_id: data.userId,
        product_id: data.productId,
        product_name: data.productName,
        current_price: data.currentPrice,
        target_price: data.targetPrice,
        notification_channels: data.notificationChannels,
        status: 'active',
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    trackingId = tracking.id;

    // Step 2: Add to Redis demand aggregation
    try {
      await addDemandEntry(
        data.productId,
        data.userId,
        data.targetPrice
      );
    } catch (redisError) {
      // Rollback: Delete from database
      await supabase
        .from('price_tracking')
        .delete()
        .eq('id', trackingId);

      throw new Error('Failed to add demand entry to Redis');
    }

    // Step 3: Get updated similar users count
    const { count: similarUsersCount } = await supabase
      .from('price_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', data.productId)
      .eq('status', 'active')
      .gte('target_price', data.targetPrice * 0.95) // ±5% range
      .lte('target_price', data.targetPrice * 1.05);

    // Success: Both DB and Redis updated
    return {
      success: true,
      tracking: {
        ...tracking,
        similar_users_count: similarUsersCount || 0,
      },
    };

  } catch (error) {
    // Cleanup on failure
    if (trackingId) {
      try {
        await supabase
          .from('price_tracking')
          .delete()
          .eq('id', trackingId);
        console.log('Rolled back price tracking:', trackingId);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }

    console.error('Price tracking transaction failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Price Tracking Cancellation Transaction
 * Ensures atomic deletion from DB and Redis
 */
export async function cancelPriceTrackingTransaction(
  trackingId: string,
  userId: string
) {
  const supabase = await createClient();

  try {
    // Step 1: Get tracking data before deletion
    const { data: tracking, error: fetchError } = await supabase
      .from('price_tracking')
      .select('*')
      .eq('id', trackingId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !tracking) {
      throw new Error('Price tracking not found or unauthorized');
    }

    // Step 2: Remove from Redis
    try {
      await removeDemandEntry(tracking.product_id, userId);
    } catch (redisError) {
      console.warn('Failed to remove from Redis, continuing with DB deletion');
      // Continue anyway - eventual consistency is acceptable here
    }

    // Step 3: Mark as cancelled in database
    const { error: updateError } = await supabase
      .from('price_tracking')
      .update({ status: 'cancelled' })
      .eq('id', trackingId);

    if (updateError) {
      // Rollback Redis if DB update failed
      try {
        await addDemandEntry(
          tracking.product_id,
          userId,
          tracking.target_price
        );
      } catch (e) {
        console.error('Failed to rollback Redis:', e);
      }
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return {
      success: true,
    };

  } catch (error) {
    console.error('Cancel price tracking transaction failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Price Tracking Update Transaction
 * Updates target price in both DB and Redis
 */
export async function updatePriceTrackingTransaction(
  trackingId: string,
  userId: string,
  updates: {
    target_price?: number;
    notification_channels?: string[];
    status?: string;
  }
) {
  const supabase = await createClient();

  try {
    // Step 1: Get current data
    const { data: currentTracking, error: fetchError } = await supabase
      .from('price_tracking')
      .select('*')
      .eq('id', trackingId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentTracking) {
      throw new Error('Price tracking not found or unauthorized');
    }

    const oldTargetPrice = currentTracking.target_price;
    const newTargetPrice = updates.target_price || oldTargetPrice;

    // Step 2: Update Redis if target price changed
    if (updates.target_price && updates.target_price !== oldTargetPrice) {
      try {
        // Remove old entry
        await removeDemandEntry(currentTracking.product_id, userId);

        // Add new entry
        await addDemandEntry(
          currentTracking.product_id,
          userId,
          newTargetPrice
        );
      } catch (redisError) {
        // Rollback: re-add old entry
        try {
          await addDemandEntry(
            currentTracking.product_id,
            userId,
            oldTargetPrice
          );
        } catch (e) {
          console.error('Failed to rollback Redis:', e);
        }
        throw new Error('Failed to update demand in Redis');
      }
    }

    // Step 3: Update database
    const { data: updatedTracking, error: updateError } = await supabase
      .from('price_tracking')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trackingId)
      .select()
      .single();

    if (updateError) {
      // Rollback Redis if DB update failed
      if (updates.target_price && updates.target_price !== oldTargetPrice) {
        try {
          await removeDemandEntry(currentTracking.product_id, userId);
          await addDemandEntry(
            currentTracking.product_id,
            userId,
            oldTargetPrice
          );
        } catch (e) {
          console.error('Failed to rollback Redis:', e);
        }
      }
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return {
      success: true,
      tracking: updatedTracking,
    };

  } catch (error) {
    console.error('Update price tracking transaction failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Utility: Retry mechanism for transactional operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries - 1) {
        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}
