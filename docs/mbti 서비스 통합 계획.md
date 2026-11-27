# AI MBTI 서비스 통합 계획

## 📋 프로젝트 개요

Pulspia 홈페이지에 AI MBTI 테스트 서비스를 통합하여, 사용자가 헤더의 "서비스" 메뉴를 통해 AI MBTI 테스트에 접근할 수 있도록 합니다.

### 프로젝트 환경
- **개발 서버**: Windows WSL Ubuntu 22.04
- **웹 서버**: nginx
- **홈페이지 개발 폴더**: `/mnt/e/dev/homepage` (React + CRA)
- **AI MBTI 개발 폴더**: `/mnt/e/dev/web/web-mbti` (Next.js 16)
- **홈페이지 서비스 폴더**: `/var/www/pulspia.com`

---

## 🎯 목표

1. 헤더의 "서비스" 메뉴를 클릭하면 새로운 서비스 페이지(`/services`)로 이동
2. 서비스 페이지는 **왼쪽 사이드바**(서비스 목록) + **오른쪽 메인**(선택된 서비스 표시) 구조
3. 첫 번째 서비스: **AI MBTI 테스트**
4. 기존 홈페이지의 Look & Feel 유지 (다크/라이트 테마, 한/영 지원)
5. 확장 가능한 구조로 향후 추가 서비스 쉽게 등록

---

## 🏗️ 아키텍처 설계

### 1. 통합 방식 선택

#### Option A: iframe 임베딩 (추천)
**장점**:
- 두 프로젝트 독립성 유지
- MBTI 앱 수정 최소화
- 각각 독립적으로 업데이트 가능
- 테마/언어 충돌 방지

**단점**:
- 별도 서버/포트 필요
- 통신 오버헤드 (postMessage 필요 시)

**구현 방법**:
- MBTI 앱을 별도 포트(예: 3001)에서 실행
- nginx 리버스 프록시로 `/services/mbti` → `localhost:3001` 연결
- React 앱에서 iframe으로 MBTI 앱 임베딩

#### Option B: 정적 빌드 통합
**장점**:
- 단일 배포 구조
- 추가 서버 불필요

**단점**:
- Next.js static export 제약 (일부 기능 제한)
- 빌드 복잡도 증가

#### Option C: 컴포넌트 직접 통합
**장점**:
- 완전한 통합

**단점**:
- Next.js → React 변환 작업 필요 (복잡)
- 의존성 충돌 가능성
- 유지보수 어려움

**최종 선택**: **Option A (iframe 임베딩)**

---

## 📝 구현 단계

### Phase 1: 홈페이지 수정 (React 앱)

#### 1.1 라우팅 구조 확장
**파일**: `src/App.js`

```javascript
// 새로운 임포트 추가
import Services from './pages/Services';

// Routes에 추가
<Route path="/services" element={<Services lang={lang} theme={theme} />} />
```

#### 1.2 헤더 네비게이션 수정
**파일**: `src/components/Header/Header.js`

현재 "서비스" 링크를 홈페이지 섹션 스크롤에서 페이지 라우팅으로 변경:

```javascript
// 변경 전
<a href="#services" onClick={(e) => handleSectionClick(e, 'services')}>
  {navLinks[lang].services}
</a>

// 변경 후
<Link to="/services" className="hover:text-blue-500 dark:hover:text-blue-400">
  {navLinks[lang].services}
</Link>
```

#### 1.3 Services 페이지 생성
**파일**: `src/pages/Services.js` (신규)

**구조**:
```javascript
import React, { useState } from 'react';
import ServicesSidebar from '../components/Services/ServicesSidebar';
import ServiceContent from '../components/Services/ServiceContent';

const Services = ({ lang, theme }) => {
  const [selectedService, setSelectedService] = useState('ai-mbti');

  return (
    <div className="flex min-h-screen">
      <ServicesSidebar
        lang={lang}
        selectedService={selectedService}
        onSelectService={setSelectedService}
      />
      <ServiceContent
        lang={lang}
        theme={theme}
        selectedService={selectedService}
      />
    </div>
  );
};

export default Services;
```

#### 1.4 사이드바 컴포넌트 생성
**파일**: `src/components/Services/ServicesSidebar.js` (신규)

**기능**:
- 서비스 목록 표시
- 선택된 서비스 하이라이트
- 반응형 디자인 (모바일에서 접기/펼치기)
- 다크/라이트 테마 지원

**서비스 데이터 구조**:
```javascript
const services = {
  ko: [
    {
      id: 'ai-mbti',
      name: 'AI MBTI 테스트',
      description: '20개 질문으로 알아보는 성격 유형',
      icon: '🎯'
    }
    // 향후 서비스 추가 가능
  ],
  en: [
    {
      id: 'ai-mbti',
      name: 'AI MBTI Test',
      description: 'Personality test with 20 questions',
      icon: '🎯'
    }
  ]
};
```

#### 1.5 서비스 콘텐츠 컴포넌트 생성
**파일**: `src/components/Services/ServiceContent.js` (신규)

**기능**:
- 선택된 서비스에 따라 콘텐츠 표시
- AI MBTI: iframe으로 MBTI 앱 임베딩
- 로딩 상태 처리
- 반응형 iframe 크기 조정

```javascript
const ServiceContent = ({ selectedService, theme }) => {
  if (selectedService === 'ai-mbti') {
    return (
      <div className="flex-1 p-6">
        <iframe
          src="http://localhost:3001"  // 개발 환경
          // src="/services/mbti"       // 프로덕션 환경
          title="AI MBTI Test"
          className="w-full h-screen border-0"
          style={{ minHeight: '800px' }}
        />
      </div>
    );
  }

  return <div>서비스를 선택해주세요</div>;
};
```

---

### Phase 2: AI MBTI 앱 설정

#### 2.1 MBTI 앱 독립 실행 설정
**파일**: `/mnt/e/dev/web/web-mbti/package.json`

포트 변경 (홈페이지와 충돌 방지):
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "start": "next start -p 3001"
  }
}
```

#### 2.2 MBTI 앱 프로덕션 빌드
```bash
cd /mnt/e/dev/web/web-mbti
npm run build
```

#### 2.3 PM2로 MBTI 앱 관리 (프로덕션)
**파일**: `/mnt/e/dev/web/web-mbti/ecosystem.config.js` (신규)

```javascript
module.exports = {
  apps: [{
    name: 'mbti-app',
    cwd: '/mnt/e/dev/web/web-mbti',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

**실행**:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 시스템 재부팅 시 자동 시작
```

---

### Phase 3: Nginx 설정

#### 3.1 Nginx 리버스 프록시 설정
**파일**: `/etc/nginx/sites-available/pulspia.com` 또는 `nginx.conf`

```nginx
server {
    listen 80;
    server_name pulspia.com www.pulspia.com;

    # 홈페이지 (React 앱)
    root /var/www/pulspia.com;
    index index.html;

    # React Router 지원
    location / {
        try_files $uri $uri/ /index.html;
    }

    # MBTI 서비스 프록시
    location /services/mbti/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # CORS 헤더 (필요 시)
        add_header Access-Control-Allow-Origin *;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3.2 Nginx 설정 테스트 및 재시작
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Phase 4: 배포

#### 4.1 홈페이지 빌드 및 배포
```bash
# 개발 폴더에서 빌드
cd /mnt/e/dev/homepage
npm run build

# 서비스 폴더로 배포
sudo rm -rf /var/www/pulspia.com/*
sudo cp -r build/* /var/www/pulspia.com/

# 권한 설정
sudo chown -R www-data:www-data /var/www/pulspia.com
sudo chmod -R 755 /var/www/pulspia.com
```

#### 4.2 MBTI 앱 배포
```bash
cd /mnt/e/dev/web/web-mbti
npm run build

# PM2로 실행 (이미 실행 중이면 재시작)
pm2 restart mbti-app
# 또는 처음 실행
pm2 start ecosystem.config.js
```

---

## 🎨 디자인 고려사항

### 사이드바 디자인
- **너비**: 고정 `280px` (데스크톱), 전체 너비 (모바일)
- **배경색**: `bg-gray-100 dark:bg-gray-800`
- **선택된 항목**: `bg-blue-100 dark:bg-blue-900` + 왼쪽 보더
- **호버 효과**: `hover:bg-gray-200 dark:hover:bg-gray-700`
- **아이콘**: 각 서비스별 이모지 또는 Lucide React 아이콘
- **스크롤**: 서비스가 많아지면 스크롤 가능

### 메인 콘텐츠 디자인
- **배경색**: `bg-white dark:bg-gray-900`
- **Padding**: `p-6`
- **iframe 스타일**:
  - `border-0` (경계선 제거)
  - `w-full h-screen` (전체 크기)
  - `rounded-lg` (모서리 둥글게, 선택 사항)

### 반응형 디자인
- **데스크톱** (≥1024px): 사이드바 + 메인 가로 배치
- **태블릿** (768px-1023px): 사이드바 축소 또는 토글
- **모바일** (<768px): 사이드바 햄버거 메뉴로 변경

---

## 🔧 개발 워크플로우

### 개발 환경 실행
```bash
# Terminal 1: 홈페이지 개발 서버
cd /mnt/e/dev/homepage
npm start  # localhost:3000

# Terminal 2: MBTI 앱 개발 서버
cd /mnt/e/dev/web/web-mbti
npm run dev  # localhost:3001
```

### 테스트 체크리스트
- [ ] 헤더 "서비스" 링크 클릭 시 `/services` 이동
- [ ] 사이드바 "AI MBTI 테스트" 선택 시 iframe 로드
- [ ] iframe 내 MBTI 앱 정상 작동
- [ ] 다크/라이트 테마 전환 시 사이드바 테마 변경
- [ ] 한/영 언어 전환 시 사이드바 언어 변경
- [ ] 반응형: 모바일에서 사이드바 정상 작동
- [ ] nginx 프록시로 프로덕션 URL 접근 테스트

---

## 🚀 배포 체크리스트

### 배포 전 준비
- [ ] 홈페이지 빌드 성공 확인 (`npm run build`)
- [ ] MBTI 앱 빌드 성공 확인 (`npm run build`)
- [ ] ServiceContent.js의 iframe src를 프로덕션 URL로 변경
  - 개발: `http://localhost:3001`
  - 프로덕션: `/services/mbti`

### 배포 실행
- [ ] 홈페이지 빌드 파일을 `/var/www/pulspia.com`에 복사
- [ ] MBTI 앱 PM2로 실행
- [ ] nginx 설정 추가 및 재시작
- [ ] DNS/도메인 설정 확인

### 배포 후 테스트
- [ ] https://pulspia.com 접속
- [ ] 헤더 "서비스" 메뉴 클릭
- [ ] AI MBTI 테스트 로드 확인
- [ ] MBTI 테스트 전체 플로우 테스트
- [ ] 모바일 브라우저 테스트
- [ ] 브라우저 콘솔 에러 확인

---

## 📂 파일 구조 (완료 후)

```
/mnt/e/dev/homepage/
├── src/
│   ├── pages/
│   │   ├── Home.js
│   │   ├── News.js
│   │   └── Services.js              # 신규
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.js            # 수정
│   │   └── Services/                # 신규
│   │       ├── ServicesSidebar.js
│   │       └── ServiceContent.js
│   └── App.js                       # 수정
└── mbti 서비스 통합 계획.md         # 본 문서

/mnt/e/dev/web/web-mbti/
├── src/
├── package.json                     # 수정 (포트 변경)
└── ecosystem.config.js              # 신규 (PM2 설정)

/var/www/pulspia.com/
└── (홈페이지 빌드 파일)

/etc/nginx/
└── sites-available/
    └── pulspia.com                 # 수정 (프록시 추가)
```

---

## 🔮 향후 확장 계획

### 추가 서비스 등록 예시
```javascript
// src/components/Services/ServicesSidebar.js
const services = {
  ko: [
    {
      id: 'ai-mbti',
      name: 'AI MBTI 테스트',
      description: '20개 질문으로 알아보는 성격 유형',
      icon: '🎯'
    },
    {
      id: 'ai-chatbot',
      name: 'AI 챗봇',
      description: '24시간 고객 응대 챗봇',
      icon: '💬'
    },
    {
      id: 'data-analysis',
      name: '데이터 분석',
      description: 'AI 기반 데이터 인사이트',
      icon: '📊'
    }
  ]
};
```

### 서비스별 URL 패턴
- AI MBTI: `/services/mbti` → `localhost:3001`
- AI Chatbot: `/services/chatbot` → `localhost:3002`
- Data Analysis: `/services/analysis` → `localhost:3003`

---

## ⚠️ 주의사항

1. **포트 충돌 방지**
   - 홈페이지 개발: 3000
   - MBTI 앱 개발: 3001
   - 프로덕션: nginx 80/443

2. **CORS 이슈**
   - iframe으로 임베딩하므로 CORS 정책 확인
   - 필요 시 nginx에서 CORS 헤더 추가

3. **테마/언어 동기화**
   - 현재는 iframe 독립 실행이므로 MBTI 앱 자체 테마 사용
   - 필요 시 postMessage로 테마/언어 동기화 가능

4. **SEO 고려**
   - iframe 내 콘텐츠는 검색엔진 크롤링 제한적
   - 필요 시 서비스 페이지에 메타 태그 추가

5. **보안**
   - iframe src에 신뢰할 수 있는 URL만 사용
   - nginx에서 적절한 보안 헤더 설정

---

## 📞 문제 해결

### MBTI 앱이 iframe에서 로드되지 않음
- PM2 상태 확인: `pm2 status`
- MBTI 앱 로그 확인: `pm2 logs mbti-app`
- 포트 충돌 확인: `sudo lsof -i :3001`

### nginx 프록시 오류
- nginx 에러 로그: `sudo tail -f /var/log/nginx/error.log`
- 설정 테스트: `sudo nginx -t`
- 프록시 대상 확인: `curl http://localhost:3001`

### 빌드 에러
- 의존성 재설치: `rm -rf node_modules package-lock.json && npm install`
- 캐시 삭제: `npm run build -- --no-cache` (Next.js)

---

## ✅ 성공 기준

- [x] 헤더 "서비스" 메뉴를 통해 서비스 페이지 접근 가능
- [x] 사이드바에서 서비스 선택 가능
- [x] AI MBTI 테스트가 iframe으로 정상 로드
- [x] 기존 홈페이지 Look & Feel 유지
- [x] 다크/라이트 테마, 한/영 언어 지원
- [x] 반응형 디자인 (모바일, 태블릿, 데스크톱)
- [x] 프로덕션 배포 완료
- [x] 향후 서비스 추가 가능한 확장 구조

---

## 📅 예상 일정

1. **Phase 1 (홈페이지 수정)**: 2-3시간
   - 라우팅, 헤더 수정
   - Services 페이지, 사이드바, 콘텐츠 컴포넌트 생성

2. **Phase 2 (MBTI 앱 설정)**: 1시간
   - 포트 변경, PM2 설정

3. **Phase 3 (Nginx 설정)**: 30분
   - 프록시 설정, 테스트

4. **Phase 4 (배포 및 테스트)**: 1시간
   - 빌드, 배포, 전체 테스트

**총 예상 시간**: 4.5-5.5시간

---

## 📚 참고 문서

- [React Router - Client Side Routing](https://reactrouter.com/)
- [Next.js - Deployment](https://nextjs.org/docs/deployment)
- [PM2 - Process Manager](https://pm2.keymetrics.io/)
- [Nginx - Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Pulspia 홈페이지 - CLAUDE.md](./CLAUDE.md)
- [AI MBTI 프로젝트 - README.md](../web/web-mbti/README.md)
