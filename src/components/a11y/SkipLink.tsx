'use client';

import Link from 'next/link';
import { SKIP_LINK_TARGET } from '@/lib/a11y/utils';

/**
 * Skip to Main Content Link
 * 키보드 사용자가 네비게이션을 건너뛸 수 있게 함
 */
export function SkipLink() {
    return (
        <Link
            href={`#${SKIP_LINK_TARGET}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
            본문으로 건너뛰기
        </Link>
    );
}
