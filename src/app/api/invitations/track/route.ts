import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface TrackRequest {
    invitationId: string;
    eventType: 'share_completed' | 'link_opened';
    metadata?: Record<string, any>;
}

/**
 * POST /api/invitations/track
 * Track share events (share completed, link opened, etc.)
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user (optional for tracking, but good to have)
        const { data: { user } } = await supabase.auth.getUser();

        const body: TrackRequest = await request.json();
        const { invitationId, eventType, metadata = {} } = body;

        if (!invitationId || !eventType) {
            return NextResponse.json(
                { error: 'Invitation ID and event type are required' },
                { status: 400 }
            );
        }

        // Verify invitation exists
        const { data: invitation, error: findError } = await supabase
            .from('invitations')
            .select('id, negotiation_id, source, inviter_id')
            .eq('id', invitationId)
            .single();

        if (findError || !invitation) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        // Insert share event
        const { error: insertError } = await supabase
            .from('share_events')
            .insert({
                user_id: user?.id || invitation.inviter_id, // Use inviter ID if user not logged in (fallback) or handle anonymous tracking
                negotiation_id: invitation.negotiation_id,
                invitation_id: invitation.id,
                platform: invitation.source,
                event_type: eventType,
                metadata: {
                    ...metadata,
                    ip: request.headers.get('x-forwarded-for'),
                    userAgent: request.headers.get('user-agent'),
                },
            });

        if (insertError) {
            logger.error('Failed to track share event', insertError);
            return NextResponse.json(
                { error: 'Failed to track event' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        logger.error('Track API error', error as Error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
