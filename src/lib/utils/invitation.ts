/**
 * Generate a unique invitation code
 * Format: 8 characters, alphanumeric, uppercase
 */
export function generateInvitationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars.charAt(randomIndex);
    }

    return code;
}

/**
 * Validate invitation code format
 */
export function isValidInvitationCode(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code);
}

/**
 * Build share URL with invitation code
 */
export function buildShareUrl(
    negotiationId: string,
    invitationCode: string,
    source: string = 'kakao'
): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
        ref: source,
        invite: invitationCode,
    });

    return `${baseUrl}/negotiations/${negotiationId}?${params.toString()}`;
}

/**
 * Parse invitation parameters from URL
 */
export function parseInvitationParams(): {
    invitationCode: string | null;
    source: string | null;
} {
    if (typeof window === 'undefined') {
        return { invitationCode: null, source: null };
    }

    const params = new URLSearchParams(window.location.search);
    return {
        invitationCode: params.get('invite'),
        source: params.get('ref'),
    };
}

/**
 * Calculate reward amount based on action type
 * @deprecated Use calculateRewardAmount from reward-config.ts instead
 */
export function calculateRewardAmount(
    type: 'invitation_sent' | 'invitation_accepted' | 'purchase_completed'
): number {
    // Import from reward-config for backwards compatibility
    const { calculateRewardAmount: calc } = require('./reward-config');
    return calc(type);
}

/**
 * Format reward amount for display
 */
export function formatRewardAmount(amount: number): string {
    return `₩${amount.toLocaleString()}`;
}

/**
 * Check if invitation is expired
 */
export function isInvitationExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
}

/**
 * Get days until invitation expires
 */
export function getDaysUntilExpiry(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}
