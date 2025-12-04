// Social invitation and reward types

export interface Invitation {
    id: string;
    inviterId: string;
    inviteeId: string | null;
    negotiationId: string;
    code: string;
    status: 'pending' | 'accepted' | 'expired' | 'used';
    rewardAmount: number;
    rewardClaimed: boolean;
    source: 'kakao' | 'link' | 'twitter' | 'other';
    metadata: Record<string, any>;
    createdAt: string;
    acceptedAt: string | null;
    expiresAt: string;
}

export interface Reward {
    id: string;
    userId: string;
    invitationId: string | null;
    type: 'invitation_sent' | 'invitation_accepted' | 'purchase_completed';
    amount: number;
    status: 'pending' | 'claimed' | 'expired';
    description: string;
    createdAt: string;
    claimedAt: string | null;
    expiresAt: string;
}

export interface ShareEvent {
    id: string;
    userId: string;
    negotiationId: string;
    invitationId: string | null;
    platform: 'kakao' | 'link' | 'twitter' | 'facebook' | 'other';
    eventType: 'share_clicked' | 'share_completed' | 'link_opened' | 'invitation_accepted';
    metadata: Record<string, any>;
    createdAt: string;
}

export interface UserSocialStats {
    userId: string;
    totalInvitationsSent: number;
    totalInvitationsAccepted: number;
    totalRewardsEarned: number;
    totalRewardsClaimed: number;
    totalShares: number;
    viralScore: number; // acceptance rate
    lastShareAt: string | null;
    updatedAt: string;
}

export interface InvitationCreateRequest {
    negotiationId: string;
    source?: 'kakao' | 'link' | 'twitter' | 'other';
}

export interface InvitationCreateResponse {
    invitation: Invitation;
    shareUrl: string;
    code: string;
}

export interface InvitationAcceptRequest {
    code: string;
}

export interface InvitationAcceptResponse {
    success: boolean;
    invitation: Invitation;
    reward: Reward | null;
}

export interface InvitationStatsResponse {
    totalInvitations: number;
    acceptedInvitations: number;
    pendingInvitations: number;
    totalRewards: number;
    claimedRewards: number;
    viralScore: number;
}

export interface ShareNegotiationParams {
    negotiationId: string;
    platform: 'kakao' | 'link' | 'twitter' | 'facebook';
    invitationCode?: string;
}

export interface KakaoShareContent {
    title: string;
    description: string;
    imageUrl: string;
    link: {
        mobileWebUrl: string;
        webUrl: string;
    };
    buttons: Array<{
        title: string;
        link: {
            mobileWebUrl: string;
            webUrl: string;
        };
    }>;
}
