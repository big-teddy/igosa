import { Suspense } from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NegotiationPageSkeleton } from '@/components/skeletons/PageSkeletons';

export const metadata = {
    title: '알림 센터 | 이거사',
    description: '가격 알림, 딜 업데이트, 소셜 알림을 한 곳에서 확인하세요',
};

export default function NotificationsPage() {
    return (
        <Suspense fallback={<NegotiationPageSkeleton />}>
            <NotificationCenter />
        </Suspense>
    );
}
