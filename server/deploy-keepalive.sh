#!/bin/bash

##############################################################################
# Supabase Keep-Alive PM2 서비스 배포 스크립트
#
# 사용 방법:
#   1. 스크립트 상단의 서버 정보 수정
#   2. chmod +x server/deploy-keepalive.sh
#   3. ./server/deploy-keepalive.sh
##############################################################################

# ========== 설정 (여기를 수정하세요) ==========
SERVER_USER="bhhan"           # 서버 SSH 사용자명
SERVER_HOST="192.168.1.145"         # 서버 주소
DEPLOY_PATH="/var/www/supabase-keepalive"  # 서버 배포 경로 (권장: 별도 폴더)
# 또는 같은 폴더에 배포하려면: DEPLOY_PATH="/var/www/pulspia.com"

# Supabase 인증 정보 (보안을 위해 직접 입력하거나 .env에서 가져옴)
SUPABASE_URL="${SUPABASE_URL:-}"      # 또는 직접 입력
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
# ==============================================

echo "======================================================================"
echo "🚀 Supabase Keep-Alive PM2 서비스 배포"
echo "======================================================================"
echo ""
echo "서버: $SERVER_USER@$SERVER_HOST"
echo "배포 경로: $DEPLOY_PATH"
echo ""

# Supabase 인증 정보 확인
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "⚠️  .env 파일에서 Supabase 인증 정보를 가져옵니다..."

    if [ -f ".env" ]; then
        source .env
        SUPABASE_URL="${REACT_APP_SUPABASE_URL:-$SUPABASE_URL}"
        SUPABASE_ANON_KEY="${REACT_APP_SUPABASE_ANON_KEY:-$SUPABASE_ANON_KEY}"
    fi

    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        echo "❌ Supabase 인증 정보를 찾을 수 없습니다."
        echo "   스크립트 상단에 직접 입력하거나 .env 파일을 확인하세요."
        exit 1
    fi
fi

echo "✅ Supabase 인증 정보 확인 완료"
echo ""

# 1. 서버에 디렉토리 생성
echo "📁 서버에 디렉토리 생성 중..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $DEPLOY_PATH/server $DEPLOY_PATH/logs"

# 2. 필요한 파일 복사
echo "📤 파일 전송 중..."

# server 디렉토리
scp server/supabase-keepalive-service.js $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/server/
scp server/supabase-keepalive.js $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/server/

# package.json (필요한 의존성만 포함된 최소 버전)
echo "📦 최소 package.json 생성 중..."
cat > /tmp/keepalive-package.json << EOF
{
  "name": "supabase-keepalive",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@supabase/supabase-js": "^2.79.0",
    "dotenv": "^16.4.7",
    "node-cron": "^3.0.3"
  },
  "scripts": {
    "start": "node server/supabase-keepalive-service.js",
    "test": "node server/supabase-keepalive.js"
  }
}
EOF

scp /tmp/keepalive-package.json $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/package.json
rm /tmp/keepalive-package.json

# .env 파일 생성
echo "🔐 서버에 .env 파일 생성 중..."
ssh $SERVER_USER@$SERVER_HOST "cat > $DEPLOY_PATH/.env" << EOF
# Supabase 설정
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Keep-Alive 설정
KEEPALIVE_CRON_SCHEDULE=0 9 */6 * *
KEEPALIVE_RUN_ON_START=true
KEEPALIVE_LOG_FILE=$DEPLOY_PATH/logs/keepalive.log
TZ=Asia/Seoul
EOF

echo "✅ 파일 전송 완료"
echo ""

# 3. 서버에서 의존성 설치
echo "📦 서버에서 의존성 설치 중..."
ssh $SERVER_USER@$SERVER_HOST << EOF
    cd $DEPLOY_PATH
    npm install --production
EOF

# 4. PM2 설치 확인
echo "🔍 PM2 설치 확인 중..."
PM2_INSTALLED=$(ssh $SERVER_USER@$SERVER_HOST "command -v pm2 || echo 'not_found'")

if [[ "$PM2_INSTALLED" == *"not_found"* ]]; then
    echo "📦 PM2 설치 중..."
    ssh $SERVER_USER@$SERVER_HOST "npm install -g pm2"
else
    echo "✅ PM2 이미 설치됨"
fi
echo ""

# 5. 기존 PM2 프로세스 확인 및 재시작
echo "🔄 PM2 서비스 시작 중..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    cd $DEPLOY_PATH

    # 기존 프로세스가 있으면 재시작, 없으면 시작
    if pm2 describe supabase-keepalive > /dev/null 2>&1; then
        echo "♻️  기존 서비스 재시작 중..."
        pm2 restart supabase-keepalive
    else
        echo "🆕 새 서비스 시작 중..."
        pm2 start server/supabase-keepalive-service.js --name supabase-keepalive
        pm2 save
    fi

    # 부팅 시 자동 시작 설정
    pm2 startup | grep -v "PM2" | sudo bash
    pm2 save

    echo ""
    echo "📊 PM2 상태:"
    pm2 status supabase-keepalive

    echo ""
    echo "📝 최근 로그 (5줄):"
    pm2 logs supabase-keepalive --lines 5 --nostream
EOF

echo ""
echo "======================================================================"
echo "✅ 배포 완료!"
echo "======================================================================"
echo ""
echo "💡 유용한 명령어:"
echo "  - 상태 확인:     ssh $SERVER_USER@$SERVER_HOST 'pm2 status'"
echo "  - 로그 확인:     ssh $SERVER_USER@$SERVER_HOST 'pm2 logs supabase-keepalive'"
echo "  - 재시작:        ssh $SERVER_USER@$SERVER_HOST 'pm2 restart supabase-keepalive'"
echo "  - 중지:          ssh $SERVER_USER@$SERVER_HOST 'pm2 stop supabase-keepalive'"
echo "  - SSH 접속:      ssh $SERVER_USER@$SERVER_HOST"
echo ""
echo "🎉 이제 자동으로 6일마다 Supabase에 ping이 전송됩니다!"
echo ""
