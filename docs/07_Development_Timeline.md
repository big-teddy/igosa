# [Timeline] 4-Week Development Plan

**버전**: 1.0  
**목표**: MVP 출시 (베타 100명)

---

## Week 1: Foundation

### Day 1-2: 프로젝트 Setup
- [ ] Next.js 14 프로젝트 생성
- [ ] TypeScript, Tailwind, shadcn/ui 설정
- [ ] Git repository 생성
- [ ] Vercel 연결
- [ ] 환경 변수 설정
- [ ] Supabase 프로젝트 생성
- [ ] Prisma schema 작성

### Day 3-4: 인증 & 데이터베이스
- [ ] 사용자 인증 (JWT)
- [ ] 데이터베이스 마이그레이션
- [ ] API route 기본 구조
- [ ] 기본 UI 레이아웃
- [ ] 네비게이션 컴포넌트

### Day 5-7: API 연동 시작
- [ ] Coupang Partners API 연동
- [ ] 제품 검색 API 구현
- [ ] 가격 정보 파싱
- [ ] 에러 핸들링
- [ ] 기본 테스트 작성

**Week 1 Deliverables**:
- ✅ 프로젝트 기반 구축
- ✅ 인증 시스템
- ✅ Coupang API 연동
- ✅ 배포 파이프라인

---

## Week 2: Core Features

### Day 8-10: AI 챗봇 구현
- [ ] OpenAI API 연동
- [ ] 기본 대화 인터페이스
- [ ] Streaming response
- [ ] 대화 히스토리 저장
- [ ] RAG pipeline 기본 구조

### Day 11-12: 제품 추천 시스템
- [ ] Vector DB (Weaviate) 설정
- [ ] Embedding 생성
- [ ] 제품 검색 로직
- [ ] 추천 알고리즘 v1
- [ ] 캐싱 전략

### Day 13-14: 가격 비교 기능
- [ ] Naver Shopping API 연동
- [ ] 11번가 API 연동 (선택)
- [ ] 멀티플랫폼 가격 비교 UI
- [ ] 최저가 표시
- [ ] 제휴 링크 생성

**Week 2 Deliverables**:
- ✅ AI 챗봇 동작
- ✅ 제품 추천
- ✅ 가격 비교 (2-3 플랫폼)
- ✅ 내부 테스트 시작

---

## Week 3: Polish & Scale

### Day 15-17: UI/UX 개선
- [ ] 모바일 최적화
- [ ] 로딩 상태 개선
- [ ] 에러 페이지
- [ ] 404 페이지
- [ ] 사용자 피드백 반영

### Day 18-19: AI 네고딜 (베타)
- [ ] 네고딜 데이터 모델
- [ ] 그룹 생성/참여 API
- [ ] 네고딜 UI
- [ ] KakaoTalk 알림 (기본)
- [ ] 판매자 이메일 템플릿

### Day 20-21: 성능 최적화
- [ ] 이미지 최적화
- [ ] Code splitting
- [ ] Caching 전략 개선
- [ ] Database query 최적화
- [ ] Lighthouse 점수 개선

**Week 3 Deliverables**:
- ✅ 모바일 최적화 완료
- ✅ AI 네고딜 베타
- ✅ 성능 개선
- ✅ 베타 테스터 50명 초대

---

## Week 4: Launch Prep

### Day 22-23: 테스팅 & 버그 수정
- [ ] E2E 테스트 작성
- [ ] 버그 수정
- [ ] 보안 검토
- [ ] API rate limiting
- [ ] 에러 로깅 설정

### Day 24-25: 모니터링 & 분석
- [ ] Sentry 설정
- [ ] PostHog 설정
- [ ] Axiom 로깅
- [ ] 대시보드 구축
- [ ] 알림 설정

### Day 26-27: 법률 & 문서화
- [ ] 이용약관 작성
- [ ] 개인정보처리방침
- [ ] PIPA 준수 확인
- [ ] README 작성
- [ ] API 문서화

### Day 28: Launch!
- [ ] 최종 배포
- [ ] 베타 100명 초대
- [ ] 소셜 미디어 발표
- [ ] 블로그 포스트
- [ ] 피드백 수집 시작

**Week 4 Deliverables**:
- ✅ 프로덕션 배포
- ✅ 100명 베타 사용자
- ✅ 모니터링 시스템
- ✅ 법률 문서 완료

---

## Daily Standup Template

```
🌅 오늘 할 일:
- [ ] Task 1
- [ ] Task 2

🎯 어제 완료:
- [x] Task A
- [x] Task B

🚧 블로커:
- 없음 / [이슈 설명]

📊 진행률: 45%
```

---

## Success Metrics (4주 후)

### Technical
- ✅ 99% uptime
- ✅ < 3s response time (P95)
- ✅ < 1% error rate

### Product
- ✅ 100 베타 사용자
- ✅ 20% DAU/MAU
- ✅ 평균 세션 5분+

### Business
- ✅ ₩10M GMV
- ✅ 10% 검색 → 구매 전환
- ✅ NPS > 40

---

**문서 끝**

다음: [Testing & QA](./08_Testing_QA.md)
