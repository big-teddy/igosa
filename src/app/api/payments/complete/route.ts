import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/complete
 * Verify payment with PortOne and update status
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
        const { impUid, merchantUid, negotiationId } = body;

        if (!impUid || !merchantUid || !negotiationId) {
            return NextResponse.json(
                { error: 'Missing required payment information' },
                { status: 400 }
            );
        }

        // 1. Verify payment with PortOne API
        // Get access token
        const tokenResponse = await fetch('https://api.iamport.kr/users/getToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imp_key: process.env.PORTONE_API_KEY,
                imp_secret: process.env.PORTONE_API_SECRET,
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to get PortOne access token');
        }

        const { response: { access_token } } = await tokenResponse.json();

        // Get payment data
        const paymentResponse = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
            headers: { Authorization: access_token },
        });

        if (!paymentResponse.ok) {
            throw new Error('Failed to fetch payment data from PortOne');
        }

        const { response: paymentData } = await paymentResponse.json();

        // 2. Verify amount matches
        const { data: paymentRecord, error: fetchError } = await supabase
            .from('payments')
            .select('*')
            .eq('merchant_uid', merchantUid)
            .single();

        if (fetchError || !paymentRecord) {
            return NextResponse.json(
                { error: 'Payment record not found' },
                { status: 404 }
            );
        }

        if (paymentData.amount !== paymentRecord.amount) {
            // Amount mismatch - potential fraud
            await supabase
                .from('payments')
                .update({ status: 'failed', imp_uid: impUid })
                .eq('merchant_uid', merchantUid);

            return NextResponse.json(
                { error: 'Payment amount mismatch' },
                { status: 400 }
            );
        }

        // 3. Update payment status
        if (paymentData.status === 'paid') {
            const { data: updatedPayment, error: updateError } = await supabase
                .from('payments')
                .update({
                    status: 'paid',
                    imp_uid: impUid,
                    paid_at: new Date().toISOString(),
                    payment_method: paymentData.pay_method,
                })
                .eq('merchant_uid', merchantUid)
                .select()
                .single();

            if (updateError) {
                throw updateError;
            }

            // 4. Update negotiation status to accepted/completed
            await supabase
                .from('negotiations')
                .update({ status: 'accepted' }) // Or 'completed' depending on logic
                .eq('id', negotiationId);

            // 5. Create timeline event
            await supabase
                .from('negotiation_events')
                .insert({
                    negotiation_id: negotiationId,
                    event_type: 'deal_accepted',
                    message: '결제가 완료되었습니다.',
                    impact: 'positive',
                    event_data: {
                        amount: paymentData.amount,
                        method: paymentData.pay_method,
                    },
                });

            // 6. Give reward to inviter if applicable (check rewards table logic if needed)
            // This might be handled by a separate trigger or service

            return NextResponse.json({
                success: true,
                payment: updatedPayment,
            });
        } else {
            // Payment failed or cancelled
            await supabase
                .from('payments')
                .update({ status: paymentData.status, imp_uid: impUid })
                .eq('merchant_uid', merchantUid);

            return NextResponse.json(
                { error: `Payment status: ${paymentData.status}` },
                { status: 400 }
            );
        }

    } catch (error) {
        logger.error('Payment complete error', error as Error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
