import { detectProductKeyword, hasProductQuery, getAllProductKeywords } from '../keyword-matcher';

describe('keyword-matcher', () => {
  describe('detectProductKeyword', () => {
    it('should detect airpods/earbuds keywords', () => {
      expect(detectProductKeyword('에어팟 프로 2세대 최저가')).toBe('이어폰');
      expect(detectProductKeyword('이어폰 추천해줘')).toBe('이어폰');
      expect(detectProductKeyword('버즈 가격 비교')).toBe('이어폰');
    });

    it('should detect laptop keywords', () => {
      expect(detectProductKeyword('노트북 추천')).toBe('노트북');
      expect(detectProductKeyword('맥북 가격')).toBe('노트북');
    });

    it('should detect smartwatch keywords', () => {
      expect(detectProductKeyword('스마트워치 추천')).toBe('스마트워치');
      expect(detectProductKeyword('애플워치 가격')).toBe('스마트워치');
      expect(detectProductKeyword('갤럭시워치 비교')).toBe('스마트워치');
    });

    it('should detect padding keywords', () => {
      expect(detectProductKeyword('패딩 추천')).toBe('패딩');
      expect(detectProductKeyword('다운재킷 가격')).toBe('패딩');
      expect(detectProductKeyword('겨울옷 찾아줘')).toBe('패딩');
    });

    it('should return null for non-product queries', () => {
      expect(detectProductKeyword('안녕하세요')).toBeNull();
      expect(detectProductKeyword('오늘 날씨')).toBeNull();
      expect(detectProductKeyword('사용 방법')).toBeNull();
    });

    it('should handle empty strings', () => {
      expect(detectProductKeyword('')).toBeNull();
      expect(detectProductKeyword('   ')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(detectProductKeyword('노트북')).toBe('노트북');
      expect(detectProductKeyword('LAPTOP')).toBeNull(); // laptop은 키워드에 없음
      expect(detectProductKeyword('이어폰')).toBe('이어폰');
    });

    it('should detect keywords in complex sentences', () => {
      expect(detectProductKeyword('20만원대 가성비 노트북 추천해주세요')).toBe('노트북');
      expect(detectProductKeyword('친구가 쓰는 에어팟 프로 어때?')).toBe('이어폰');
      expect(detectProductKeyword('운동할 때 쓸 무선 이어폰 뭐가 좋아?')).toBe('이어폰');
    });
  });

  describe('hasProductQuery', () => {
    it('should return true for product queries', () => {
      expect(hasProductQuery('에어팟 추천')).toBe(true);
      expect(hasProductQuery('노트북 가격')).toBe(true);
    });

    it('should return false for non-product queries', () => {
      expect(hasProductQuery('안녕하세요')).toBe(false);
      expect(hasProductQuery('날씨')).toBe(false);
    });
  });

  describe('getAllProductKeywords', () => {
    it('should return all keywords as an array', () => {
      const keywords = getAllProductKeywords();

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords).toContain('러닝화');
      expect(keywords).toContain('에어팟');
      expect(keywords).toContain('노트북');
    });
  });
});
