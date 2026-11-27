#!/bin/bash

##############################################################################
# Supabase Keep-Alive Cron Job 자동 설정 스크립트 (Linux/Mac)
#
# 이 스크립트는 Linux 또는 Mac 서버에서 Cron Job을 자동으로 설정합니다.
#
# 사용 방법:
#   chmod +x server/setup-cron.sh
#   ./server/setup-cron.sh
##############################################################################

echo "======================================================================"
echo "🚀 Supabase Keep-Alive Cron Job 설정 시작"
echo "======================================================================"
echo ""

# 현재 디렉토리 저장
CURRENT_DIR=$(pwd)
SCRIPT_PATH="$CURRENT_DIR/server/supabase-keepalive.js"

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    echo "   Node.js를 먼저 설치해주세요: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 확인: $(node --version)"
echo ""

# 스크립트 파일 존재 확인
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ 스크립트 파일을 찾을 수 없습니다: $SCRIPT_PATH"
    exit 1
fi

echo "✅ 스크립트 파일 확인: $SCRIPT_PATH"
echo ""

# 실행 권한 부여
chmod +x "$SCRIPT_PATH"
echo "✅ 실행 권한 부여 완료"
echo ""

# .env 파일 확인
if [ ! -f "$CURRENT_DIR/.env" ]; then
    echo "⚠️  .env 파일이 없습니다."
    echo "   SUPABASE_URL과 SUPABASE_ANON_KEY를 환경 변수로 설정해야 합니다."
    echo ""
else
    echo "✅ .env 파일 확인"
    echo ""
fi

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install --save @supabase/supabase-js dotenv
echo ""

# Cron Job 설정
echo "⏰ Cron Job 설정 중..."
echo ""

# 6일마다 오전 9시에 실행하는 Cron 표현식
CRON_SCHEDULE="0 9 */6 * *"
CRON_COMMAND="cd $CURRENT_DIR && /usr/bin/env node $SCRIPT_PATH >> $CURRENT_DIR/logs/keepalive.log 2>&1"

# 로그 디렉토리 생성
mkdir -p "$CURRENT_DIR/logs"
echo "✅ 로그 디렉토리 생성: $CURRENT_DIR/logs"
echo ""

# 기존 Cron Job 확인
if crontab -l 2>/dev/null | grep -q "supabase-keepalive.js"; then
    echo "⚠️  기존 Cron Job이 이미 존재합니다."
    echo ""
    echo "기존 Cron Job:"
    crontab -l | grep "supabase-keepalive.js"
    echo ""
    read -p "기존 설정을 덮어쓰시겠습니까? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 설정이 취소되었습니다."
        exit 1
    fi

    # 기존 Cron Job 제거
    crontab -l | grep -v "supabase-keepalive.js" | crontab -
    echo "✅ 기존 Cron Job 제거 완료"
    echo ""
fi

# 새 Cron Job 추가
(crontab -l 2>/dev/null; echo "$CRON_SCHEDULE $CRON_COMMAND") | crontab -
echo "✅ Cron Job 등록 완료"
echo ""

# 설정 확인
echo "======================================================================"
echo "📋 등록된 Cron Job 정보"
echo "======================================================================"
echo ""
echo "스케줄: 6일마다 오전 9시"
echo "명령어: $CRON_COMMAND"
echo ""
echo "Cron 표현식: $CRON_SCHEDULE"
echo "  - 분: 0 (매시 정각)"
echo "  - 시: 9 (오전 9시)"
echo "  - 일: */6 (6일마다)"
echo "  - 월: * (매월)"
echo "  - 요일: * (모든 요일)"
echo ""
echo "로그 파일: $CURRENT_DIR/logs/keepalive.log"
echo ""

# 현재 등록된 모든 Cron Job 표시
echo "======================================================================"
echo "📅 현재 등록된 모든 Cron Jobs"
echo "======================================================================"
crontab -l
echo ""

# 테스트 실행
echo "======================================================================"
echo "🧪 테스트 실행"
echo "======================================================================"
echo ""
read -p "지금 바로 테스트 실행을 하시겠습니까? (Y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo "🏃 테스트 실행 중..."
    echo ""
    cd "$CURRENT_DIR" && node "$SCRIPT_PATH"
    echo ""
    if [ $? -eq 0 ]; then
        echo "✅ 테스트 성공!"
    else
        echo "❌ 테스트 실패. .env 파일과 환경 변수를 확인하세요."
    fi
fi

echo ""
echo "======================================================================"
echo "✅ Cron Job 설정 완료!"
echo "======================================================================"
echo ""
echo "💡 유용한 명령어:"
echo "  - Cron Job 확인:     crontab -l"
echo "  - Cron Job 편집:     crontab -e"
echo "  - Cron Job 삭제:     crontab -r"
echo "  - 로그 확인:         tail -f $CURRENT_DIR/logs/keepalive.log"
echo "  - 수동 실행:         node $SCRIPT_PATH"
echo ""
echo "🎉 이제 자동으로 6일마다 Supabase에 ping이 전송됩니다!"
echo ""
