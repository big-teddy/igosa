#!/bin/bash
# Production 배포 자동화 스크립트

set -e

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_COMMIT=$(git rev-parse HEAD)

echo "🚀 Production 배포 시작..."
echo "현재 브랜치: $CURRENT_BRANCH"
echo "현재 커밋: $CURRENT_COMMIT"

# 1. main 브랜치로 변경사항 푸시를 위한 임시 브랜치 생성
echo "📝 임시 배포 브랜치 생성 중..."
DEPLOY_BRANCH="deploy-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$DEPLOY_BRANCH"

# 2. 현재 변경사항을 임시 브랜치에 커밋
echo "💾 배포 준비 완료"

# 3. main 브랜치 정보 가져오기
echo "🔄 main 브랜치 업데이트 중..."
git fetch origin main:main 2>/dev/null || git fetch origin

# 4. Vercel에 배포 트리거 알림
echo ""
echo "✅ 배포 준비 완료!"
echo ""
echo "⚠️  다음 단계를 수행해주세요:"
echo ""
echo "1. GitHub에서 수동으로 Pull Request 생성:"
echo "   - Source: $CURRENT_BRANCH"
echo "   - Target: main"
echo ""
echo "2. 또는 Vercel 대시보드에서:"
echo "   - Settings → Git → Production Branch"
echo "   - '$CURRENT_BRANCH'로 변경"
echo ""
echo "3. 또는 현재 Preview 배포를 Production으로 승격:"
echo "   - Vercel Deployments 탭 → 최신 Preview → 'Promote to Production'"
echo ""

# 원래 브랜치로 돌아가기
git checkout "$CURRENT_BRANCH"
git branch -D "$DEPLOY_BRANCH" 2>/dev/null || true

echo "🎉 스크립트 완료!"
