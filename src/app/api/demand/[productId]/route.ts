/**
 * Demand Aggregation API
 * 
 * GET /api/demand/[productId] - Get demand aggregation for a product
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { DemandAggregation } from '@/types/price-tracking';

/**
 * GET /api/demand/[productId]
 * Get real-time demand aggregation for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = await createClient();

    // Get all active trackings for this product
    const { data: trackings, error: queryError } = await supabase
      .from('price_tracking')
      .select('target_price, user_id')
      .eq('product_id', params.productId)
      .eq('status', 'active');

    if (queryError) {
      console.error('Error fetching demand data:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch demand data' },
        { status: 500 }
      );
    }

    if (!trackings || trackings.length === 0) {
      return NextResponse.json({
        productId: params.productId,
        productName: `Product ${params.productId}`,
        timestamp: new Date().toISOString(),
        priceTiers: [],
        totalUsers: 0,
        peakDemandPrice: 0,
        avgTargetPrice: 0,
        medianTargetPrice: 0,
        priceRange: { min: 0, max: 0 },
      });
    }

    // Aggregate by price tiers (bucket by 10k)
    const priceMap = new Map<number, number>();
    let totalPrice = 0;
    const prices = trackings.map(t => t.target_price).sort((a, b) => a - b);

    trackings.forEach((tracking) => {
      const bucket = Math.floor(tracking.target_price / 10000) * 10000;
      priceMap.set(bucket, (priceMap.get(bucket) || 0) + 1);
      totalPrice += tracking.target_price;
    });

    // Calculate statistics
    const totalUsers = trackings.length;
    const avgTargetPrice = Math.floor(totalPrice / totalUsers);
    const medianTargetPrice = prices[Math.floor(prices.length / 2)];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Find peak demand price
    let peakDemandPrice = 0;
    let maxCount = 0;
    priceMap.forEach((count, price) => {
      if (count > maxCount) {
        maxCount = count;
        peakDemandPrice = price;
      }
    });

    // Convert to price tiers array
    const priceTiers = Array.from(priceMap.entries())
      .map(([price, userCount]) => ({
        price,
        userCount,
        percentage: (userCount / totalUsers) * 100,
      }))
      .sort((a, b) => a.price - b.price);

    const response: DemandAggregation = {
      productId: params.productId,
      productName: `Product ${params.productId}`, // TODO: Get from product service
      timestamp: new Date(),
      priceTiers,
      totalUsers,
      peakDemandPrice,
      avgTargetPrice,
      medianTargetPrice,
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/demand/[productId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
