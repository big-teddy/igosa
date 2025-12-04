# Vercel 배포 문제 진단 및 해결

## 🔍 문제 분석

### 확인된 사항
1. ✅ Git 푸시 성공 (커밋: a1682f5)
2. ✅ GitHub 연동 재설정 완료
3. ✅ 로컬 빌드 성공 (`npm run build`)
4. ❌ Vercel 자동 배포 미작동

### 가능한 원인
1. **Vercel 프로젝트 설정 문제**
   - Production Branch 설정 불일치
   - Auto Deploy 비활성화
   - Ignored Build Step 설정

2. **GitHub App 권한 문제**
   - Repository 접근 권한 부족
   - Webhook 미설정

3. **Vercel 계정/프로젝트 연결 문제**
   - 프로젝트가 다른 계정에 연결됨
   - 로컬 .vercel 설정 불일치

---

## ✅ 해결 방법

### 방법 1: Vercel Dashboard 설정 확인 (권장)

#### 1. Git 설정 확인
```
Vercel Dashboard → igosa 프로젝트 → Settings → Git
```

**확인 사항**:
- [ ] Repository: `big-teddy/igosa` 연결됨
- [ ] Production Branch: `main`
- [ ] Auto Deploy: **Enabled** ✅

#### 2. Build & Development 설정
```
Settings → General
```

**확인 사항**:
- [ ] Framework Preset: `Next.js`
- [ ] Build Command: `npm run build`
- [ ] Install Command: `npm install --legacy-peer-deps`
- [ ] Output Directory: (비워두기)

#### 3. Ignored Build Step 확인
```
Settings → Git → Ignored Build Step
```

**설정**:
```bash
# 비워두거나 다음과 같이 설정
# (비어있어야 모든 푸시에서 빌드됨)
```

**만약 설정되어 있다면**: 삭제하고 저장

---

### 방법 2: Vercel CLI 수동 배포

#### 준비 단계
```bash
# 1. Vercel CLI 업데이트
npm i -g vercel@latest

# 2. 로그인
vercel login
# → 이메일 또는 GitHub 선택
# → 인증 완료
```

#### 배포 실행
```bash
cd /Users/sunghyunkim/igosa-1

# 프로덕션 배포
vercel --prod

# 또는 대화형 배포
vercel
```

**예상 출력**:
```
🔍 Inspect: https://vercel.com/...
✅ Production: https://igosa.vercel.app
```

---

### 방법 3: GitHub Webhook 재설정

#### 1. GitHub Repository 설정
```
https://github.com/big-teddy/igosa/settings/hooks
```

#### 2. Vercel Webhook 확인
- Vercel webhook이 있는지 확인
- 없다면 Vercel Dashboard에서 재연결

#### 3. Webhook 테스트
- "Recent Deliveries" 탭
- "Redeliver" 클릭하여 테스트

---

### 방법 4: 새 Vercel 프로젝트 생성 (최후의 수단)

#### 1. 기존 프로젝트 백업
```
Vercel Dashboard → Settings → Environment Variables
→ 모든 변수 복사/저장
```

#### 2. 새 프로젝트 Import
```
Vercel Dashboard → Add New → Project
→ Import Git Repository
→ big-teddy/igosa 선택
```

#### 3. 설정 복원
- Framework: Next.js
- Build Command: `npm run build`
- Install Command: `npm install --legacy-peer-deps`
- 환경변수 모두 추가

---

## 🎯 즉시 실행 체크리스트

### Dashboard 확인 (5분)
- [ ] Settings → Git → Production Branch = `main`
- [ ] Settings → Git → Auto Deploy = **Enabled**
- [ ] Settings → Git → Ignored Build Step = **비어있음**
- [ ] Settings → General → Build Command = `npm run build`
- [ ] Settings → General → Install Command = `npm install --legacy-peer-deps`

### CLI 배포 (5분)
```bash
# 1. 로그인
vercel login

# 2. 배포
vercel --prod

# 3. 완료 확인
# URL 접속하여 확인
```

---

## 🐛 추가 디버깅

### Vercel 로그 확인
```
Dashboard → Deployments → (가장 최근 배포)
→ Build Logs 확인
```

### GitHub Actions 확인
```
https://github.com/big-teddy/igosa/actions
→ 최근 workflow 확인
```

### 로컬 Vercel 설정 확인
```bash
# .vercel 폴더 확인
ls -la .vercel/

# 프로젝트 정보
cat .vercel/project.json
```

---

## 💡 권장 순서

1. **먼저**: Dashboard에서 설정 확인 (2분)
2. **그래도 안되면**: CLI로 수동 배포 (5분)
3. **여전히 안되면**: Webhook 재설정 (3분)
4. **최후**: 새 프로젝트 생성 (10분)

---

## 📞 다음 단계

**즉시 실행**:
1. Vercel Dashboard → Settings → Git 확인
2. Production Branch = `main` 확인
3. Auto Deploy = Enabled 확인
4. 설정 변경 후 → 새 커밋 푸시 또는 Redeploy

**또는**:
```bash
vercel login
vercel --prod
```

---

**작성**: 2025-12-04  
**상태**: 진단 완료, 해결 방법 제시
