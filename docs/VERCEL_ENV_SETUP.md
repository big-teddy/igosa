# Vercel 환경변수 설정 가이드

**프로젝트**: igosa
**Supabase**: igosa-production (gaceyqigufvasshjifnl)

---

## 🔐 필수 환경변수

### Vercel Dashboard에서 설정

**URL**: https://vercel.com/your-team/igosa/settings/environment-variables

아래 환경변수들을 **Production**, **Preview**, **Development** 모두에 추가:

---

### 1. Supabase (데이터베이스 & 인증)

```bash
# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://gaceyqigufvasshjifnl.supabase.co

# Supabase Anon Key (Public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2V5cWlndWZ2YXNzaGppZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mjk1MzgsImV4cCI6MjA3OTMwNTUzOH0.lxOrPZgHkIvkGwERhCqBeV5qjoaWbIL_8hU7IpE5xlw

# Supabase Service Role Key (Server-only, 중요!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2V5cWlndWZ2YXNzaGppZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcyOTUzOCwiZXhwIjoyMDc5MzA1NTM4fQ.EwBoL29DLCePGsS8_3LQeo1hqxlYjsF8yW-0u5zX_H0
```

⚠️ **중요**: Service Role Key는 서버에서만 사용되며 절대 클라이언트에 노출되지 않습니다.

---

### 2. Feature Flags (네고딜 통합)

```bash
# 통합 네고딜 위젯 활성화
NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL=true

# 새 네고딜 페이지
NEXT_PUBLIC_ENABLE_NEGODEAL_V2_PAGE=true

# 업데이트된 헤더 네비게이션
NEXT_PUBLIC_ENABLE_NEW_NAVIGATION=true

# AI 추천 가격
NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS=true
```

---

### 3. A/B Testing & Gradual Rollout

```bash
# 롤아웃 비율 (0-100)
# Production: 처음엔 100으로 시작 (전체 활성화)
# 또는 단계적 롤아웃: 10 → 30 → 50 → 100
NEXT_PUBLIC_ROLLOUT_PERCENT=100
```

**롤아웃 전략**:
- Week 1: `100` (전체 활성화, Feature Flag는 on/off만)
- 또는 Week 2부터: `10` → `30` → `50` → `100` (점진적)

---

### 4. App Configuration

```bash
# 프로덕션 URL (Vercel 도메인)
NEXT_PUBLIC_APP_URL=https://igosa.vercel.app

# Node 환경
NODE_ENV=production
```

---

## 📋 Vercel CLI로 설정하기 (선택사항)

Vercel CLI가 설치되어 있다면:

```bash
# Production 환경변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL production
vercel env add NEXT_PUBLIC_ENABLE_NEW_NAVIGATION production
vercel env add NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS production
vercel env add NEXT_PUBLIC_ROLLOUT_PERCENT production
vercel env add NEXT_PUBLIC_APP_URL production

# Preview 환경도 동일하게 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# ... (위와 동일)
```

---

## 🖱️ Vercel Dashboard에서 수동 설정 (추천)

### Step 1: Vercel Dashboard 접속
1. https://vercel.com 로그인
2. `igosa` 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭

### Step 2: 환경변수 추가
각 환경변수를 하나씩 추가:

1. **Name** 입력 (예: `NEXT_PUBLIC_SUPABASE_URL`)
2. **Value** 입력 (위 값 복사)
3. **Environments** 선택:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **Save** 클릭

**반복**: 위의 모든 환경변수에 대해 반복

---

## ✅ 설정 완료 후 확인

### Step 3: 재배포 (환경변수 적용)

환경변수를 추가한 후에는 재배포가 필요합니다:

**방법 1: GitHub Push (자동)**
```bash
git commit --allow-empty -m "chore: Trigger Vercel redeploy with new env vars"
git push origin main
```

**방법 2: Vercel Dashboard**
1. **Deployments** 탭
2. 최근 배포의 `...` 메뉴 클릭
3. **Redeploy** 선택

---

## 🧪 배포 후 테스트

### 프로덕션 URL 확인:
```
https://igosa.vercel.app (또는 커스텀 도메인)
```

### 테스트 항목:
1. ✅ 홈페이지 로딩
2. ✅ 제품 상세 페이지 접속
3. ✅ 네고딜 위젯 표시 확인
4. ✅ "네고딜" 메뉴 헤더에 표시 확인
5. ✅ 참여 버튼 클릭 → Supabase 연결 확인

### 에러 확인:
- Vercel Dashboard → **Logs** 탭
- 런타임 에러가 있는지 확인

---

## 🔒 보안 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용
- [ ] `.env.local`은 `.gitignore`에 포함됨
- [ ] GitHub에 비밀키가 커밋되지 않음
- [ ] Vercel 환경변수는 암호화되어 저장됨

---

## 📊 환경변수 요약표

| 변수명 | 타입 | 필수 | 환경 |
|--------|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | ✅ | All |
| `NEXT_PUBLIC_ENABLE_UNIFIED_NEGODEAL` | Public | ✅ | All |
| `NEXT_PUBLIC_ENABLE_NEW_NAVIGATION` | Public | ✅ | All |
| `NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS` | Public | ✅ | All |
| `NEXT_PUBLIC_ROLLOUT_PERCENT` | Public | ✅ | All |
| `NEXT_PUBLIC_APP_URL` | Public | ✅ | Production |
| `NODE_ENV` | System | ✅ | Auto |

**Total**: 9개 환경변수

---

## 🚨 문제 해결

### Issue 1: "Invalid environment variables" 에러
**해결**:
- Vercel에서 환경변수가 정확히 설정되었는지 확인
- 재배포 실행

### Issue 2: Supabase 연결 실패
**해결**:
- `NEXT_PUBLIC_SUPABASE_URL` 확인 (https:// 포함)
- API Keys가 올바른지 Supabase Dashboard에서 재확인

### Issue 3: Feature Flag가 작동하지 않음
**해결**:
- `NEXT_PUBLIC_` 접두사가 있는지 확인
- 재배포 후 브라우저 캐시 삭제

---

**작성**: 2025-01-20
**프로젝트**: igosa-production
**Supabase**: gaceyqigufvasshjifnl
