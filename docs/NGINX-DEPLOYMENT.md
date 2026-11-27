# Nginx 서버 배포 가이드

Pulspia 홈페이지를 Nginx 웹서버 환경의 일반 호스팅 서버에 배포하는 가이드입니다.

## 📋 배포 전 체크리스트

- [x] BrowserRouter로 변경 완료
- [x] 프로덕션 빌드 완료 (`npm run build`)
- [x] Supabase 환경 변수 설정 완료
- [x] EmailJS 환경 변수 설정 완료
- [ ] Nginx 서버 접근 권한 확인
- [ ] 도메인 DNS 설정 완료

---

## 🚀 배포 단계

### 1. 빌드 파일 업로드

`build` 폴더의 **모든 내용**을 서버의 웹 루트 디렉토리에 업로드하세요.

#### FTP/SFTP 사용 시:
```
로컬: C:\Users\user\Downloads\dev\homepage\build\*
서버: /var/www/html/ (또는 호스팅 제공업체가 지정한 경로)
```

#### SCP 사용 시:
```bash
scp -r build/* user@your-server.com:/var/www/html/
```

**⚠️ 중요**: `build` 폴더 자체가 아니라 **폴더 내부의 파일들**을 업로드하세요.

업로드할 파일 목록:
```
/var/www/html/
├── index.html          ← React 앱 진입점
├── asset-manifest.json
├── favicon.ico
├── logo192.png
├── logo512.png
├── manifest.json
├── robots.txt
└── static/
    ├── css/
    │   └── main.*.css
    ├── js/
    │   └── main.*.js
    └── media/
```

---

### 2. Nginx 서버 설정

#### 방법 A: 서버 블록 파일 생성 (권장)

1. **새 서버 블록 파일 생성**:
```bash
sudo nano /etc/nginx/sites-available/pulspia
```

2. **nginx.conf 파일 내용 붙여넣기**:
   - 프로젝트 루트의 `nginx.conf` 파일 내용 복사
   - `server_name`을 실제 도메인으로 변경
   - `root` 경로를 실제 빌드 파일 위치로 변경

3. **심볼릭 링크 생성**:
```bash
sudo ln -s /etc/nginx/sites-available/pulspia /etc/nginx/sites-enabled/
```

4. **Nginx 설정 테스트**:
```bash
sudo nginx -t
```

5. **Nginx 재시작**:
```bash
sudo systemctl restart nginx
```

#### 방법 B: 기존 설정 파일 수정

기존 nginx 설정 파일을 수정하는 경우:
```bash
sudo nano /etc/nginx/nginx.conf
# 또는
sudo nano /etc/nginx/sites-available/default
```

다음 내용을 `server` 블록에 추가:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # SPA 라우팅 지원
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

### 3. 일반 호스팅 환경 (cPanel 등)

일부 호스팅 서비스는 Nginx 설정 파일에 직접 접근할 수 없습니다.

#### cPanel의 경우:

1. **파일 관리자**로 접속
2. `public_html` 폴더에 build 폴더 내용 업로드
3. **Nginx 설정 지원 여부 확인**:
   - cPanel → "MultiPHP INI Editor" 또는 "Nginx Configuration"
   - 없는 경우: 호스팅 업체에 연락하여 SPA 라우팅 설정 요청

4. **호스팅 업체에 요청할 내용**:
```
안녕하세요,

React SPA 애플리케이션을 배포하려고 합니다.
Nginx에서 다음 설정을 추가해주실 수 있을까요?

location / {
    try_files $uri $uri/ /index.html;
}

감사합니다.
```

---

### 4. 배포 확인

배포 후 다음 사항을 확인하세요:

#### 기본 기능
- [ ] 홈페이지 접속: `https://your-domain.com`
- [ ] 뉴스 페이지 접속: `https://your-domain.com/news`
- [ ] 새로고침 시 404 에러 발생하지 않는지 확인
- [ ] 브라우저 뒤로가기/앞으로가기 동작 확인

#### 페이지별 기능
- [ ] 테마 전환 (다크/라이트 모드)
- [ ] 언어 전환 (한국어/영어)
- [ ] 헤더 네비게이션 동작
- [ ] 홈페이지 섹션 스크롤

#### Contact 폼
- [ ] 폼 입력 및 제출
- [ ] EmailJS 이메일 전송 확인
- [ ] 성공/실패 메시지 표시

#### 뉴스 게시판
- [ ] 관리자 로그인 기능
- [ ] 게시글 목록 조회
- [ ] 게시글 작성 (이미지 업로드 포함)
- [ ] 게시글 삭제
- [ ] Supabase 연동 확인

#### 성능 확인
- [ ] 페이지 로딩 속도 확인
- [ ] 모바일 반응형 확인
- [ ] 개발자 도구에서 콘솔 에러 확인

---

## 🔧 문제 해결

### 1. 404 에러 (페이지를 찾을 수 없음)

**증상**: `/news` 접속 시 404 에러

**원인**: Nginx가 SPA 라우팅을 처리하지 못함

**해결**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
이 설정이 Nginx 서버 블록에 추가되었는지 확인하세요.

---

### 2. 정적 파일 로딩 실패 (CSS/JS 404)

**증상**: 페이지는 로드되지만 스타일이 깨짐

**원인**: 정적 파일 경로 문제

**해결**:
1. `package.json`의 `homepage` 필드 확인:
```json
"homepage": "."
```

2. 웹 루트 디렉토리 확인:
   - Nginx `root` 경로가 `index.html`이 있는 디렉토리를 가리키는지 확인

---

### 3. Supabase 연결 실패

**증상**: 뉴스 게시판에서 "Failed to fetch" 에러

**원인**: 환경 변수가 빌드에 포함되지 않음

**해결**:
1. `.env` 파일 확인:
```env
REACT_APP_SUPABASE_URL=https://qsnuvaczuzdbqlbrdqjw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
```

2. 빌드 재실행:
```bash
npm run build
```

3. 새 빌드 파일 재업로드

---

### 4. CORS 에러

**증상**: 브라우저 콘솔에 CORS 에러 표시

**원인**: Supabase/EmailJS 도메인 설정 문제

**해결**:
- **Supabase**: Dashboard → Settings → API → Allowed domains에 도메인 추가
- **EmailJS**: Dashboard → Account → Allowed domains에 도메인 추가

---

### 5. HTTP에서 HTTPS로 리다이렉트 안됨

**증상**: `http://` 접속 시 자동으로 `https://`로 이동하지 않음

**해결**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔒 HTTPS 설정 (SSL/TLS)

### Let's Encrypt SSL 인증서 설치

1. **Certbot 설치**:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. **SSL 인증서 자동 발급 및 Nginx 설정**:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

3. **자동 갱신 설정 확인**:
```bash
sudo systemctl status certbot.timer
```

4. **수동 갱신 테스트**:
```bash
sudo certbot renew --dry-run
```

---

## 📊 성능 최적화

### Gzip 압축 활성화

nginx.conf의 Gzip 설정 확인:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/javascript application/javascript;
```

### 브라우저 캐싱 최적화

정적 파일 캐싱 설정:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### HTTP/2 활성화 (HTTPS 필요)

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

---

## 🎯 배포 완료 체크리스트

- [ ] build 폴더 내용 서버에 업로드 완료
- [ ] Nginx 설정 추가 완료
- [ ] Nginx 재시작 완료
- [ ] 도메인으로 홈페이지 접속 확인
- [ ] /news 페이지 접속 확인 (404 없음)
- [ ] 테마/언어 전환 동작 확인
- [ ] Contact 폼 이메일 전송 확인
- [ ] 뉴스 게시판 로그인/작성 확인
- [ ] HTTPS 설정 완료 (Let's Encrypt)
- [ ] 모바일 반응형 확인
- [ ] 콘솔 에러 없는지 확인

---

## 📞 추가 지원

### Supabase 설정
- [SUPABASE-SETUP.md](SUPABASE-SETUP.md) 참조

### 보안 검토
- [SECURITY-REVIEW.md](SECURITY-REVIEW.md) 참조

### 일반 호스팅 업체별 가이드

**Cafe24**:
- Nginx 설정 접근 불가
- 고객센터에 SPA 라우팅 설정 요청 필요

**가비아**:
- 일부 요금제에서 Nginx 설정 가능
- 호스팅 관리 페이지 → 서버 설정

**AWS Lightsail / DigitalOcean**:
- 전체 서버 제어 가능
- 위의 Nginx 설정 방법 A 사용

**Netlify / Vercel (대안)**:
- Nginx 설정 불필요
- Git 연동 자동 배포 지원
- `_redirects` 파일로 SPA 라우팅 자동 처리

---

## 🎉 배포 완료!

모든 단계를 완료했다면 Pulspia 홈페이지가 성공적으로 배포되었습니다!

**접속 URL**:
- 홈페이지: `https://your-domain.com/`
- 회사 뉴스: `https://your-domain.com/news`

배포 후 문제가 발생하면 위의 "문제 해결" 섹션을 참조하세요.
