/**
 * Price Tracking API Routes - Individual Tracking
 *
 * GET /api/price-tracking/[id] - Get specific price tracking
 * PATCH /api/price-tracking/[id] - Update price tracking
 * DELETE /api/price-tracking/[id] - Delete price tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for PATCH requests
const updatePriceTrackingSchema = z.object({
  target_price: z.number().positive().optional(),
  status: z.enum(['active', 'paused', 'triggered', 'cancelled', 'expired']).optional(),
  notification_channels: z.array(z.enum(['email', 'push', 'sms', 'kakao'])).optional(),
  updated_at: z.string().datetime().optional(),
}).strict(); // Reject any unknown fields

/**
 * GET /api/price-tracking/[id]
 * Get a specific price tracking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: tracking, error: queryError } = await supabase
      .from('price_tracking')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (queryError || !tracking) {
      return NextResponse.json(
        { error: 'Price tracking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tracking });
  } catch (error) {
    console.error('Error in GET /api/price-tracking/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/price-tracking/[id]
 * Update a price tracking (e.g., change target price, pause/resume)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = updatePriceTrackingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('price_tracking')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Price tracking not found' },
        { status: 404 }
      );
    }

    // Update tracking with validated data only
    const { data: updated, error: updateError } = await supabase
      .from('price_tracking')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update price tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tracking: updated });
  } catch (error) {
    console.error('Error in PATCH /api/price-tracking/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/price-tracking/[id]
 * Delete/cancel a price tracking
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Instead of hard delete, mark as cancelled
    const { error: updateError } = await supabase
      .from('price_tracking')
      .update({ status: 'cancelled' })
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to cancel price tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/price-tracking/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
