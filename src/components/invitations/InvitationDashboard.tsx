'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Gift, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { UserSocialStats, Invitation } from '@/types/invitation';

export function InvitationDashboard() {
    const [stats, setStats] = useState<UserSocialStats | null>(null);
    const [recentInvitations, setRecentInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Fetch stats
            const { data: statsData } = await supabase
                .from('user_social_stats')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (statsData) {
                setStats({
                    userId: statsData.user_id,
                    totalInvitationsSent: statsData.total_invitations_sent,
                    totalInvitationsAccepted: statsData.total_invitations_accepted,
                    totalRewardsEarned: statsData.total_rewards_earned,
                    totalRewardsClaimed: statsData.total_rewards_claimed,
                    totalShares: statsData.total_shares,
                    viralScore: statsData.viral_score,
                    lastShareAt: statsData.last_share_at,
                    updatedAt: statsData.updated_at,
                });
            }

            // Fetch recent invitations
            const { data: invitationsData } = await supabase
                .from('invitations')
                .select('*')
                .eq('inviter_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (invitationsData) {
                setRecentInvitations(invitationsData.map(inv => ({
                    id: inv.id,
                    inviterId: inv.inviter_id,
                    inviteeId: inv.invitee_id,
                    negotiationId: inv.negotiation_id,
                    code: inv.code,
                    status: inv.status,
                    rewardAmount: inv.reward_amount,
                    rewardClaimed: inv.reward_claimed,
                    source: inv.source,
                    metadata: inv.metadata,
                    createdAt: inv.created_at,
                    acceptedAt: inv.accepted_at,
                    expiresAt: inv.expires_at,
                })));
            }

            setLoading(false);
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>친구 초대 현황</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!stats && recentInvitations.length === 0) {
        return null; // Don't show if no activity
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    친구 초대 현황
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">총 적립 쿠폰</p>
                        <p className="text-2xl font-bold text-primary">
                            ₩{stats?.totalRewardsEarned.toLocaleString() || 0}
                        </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">초대 성공</p>
                        <p className="text-2xl font-bold">
                            {stats?.totalInvitationsAccepted || 0}명
                        </p>
                    </div>
                </div>

                {/* Viral Score */}
                {stats && stats.viralScore > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">바이럴 점수</span>
                        </div>
                        <span className="font-bold text-blue-600">{stats.viralScore.toFixed(1)}</span>
                    </div>
                )}

                {/* Recent List */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">최근 초대</h4>
                    {recentInvitations.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono">{inv.code}</span>
                            </div>
                            <Badge variant={
                                inv.status === 'accepted' ? 'default' :
                                    inv.status === 'expired' ? 'destructive' :
                                        'secondary'
                            }>
                                {inv.status === 'accepted' ? '수락됨' :
                                    inv.status === 'expired' ? '만료됨' :
                                        '대기중'}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
