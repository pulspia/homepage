#!/bin/bash

# Nginx 설정 파일 경로
NGINX_CONFIG="/etc/nginx/sites-enabled/pulspia.com"
BACKUP_FILE="/tmp/pulspia.com.backup.$(date +%Y%m%d_%H%M%S)"

echo "========================================"
echo "Nginx 모니터링 서버 프록시 설정 추가"
echo "========================================"
echo ""

# 백업 생성
echo "1. 현재 설정 백업 중..."
sudo cp "$NGINX_CONFIG" "$BACKUP_FILE"
echo "   백업 완료: $BACKUP_FILE"
echo ""

# Python 스크립트로 정확하게 수정
echo "2. Nginx 설정 파일 수정 중..."
sudo python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-enabled/pulspia.com"

with open(config_file, 'r') as f:
    content = f.read()

# 기존에 잘못 추가된 모니터링 프록시 제거 (있다면)
content = re.sub(r'\n\s*#\s*모니터링 서버 프록시\s*\n\s*location\s+/monitor/\s*\{[^}]*\}', '', content)

# 모니터링 프록시 설정
monitor_proxy = """
    # 모니터링 서버 프록시
    location /monitor/ {
        proxy_pass http://localhost:8002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
"""

# /api/ location 블록 다음에 모니터링 프록시 추가
# /api/ 블록의 끝(})을 찾고 그 다음에 추가
api_pattern = r'(location\s+/api/\s*\{[^}]*\}(?:\s*\n)?)'
replacement = r'\1' + monitor_proxy

# 이미 모니터링 프록시가 있는지 확인
if 'location /monitor/' not in content:
    content = re.sub(api_pattern, replacement, content, count=1)
    print("✓ 모니터링 서버 프록시 설정 추가 완료")
else:
    print("✓ 모니터링 서버 프록시 설정이 이미 존재합니다")

with open(config_file, 'w') as f:
    f.write(content)
PYTHON_SCRIPT

echo "   설정 파일 수정 완료"
echo ""

# Nginx 설정 테스트
echo "3. Nginx 설정 검증 중..."
if sudo nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo "   ✓ Nginx 설정 검증 성공"
    echo ""

    # Nginx 재시작
    echo "4. Nginx 재시작 중..."
    sudo systemctl reload nginx
    echo "   ✓ Nginx 재시작 완료"
    echo ""

    echo "========================================"
    echo "✓ Nginx 설정이 성공적으로 완료되었습니다!"
    echo "========================================"
    echo ""
    echo "다음 단계:"
    echo "  ./deploy.sh"
    echo ""
else
    echo "   ✗ Nginx 설정 검증 실패"
    echo ""
    echo "백업에서 복원 중..."
    sudo cp "$BACKUP_FILE" "$NGINX_CONFIG"
    echo "   ✓ 백업에서 복원 완료"
    echo ""
    echo "에러 로그:"
    sudo nginx -t
    exit 1
fi
