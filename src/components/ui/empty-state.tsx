'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Package, Search, ShoppingCart, Bell, Heart,
  MessageCircle, Users, FileText, Settings
} from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * 빈 상태 컴포넌트
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 p-4 bg-muted rounded-full">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

// 미리 정의된 빈 상태들

export function NoProductsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-8 w-8 text-muted-foreground" />}
      title="상품이 없습니다"
      description="검색 조건을 변경하거나 다른 카테고리를 탐색해보세요."
      action={onAction ? { label: '상품 둘러보기', onClick: onAction } : undefined}
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title={`"${query}" 검색 결과가 없습니다`}
      description="다른 키워드로 검색하거나 철자를 확인해보세요."
    />
  );
}

export function EmptyCartEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
      title="장바구니가 비어있습니다"
      description="마음에 드는 상품을 담아보세요."
      action={onAction ? { label: '쇼핑하러 가기', onClick: onAction } : undefined}
    />
  );
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={<Bell className="h-8 w-8 text-muted-foreground" />}
      title="알림이 없습니다"
      description="새로운 소식이 있으면 여기서 알려드릴게요."
    />
  );
}

export function NoWishlistEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Heart className="h-8 w-8 text-muted-foreground" />}
      title="찜한 상품이 없습니다"
      description="관심있는 상품에 하트를 눌러보세요."
      action={onAction ? { label: '상품 둘러보기', onClick: onAction } : undefined}
    />
  );
}

export function NoMessagesEmpty() {
  return (
    <EmptyState
      icon={<MessageCircle className="h-8 w-8 text-muted-foreground" />}
      title="메시지가 없습니다"
      description="AI와 대화를 시작해보세요."
    />
  );
}

export function NoDealsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="참여 중인 딜이 없습니다"
      description="네고딜에 참여해서 함께 절약해보세요!"
      action={onAction ? { label: '딜 찾아보기', onClick: onAction } : undefined}
    />
  );
}

export function NoOrdersEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-muted-foreground" />}
      title="주문 내역이 없습니다"
      description="첫 주문을 해보세요!"
      action={onAction ? { label: '쇼핑하러 가기', onClick: onAction } : undefined}
    />
  );
}
