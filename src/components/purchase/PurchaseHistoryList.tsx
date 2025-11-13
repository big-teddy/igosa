'use client';

import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { PurchaseItem } from '@/types/purchase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PurchaseHistoryListProps {
  purchases: PurchaseItem[];
  onStatusUpdate?: (purchaseId: string, status: PurchaseItem['status']) => void;
}

export function PurchaseHistoryList({ purchases, onStatusUpdate }: PurchaseHistoryListProps) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">구매 내역이 없습니다</h3>
        <p className="text-sm text-muted-foreground">이거사에서 첫 구매를 시작해보세요!</p>
      </div>
    );
  }

  const getStatusIcon = (status: PurchaseItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: PurchaseItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: PurchaseItem['status']) => {
    switch (status) {
      case 'pending':
        return '주문 대기';
      case 'confirmed':
        return '주문 확인';
      case 'shipped':
        return '배송 중';
      case 'delivered':
        return '배송 완료';
      case 'cancelled':
        return '주문 취소';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {purchases.map((purchase, index) => (
        <motion.div
          key={purchase.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start gap-4">
              {/* Product Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={purchase.productImage}
                  alt={purchase.productName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Purchase Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">
                      {purchase.productName}
                    </h4>
                    <p className="text-sm text-muted-foreground">{purchase.seller}</p>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 ${getStatusColor(purchase.status)}`}
                  >
                    {getStatusIcon(purchase.status)}
                    {getStatusLabel(purchase.status)}
                  </Badge>
                </div>

                {/* Purchase Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(purchase.purchaseDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>수량: {purchase.quantity}개</span>
                  </div>
                  {purchase.category && (
                    <Badge variant="secondary" className="text-xs">
                      {purchase.category}
                    </Badge>
                  )}
                  {purchase.searchMode && (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        purchase.searchMode === 'price'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {purchase.searchMode === 'price' ? '💰 가격비교' : '✨ AI추천'}
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold text-primary">
                      {(purchase.price * purchase.quantity).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
