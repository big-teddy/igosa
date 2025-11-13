'use client';

import { useState } from 'react';
import { X, Share2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { NegoDeal } from '@/types/nego-deal';
import { referralService } from '@/lib/services/referral-service';
import { toast } from 'sonner';

interface ShareDealToFeedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deal: NegoDeal;
  userId: string;
}

export function ShareDealToFeedDialog({
  isOpen,
  onClose,
  deal,
  userId,
}: ShareDealToFeedDialogProps) {
  const [message, setMessage] = useState<string>('');
  const [sharing, setSharing] = useState(false);

  const handleShare = () => {
    if (!message.trim()) {
      toast.error('메시지를 입력해주세요');
      return;
    }

    setSharing(true);

    try {
      // 레퍼럴 링크 생성
      const referralLink = referralService.getOrCreateReferralLink(userId, `deal_${deal.id}`, deal.productId);

      // TODO: 피드에 포스트 생성 로직 구현
      // 현재는 레퍼럴 링크만 생성하고 성공 메시지를 표시합니다

      toast.success('피드에 공유했습니다!', {
        description: '친구들이 이 딜에 참여하면 레퍼럴 수익을 받을 수 있어요',
      });

      setMessage('');
      onClose();
    } catch (error) {
      toast.error('공유 중 오류가 발생했습니다');
    } finally {
      setSharing(false);
    }
  };

  const suggestedMessages = [
    `이 네고딜 대박! ${deal.discountRate}% 할인 받을 수 있어요 🔥`,
    `${deal.productName} 함께 사요! 할인 혜택 엄청나요 😍`,
    `지금 네고딜 참여하면 ₩${deal.savings.toLocaleString()} 절약 가능!`,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
            >
              <Card className="p-6 relative">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">피드에 공유</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    친구들에게 네고딜을 공유하고 레퍼럴 수익을 받으세요
                  </p>
                </div>

                {/* Product Preview */}
                <div className="flex gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={deal.productImage}
                      alt={deal.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">{deal.productName}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">
                        ₩{deal.targetPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        {deal.discountRate}% OFF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="mb-4">
                  <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                    공유 메시지
                  </Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="친구들에게 전할 메시지를 입력하세요"
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {message.length}/200
                  </p>
                </div>

                {/* Suggested Messages */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">추천 메시지</Label>
                  <div className="space-y-2">
                    {suggestedMessages.map((suggested, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setMessage(suggested)}
                        className="w-full p-2 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left text-sm"
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 친구가 이 딜에 참여하면 2%의 레퍼럴 수수료를 받을 수 있어요!
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    취소
                  </Button>
                  <Button
                    onClick={handleShare}
                    disabled={sharing || !message.trim()}
                    className="flex-1 gap-2"
                  >
                    {sharing ? (
                      '공유 중...'
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        피드에 공유
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
