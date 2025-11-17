/**
 * Mock Price Update Simulator
 *
 * Simulates price changes for testing the Price Tracking system
 * In production, this would be replaced by actual price crawling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { priceAlertNotification } from '@/lib/services/price-alert-notification';
import type { PriceAlertEvent } from '@/types/price-tracking';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all active price trackings
    const { data: trackings, error: fetchError } = await supabase
      .from('price_tracking')
      .select('*')
      .eq('status', 'active');

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch trackings', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!trackings || trackings.length === 0) {
      return NextResponse.json({
        message: 'No active trackings to update',
        updated: 0,
      });
    }

    const updates = [];
    const triggered = [];

    for (const tracking of trackings) {
      // Simulate price change: -5% to +3% of current price
      const changePercent = (Math.random() * 0.08) - 0.05; // -5% to +3%
      const newPrice = Math.floor(tracking.current_price * (1 + changePercent));

      // Don't let price go below 50% or above 150% of original
      const clampedPrice = Math.max(
        tracking.current_price * 0.5,
        Math.min(tracking.current_price * 1.5, newPrice)
      );

      // Check if target price is reached
      const targetReached = clampedPrice <= tracking.target_price;

      // Update the tracking
      const { error: updateError } = await supabase
        .from('price_tracking')
        .update({
          current_price: clampedPrice,
          last_checked_at: new Date().toISOString(),
          status: targetReached ? 'triggered' : 'active',
          triggered_at: targetReached ? new Date().toISOString() : null,
        })
        .eq('id', tracking.id);

      if (!updateError) {
        updates.push({
          id: tracking.id,
          productName: tracking.product_name,
          oldPrice: tracking.current_price,
          newPrice: clampedPrice,
          targetPrice: tracking.target_price,
          triggered: targetReached,
        });

        // If triggered, create price alert
        if (targetReached) {
          const { error: alertError } = await supabase
            .from('price_alerts')
            .insert({
              tracking_id: tracking.id,
              user_id: tracking.user_id,
              product_id: tracking.product_id,
              product_name: tracking.product_name,
              target_price: tracking.target_price,
              current_price: clampedPrice,
              price_drop_amount: tracking.current_price - clampedPrice,
              price_drop_percentage: ((tracking.current_price - clampedPrice) / tracking.current_price * 100),
              triggered_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            });

          if (!alertError) {
            triggered.push({
              productName: tracking.product_name,
              targetPrice: tracking.target_price,
              currentPrice: clampedPrice,
              savings: tracking.current_price - clampedPrice,
            });

            // Send notification
            const alertEvent: PriceAlertEvent = {
              trackingId: tracking.id,
              userId: tracking.user_id,
              productId: tracking.product_id,
              productName: tracking.product_name,
              targetPrice: tracking.target_price,
              currentPrice: clampedPrice,
              priceDropAmount: tracking.current_price - clampedPrice,
              priceDropPercentage: ((tracking.current_price - clampedPrice) / tracking.current_price * 100),
              triggeredAt: new Date(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              purchaseUrl: `/products/${tracking.product_id}`,
            };

            // Get user email from Supabase Auth
            const { data: { user } } = await supabase.auth.admin.getUserById(tracking.user_id);

            if (user?.email) {
              try {
                await priceAlertNotification.send({
                  userId: tracking.user_id,
                  userEmail: user.email,
                  userName: user.user_metadata?.name,
                  event: alertEvent,
                  channels: tracking.notification_channels || ['push'],
                });
              } catch (notifError) {
                console.error('Failed to send notification:', notifError);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Price simulation completed',
      updated: updates.length,
      triggered: triggered.length,
      details: {
        updates,
        triggered,
      },
    });
  } catch (error: any) {
    console.error('Error simulating price updates:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to view simulation stats
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get stats about trackings
    const { data: trackings, error } = await supabase
      .from('price_tracking')
      .select('status');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stats = {
      total: trackings?.length || 0,
      active: trackings?.filter(t => t.status === 'active').length || 0,
      triggered: trackings?.filter(t => t.status === 'triggered').length || 0,
      paused: trackings?.filter(t => t.status === 'paused').length || 0,
      expired: trackings?.filter(t => t.status === 'expired').length || 0,
      cancelled: trackings?.filter(t => t.status === 'cancelled').length || 0,
    };

    return NextResponse.json({
      message: 'Price tracking statistics',
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
