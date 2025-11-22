#!/bin/bash
# Supabase 자동 설정 스크립트

set -e  # 에러 발생 시 중단

echo "🚀 Supabase 자동 설정 시작..."

# 환경변수 체크
if [ -z "$DB_PASSWORD" ]; then
  echo "❌ DB_PASSWORD 환경변수가 설정되지 않았습니다."
  echo ""
  echo "사용 방법:"
  echo "  export DB_PASSWORD='your-password'"
  echo "  ./scripts/setup-supabase.sh"
  echo ""
  echo "비밀번호는 Supabase Dashboard에서 확인 가능:"
  echo "  https://supabase.com/dashboard/project/gaceyqigufvasshjifnl/settings/database"
  exit 1
fi

PROJECT_REF="gaceyqigufvasshjifnl"

echo "📡 Supabase 프로젝트 연결 중..."
supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD"

echo "📤 마이그레이션 파일 푸시 중..."
supabase db push

echo "✅ 마이그레이션 적용 완료!"

echo ""
echo "🧪 데이터베이스 확인..."
echo "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" | \
  supabase db execute --project-ref "$PROJECT_REF"

echo ""
echo "✅ Supabase 설정 완료!"
echo ""
echo "다음 단계:"
echo "  1. npm run dev  # 로컬 서버 시작"
echo "  2. http://localhost:3000 접속하여 테스트"
