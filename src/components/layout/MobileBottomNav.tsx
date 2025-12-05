'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', icon: Home, label: '홈' },
    { href: '/products', icon: Search, label: '검색' },
    { href: '/nego-deals', icon: ShoppingBag, label: '네고딜' },
    { href: '/notifications', icon: Bell, label: '알림' },
    { href: '/my', icon: User, label: '마이' },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t" />

            {/* Safe area padding for iOS */}
            <div className="relative flex items-center justify-around h-16 pb-safe">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full relative',
                                'transition-colors duration-200',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-x-2 top-0 h-0.5 bg-primary rounded-full"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            <motion.div
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                                <Icon className="h-5 w-5" />
                            </motion.div>
                            <span className={cn(
                                'text-[10px] mt-1 font-medium',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

// CSS for safe area (add to globals.css if needed)
// .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
