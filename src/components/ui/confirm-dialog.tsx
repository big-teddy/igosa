'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'default';
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

/**
 * 확인 다이얼로그 컴포넌트
 */
export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
        }
    };

    const variantStyles = {
        danger: 'bg-destructive hover:bg-destructive/90',
        warning: 'bg-yellow-500 hover:bg-yellow-600',
        default: '',
    };

    const icons = {
        danger: <Trash2 className="h-6 w-6 text-destructive" />,
        warning: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
        default: null,
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    {icons[variant]}
                                    <CardTitle>{title}</CardTitle>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{message}</p>
                            </CardContent>
                            <CardFooter className="flex gap-3 justify-end">
                                <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                                    {cancelText}
                                </Button>
                                <Button
                                    className={variantStyles[variant]}
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '처리 중...' : confirmText}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * 확인 다이얼로그 훅
 */
export function useConfirmDialog() {
    const [state, setState] = useState<{
        isOpen: boolean;
        resolve: ((value: boolean) => void) | null;
        props: Omit<ConfirmDialogProps, 'isOpen' | 'onConfirm' | 'onCancel'>;
    }>({
        isOpen: false,
        resolve: null,
        props: { title: '', message: '' },
    });

    const confirm = useCallback(
        (props: Omit<ConfirmDialogProps, 'isOpen' | 'onConfirm' | 'onCancel'>): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({ isOpen: true, resolve, props });
            });
        },
        []
    );

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState((prev) => ({ ...prev, isOpen: false }));
    }, [state]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        setState((prev) => ({ ...prev, isOpen: false }));
    }, [state]);

    const dialog = (
        <ConfirmDialog
            isOpen={state.isOpen}
            {...state.props}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, dialog };
}
