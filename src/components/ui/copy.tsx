'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyButtonProps {
    text: string;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * 클립보드 복사 버튼
 */
export function CopyButton({
    text,
    className = '',
    variant = 'outline',
    size = 'icon'
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    }, [text]);

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={className}
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    );
}

/**
 * 코드 블록 with 복사 버튼
 */
export function CodeBlock({
    code,
    language = 'text'
}: {
    code: string;
    language?: string;
}) {
    return (
        <div className="relative group">
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                <code className={`language-${language}`}>{code}</code>
            </pre>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={code} size="sm" />
            </div>
        </div>
    );
}

/**
 * 공유 URL 복사 컴포넌트
 */
export function ShareUrl({ url, label = '링크 복사' }: { url: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <input
                type="text"
                value={url}
                readOnly
                className="flex-1 bg-transparent text-sm truncate outline-none"
            />
            <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? '복사됨' : label}
            </Button>
        </div>
    );
}
