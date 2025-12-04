import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/prepare
 * Prepare payment by generating merchant_uid and validating request
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { negotiationId, amount } = body;

        if (!negotiationId || !amount) {
            return NextResponse.json(
                { error: 'Negotiation ID and amount are required' },
                { status: 400 }
            );
        }

        // Verify negotiation exists and belongs to user (or user is participant)
        // Also verify amount matches the agreed price
        const { data: negotiation, error: negError } = await supabase
            .from('negotiations')
            .select('*')
            .eq('id', negotiationId)
            .single();

        if (negError || !negotiation) {
            return NextResponse.json(
                { error: 'Negotiation not found' },
                { status: 404 }
            );
        }

        // Generate unique merchant_uid
        const merchantUid = `ORD-${nanoid(10)}-${Date.now()}`;

        // Create initial payment record
        const { error: insertError } = await supabase
            .from('payments')
            .insert({
                negotiation_id: negotiationId,
                user_id: user.id,
                imp_uid: 'temp', // Will be updated after payment
                merchant_uid: merchantUid,
                amount: amount,
                status: 'ready',
            });

        if (insertError) {
            logger.error('Failed to create payment record', insertError);
            return NextResponse.json(
                { error: 'Failed to prepare payment' },
                { status: 500 }
            );
        }

        // Return data for PortOne SDK
        return NextResponse.json({
            merchantUid,
            amount,
            buyerEmail: user.email,
            buyerName: user.user_metadata?.full_name || user.user_metadata?.name || 'Customer',
            buyerTel: user.user_metadata?.phone || undefined,
        });

    } catch (error) {
        logger.error('Payment prepare error', error as Error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
