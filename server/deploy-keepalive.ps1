##############################################################################
# Supabase Keep-Alive PM2 서비스 배포 스크립트 (PowerShell 버전)
#
# 사용 방법:
#   1. 스크립트 상단의 서버 정보 수정
#   2. PowerShell에서: .\server\deploy-keepalive.ps1
##############################################################################

# ========== 설정 (여기를 수정하세요) ==========
$SERVER_USER = "bhhan"
$SERVER_HOST = "192.168.1.145"
$SERVER = "${SERVER_USER}@${SERVER_HOST}"
$DEPLOY_PATH = "/var/www/supabase-keepalive"

# Supabase 인증 정보 (.env에서 자동으로 가져옴)
# ==============================================

Write-Host "======================================================================"
Write-Host "🚀 Supabase Keep-Alive PM2 서비스 배포" -ForegroundColor Green
Write-Host "======================================================================"
Write-Host ""
Write-Host "서버: $SERVER"
Write-Host "배포 경로: $DEPLOY_PATH"
Write-Host ""

# .env 파일에서 Supabase 인증 정보 읽기
if (Test-Path ".env") {
    Write-Host "✅ .env 파일 발견" -ForegroundColor Green

    $envContent = Get-Content .env
    $SUPABASE_URL = ($envContent | Select-String "REACT_APP_SUPABASE_URL=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    $SUPABASE_ANON_KEY = ($envContent | Select-String "REACT_APP_SUPABASE_ANON_KEY=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })

    if ($SUPABASE_URL -and $SUPABASE_ANON_KEY) {
        Write-Host "✅ Supabase 인증 정보 확인 완료" -ForegroundColor Green
    } else {
        Write-Host "❌ .env 파일에 Supabase 인증 정보가 없습니다." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ .env 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host ""

# 1. 서버에 디렉토리 생성
Write-Host "📁 서버에 디렉토리 생성 중..." -ForegroundColor Cyan
ssh $SERVER "mkdir -p $DEPLOY_PATH/server $DEPLOY_PATH/logs"

# 2. 필요한 파일 복사
Write-Host "📤 파일 전송 중..." -ForegroundColor Cyan

# server 디렉토리
scp server/supabase-keepalive-service.js "${SERVER}:${DEPLOY_PATH}/server/"
scp server/supabase-keepalive.js "${SERVER}:${DEPLOY_PATH}/server/"

# 최소 package.json 생성
Write-Host "📦 최소 package.json 생성 중..." -ForegroundColor Cyan

$packageJson = @"
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
"@

$packageJson | Out-File -FilePath "temp-package.json" -Encoding UTF8
scp temp-package.json "${SERVER}:${DEPLOY_PATH}/package.json"
Remove-Item temp-package.json

# .env 파일 생성
Write-Host "🔐 서버에 .env 파일 생성 중..." -ForegroundColor Cyan

$envContent = @"
# Supabase 설정
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Keep-Alive 설정
KEEPALIVE_CRON_SCHEDULE=0 9 */6 * *
KEEPALIVE_RUN_ON_START=true
KEEPALIVE_LOG_FILE=$DEPLOY_PATH/logs/keepalive.log
TZ=Asia/Seoul
"@

$envContent | ssh $SERVER "cat > $DEPLOY_PATH/.env"

Write-Host "✅ 파일 전송 완료" -ForegroundColor Green
Write-Host ""

# 3. 서버에서 의존성 설치
Write-Host "📦 서버에서 의존성 설치 중..." -ForegroundColor Cyan
ssh $SERVER "cd $DEPLOY_PATH && npm install --production"

# 4. PM2 설치 확인
Write-Host "🔍 PM2 설치 확인 중..." -ForegroundColor Cyan
$pm2Check = ssh $SERVER "command -v pm2 2>&1"

if ($pm2Check -like "*not found*" -or $pm2Check -eq "") {
    Write-Host "📦 PM2 설치 중..." -ForegroundColor Yellow
    ssh $SERVER "npm install -g pm2"
} else {
    Write-Host "✅ PM2 이미 설치됨" -ForegroundColor Green
}
Write-Host ""

# 5. PM2 서비스 시작
Write-Host "🔄 PM2 서비스 시작 중..." -ForegroundColor Cyan

ssh $SERVER @"
cd $DEPLOY_PATH

# 기존 프로세스가 있으면 재시작, 없으면 시작
if pm2 describe supabase-keepalive > /dev/null 2>&1; then
    echo '♻️  기존 서비스 재시작 중...'
    pm2 restart supabase-keepalive
else
    echo '🆕 새 서비스 시작 중...'
    pm2 start server/supabase-keepalive-service.js --name supabase-keepalive
    pm2 save
fi

# 부팅 시 자동 시작 설정
pm2 startup | grep -v 'PM2' | sudo bash
pm2 save

echo ''
echo '📊 PM2 상태:'
pm2 status supabase-keepalive

echo ''
echo '📝 최근 로그 (5줄):'
pm2 logs supabase-keepalive --lines 5 --nostream
"@

Write-Host ""
Write-Host "======================================================================"
Write-Host "✅ 배포 완료!" -ForegroundColor Green
Write-Host "======================================================================"
Write-Host ""
Write-Host "💡 유용한 명령어:" -ForegroundColor Cyan
Write-Host "  - 상태 확인:     ssh $SERVER 'pm2 status'"
Write-Host "  - 로그 확인:     ssh $SERVER 'pm2 logs supabase-keepalive'"
Write-Host "  - 재시작:        ssh $SERVER 'pm2 restart supabase-keepalive'"
Write-Host "  - 중지:          ssh $SERVER 'pm2 stop supabase-keepalive'"
Write-Host "  - SSH 접속:      ssh $SERVER"
Write-Host ""
Write-Host "🎉 이제 자동으로 6일마다 Supabase에 ping이 전송됩니다!" -ForegroundColor Green
Write-Host ""
