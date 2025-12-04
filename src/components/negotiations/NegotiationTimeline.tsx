'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
    CircleDollarSign,
    Users,
    Bot,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import type { NegotiationEvent } from '@/types/negotiation';

interface NegotiationTimelineProps {
    events: NegotiationEvent[];
}

export function NegotiationTimeline({ events }: NegotiationTimelineProps) {
    const getEventIcon = (type: string) => {
        switch (type) {
            case 'demand_milestone':
                return <Users className="w-5 h-5 text-blue-500" />;
            case 'ai_analysis':
            case 'ai_proposal':
                return <Bot className="w-5 h-5 text-purple-500" />;
            case 'deal_accepted':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'deal_rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getImpactBadge = (impact?: 'positive' | 'negative' | 'neutral') => {
        if (!impact) return null;

        const styles = {
            positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        };

        const labels = {
            positive: '긍정적',
            negative: '부정적',
            neutral: '중립',
        };

        return (
            <Badge variant="outline" className={`${styles[impact]} border-0`}>
                {labels[impact]}
            </Badge>
        );
    };

    if (events.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        타임라인
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        아직 기록된 이벤트가 없습니다.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    실시간 타임라인
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative pl-6 border-l-2 border-muted space-y-8">
                    <AnimatePresence initial={false}>
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                            >
                                <span className="absolute -left-[31px] bg-background p-1 rounded-full border-2 border-muted">
                                    {getEventIcon(event.eventType)}
                                </span>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground font-medium">
                                            {formatDistanceToNow(new Date(event.createdAt), {
                                                addSuffix: true,
                                                locale: ko,
                                            })}
                                        </span>
                                        {getImpactBadge(event.impact)}
                                    </div>
                                    <p className="text-base font-medium">{event.message}</p>
                                    {event.eventData && Object.keys(event.eventData).length > 0 && (
                                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-1">
                                            {JSON.stringify(event.eventData)}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
