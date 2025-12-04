import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInvitationCode, buildShareUrl } from '@/lib/utils/invitation';
import { logger } from '@/lib/logger';
import type { InvitationCreateRequest, InvitationCreateResponse } from '@/types/invitation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/invitations/create
 * Create a new invitation code for sharing
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

        const body: InvitationCreateRequest = await request.json();
        const { negotiationId, source = 'kakao' } = body;

        if (!negotiationId) {
            return NextResponse.json(
                { error: 'Negotiation ID is required' },
                { status: 400 }
            );
        }

        // Verify negotiation exists
        const { data: negotiation, error: negError } = await supabase
            .from('negotiations')
            .select('id')
            .eq('id', negotiationId)
            .single();

        if (negError || !negotiation) {
            return NextResponse.json(
                { error: 'Negotiation not found' },
                { status: 404 }
            );
        }

        // Generate unique invitation code
        let code = generateInvitationCode();
        let attempts = 0;
        const maxAttempts = 5;

        // Ensure code is unique
        while (attempts < maxAttempts) {
            const { data: existing } = await supabase
                .from('invitations')
                .select('id')
                .eq('code', code)
                .single();

            if (!existing) break;

            code = generateInvitationCode();
            attempts++;
        }

        if (attempts >= maxAttempts) {
            return NextResponse.json(
                { error: 'Failed to generate unique code' },
                { status: 500 }
            );
        }

        // Create invitation
        const { data: invitation, error: createError } = await supabase
            .from('invitations')
            .insert({
                inviter_id: user.id,
                negotiation_id: negotiationId,
                code,
                source,
                reward_amount: 1000, // Default ₩1,000
            })
            .select()
            .single();

        if (createError) {
            logger.error('Failed to create invitation', createError);
            return NextResponse.json(
                { error: 'Failed to create invitation' },
                { status: 500 }
            );
        }

        // Track share event
        await supabase.from('share_events').insert({
            user_id: user.id,
            negotiation_id: negotiationId,
            invitation_id: invitation.id,
            platform: source,
            event_type: 'share_clicked',
        });

        // Build share URL
        const shareUrl = buildShareUrl(negotiationId, code, source);

        const response: InvitationCreateResponse = {
            invitation: {
                id: invitation.id,
                inviterId: invitation.inviter_id,
                inviteeId: invitation.invitee_id,
                negotiationId: invitation.negotiation_id,
                code: invitation.code,
                status: invitation.status,
                rewardAmount: invitation.reward_amount,
                rewardClaimed: invitation.reward_claimed,
                source: invitation.source,
                metadata: invitation.metadata,
                createdAt: invitation.created_at,
                acceptedAt: invitation.accepted_at,
                expiresAt: invitation.expires_at,
            },
            shareUrl,
            code,
        };

        return NextResponse.json(response);

    } catch (error) {
        logger.error('Invitation creation error', error as Error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
