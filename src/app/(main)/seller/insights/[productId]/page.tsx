/**
 * Seller Insights Page
 *
 * Phase 2: Real-time demand insights and AI negotiation dashboard
 */

import { SellerInsightsDashboard } from '@/components/seller/SellerInsightsDashboard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function SellerInsightsPage({ params }: PageProps) {
  const { productId } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // TODO: Check if user is a seller/has seller permissions
  // For MVP, we'll allow all authenticated users to view

  // Mock product data - in production, fetch from product service
  const mockProduct = {
    id: productId,
    name: `갤럭시 버즈3 Pro`,
    currentPrice: 259000,
    imageUrl: 'https://via.placeholder.com/400',
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <SellerInsightsDashboard
        productId={productId}
        currentPrice={mockProduct.currentPrice}
        productName={mockProduct.name}
      />
    </div>
  );
}

