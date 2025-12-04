'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Negotiation } from '@/types/negotiation';

interface ShareButtonProps {
    negotiation: Negotiation;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export function ShareButton({
    negotiation,
    variant = 'outline',
    size = 'default',
    className = ''
}: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [invitationCode, setInvitationCode] = useState('');
    const [copied, setCopied] = useState(false);

    const discount = negotiation.aiProposedPrice && negotiation.targetPrice
        ? Math.round(((negotiation.targetPrice - negotiation.aiProposedPrice) / negotiation.targetPrice) * 100)
        : 0;

    const productName = (negotiation as any).product?.name || '협상 중인 제품';

    const handleShare = async () => {
        setIsLoading(true);
        try {
            // Create invitation first
            const response = await fetch('/api/invitations/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    negotiationId: negotiation.id,
                    source: 'native_share',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create invitation');
            }

            const data = await response.json();
            const url = data.shareUrl;
            setShareUrl(url);
            setInvitationCode(data.code);

            // Try native share API first
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `AI 네고딜: ${productName}`,
                        text: `${productName} - ₩${negotiation.aiProposedPrice?.toLocaleString()} (${discount}% 할인)\n현재 ${negotiation.totalParticipants}명 참여 중!`,
                        url: url,
                    });

                    toast.success('공유되었습니다');

                    // Track share completion
                    await fetch('/api/invitations/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            invitationId: data.invitation.id,
                            eventType: 'share_completed',
                        }),
                    });
                } catch (err: any) {
                    // User cancelled share or error occurred
                    if (err.name !== 'AbortError') {
                        // Show dialog as fallback
                        setIsOpen(true);
                    }
                }
            } else {
                // No native share support, show dialog
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Share error:', error);
            toast.error('공유 링크 생성에 실패했습니다');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('링크가 복사되었습니다');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('복사에 실패했습니다');
        }
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={handleShare}
                disabled={isLoading}
                className={className}
            >
                <Share2 className="w-4 h-4 mr-2" />
                {isLoading ? '생성 중...' : '친구에게 공유'}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>친구 초대하기</DialogTitle>
                        <DialogDescription>
                            친구가 참여하면 보상을 받을 수 있어요!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Negotiation Preview */}
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <h4 className="font-semibold line-clamp-2">
                                {productName}
                            </h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">
                                    ₩{negotiation.aiProposedPrice?.toLocaleString()}
                                </span>
                                {discount > 0 && (
                                    <span className="text-sm text-green-600 font-medium">
                                        {discount}% 할인
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                현재 {negotiation.totalParticipants}명 참여 중
                            </p>
                        </div>

                        {/* Invitation Code */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">초대 코드</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg font-bold text-center">
                                    {invitationCode}
                                </div>
                            </div>
                        </div>

                        {/* Share Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">공유 링크</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            복사됨
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            복사
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Reward Info */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                💰 친구가 참여하면 <strong>보상</strong>을 받아요!
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
