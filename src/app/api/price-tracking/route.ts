/**
 * Price Tracking API Routes
 * 
 * POST /api/price-tracking - Create price tracking
 * GET /api/price-tracking - Get user's price trackings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { CreatePriceTrackingRequest, CreatePriceTrackingResponse } from '@/types/price-tracking';

/**
 * POST /api/price-tracking
 * Create a new price tracking record
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePriceTrackingRequest = await request.json();
    const { productId, targetPrice, maxAcceptableDelta, notificationChannels, autoPurchase, expiresAt } = body;

    // Validate required fields
    if (!productId || !targetPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, targetPrice' },
        { status: 400 }
      );
    }

    // Get user from session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Get product info from product service
    // For now, use mock data
    const productName = `Product ${productId}`;
    const currentPrice = targetPrice * 1.3; // Mock: current price is 30% higher

    // Insert into price_tracking table
    const { data, error: insertError } = await supabase
      .from('price_tracking')
      .insert({
        user_id: user.id,
        product_id: productId,
        product_name: productName,
        target_price: targetPrice,
        current_price: Math.floor(currentPrice),
        max_acceptable_delta: maxAcceptableDelta || 3000,
        notification_channels: notificationChannels || ['push'],
        auto_purchase: autoPurchase || false,
        expires_at: expiresAt || null,
        status: 'active',
      })
      .select();

    const tracking = data?.[0];

    if (insertError) {
      logger.error('Error creating price tracking:', undefined, { error: insertError });
      return NextResponse.json(
        { error: 'Failed to create price tracking', details: insertError.message },
        { status: 500 }
      );
    }

    // Calculate estimated probability
    const minPrice = Math.floor(currentPrice * 0.7);
    const avgPrice = Math.floor((currentPrice + minPrice) / 2);
    const probability = calculateProbability(targetPrice, currentPrice, minPrice, avgPrice);

    // Get similar users count
    const { count: similarUsersCount } = await supabase
      .from('price_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('status', 'active')
      .gte('target_price', targetPrice * 0.95)
      .lte('target_price', targetPrice * 1.05);

    const response: CreatePriceTrackingResponse = {
      trackingId: tracking.id,
      status: tracking.status,
      currentPrice: tracking.current_price,
      targetPrice: tracking.target_price,
      estimatedProbability: probability,
      similarUsersCount: similarUsersCount || 0,
      createdAt: tracking.created_at,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/price-tracking', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/price-tracking
 * Get all price trackings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');

    let query = supabase
      .from('price_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: trackings, error: queryError } = await query;

    if (queryError) {
      logger.error('Error fetching price trackings:', undefined, { error: queryError });
      return NextResponse.json(
        { error: 'Failed to fetch price trackings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ trackings: trackings || [] });
  } catch (error) {
    logger.error('Error in GET /api/price-tracking', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate probability of reaching target price within 30 days
 * Simple heuristic for MVP
 */
function calculateProbability(
  targetPrice: number,
  currentPrice: number,
  minPrice: number,
  avgPrice: number
): number {
  if (targetPrice >= currentPrice) return 0.95;
  if (targetPrice <= minPrice) return 0.15;

  const range = currentPrice - minPrice;
  const position = currentPrice - targetPrice;
  const ratio = position / range;

  // Linear interpolation: 15% at min, 95% at current
  return Math.min(Math.max(0.15 + ratio * 0.8, 0), 1);
}
