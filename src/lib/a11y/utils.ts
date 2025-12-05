/**
 * Accessibility (a11y) Utilities
 * WCAG 2.1 AA 준수를 위한 유틸리티
 */

/**
 * 스크린 리더 전용 텍스트 클래스
 */
export const srOnly = 'sr-only';

/**
 * 포커스 표시 스타일
 */
export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

/**
 * 키보드 접근성 핸들러
 */
export function handleKeyboardClick(
    callback: () => void
): (e: React.KeyboardEvent) => void {
    return (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback();
        }
    };
}

/**
 * ARIA 라이브 영역 발표
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * 포커스 트랩 (모달용)
 */
export function createFocusTrap(containerRef: React.RefObject<HTMLElement>) {
    const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return {
        activate: () => {
            const container = containerRef.current;
            if (!container) return;

            const focusableElements = container.querySelectorAll(focusableSelectors);
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            };

            container.addEventListener('keydown', handleKeyDown);
            firstElement?.focus();

            return () => container.removeEventListener('keydown', handleKeyDown);
        },
    };
}

/**
 * Skip Link 컴포넌트용 ID
 */
export const SKIP_LINK_TARGET = 'main-content';

/**
 * 색상 대비 체크 (WCAG AA: 4.5:1)
 */
export function hasGoodContrast(foreground: string, background: string): boolean {
    const getLuminance = (hex: string): number => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = rgb & 0xff;

        const [rs, gs, bs] = [r, g, b].map((c) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return ratio >= 4.5;
}

/**
 * 감소된 모션 선호 체크
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
