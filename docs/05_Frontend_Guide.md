# [Frontend] UI/UX Implementation Guide

**버전**: 1.0  
**날짜**: 2025-10-30  
**작성자**: Frontend Team

---

## 핵심 컴포넌트

### 1. Chat Interface

```typescript
// components/chat/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, ChatInput, MessageList } from './components';
import { sendChatMessage } from '@/lib/api/chat';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (content: string) => {
    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const stream = await sendChatMessage(content);
      let aiResponse = '';

      for await (const chunk of stream) {
        aiResponse += chunk;
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: aiResponse }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} />
      <div ref={messagesEndRef} />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
```

### 2. Product Card

```typescript
// components/products/ProductCard.tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    image: string;
    prices: {
      platform: string;
      price: number;
      shipping: number;
      total: number;
      url: string;
    }[];
    rating: number;
    reviewCount: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = product.prices.reduce((min, p) => 
    p.total < min.total ? p : min
  );

  return (
    <Card className="p-4 hover:shadow-lg transition">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover rounded mb-4"
      />
      
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
        {product.name}
      </h3>
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl font-bold text-primary">
          ₩{lowestPrice.total.toLocaleString()}
        </span>
        <Badge variant="secondary">{lowestPrice.platform}</Badge>
      </div>
      
      <div className="flex items-center gap-1 mb-4">
        <span className="text-yellow-500">★</span>
        <span className="font-medium">{product.rating}</span>
        <span className="text-gray-500">
          ({product.reviewCount.toLocaleString()})
        </span>
      </div>
      
      <Button className="w-full" asChild>
        <a href={lowestPrice.url} target="_blank" rel="noopener noreferrer">
          구매하기
        </a>
      </Button>
    </Card>
  );
}
```

### 3. Price Comparison Table

```typescript
// components/products/PriceComparison.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PriceComparisonProps {
  prices: {
    platform: string;
    price: number;
    shipping: number;
    total: number;
    deliveryType: string;
    url: string;
  }[];
}

export function PriceComparison({ prices }: PriceComparisonProps) {
  const sorted = [...prices].sort((a, b) => a.total - b.total);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>플랫폼</TableHead>
          <TableHead className="text-right">제품가</TableHead>
          <TableHead className="text-right">배송비</TableHead>
          <TableHead className="text-right">총액</TableHead>
          <TableHead>배송</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((price, idx) => (
          <TableRow key={price.platform}>
            <TableCell className="font-medium">
              {idx === 0 && <Badge className="mr-2">최저가</Badge>}
              {price.platform}
            </TableCell>
            <TableCell className="text-right">
              ₩{price.price.toLocaleString()}
            </TableCell>
            <TableCell className="text-right">
              {price.shipping === 0 ? '무료' : `₩${price.shipping.toLocaleString()}`}
            </TableCell>
            <TableCell className="text-right font-bold">
              ₩{price.total.toLocaleString()}
            </TableCell>
            <TableCell>{price.deliveryType}</TableCell>
            <TableCell>
              <Button size="sm" asChild>
                <a href={price.url} target="_blank" rel="noopener noreferrer">
                  구매
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 모바일 최적화

### 1. Responsive Design

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
};
```

```tsx
// Example usage
<div className="p-4 sm:p-6 lg:p-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Product cards */}
  </div>
</div>
```

### 2. Touch Optimization

```tsx
// components/ui/TouchButton.tsx
export function TouchButton({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        px-4 py-3
        min-h-[44px]  /* iOS minimum touch target */
        active:scale-95
        transition-transform
        touch-manipulation
      "
    >
      {children}
    </button>
  );
}
```

### 3. Virtual Keyboard Handling

```tsx
// utils/viewport.ts
export function useViewportHeight() {
  const [height, setHeight] = useState('100vh');

  useEffect(() => {
    const updateHeight = () => {
      setHeight(`${window.innerHeight}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height;
}

// Usage in layout
function ChatLayout() {
  const height = useViewportHeight();
  
  return (
    <div style={{ height }} className="flex flex-col">
      {/* Content */}
    </div>
  );
}
```

---

## 상태 관리 (Zustand)

```typescript
// store/chatStore.ts
import { create } from 'zustand';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearMessages: () => set({ messages: [] }),
}));
```

---

## 성능 최적화

### 1. Code Splitting

```typescript
// app/products/[id]/page.tsx
import dynamic from 'next/dynamic';

const PriceChart = dynamic(() => import('@/components/products/PriceChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});

export default function ProductPage() {
  return (
    <div>
      <ProductDetails />
      <PriceChart />
    </div>
  );
}
```

### 2. Image Optimization

```tsx
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={300}
  className="rounded"
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.png"
/>
```

### 3. Memo & Callbacks

```tsx
import { memo, useCallback, useMemo } from 'react';

const ProductList = memo(function ProductList({ products }: Props) {
  const sortedProducts = useMemo(() => 
    [...products].sort((a, b) => a.price - b.price),
    [products]
  );

  const handleClick = useCallback((id: string) => {
    // Handle click
  }, []);

  return (
    <div>
      {sortedProducts.map(p => (
        <ProductCard key={p.id} product={p} onClick={handleClick} />
      ))}
    </div>
  );
});
```

---

## 접근성 (A11y)

```tsx
// Proper semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">홈</a></li>
    <li><a href="/products">제품</a></li>
  </ul>
</nav>

// ARIA labels
<button aria-label="검색">
  <SearchIcon />
</button>

// Focus management
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">제품 상세</h2>
  <button autoFocus>닫기</button>
</div>

// Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  클릭 가능한 div
</div>
```

---

**문서 끝**

다음: [DevOps & Infrastructure](./06_DevOps_Infrastructure.md)
