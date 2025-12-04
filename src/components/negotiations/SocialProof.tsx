'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SocialProofProps {
    negotiationId: string;
    maxDisplay?: number;
}

interface Participant {
    id: string;
    name: string;
    avatarUrl?: string;
}

export function SocialProof({ negotiationId, maxDisplay = 3 }: SocialProofProps) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        async function fetchParticipants() {
            const supabase = createClient();

            // Fetch accepted invitations for this negotiation
            const { data: invitations } = await supabase
                .from('invitations')
                .select(`
          invitee_id,
          invitee:invitee_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
                .eq('negotiation_id', negotiationId)
                .eq('status', 'accepted')
                .limit(10);

            if (invitations) {
                const parts = invitations
                    .filter(inv => inv.invitee)
                    .map(inv => {
                        const meta = (inv.invitee as any).raw_user_meta_data || {};
                        return {
                            id: (inv.invitee as any).id,
                            name: meta.full_name || meta.name || (inv.invitee as any).email?.split('@')[0] || '익명',
                            avatarUrl: meta.avatar_url,
                        };
                    });

                // Remove duplicates
                const uniqueParts = Array.from(new Map(parts.map(p => [p.id, p])).values());
                setParticipants(uniqueParts);
                setTotalCount(uniqueParts.length);
            }
        }

        fetchParticipants();
    }, [negotiationId]);

    if (totalCount === 0) return null;

    return (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex -space-x-2">
                <TooltipProvider>
                    {participants.slice(0, maxDisplay).map((p) => (
                        <Tooltip key={p.id}>
                            <TooltipTrigger>
                                <Avatar className="w-6 h-6 border-2 border-background">
                                    <AvatarImage src={p.avatarUrl} />
                                    <AvatarFallback className="text-[10px]">
                                        {p.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{p.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
                {totalCount > maxDisplay && (
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                        +{totalCount - maxDisplay}
                    </div>
                )}
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {participants[0].name}님 외 {totalCount - 1 > 0 ? `${totalCount - 1}명이` : ''} 참여 중
            </p>
        </div>
    );
}
