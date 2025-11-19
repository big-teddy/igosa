/**
 * Demand Aggregation API
 *
 * GET /api/demand/[productId] - Get real-time demand aggregation for a product
 *
 * Phase 2: Redis-powered real-time demand aggregation
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/errors/api-error';
import { success } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import { getDemandAggregation } from '@/lib/services/demand-aggregation-service';

/**
 * GET /api/demand/[productId]
 * Get real-time demand aggregation for a product using Redis
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { productId: string } }
) => {
  const startTime = Date.now();
  const { productId } = params;

  logger.info('Fetching demand aggregation', { productId });

  // Get demand aggregation from Redis
  const demandData = await getDemandAggregation(productId);

  const duration = Date.now() - startTime;
  logger.apiResponse('GET', `/api/demand/${productId}`, 200, duration);

  return success(demandData, {
    productId,
    cached: duration < 50, // If very fast, it was cached
  });
});
