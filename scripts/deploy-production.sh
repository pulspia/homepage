#!/bin/bash
# 프로덕션 배포 스크립트

echo "=== 프로덕션 배포 시작 ==="
echo ""

# 1. Nginx 설정 배포
echo "[1/3] Nginx 설정 배포 중..."
sudo cp nginx.conf /etc/nginx/sites-available/pulspia.com
echo "✓ Nginx 설정 파일 복사 완료"

# 2. Nginx 설정 테스트
echo ""
echo "[2/3] Nginx 설정 테스트 중..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✓ Nginx 설정 테스트 통과"
else
    echo "✗ Nginx 설정 오류 발생!"
    exit 1
fi

# 3. Nginx reload
echo ""
echo "[3/3] Nginx 재시작 중..."
sudo systemctl reload nginx
echo "✓ Nginx reload 완료"

echo ""
echo "=== 배포 완료! ==="
echo ""
echo "다음 단계:"
echo "1. 브라우저 캐시 완전 삭제 (Ctrl + Shift + Delete)"
echo "2. 또는 시크릿 모드에서 테스트"
echo "3. http://www.pulspia.com/services 접속"
