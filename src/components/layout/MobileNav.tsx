"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Search, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    icon: typeof Home;
    href: string;
    badge?: number;
}

const NAV_ITEMS: NavItem[] = [
    {
        label: "홈",
        icon: Home,
        href: "/",
    },
    {
        label: "검색",
        icon: Search,
        href: "/search",
    },
    {
        label: "채팅",
        icon: MessageCircle,
        href: "/chat",
    },
    {
        label: "마이",
        icon: User,
        href: "/my",
    },
];

/**
 * Mobile Bottom Navigation
 * 
 * Features:
 * - Sticky bottom positioning
 * - Active state indicators
 * - Touch-friendly 44x44px targets
 * - Haptic feedback on tap
 * - Badge support for notifications
 */
export function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavClick = (href: string) => {
        // Haptic feedback for supported devices
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(10); // 10ms gentle vibration
        }
        router.push(href);
    };

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Spacer to prevent content from being hidden behind nav */}
            <div className="h-16 md:hidden" aria-hidden="true" />

            {/* Bottom Navigation Bar */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden"
                role="navigation"
                aria-label="Mobile navigation"
            >
                <div className="flex items-center justify-around h-16 px-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <button
                                key={item.href}
                                onClick={() => handleNavClick(item.href)}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                                    "min-w-[64px] min-h-[44px]", // Touch-friendly size
                                    active
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                aria-label={item.label}
                                aria-current={active ? "page" : undefined}
                            >
                                {/* Icon */}
                                <Icon className={cn("h-5 w-5", active && "fill-primary/20")} />

                                {/* Label */}
                                <span className={cn("text-xs font-medium", active && "font-semibold")}>
                                    {item.label}
                                </span>

                                {/* Badge */}
                                {item.badge && item.badge > 0 && (
                                    <span
                                        className="absolute top-1 right-1 flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full"
                                        aria-label={`${item.badge} notifications`}
                                    >
                                        {item.badge > 99 ? "99+" : item.badge}
                                    </span>
                                )}

                                {/* Active Indicator */}
                                {active && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
