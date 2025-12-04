import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateRewardAmount } from '@/lib/utils/reward-config';
import { logger } from '@/lib/logger';
import type { InvitationAcceptRequest, InvitationAcceptResponse } from '@/types/invitation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/invitations/accept
 * Accept an invitation and claim reward
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

        const body: InvitationAcceptRequest = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Invitation code is required' },
                { status: 400 }
            );
        }

        // Find invitation
        const { data: invitation, error: findError } = await supabase
            .from('invitations')
            .select('*')
            .eq('code', code)
            .single();

        if (findError || !invitation) {
            return NextResponse.json(
                { error: 'Invalid invitation code' },
                { status: 404 }
            );
        }

        // Check if already accepted
        if (invitation.status === 'accepted' || invitation.status === 'used') {
            return NextResponse.json(
                { error: 'Invitation already used' },
                { status: 400 }
            );
        }

        // Check if expired
        if (new Date(invitation.expires_at) < new Date()) {
            await supabase
                .from('invitations')
                .update({ status: 'expired' })
                .eq('id', invitation.id);

            return NextResponse.json(
                { error: 'Invitation expired' },
                { status: 400 }
            );
        }

        // Check if user is trying to accept their own invitation
        if (invitation.inviter_id === user.id) {
            return NextResponse.json(
                { error: 'Cannot accept your own invitation' },
                { status: 400 }
            );
        }

        // Update invitation status
        const { data: updatedInvitation, error: updateError } = await supabase
            .from('invitations')
            .update({
                invitee_id: user.id,
                status: 'accepted',
                accepted_at: new Date().toISOString(),
            })
            .eq('id', invitation.id)
            .select()
            .single();

        if (updateError) {
            logger.error('Failed to update invitation', updateError);
            return NextResponse.json(
                { error: 'Failed to accept invitation' },
                { status: 500 }
            );
        }

        // Create reward for inviter
        const rewardAmount = calculateRewardAmount('invitation_accepted');
        const { data: reward, error: rewardError } = await supabase
            .from('rewards')
            .insert({
                user_id: invitation.inviter_id,
                invitation_id: invitation.id,
                type: 'invitation_accepted',
                amount: rewardAmount,
                description: `친구 초대 보상: ${code}`,
            })
            .select()
            .single();

        if (rewardError) {
            logger.error('Failed to create reward', rewardError);
        }

        // Track acceptance event
        await supabase.from('share_events').insert({
            user_id: invitation.inviter_id,
            negotiation_id: invitation.negotiation_id,
            invitation_id: invitation.id,
            platform: invitation.source,
            event_type: 'invitation_accepted',
            metadata: {
                invitee_id: user.id,
            },
        });

        const response: InvitationAcceptResponse = {
            success: true,
            invitation: {
                id: updatedInvitation.id,
                inviterId: updatedInvitation.inviter_id,
                inviteeId: updatedInvitation.invitee_id,
                negotiationId: updatedInvitation.negotiation_id,
                code: updatedInvitation.code,
                status: updatedInvitation.status,
                rewardAmount: updatedInvitation.reward_amount,
                rewardClaimed: updatedInvitation.reward_claimed,
                source: updatedInvitation.source,
                metadata: updatedInvitation.metadata,
                createdAt: updatedInvitation.created_at,
                acceptedAt: updatedInvitation.accepted_at,
                expiresAt: updatedInvitation.expires_at,
            },
            reward: reward ? {
                id: reward.id,
                userId: reward.user_id,
                invitationId: reward.invitation_id,
                type: reward.type,
                amount: reward.amount,
                status: reward.status,
                description: reward.description,
                createdAt: reward.created_at,
                claimedAt: reward.claimed_at,
                expiresAt: reward.expires_at,
            } : null,
        };

        return NextResponse.json(response);

    } catch (error) {
        logger.error('Invitation acceptance error', error as Error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
