/**
 * 제품 검색 키워드 매칭 유틸리티
 */

import { ProductKeywordMapping } from '@/types/search';

// 제품 카테고리별 키워드 맵핑
const PRODUCT_KEYWORD_MAPPINGS: ProductKeywordMapping[] = [
  {
    keywords: ['러닝화', '운동화', '신발'],
    searchTerm: '러닝화',
  },
  {
    keywords: ['노트북', '맥북'],
    searchTerm: '노트북',
  },
  {
    keywords: ['이어폰', '에어팟', '버즈'],
    searchTerm: '이어폰',
  },
  {
    keywords: ['스마트워치', '애플워치', '갤럭시워치'],
    searchTerm: '스마트워치',
  },
  {
    keywords: ['패딩', '다운재킷', '겨울옷'],
    searchTerm: '패딩',
  },
  {
    keywords: ['공기청정기', '청정기'],
    searchTerm: '공기청정기',
  },
  {
    keywords: ['스피커', '블루투스'],
    searchTerm: '스피커',
  },
  {
    keywords: ['키보드', '기계식'],
    searchTerm: '키보드',
  },
  {
    keywords: ['마우스'],
    searchTerm: '마우스',
  },
  {
    keywords: ['백팩', '가방'],
    searchTerm: '가방',
  },
  {
    keywords: ['텀블러', '물통'],
    searchTerm: '텀블러',
  },
  {
    keywords: ['면도기', '전기면도기'],
    searchTerm: '면도기',
  },
  {
    keywords: ['청소기', '로봇청소기'],
    searchTerm: '청소기',
  },
];

/**
 * 쿼리에서 제품 키워드를 감지하고 매칭되는 검색어를 반환
 * @param query - 사용자 검색 쿼리
 * @returns 매칭된 검색어 또는 null
 */
export function detectProductKeyword(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();

  for (const mapping of PRODUCT_KEYWORD_MAPPINGS) {
    const hasKeyword = mapping.keywords.some((keyword) =>
      normalizedQuery.includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
      return mapping.searchTerm;
    }
  }

  return null;
}

/**
 * 쿼리가 제품 관련 검색인지 확인
 * @param query - 사용자 검색 쿼리
 * @returns 제품 관련 쿼리 여부
 */
export function hasProductQuery(query: string): boolean {
  return detectProductKeyword(query) !== null;
}

/**
 * 모든 제품 키워드 목록 반환 (디버깅용)
 * @returns 모든 키워드 배열
 */
export function getAllProductKeywords(): string[] {
  return PRODUCT_KEYWORD_MAPPINGS.flatMap((mapping) => mapping.keywords);
}

/**
 * 새로운 키워드 매핑 추가 (동적 확장)
 * @param mapping - 추가할 키워드 매핑
 */
export function addProductKeywordMapping(mapping: ProductKeywordMapping): void {
  PRODUCT_KEYWORD_MAPPINGS.push(mapping);
}
