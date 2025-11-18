/**
 * Price Tracking API Routes (Improved Version)
 *
 * POST /api/price-tracking - Create price tracking
 * GET /api/price-tracking - Get user's price trackings
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandling, BadRequestError, DatabaseError } from '@/lib/errors/api-error';
import { requireAuth } from '@/lib/api/auth';
import { created, success, paginated } from '@/lib/api/response';
import { validateBody, validateQuery, CommonSchemas } from '@/lib/api/validation';
import { logger } from '@/lib/logger';
import { addDemandEntry } from '@/lib/services/demand-aggregation-service';
import type { CreatePriceTrackingResponse } from '@/types/price-tracking';

/**
 * Validation Schemas
 */
const CreatePriceTrackingSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  targetPrice: CommonSchemas.price,
  maxAcceptableDelta: CommonSchemas.price.optional().default(3000),
  notificationChannels: z
    .array(z.enum(['push', 'email', 'kakao', 'sms']))
    .optional()
    .default(['push']),
  autoPurchase: z.boolean().optional().default(false),
  expiresAt: CommonSchemas.timestamp.optional(),
});

const GetPriceTrackingsSchema = z.object({
  status: z.enum(['active', 'triggered', 'paused', 'expired', 'cancelled']).optional(),
  productId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * POST /api/price-tracking
 * Create a new price tracking record
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const startTime = Date.now();

  // Authenticate user
  const authUser = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validated = await validateBody(CreatePriceTrackingSchema, body);

  logger.info('Creating price tracking', {
    userId: authUser.id,
    productId: validated.productId,
    targetPrice: validated.targetPrice,
  });

  const supabase = await createClient();

  // Check for existing active tracking
  const { data: existingTracking } = await supabase
    .from('price_tracking')
    .select('id')
    .eq('user_id', authUser.id)
    .eq('product_id', validated.productId)
    .eq('status', 'active')
    .single();

  if (existingTracking) {
    throw new BadRequestError('Active price tracking already exists for this product', {
      existingTrackingId: existingTracking.id,
    });
  }

  // TODO: Get product info from product service
  // For now, use mock data
  const productName = `Product ${validated.productId}`;
  const currentPrice = Math.floor(validated.targetPrice * 1.3); // Mock: 30% higher

  // Insert into price_tracking table
  const { data: tracking, error: insertError } = await supabase
    .from('price_tracking')
    .insert({
      user_id: authUser.id,
      product_id: validated.productId,
      product_name: productName,
      target_price: validated.targetPrice,
      current_price: currentPrice,
      max_acceptable_delta: validated.maxAcceptableDelta,
      notification_channels: validated.notificationChannels,
      auto_purchase: validated.autoPurchase,
      expires_at: validated.expiresAt || null,
      status: 'active',
    })
    .select()
    .single();

  if (insertError || !tracking) {
    logger.error('Failed to create price tracking', insertError || undefined, {
      userId: authUser.id,
      productId: validated.productId,
    });
    throw new DatabaseError(
      insertError?.message || 'Failed to create price tracking',
      insertError || undefined
    );
  }

  // Add to Redis demand aggregation (fire and forget)
  try {
    await addDemandEntry(validated.productId, authUser.id, validated.targetPrice);
  } catch (redisError) {
    // Log but don't fail the request
    logger.warn('Failed to add demand entry to Redis', {
      error: redisError,
      productId: validated.productId,
    });
  }

  // Calculate estimated probability
  const minPrice = Math.floor(currentPrice * 0.7);
  const probability = calculateProbability(validated.targetPrice, currentPrice, minPrice);

  // Get similar users count
  const { count: similarUsersCount } = await supabase
    .from('price_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', validated.productId)
    .eq('status', 'active')
    .gte('target_price', validated.targetPrice * 0.95)
    .lte('target_price', validated.targetPrice * 1.05);

  const response: CreatePriceTrackingResponse = {
    trackingId: tracking.id,
    status: tracking.status,
    currentPrice: tracking.current_price,
    targetPrice: tracking.target_price,
    estimatedProbability: probability,
    similarUsersCount: similarUsersCount || 0,
    createdAt: tracking.created_at,
  };

  const duration = Date.now() - startTime;
  logger.apiResponse('POST', '/api/price-tracking', 201, duration);

  return created(response, {
    userId: authUser.id,
    productId: validated.productId,
  });
});

/**
 * GET /api/price-tracking
 * Get all price trackings for the authenticated user
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const startTime = Date.now();

  // Authenticate user
  const authUser = await requireAuth(request);

  // Parse and validate query parameters
  const url = new URL(request.url);
  const params = validateQuery(GetPriceTrackingsSchema, url.searchParams);

  logger.info('Fetching price trackings', {
    userId: authUser.id,
    status: params.status,
    productId: params.productId,
    page: params.page,
  });

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('price_tracking')
    .select('*', { count: 'exact' })
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false });

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.productId) {
    query = query.eq('product_id', params.productId);
  }

  // Apply pagination
  const offset = (params.page - 1) * params.limit;
  query = query.range(offset, offset + params.limit - 1);

  const { data: trackings, error: queryError, count } = await query;

  if (queryError) {
    logger.error('Failed to fetch price trackings', queryError || undefined, {
      userId: authUser.id,
    });
    throw new DatabaseError(queryError.message, queryError || undefined);
  }

  const duration = Date.now() - startTime;
  logger.apiResponse('GET', '/api/price-tracking', 200, duration);

  return paginated(trackings || [], {
    page: params.page,
    limit: params.limit,
    total: count || 0,
  });
});

/**
 * Calculate probability of reaching target price within 30 days
 * Simple heuristic for MVP
 */
function calculateProbability(
  targetPrice: number,
  currentPrice: number,
  minPrice: number
): number {
  if (targetPrice >= currentPrice) return 0.95;
  if (targetPrice <= minPrice) return 0.15;

  const range = currentPrice - minPrice;
  const position = currentPrice - targetPrice;
  const ratio = position / range;

  // Linear interpolation: 15% at min, 95% at current
  return Math.min(Math.max(0.15 + ratio * 0.8, 0.15), 0.95);
}
