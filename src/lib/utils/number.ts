/**
 * 숫자 포맷팅 유틸리티
 */

/**
 * 가격 포맷 (₩1,234,567)
 */
export function formatPrice(price: number): string {
    return `₩${price.toLocaleString('ko-KR')}`;
}

/**
 * 할인율 계산
 */
export function calculateDiscount(original: number, discounted: number): number {
    if (original <= 0) return 0;
    return Math.round(((original - discounted) / original) * 100);
}

/**
 * 할인가 표시 (10% ↓)
 */
export function formatDiscount(percent: number): string {
    return `${percent}% ↓`;
}

/**
 * 절약 금액 표시
 */
export function formatSavings(amount: number): string {
    if (amount >= 10000) {
        return `${(amount / 10000).toFixed(1)}만원 절약`;
    }
    return `${amount.toLocaleString()}원 절약`;
}

/**
 * 큰 숫자 축약 (1.2만, 3.5천)
 */
export function formatCompactNumber(num: number): string {
    if (num >= 100000000) {
        return `${(num / 100000000).toFixed(1)}억`;
    }
    if (num >= 10000) {
        return `${(num / 10000).toFixed(1)}만`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}천`;
    }
    return num.toLocaleString();
}

/**
 * 참여자 수 표시
 */
export function formatParticipants(count: number): string {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K명`;
    }
    return `${count}명`;
}

/**
 * 퍼센트 포맷
 */
export function formatPercent(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * 파일 크기 포맷
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * 전화번호 포맷
 */
export function formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return phone;
}

/**
 * 카드 번호 마스킹
 */
export function maskCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 12) return cardNumber;

    const first = digits.slice(0, 4);
    const last = digits.slice(-4);
    return `${first}-****-****-${last}`;
}

/**
 * 범위 내 값 제한
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
