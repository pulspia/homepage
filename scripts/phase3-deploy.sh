#!/bin/bash
# Phase 3: 프로덕션 배포 스크립트

echo "=== Phase 3: Nginx 설정 및 프로덕션 배포 ==="
echo ""

# 1. 홈페이지 빌드 파일을 서비스 폴더로 복사
echo "[1/6] 홈페이지 빌드 파일 배포 중..."
sudo rm -rf /var/www/pulspia.com/*
sudo cp -r /mnt/e/dev/homepage/build/* /var/www/pulspia.com/
sudo chown -R www-data:www-data /var/www/pulspia.com
sudo chmod -R 755 /var/www/pulspia.com
echo "✓ 홈페이지 배포 완료"
echo ""

# 2. Nginx 설정 파일 복사
echo "[2/6] Nginx 설정 파일 배포 중..."
sudo cp /mnt/e/dev/homepage/nginx.conf /etc/nginx/sites-available/pulspia.com
sudo ln -sf /etc/nginx/sites-available/pulspia.com /etc/nginx/sites-enabled/pulspia.com
echo "✓ Nginx 설정 파일 배포 완료"
echo ""

# 3. Nginx 설정 테스트
echo "[3/6] Nginx 설정 테스트 중..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✓ Nginx 설정 테스트 통과"
else
    echo "✗ Nginx 설정 오류 - 수정이 필요합니다"
    exit 1
fi
echo ""

# 4. 개발 서버 중지
echo "[4/6] 개발 서버 중지 중..."
# React 개발 서버 (포트 3000)
REACT_PID=$(lsof -ti:3000)
if [ ! -z "$REACT_PID" ]; then
    kill $REACT_PID 2>/dev/null
    echo "  - React 개발 서버 중지됨"
fi

# Next.js 개발 서버 (포트 3001)
NEXT_PID=$(lsof -ti:3001)
if [ ! -z "$NEXT_PID" ]; then
    kill $NEXT_PID 2>/dev/null
    echo "  - Next.js 개발 서버 중지됨"
fi

# FastAPI 개발 서버 (포트 8001)
FASTAPI_PID=$(lsof -ti:8001)
if [ ! -z "$FASTAPI_PID" ]; then
    kill $FASTAPI_PID 2>/dev/null
    echo "  - FastAPI 개발 서버 중지됨"
fi

sleep 2
echo "✓ 개발 서버 중지 완료"
echo ""

# 5. PM2로 프로덕션 서버 시작
echo "[5/6] PM2로 프로덕션 서버 시작 중..."
cd /mnt/e/dev/web/web-mbti
pm2 start ecosystem.config.js
pm2 save
echo "✓ PM2 서버 시작 완료"
echo ""

# 6. Nginx 재시작
echo "[6/6] Nginx 재시작 중..."
sudo systemctl reload nginx
echo "✓ Nginx 재시작 완료"
echo ""

echo "=== Phase 3 배포 완료! ==="
echo ""
echo "서비스 URL:"
echo "  - 홈페이지: http://localhost"
echo "  - MBTI 테스트: http://localhost/services/mbti"
echo ""
echo "PM2 상태 확인: pm2 status"
echo "PM2 로그 확인: pm2 logs"
echo "Nginx 로그 확인: sudo tail -f /var/log/nginx/pulspia_error.log"
