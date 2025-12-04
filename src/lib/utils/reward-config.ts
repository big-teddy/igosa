// Reward configuration types

export type RewardType = 'invitation_sent' | 'invitation_accepted' | 'purchase_completed';
export type RewardValueType = 'fixed' | 'percentage';

export interface RewardConfig {
    type: RewardType;
    valueType: RewardValueType;
    value: number; // Amount in KRW for 'fixed', percentage (0-100) for 'percentage'
    description: string;
    minAmount?: number; // Minimum reward amount for percentage-based rewards
    maxAmount?: number; // Maximum reward amount for percentage-based rewards
}

// Default reward configurations (can be overridden via admin panel)
export const DEFAULT_REWARD_CONFIGS: Record<RewardType, RewardConfig> = {
    invitation_sent: {
        type: 'invitation_sent',
        valueType: 'fixed',
        value: 0,
        description: '초대 발송 (보상 없음)',
    },
    invitation_accepted: {
        type: 'invitation_accepted',
        valueType: 'fixed',
        value: 1000,
        description: '친구 참여 보상',
    },
    purchase_completed: {
        type: 'purchase_completed',
        valueType: 'percentage',
        value: 5, // 5% of purchase amount
        description: '친구 구매 완료 보상',
        minAmount: 1000,
        maxAmount: 10000,
    },
};

/**
 * Calculate reward amount based on configuration
 */
export function calculateRewardAmount(
    type: RewardType,
    purchaseAmount?: number,
    config?: RewardConfig
): number {
    const rewardConfig = config || DEFAULT_REWARD_CONFIGS[type];

    if (rewardConfig.valueType === 'fixed') {
        return rewardConfig.value;
    }

    // Percentage-based reward
    if (!purchaseAmount) {
        return rewardConfig.minAmount || 0;
    }

    const calculatedAmount = Math.floor((purchaseAmount * rewardConfig.value) / 100);

    // Apply min/max constraints
    let finalAmount = calculatedAmount;
    if (rewardConfig.minAmount) {
        finalAmount = Math.max(finalAmount, rewardConfig.minAmount);
    }
    if (rewardConfig.maxAmount) {
        finalAmount = Math.min(finalAmount, rewardConfig.maxAmount);
    }

    return finalAmount;
}

/**
 * Format reward display text
 */
export function formatRewardDisplay(config: RewardConfig): string {
    if (config.valueType === 'fixed') {
        return `₩${config.value.toLocaleString()}`;
    }

    let text = `${config.value}%`;
    if (config.minAmount || config.maxAmount) {
        const parts = [];
        if (config.minAmount) parts.push(`최소 ₩${config.minAmount.toLocaleString()}`);
        if (config.maxAmount) parts.push(`최대 ₩${config.maxAmount.toLocaleString()}`);
        text += ` (${parts.join(', ')})`;
    }

    return text;
}

/**
 * Get reward description for user display
 */
export function getRewardDescription(type: RewardType, config?: RewardConfig): string {
    const rewardConfig = config || DEFAULT_REWARD_CONFIGS[type];
    return `${rewardConfig.description}: ${formatRewardDisplay(rewardConfig)}`;
}
