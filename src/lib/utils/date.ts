/**
 * 날짜 유틸리티
 */

/**
 * 상대 시간 표시 (예: "3분 전", "2일 전")
 */
export function formatRelativeTime(date: Date | string | number): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    if (diffWeek < 4) return `${diffWeek}주 전`;
    if (diffMonth < 12) return `${diffMonth}개월 전`;
    return `${diffYear}년 전`;
}

/**
 * 날짜 포맷 (YYYY.MM.DD)
 */
export function formatDate(date: Date | string | number): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

/**
 * 날짜+시간 포맷
 */
export function formatDateTime(date: Date | string | number): string {
    const d = new Date(date);
    const dateStr = formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
}

/**
 * 남은 시간 카운트다운
 */
export function formatCountdown(endDate: Date | string | number): string {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) return '종료됨';

    const diffSec = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    if (minutes > 0) return `${minutes}분 ${seconds}초`;
    return `${seconds}초`;
}

/**
 * 날짜 범위 표시
 */
export function formatDateRange(start: Date, end: Date): string {
    const startStr = formatDate(start);
    const endStr = formatDate(end);

    if (startStr === endStr) return startStr;
    return `${startStr} ~ ${endStr}`;
}

/**
 * 오늘인지 확인
 */
export function isToday(date: Date | string | number): boolean {
    const d = new Date(date);
    const today = new Date();
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
}

/**
 * 이번 주인지 확인
 */
export function isThisWeek(date: Date | string | number): boolean {
    const d = new Date(date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return d >= weekStart && d < weekEnd;
}
