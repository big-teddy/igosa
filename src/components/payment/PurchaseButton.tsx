'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { paymentService } from '@/lib/services/payment-service';
import { toast } from 'sonner';
import type { CartItem } from '@/types/payment';

interface PurchaseButtonProps {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  dealId?: string;
  onPurchaseStart?: () => void;
  onPurchaseComplete?: () => void;
}

export function PurchaseButton({
  productId,
  productName,
  productImage,
  price,
  originalPrice,
  dealId,
  onPurchaseStart,
  onPurchaseComplete,
}: PurchaseButtonProps) {
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    onPurchaseStart?.();

    try {
      // Get user
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        toast.error('로그인이 필요합니다');
        return;
      }

      const userData = JSON.parse(storedUser);
      const userId = userData.email || userData.id || 'user-1';

      // Add to cart
      const cartItem: Omit<CartItem, 'id'> = {
        productId,
        productName,
        productImage,
        price,
        originalPrice,
        quantity: 1,
        dealId,
      };

      paymentService.addToCart(userId, cartItem);

      toast.success('장바구니에 추가되었습니다', {
        description: '장바구니에서 구매를 계속하실 수 있습니다',
        action: {
          label: '장바구니 가기',
          onClick: () => {
            window.location.href = '/cart';
          },
        },
      });

      onPurchaseComplete?.();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('장바구니에 추가하지 못했습니다');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={adding}
      className="w-full gap-2"
      size="lg"
    >
      {adding ? (
        <>
          <Check className="h-5 w-5" />
          추가 중...
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          장바구니에 담기
        </>
      )}
    </Button>
  );
}
