export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  prices: {
    platform: 'coupang' | 'naver' | '11st';
    price: number;
    shipping: number;
    total: number;
    deliveryType: string;
    deliveryDays: number;
    inStock: boolean;
    url: string;
  }[];
}

export const mockProducts: Product[] = [
  // 러닝화
  {
    id: 'nike-pegasus-40',
    name: '나이키 에어 줌 페가수스 40',
    description: '일상 러닝을 위한 완벽한 선택. Zoom Air 쿠셔닝으로 편안한 착화감을 제공합니다.',
    category: '신발',
    brand: '나이키',
    price: 149000,
    originalPrice: 179000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    rating: 4.7,
    reviewCount: 1234,
    specs: {
      '무게': '280g (US 9 기준)',
      '쿠셔닝': 'Zoom Air',
      '용도': '일상 러닝',
      '내구성': '500-600km',
    },
    prices: [
      {
        platform: 'coupang',
        price: 149000,
        shipping: 0,
        total: 149000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 152000,
        shipping: 0,
        total: 152000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 147000,
        shipping: 2500,
        total: 149500,
        deliveryType: '일반배송',
        deliveryDays: 3,
        inStock: true,
        url: '#',
      },
    ],
  },
  {
    id: 'adidas-ultraboost-23',
    name: '아디다스 울트라부스트 23',
    description: 'Boost 폼 쿠셔닝으로 최고의 에너지 리턴을 제공하는 프리미엄 러닝화',
    category: '신발',
    brand: '아디다스',
    price: 169000,
    originalPrice: 199000,
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400',
    rating: 4.8,
    reviewCount: 892,
    specs: {
      '무게': '310g',
      '쿠셔닝': 'Boost',
      '용도': '장거리 러닝',
      '특징': '프라임니트 어퍼',
    },
    prices: [
      {
        platform: 'coupang',
        price: 172000,
        shipping: 0,
        total: 172000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 169000,
        shipping: 0,
        total: 169000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 175000,
        shipping: 0,
        total: 175000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
    ],
  },
  {
    id: 'hoka-bondi-8',
    name: '호카 본디 8',
    description: '최대 쿠셔닝을 제공하는 호카의 베스트셀러. 장거리 러닝에 최적',
    category: '신발',
    brand: '호카',
    price: 189000,
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    rating: 4.9,
    reviewCount: 456,
    specs: {
      '무게': '295g',
      '쿠셔닝': 'EVA 폼',
      '드롭': '4mm',
      '용도': '장거리 러닝',
    },
    prices: [
      {
        platform: 'coupang',
        price: 189000,
        shipping: 0,
        total: 189000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 192000,
        shipping: 0,
        total: 192000,
        deliveryType: '새벽배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 185000,
        shipping: 3000,
        total: 188000,
        deliveryType: '일반배송',
        deliveryDays: 3,
        inStock: false,
        url: '#',
      },
    ],
  },

  // 노트북
  {
    id: 'macbook-air-m3',
    name: '맥북 에어 M3 13인치',
    description: 'Apple M3 칩 탑재. 얇고 가벼운 프리미엄 노트북',
    category: '노트북',
    brand: 'Apple',
    price: 1490000,
    originalPrice: 1690000,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    rating: 4.9,
    reviewCount: 2341,
    specs: {
      'CPU': 'Apple M3 8코어',
      'RAM': '8GB',
      '저장공간': '256GB SSD',
      '디스플레이': '13.6인치 Retina',
      '무게': '1.24kg',
    },
    prices: [
      {
        platform: 'coupang',
        price: 1490000,
        shipping: 0,
        total: 1490000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 1520000,
        shipping: 0,
        total: 1520000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 1485000,
        shipping: 0,
        total: 1485000,
        deliveryType: '무료배송',
        deliveryDays: 3,
        inStock: true,
        url: '#',
      },
    ],
  },
  {
    id: 'lg-gram-17',
    name: 'LG 그램 17인치 (2024)',
    description: '초경량 17인치 대화면 노트북. 뛰어난 휴대성과 배터리 수명',
    category: '노트북',
    brand: 'LG전자',
    price: 2290000,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    rating: 4.7,
    reviewCount: 876,
    specs: {
      'CPU': 'Intel Core Ultra 7',
      'RAM': '16GB',
      '저장공간': '512GB SSD',
      '디스플레이': '17인치 WQXGA',
      '무게': '1.35kg',
    },
    prices: [
      {
        platform: 'coupang',
        price: 2290000,
        shipping: 0,
        total: 2290000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 2250000,
        shipping: 0,
        total: 2250000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 2320000,
        shipping: 0,
        total: 2320000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
    ],
  },
  {
    id: 'asus-gaming-laptop',
    name: 'ASUS TUF Gaming A15',
    description: 'RTX 4060 탑재 가성비 게이밍 노트북',
    category: '노트북',
    brand: 'ASUS',
    price: 1450000,
    originalPrice: 1690000,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
    rating: 4.6,
    reviewCount: 543,
    specs: {
      'CPU': 'AMD Ryzen 7 7735HS',
      'GPU': 'RTX 4060 6GB',
      'RAM': '16GB DDR5',
      '저장공간': '512GB SSD',
      '디스플레이': '15.6인치 144Hz',
    },
    prices: [
      {
        platform: 'coupang',
        price: 1450000,
        shipping: 0,
        total: 1450000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 1480000,
        shipping: 0,
        total: 1480000,
        deliveryType: '무료배송',
        deliveryDays: 3,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 1430000,
        shipping: 3000,
        total: 1433000,
        deliveryType: '일반배송',
        deliveryDays: 4,
        inStock: true,
        url: '#',
      },
    ],
  },

  // 무선 이어폰
  {
    id: 'airpods-pro-2',
    name: '애플 에어팟 프로 2세대',
    description: 'H2 칩과 적응형 오디오로 완벽한 청취 경험',
    category: '이어폰',
    brand: 'Apple',
    price: 359000,
    originalPrice: 399000,
    imageUrl: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    rating: 4.8,
    reviewCount: 3421,
    specs: {
      '노이즈캔슬링': 'ANC',
      '배터리': '최대 30시간',
      '방수': 'IPX4',
      '특징': 'H2 칩, 적응형 오디오',
    },
    prices: [
      {
        platform: 'coupang',
        price: 359000,
        shipping: 0,
        total: 359000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 365000,
        shipping: 0,
        total: 365000,
        deliveryType: '무료배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 355000,
        shipping: 2500,
        total: 357500,
        deliveryType: '일반배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
    ],
  },
  {
    id: 'sony-wf-1000xm5',
    name: '소니 WF-1000XM5',
    description: '업계 최고 수준의 노이즈 캔슬링 무선 이어폰',
    category: '이어폰',
    brand: '소니',
    price: 329000,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    rating: 4.9,
    reviewCount: 1876,
    specs: {
      '노이즈캔슬링': 'ANC',
      '배터리': '최대 24시간',
      '코덱': 'LDAC',
      '방수': 'IPX4',
    },
    prices: [
      {
        platform: 'coupang',
        price: 329000,
        shipping: 0,
        total: 329000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 325000,
        shipping: 0,
        total: 325000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 339000,
        shipping: 0,
        total: 339000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
    ],
  },
  {
    id: 'samsung-buds-pro-3',
    name: '삼성 갤럭시 버즈3 프로',
    description: '블레이드 디자인과 강력한 노이즈 캔슬링',
    category: '이어폰',
    brand: '삼성전자',
    price: 279000,
    originalPrice: 329000,
    imageUrl: 'https://images.unsplash.com/photo-1649859394657-c2b5c6c7b768?w=400',
    rating: 4.7,
    reviewCount: 2134,
    specs: {
      '노이즈캔슬링': 'ANC',
      '배터리': '최대 30시간',
      '방수': 'IP57',
      '특징': '360 오디오',
    },
    prices: [
      {
        platform: 'coupang',
        price: 279000,
        shipping: 0,
        total: 279000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 285000,
        shipping: 0,
        total: 285000,
        deliveryType: '무료배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 275000,
        shipping: 0,
        total: 275000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
    ],
  },

  // 스마트워치
  {
    id: 'apple-watch-9',
    name: '애플 워치 시리즈 9',
    description: 'S9 칩과 더블탭 제스처로 새로워진 스마트워치',
    category: '스마트워치',
    brand: 'Apple',
    price: 599000,
    imageUrl: 'https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?w=400',
    rating: 4.8,
    reviewCount: 4532,
    specs: {
      '디스플레이': '1.9인치 OLED',
      '배터리': '최대 18시간',
      '방수': '50m',
      '특징': 'S9 칩, 더블탭',
    },
    prices: [
      {
        platform: 'coupang',
        price: 599000,
        shipping: 0,
        total: 599000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 605000,
        shipping: 0,
        total: 605000,
        deliveryType: '무료배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 595000,
        shipping: 0,
        total: 595000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
    ],
  },
  {
    id: 'galaxy-watch-6',
    name: '갤럭시 워치6 클래식',
    description: '회전 베젤의 부활. 프리미엄 스마트워치',
    category: '스마트워치',
    brand: '삼성전자',
    price: 449000,
    originalPrice: 529000,
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
    rating: 4.7,
    reviewCount: 2876,
    specs: {
      '디스플레이': '1.5인치 AMOLED',
      '배터리': '최대 40시간',
      '방수': '5ATM + IP68',
      '특징': '회전 베젤',
    },
    prices: [
      {
        platform: 'coupang',
        price: 449000,
        shipping: 0,
        total: 449000,
        deliveryType: '로켓배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: 'naver',
        price: 455000,
        shipping: 0,
        total: 455000,
        deliveryType: '새벽배송',
        deliveryDays: 1,
        inStock: true,
        url: '#',
      },
      {
        platform: '11st',
        price: 445000,
        shipping: 0,
        total: 445000,
        deliveryType: '무료배송',
        deliveryDays: 2,
        inStock: true,
        url: '#',
      },
    ],
  },
];

// 검색 함수
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery)
  );
}

// 카테고리별 필터
export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase()
  );
}

// 최저가 정렬
export function sortByLowestPrice(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aLowest = Math.min(...a.prices.map((p) => p.total));
    const bLowest = Math.min(...b.prices.map((p) => p.total));
    return aLowest - bLowest;
  });
}

// 평점 정렬
export function sortByRating(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.rating - a.rating);
}

// 리뷰 수 정렬
export function sortByReviewCount(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
}
