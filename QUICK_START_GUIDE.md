# 🚀 빠른 시작 가이드

## 1. 환경변수 설정 (5분)

### 로컬 개발
```bash
# .env.local 파일 생성
cp .env.example .env.local

# 필수 변수 입력
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel 배포
```
Vercel Dashboard → Settings → Environment Variables
→ 위 변수들 추가
```

---

## 2. Supabase 마이그레이션 (2분)

```sql
-- Supabase Dashboard → SQL Editor
-- supabase/migrations/20251204_create_negotiation_tables.sql 복사 & 실행
```

---

## 3. 로컬 실행 (1분)

```bash
npm install
npm run dev
```

브라우저: http://localhost:3000

---

## 4. 테스트 (10분)

### 협상 UI 확인
1. http://localhost:3000/negotiations
2. 빈 상태 확인
3. 테스트 데이터 생성 (아래)

### 테스트 데이터 생성
```sql
-- Supabase SQL Editor
INSERT INTO negotiations (
  product_id,
  status,
  total_participants,
  avg_target_price,
  ai_proposed_price,
  ai_confidence_score
) VALUES (
  'test-product-1',
  'in_progress',
  50,
  250000,
  243000,
  0.85
);
```

---

## 5. Vercel 배포 (5분)

```bash
# 방법 1: Git 푸시 (자동 배포)
git push origin main

# 방법 2: Vercel CLI
vercel --prod
```

---

## ✅ 체크리스트

- [ ] .env.local 생성
- [ ] Supabase URL/Key 입력
- [ ] 마이그레이션 실행
- [ ] npm run dev 실행
- [ ] /negotiations 페이지 확인
- [ ] 테스트 데이터 생성
- [ ] Vercel 환경변수 설정
- [ ] Git 푸시

---

**예상 시간**: 23분  
**난이도**: 쉬움
