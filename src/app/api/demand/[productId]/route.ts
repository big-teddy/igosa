/**
 * Demand Aggregation API
 *
 * GET /api/demand/[productId] - Get real-time demand aggregation for a product
 *
 * Phase 2: Redis-powered real-time demand aggregation
 *
 * Security:
 * - Public access: Only high-level aggregation (total users, peak price)
 * - Authenticated users: Full demand distribution data
 * - Sellers: All data including individual price points (future: role-based)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/errors/api-error';
import { success } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import { getDemandAggregation } from '@/lib/services/demand-aggregation-service';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/demand/[productId]
 * Get real-time demand aggregation for a product using Redis
 *
 * Returns different levels of detail based on authentication:
 * - Unauthenticated: Summary only (total users, peak price)
 * - Authenticated: Full distribution data
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) => {
  const startTime = Date.now();
  const { productId } = await params;

  // Check authentication (optional - determines detail level)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  logger.info('Fetching demand aggregation', {
    productId,
    authenticated: isAuthenticated,
    userId: user?.id,
  });

  // Get demand aggregation from Redis
  const demandData = await getDemandAggregation(productId);

  // Filter response based on authentication level
  let responseData = demandData;

  if (!isAuthenticated) {
    // Public access: Return limited data only
    responseData = {
      ...demandData,
      // Hide detailed distribution from unauthenticated users
      priceTiers: [],
    } as any; // Type assertion for partial response

    logger.info('Returning limited demand data for unauthenticated request', {
      productId,
    });
  }

  const duration = Date.now() - startTime;
  logger.apiResponse('GET', `/api/demand/${productId}`, 200, duration);

  return success(responseData, {
    productId,
    cached: duration < 50, // If very fast, it was cached
    authenticated: isAuthenticated,
  });
});
