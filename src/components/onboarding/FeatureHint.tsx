"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureHintProps {
    id: string;
    title: string;
    description: string;
    targetElement?: string;
    position?: "top" | "bottom" | "left" | "right";
    delay?: number;
}

export function FeatureHint({
    id,
    title,
    description,
    targetElement,
    position = "bottom",
    delay = 0,
}: FeatureHintProps) {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if hint was already dismissed
        const dismissedHints = JSON.parse(
            localStorage.getItem("dismissedHints") || "[]"
        );
        if (dismissedHints.includes(id)) {
            setDismissed(true);
            return;
        }

        // Show hint after delay
        const timer = setTimeout(() => {
            setVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [id, delay]);

    const handleDismiss = (permanent = false) => {
        setVisible(false);
        if (permanent) {
            const dismissedHints = JSON.parse(
                localStorage.getItem("dismissedHints") || "[]"
            );
            dismissedHints.push(id);
            localStorage.setItem("dismissedHints", JSON.stringify(dismissedHints));
            setDismissed(true);
        }
    };

    if (dismissed || !visible) return null;

    const positionClasses = {
        top: "bottom-full mb-2",
        bottom: "top-full mt-2",
        left: "right-full mr-2",
        right: "left-full ml-2",
    };

    return (
        <div
            className={cn(
                "absolute z-50 w-64 p-4 bg-primary text-primary-foreground rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2",
                positionClasses[position]
            )}
            role="tooltip"
            aria-live="polite"
        >
            {/* Arrow */}
            <div
                className={cn(
                    "absolute w-3 h-3 bg-primary rotate-45",
                    position === "bottom" && "top-0 left-4 -translate-y-1/2",
                    position === "top" && "bottom-0 left-4 translate-y-1/2",
                    position === "right" && "left-0 top-4 -translate-x-1/2",
                    position === "left" && "right-0 top-4 translate-x-1/2"
                )}
            />

            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => handleDismiss(false)}
                >
                    <X className="h-3 w-3" />
                </Button>

                <h4 className="font-semibold mb-1 pr-4">{title}</h4>
                <p className="text-sm opacity-90 mb-3">{description}</p>

                <div className="flex gap-2 text-xs">
                    <button
                        onClick={() => handleDismiss(false)}
                        className="opacity-70 hover:opacity-100 underline"
                    >
                        나중에
                    </button>
                    <button
                        onClick={() => handleDismiss(true)}
                        className="opacity-70 hover:opacity-100 underline"
                    >
                        다시 보지 않기
                    </button>
                </div>
            </div>
        </div>
    );
}

// Preset feature hints for common features
export const FEATURE_HINTS = {
    visualSearch: {
        id: "visual-search",
        title: "💡 이미지로 검색해보세요",
        description: "상품 사진만 있어도 찾을 수 있어요!",
        delay: 2000,
    },
    watchlist: {
        id: "watchlist",
        title: "💡 가격 알림 받기",
        description: "찜하면 가격이 떨어질 때 알려드려요!",
        delay: 3000,
    },
    aiChat: {
        id: "ai-chat",
        title: "💡 AI에게 물어보세요",
        description: "\"노트북 추천해줘\" 같은 자연어로 대화하세요!",
        delay: 2000,
    },
};
