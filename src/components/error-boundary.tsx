'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to monitoring service
        logger.error('React Error Boundary caught error', error, {
            componentStack: errorInfo.componentStack,
        });

        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-xl">문제가 발생했습니다</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-center text-muted-foreground">
                                예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 홈으로 이동해 주세요.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4 p-3 bg-muted rounded-lg text-sm">
                                    <summary className="cursor-pointer font-medium">
                                        오류 상세 정보
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-40">
                                        {this.state.error.message}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                            <div className="flex flex-col gap-2">
                                <Button onClick={this.handleReload} className="w-full">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    새로고침
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={this.handleGoHome}
                                    className="w-full"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    홈으로 이동
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Wrapper for use in Server Components
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
