// Mock AI responses for testing before API integration

export interface MockProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  rating?: number;
  reviewCount?: number;
  shippingInfo?: string;
}

export interface AIResponse {
  type: 'text' | 'products' | 'comparison' | 'recommendation';
  content: string;
  products?: MockProduct[];
  reasoning?: string;
}

// Mock product data
const MOCK_PRODUCTS: Record<string, MockProduct[]> = {
  airpods: [
    {
      id: 'ap1',
      name: '애플 에어팟 프로 2세대 (USB-C)',
      price: 359000,
      originalPrice: 389000,
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      seller: '쿠팡',
      rating: 4.8,
      reviewCount: 2847,
      shippingInfo: '무료배송'
    },
    {
      id: 'ap2',
      name: '애플 에어팟 프로 2세대',
      price: 365000,
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      seller: '11번가',
      rating: 4.7,
      reviewCount: 1534,
      shippingInfo: '무료배송'
    },
    {
      id: 'ap3',
      name: '애플 에어팟 프로 2세대 정품',
      price: 369000,
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      seller: '네이버쇼핑',
      rating: 4.9,
      reviewCount: 892,
      shippingInfo: '무료배송'
    }
  ],
  laptop: [
    {
      id: 'lt1',
      name: '삼성 갤럭시북4 프로 16GB/512GB',
      price: 1190000,
      originalPrice: 1490000,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      seller: '쿠팡',
      rating: 4.6,
      reviewCount: 456,
      shippingInfo: '무료배송'
    },
    {
      id: 'lt2',
      name: 'LG 그램 17인치 i5 16GB/512GB',
      price: 1250000,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      seller: 'G마켓',
      rating: 4.7,
      reviewCount: 789,
      shippingInfo: '무료배송'
    },
    {
      id: 'lt3',
      name: 'HP 엔비 13 i7 16GB/512GB',
      price: 1098000,
      originalPrice: 1350000,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      seller: '11번가',
      rating: 4.5,
      reviewCount: 234,
      shippingInfo: '무료배송'
    }
  ],
  earbuds: [
    {
      id: 'eb1',
      name: '삼성 갤럭시 버즈2 프로',
      price: 189000,
      originalPrice: 229000,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      seller: '쿠팡',
      rating: 4.6,
      reviewCount: 3421,
      shippingInfo: '무료배송'
    },
    {
      id: 'eb2',
      name: '소니 WF-1000XM5',
      price: 289000,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      seller: '옥션',
      rating: 4.8,
      reviewCount: 1876,
      shippingInfo: '무료배송'
    },
    {
      id: 'eb3',
      name: '보스 QuietComfort 이어버드 II',
      price: 299000,
      originalPrice: 349000,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      seller: '네이버쇼핑',
      rating: 4.7,
      reviewCount: 892,
      shippingInfo: '무료배송'
    }
  ],
  padding: [
    {
      id: 'pd1',
      name: '노스페이스 눕시 다운자켓',
      price: 359000,
      originalPrice: 459000,
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
      seller: '무신사',
      rating: 4.9,
      reviewCount: 5678,
      shippingInfo: '무료배송'
    },
    {
      id: 'pd2',
      name: '디스커버리 익스페디션 롱패딩',
      price: 289000,
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
      seller: '쿠팡',
      rating: 4.7,
      reviewCount: 2341,
      shippingInfo: '무료배송'
    }
  ]
};

// Keyword detection patterns
const KEYWORD_PATTERNS = {
  airpods: /에어팟|airpod/i,
  laptop: /노트북|laptop/i,
  earbuds: /무선.*이어폰|이어버드|earbuds?/i,
  padding: /패딩|다운.*자켓|겨울.*옷/i,
  price: /가격|최저가|저렴|싼|얼마/i,
  recommend: /추천|좋은|인기|베스트/i,
  compare: /비교|차이|vs/i,
};

// Generate intelligent AI response based on query
export function generateMockAIResponse(query: string): AIResponse[] {
  const responses: AIResponse[] = [];

  // Detect intent and keywords
  const isPriceQuery = KEYWORD_PATTERNS.price.test(query);
  const isRecommendQuery = KEYWORD_PATTERNS.recommend.test(query);
  const isCompareQuery = KEYWORD_PATTERNS.compare.test(query);

  // Detect product category
  let productCategory: keyof typeof MOCK_PRODUCTS | null = null;
  let products: MockProduct[] = [];

  if (KEYWORD_PATTERNS.airpods.test(query)) {
    productCategory = 'airpods';
    products = MOCK_PRODUCTS.airpods;
  } else if (KEYWORD_PATTERNS.laptop.test(query)) {
    productCategory = 'laptop';
    products = MOCK_PRODUCTS.laptop;
  } else if (KEYWORD_PATTERNS.earbuds.test(query)) {
    productCategory = 'earbuds';
    products = MOCK_PRODUCTS.earbuds;
  } else if (KEYWORD_PATTERNS.padding.test(query)) {
    productCategory = 'padding';
    products = MOCK_PRODUCTS.padding;
  }

  // Generate response based on intent
  if (isPriceQuery && products.length > 0) {
    const lowestPrice = Math.min(...products.map(p => p.price));
    const lowestPriceProduct = products.find(p => p.price === lowestPrice);

    responses.push({
      type: 'text',
      content: `"${query}"에 대한 가격 비교 결과입니다.\n\n현재 최저가는 ${lowestPriceProduct?.seller}에서 판매 중인 **${lowestPrice.toLocaleString()}원**입니다. 여러 쇼핑몰의 가격을 비교해보았습니다.`,
      reasoning: `${products.length}개 쇼핑몰 비교 완료`
    });

    responses.push({
      type: 'products',
      content: '가격 비교 결과',
      products: products.slice(0, 3)
    });
  } else if (isRecommendQuery && products.length > 0) {
    // Sort by rating
    const sortedProducts = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    responses.push({
      type: 'text',
      content: `"${query}"에 대한 추천 제품입니다.\n\n평점과 리뷰 수를 기반으로 가장 만족도가 높은 제품들을 선별했습니다. ${sortedProducts[0].name}이(가) 현재 가장 높은 평점을 받고 있네요.`,
      reasoning: '평점 및 리뷰 분석 완료'
    });

    responses.push({
      type: 'recommendation',
      content: '추천 제품',
      products: sortedProducts.slice(0, 3)
    });
  } else if (isCompareQuery && products.length > 0) {
    responses.push({
      type: 'text',
      content: `"${query}"에 대한 비교 분석입니다.\n\n${products.length}개 제품을 가격, 평점, 배송 조건 등 다양한 기준으로 비교했습니다. 각 제품의 장단점을 확인해보세요.`,
      reasoning: '다중 기준 비교 완료'
    });

    responses.push({
      type: 'comparison',
      content: '제품 비교',
      products: products
    });
  } else if (products.length > 0) {
    // Generic product search
    responses.push({
      type: 'text',
      content: `"${query}"에 대한 검색 결과입니다.\n\n총 ${products.length}개의 제품을 찾았습니다. 가격대와 사양을 비교해서 선택하시면 됩니다.`,
      reasoning: `${products.length}개 제품 검색 완료`
    });

    responses.push({
      type: 'products',
      content: '검색 결과',
      products: products
    });
  } else {
    // No products found - general response
    responses.push({
      type: 'text',
      content: `"${query}"에 대해 검색하고 있습니다.\n\n현재 mock 데이터에서는 해당 제품을 찾을 수 없지만, 실제 서비스에서는 다양한 쇼핑몰의 제품을 실시간으로 검색하여 보여드립니다.\n\n다음 카테고리를 시도해보세요:\n- 에어팟 프로 2세대 최저가\n- 20만원대 노트북 추천\n- 무선 이어폰 비교\n- 겨울 패딩 인기 순위`,
      reasoning: '검색 제안 제공'
    });
  }

  return responses;
}

// Simulate network delay
export function simulateNetworkDelay(min = 800, max = 1500): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}
