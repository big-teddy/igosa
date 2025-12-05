'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Shortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: () => void;
    description: string;
}

/**
 * 글로벌 키보드 단축키 훅
 */
export function useKeyboardShortcuts(customShortcuts?: Shortcut[]) {
    const router = useRouter();

    const defaultShortcuts: Shortcut[] = [
        { key: 'h', ctrl: true, action: () => router.push('/'), description: '홈으로 이동' },
        { key: 'k', ctrl: true, action: () => router.push('/chat'), description: 'AI 채팅 열기' },
        { key: 'd', ctrl: true, action: () => router.push('/nego-deals'), description: '네고딜 보기' },
        { key: 's', ctrl: true, action: () => router.push('/settings'), description: '설정 열기' },
    ];

    const shortcuts = [...defaultShortcuts, ...(customShortcuts || [])];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // 입력 필드에서는 무시
        if (
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement ||
            (e.target as HTMLElement).isContentEditable
        ) {
            return;
        }

        for (const shortcut of shortcuts) {
            const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
            const altMatch = shortcut.alt ? e.altKey : !e.altKey;
            const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

            if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
                e.preventDefault();
                shortcut.action();
                break;
            }
        }
    }, [shortcuts]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return shortcuts;
}

/**
 * 단축키 도움말 컴포넌트
 */
export function ShortcutHelp({ shortcuts }: { shortcuts: Shortcut[] }) {
    return (
        <div className="space-y-2">
            <h4 className="font-medium text-sm">키보드 단축키</h4>
            <div className="grid gap-1 text-sm">
                {shortcuts.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">{s.description}</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {s.ctrl && '⌘'}
                            {s.alt && '⌥'}
                            {s.shift && '⇧'}
                            {s.key.toUpperCase()}
                        </kbd>
                    </div>
                ))}
            </div>
        </div>
    );
}
