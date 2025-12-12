"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Search,
    Heart,
    MessageCircle,
    ShoppingBag,
    Sparkles,
    Package
} from "lucide-react";

interface EmptyStateProps {
    variant:
    | "no-results"
    | "empty-watchlist"
    | "no-conversations"
    | "first-time"
    | "no-orders";
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const EMPTY_STATE_CONFIG = {
    "no-results": {
        icon: Search,
        defaultTitle: "검색 결과가 없습니다",
        defaultDescription: "다른 키워드로 검색하거나 필터를 조정해보세요.",
        iconColor: "text-muted-foreground",
    },
    "empty-watchlist": {
        icon: Heart,
        defaultTitle: "찜한 상품이 없어요",
        defaultDescription: "마음에 드는 상품을 찜하고 가격 알림을 받아보세요!",
        iconColor: "text-red-500",
    },
    "no-conversations": {
        icon: MessageCircle,
        defaultTitle: "대화를 시작해보세요",
        defaultDescription: "AI 어시스턴트가 쇼핑을 도와드립니다.",
        iconColor: "text-blue-500",
    },
    "first-time": {
        icon: Sparkles,
        defaultTitle: "환영합니다! 👋",
        defaultDescription: "AI 쇼핑 어시스턴트가 최적의 가격을 찾아드립니다.",
        iconColor: "text-primary",
    },
    "no-orders": {
        icon: Package,
        defaultTitle: "주문 내역이 없습니다",
        defaultDescription: "첫 구매를 시작해보세요!",
        iconColor: "text-orange-500",
    },
};

export function EmptyState({
    variant,
    title,
    description,
    action,
    className = "",
}: EmptyStateProps) {
    const config = EMPTY_STATE_CONFIG[variant];
    const Icon = config.icon;

    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            {/* Icon */}
            <div className="mb-4 p-6 bg-muted/50 rounded-full">
                <Icon className={`h-12 w-12 ${config.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold mb-2">
                {title || config.defaultTitle}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground mb-6 max-w-md">
                {description || config.defaultDescription}
            </p>

            {/* Action Button */}
            {action && (
                <Button onClick={action.onClick} size="lg">
                    {action.label}
                </Button>
            )}

            {/* Additional Suggestions for specific variants */}
            {variant === "no-results" && (
                <div className="mt-8 space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium">검색 팁:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>철자를 확인해보세요</li>
                        <li>더 짧은 키워드를 사용해보세요</li>
                        <li>다른 검색어로 시도해보세요</li>
                    </ul>
                </div>
            )}

            {variant === "no-conversations" && (
                <div className="mt-8 grid gap-2 text-sm w-full max-w-md">
                    <p className="font-medium text-muted-foreground mb-2">예시 질문:</p>
                    <Button
                        variant="outline"
                        className="justify-start text-left h-auto py-3"
                        onClick={() => action?.onClick()}
                    >
                        "10만원대 가성비 노트북 추천해줘"
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start text-left h-auto py-3"
                        onClick={() => action?.onClick()}
                    >
                        "에어팟 프로 2세대 최저가 찾아줘"
                    </Button>
                </div>
            )}
        </div>
    );
}
