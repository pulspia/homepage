#!/bin/bash
# HTTPS 진단 스크립트

echo "========================================="
echo "HTTPS 진단 스크립트"
echo "========================================="
echo ""

echo "1. Nginx 443 포트 리스닝 확인"
echo "-----------------------------------------"
sudo netstat -tlnp | grep :443 || sudo ss -tlnp | grep :443
if [ $? -ne 0 ]; then
    echo "❌ Nginx가 443 포트를 리스닝하지 않습니다!"
else
    echo "✅ Nginx가 443 포트를 리스닝하고 있습니다."
fi
echo ""

echo "2. Origin CA 인증서 파일 존재 확인"
echo "-----------------------------------------"
if [ -f /etc/cloudflare/certs/pulspia.com.pem ]; then
    echo "✅ 인증서 파일 존재: /etc/cloudflare/certs/pulspia.com.pem"
    ls -lh /etc/cloudflare/certs/pulspia.com.pem
else
    echo "❌ 인증서 파일 없음: /etc/cloudflare/certs/pulspia.com.pem"
fi

if [ -f /etc/cloudflare/certs/pulspia.com.key ]; then
    echo "✅ 개인 키 파일 존재: /etc/cloudflare/certs/pulspia.com.key"
    ls -lh /etc/cloudflare/certs/pulspia.com.key
else
    echo "❌ 개인 키 파일 없음: /etc/cloudflare/certs/pulspia.com.key"
fi
echo ""

echo "3. Nginx 설정 파일에서 443 포트 설정 확인"
echo "-----------------------------------------"
if grep -q "listen 443" /etc/nginx/sites-available/pulspia.com; then
    echo "✅ Nginx 설정에 443 포트 설정이 있습니다."
    grep "listen 443" /etc/nginx/sites-available/pulspia.com
else
    echo "❌ Nginx 설정에 443 포트 설정이 없습니다!"
fi
echo ""

echo "4. Nginx 설정 문법 검사"
echo "-----------------------------------------"
sudo nginx -t
echo ""

echo "5. Nginx 상태 확인"
echo "-----------------------------------------"
sudo systemctl status nginx | head -10
echo ""

echo "6. 방화벽 443 포트 확인"
echo "-----------------------------------------"
sudo ufw status | grep 443 || echo "UFW가 비활성화되었거나 443 포트 규칙이 없습니다."
echo ""

echo "7. Nginx 에러 로그 마지막 10줄"
echo "-----------------------------------------"
sudo tail -10 /var/log/nginx/pulspia-error.log 2>/dev/null || echo "에러 로그 파일이 없습니다."
echo ""

echo "8. 로컬에서 HTTPS 연결 테스트"
echo "-----------------------------------------"
curl -I -k https://localhost 2>&1 | head -5
echo ""

echo "========================================="
echo "진단 완료"
echo "========================================="
