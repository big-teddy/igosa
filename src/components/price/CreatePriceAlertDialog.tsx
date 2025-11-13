'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePriceAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage: string;
  currentPrice: number;
  onCreateAlert: (targetPrice: number) => void;
}

export function CreatePriceAlertDialog({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  currentPrice,
  onCreateAlert,
}: CreatePriceAlertDialogProps) {
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const price = parseFloat(targetPrice.replace(/,/g, ''));

    if (isNaN(price) || price <= 0) {
      setError('올바른 가격을 입력해주세요');
      return;
    }

    if (price >= currentPrice) {
      setError('목표 가격은 현재 가격보다 낮아야 합니다');
      return;
    }

    onCreateAlert(price);
    setTargetPrice('');
    onClose();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setTargetPrice(value ? parseInt(value).toLocaleString() : '');
    setError('');
  };

  const suggestedPrices = [
    { label: '5% 할인', value: Math.round(currentPrice * 0.95) },
    { label: '10% 할인', value: Math.round(currentPrice * 0.9) },
    { label: '20% 할인', value: Math.round(currentPrice * 0.8) },
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
                    <Bell className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">가격 알림 설정</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    원하는 가격에 도달하면 알림을 보내드립니다
                  </p>
                </div>

                {/* Product Info */}
                <div className="flex gap-3 mb-6 p-3 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">{productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      현재가: <span className="font-bold">₩{currentPrice.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Target Price Input */}
                  <div>
                    <Label htmlFor="targetPrice" className="text-sm font-medium mb-2 block">
                      목표 가격
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₩
                      </span>
                      <Input
                        id="targetPrice"
                        type="text"
                        value={targetPrice}
                        onChange={handlePriceChange}
                        placeholder="목표 가격을 입력하세요"
                        className="pl-8 text-right"
                        autoFocus
                      />
                    </div>
                    {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                  </div>

                  {/* Suggested Prices */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">추천 가격</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {suggestedPrices.map((suggested) => (
                        <button
                          key={suggested.label}
                          type="button"
                          onClick={() => setTargetPrice(suggested.value.toLocaleString())}
                          className="p-2 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
                        >
                          <p className="text-xs text-muted-foreground mb-1">{suggested.label}</p>
                          <p className="text-sm font-bold">₩{suggested.value.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      취소
                    </Button>
                    <Button type="submit" className="flex-1 gap-2">
                      <Bell className="h-4 w-4" />
                      알림 설정
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
