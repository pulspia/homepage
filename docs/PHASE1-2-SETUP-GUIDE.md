# Phase 1-2 설정 및 테스트 가이드

## 🎯 Phase 1-2 완료 내역

### ✅ Phase 1: 기본 인프라 구축
- Supabase 데이터베이스 스키마 (8개 테이블)
- Admin 라우팅 (`/admin`)
- AdminDashboard 메인 페이지
- AdminLogin 인증 테스트

### ✅ Phase 2: 실시간 접속자 추적 및 통계
- 방문자 추적 유틸리티 (`src/utils/analytics.js`)
- App.js 통합 (자동 방문자 추적)
- 실시간 접속자 컴포넌트 (`RealTimeVisitors`)
- 방문자 통계 대시보드 (`VisitorStats`)
- Recharts 차트 시각화

---

## 📦 설치된 패키지

```bash
npm install uuid recharts
```

---

## 🗄️ Supabase 데이터베이스 설정

### 1. Supabase Dashboard 접속

1. https://supabase.com 로그인
2. 프로젝트 선택 (또는 새 프로젝트 생성)
3. 좌측 메뉴에서 **SQL Editor** 클릭

### 2. SQL 스키마 실행

`supabase-admin-setup.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣고 **RUN** 버튼 클릭

**생성되는 테이블:**
1. `admin_settings` - 사이트 설정
2. `visitor_analytics` - 방문자 세션 정보
3. `page_views` - 페이지 조회 기록
4. `system_logs` - 시스템 에러 로그
5. `server_metrics` - 서버 리소스 메트릭
6. `ip_blacklist` - IP 차단 목록
7. `admin_activity_logs` - 관리자 활동 로그
8. `alert_history` - 알람 발송 이력

**자동 설정:**
- 16개 인덱스 생성 (성능 최적화)
- 24개 RLS 정책 적용 (보안)
- 4개 테이블 Realtime 활성화
- 2개 자동 트리거 함수

### 3. 테이블 확인

좌측 메뉴에서 **Table Editor** 클릭하여 8개 테이블이 생성되었는지 확인

---

## ⚙️ 환경 변수 확인

`.env` 파일에 Supabase 설정이 올바른지 확인:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**중요**: `.env` 파일을 수정했다면 개발 서버를 재시작해야 합니다.

```bash
# Ctrl+C로 서버 종료 후
npm start
```

---

## 🚀 로컬 실행 및 테스트

### 1. 개발 서버 시작

```bash
npm start
```

서버가 http://localhost:3000 에서 실행됩니다.

### 2. 방문자 추적 테스트

1. 브라우저에서 http://localhost:3000 접속
2. 여러 페이지를 탐색 (Home, News, Contact 등)
3. 개발자 도구 (F12) → Console 탭에서 에러 확인

**자동으로 추적되는 정보:**
- 세션 ID (localStorage에 저장)
- 디바이스 유형 (mobile, tablet, desktop)
- 브라우저 및 버전
- OS 및 버전
- 화면 해상도
- 언어
- 유입 경로 (referrer)
- 페이지 조회

### 3. Supabase 데이터 확인

1. Supabase Dashboard → Table Editor
2. `visitor_analytics` 테이블 선택
3. 방문자 데이터가 기록되었는지 확인
4. `page_views` 테이블에서 페이지 조회 기록 확인

### 4. 관리자 페이지 접속

1. http://localhost:3000/admin 접속
2. News 페이지에서 사용하는 Supabase 계정으로 로그인
3. 대시보드에서 다음 정보 확인:
   - 실시간 접속자 목록
   - 전체 방문자 수
   - 오늘 방문자 수
   - 유입 경로 차트 (파이 차트)
   - 디바이스 유형 차트 (파이 차트)
   - 브라우저 분포 차트 (막대 차트)

---

## 🧪 테스트 실행

### 단위 테스트 (AdminLogin)

```bash
npm test -- AdminLogin.test.js --watchAll=false
```

**테스트 내용:**
- 로그인 폼 렌더링
- 이메일/비밀번호 입력
- 로그인 버튼 클릭
- 로딩 상태 표시
- 에러 메시지 표시
- 성공 콜백 실행

### 전체 테스트 실행

```bash
npm test
```

---

## 🔍 실시간 기능 테스트

### Supabase Realtime 테스트

1. 관리자 페이지를 두 개의 브라우저 탭에서 열기
2. 첫 번째 탭: 관리자 대시보드 확인
3. 두 번째 탭: 홈페이지 탐색 (새로운 방문자 생성)
4. 첫 번째 탭에서 실시간 접속자가 자동으로 업데이트되는지 확인

### 세션 Heartbeat 테스트

1. 홈페이지를 열고 2분 이상 대기
2. Supabase Dashboard에서 `visitor_analytics` 테이블 확인
3. `last_activity` 컬럼이 자동으로 업데이트되는지 확인 (2분 간격)

---

## 📊 대시보드 기능 확인

### 실시간 접속자

- 현재 활성 방문자 수 표시
- 각 방문자의 디바이스, 브라우저, OS 정보
- 유입 경로 정보
- 마지막 활동 시간
- 30초마다 자동 새로고침

### 방문자 통계

- 전체 방문자 수
- 오늘 방문자 수
- 유입 경로 분포 (파이 차트)
  - Direct (직접 접속)
  - Google Search
  - Social Media
  - Others
- 디바이스 유형 분포 (파이 차트)
  - Desktop
  - Mobile
  - Tablet
- 브라우저 분포 (막대 차트)
  - Top 5 브라우저 표시
- 1분마다 자동 새로고침

---

## 🎨 다크 모드 테스트

1. 홈페이지 우측 상단의 🌙/☀️ 버튼 클릭
2. 다크 모드/라이트 모드 전환 확인
3. 관리자 페이지에서도 동일하게 테마 적용되는지 확인

---

## 🐛 문제 해결

### 1. 방문자 데이터가 기록되지 않는 경우

**확인 사항:**
- Supabase SQL 스키마가 정상적으로 실행되었는지 확인
- `.env` 파일의 Supabase URL과 Anon Key가 올바른지 확인
- 개발 서버를 재시작했는지 확인
- 브라우저 콘솔에 에러 메시지가 있는지 확인

**RLS 정책 확인:**
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM pg_policies
WHERE tablename = 'visitor_analytics';
```

### 2. 관리자 로그인이 안 되는 경우

**확인 사항:**
- News 페이지에서 사용하는 Supabase 계정이 존재하는지 확인
- Supabase Dashboard → Authentication → Users에서 계정 확인
- 계정이 없다면 News 페이지에서 먼저 로그인하여 계정 생성

### 3. 차트가 표시되지 않는 경우

**확인 사항:**
- recharts 패키지가 설치되었는지 확인: `npm list recharts`
- 방문자 데이터가 Supabase에 존재하는지 확인
- 브라우저 콘솔에 에러 메시지가 있는지 확인

### 4. Realtime 업데이트가 안 되는 경우

**Supabase Realtime 활성화 확인:**
1. Supabase Dashboard → Database → Replication
2. `visitor_analytics`, `server_metrics`, `system_logs`, `alert_history` 테이블이 활성화되어 있는지 확인
3. 활성화되어 있지 않다면 각 테이블 우측의 토글 버튼 클릭

---

## 📈 성능 최적화 팁

### 데이터베이스 인덱스

모든 주요 쿼리에 인덱스가 적용되어 있습니다:
- `visited_at` (시간순 정렬)
- `is_active` (활성 방문자 필터링)
- `referrer_type` (유입 경로 집계)

### Supabase 무료 플랜 제한

- 데이터베이스: 500MB
- 데이터 전송량: 2GB/월
- Realtime 동시 연결: 200개

### 데이터 정리 (선택사항)

오래된 방문자 데이터 정리 (예: 30일 이상):

```sql
-- Supabase SQL Editor에서 실행
DELETE FROM visitor_analytics
WHERE visited_at < NOW() - INTERVAL '30 days';
```

---

## 🔐 보안 확인 사항

### RLS (Row Level Security) 정책

- ✅ 인증된 사용자만 관리자 페이지 접근 가능
- ✅ 익명 사용자는 `visitor_analytics`, `page_views`, `system_logs` INSERT만 가능
- ✅ 모든 테이블에 RLS 활성화됨

### 환경 변수

- ✅ Supabase Anon Key는 공개해도 안전 (RLS로 보호됨)
- ❌ Supabase Service Role Key는 절대 공개하지 말 것
- ❌ `.env` 파일을 git에 커밋하지 말 것 (`.gitignore`에 추가됨)

---

## 📝 다음 단계

Phase 1-2가 정상적으로 동작하는지 확인 후, 다음 Phase를 진행할 수 있습니다:

### Phase 3: 시스템 모니터링
- Node.js 모니터링 서버 구축 (port 8002)
- CPU, RAM, Disk 사용량 모니터링
- 에러 로그 수집 및 표시

### Phase 4: 알람 시스템
- EmailJS 알람 구현
- 임계치 초과 시 이메일 발송
- 알람 이력 관리

### Phase 5: 보안 기능
- IP 차단 목록 관리
- Nginx 연동
- 관리자 활동 로그

### Phase 6: 설정 및 최적화
- 사이트 설정 UI
- 성능 최적화
- 종합 테스트

---

## 💡 추가 정보

### 관련 문서

- `관리자페이지개발계획.md` - 전체 개발 계획
- `ADMIN-IMPLEMENTATION-STATUS.md` - 구현 현황
- `supabase-admin-setup.sql` - 데이터베이스 스키마
- `CLAUDE.md` - 프로젝트 개요

### 유용한 명령어

```bash
# 개발 서버 시작
npm start

# 테스트 실행
npm test

# 프로덕션 빌드
npm run build

# 의존성 재설치 (문제 발생 시)
rm -rf node_modules package-lock.json
npm install
```

### Supabase 유용한 SQL 쿼리

```sql
-- 활성 방문자 수 확인
SELECT COUNT(*) FROM visitor_analytics WHERE is_active = true;

-- 오늘 방문자 수 확인
SELECT COUNT(*) FROM visitor_analytics
WHERE visited_at >= CURRENT_DATE;

-- 유입 경로별 집계
SELECT referrer_type, COUNT(*) as count
FROM visitor_analytics
GROUP BY referrer_type
ORDER BY count DESC;

-- 최근 페이지 조회 10개
SELECT * FROM page_views
ORDER BY viewed_at DESC
LIMIT 10;
```

---

## ✅ 체크리스트

완료된 항목을 확인하세요:

- [ ] Supabase SQL 스키마 실행
- [ ] 8개 테이블 생성 확인
- [ ] 환경 변수 설정 확인
- [ ] 개발 서버 시작 (`npm start`)
- [ ] 홈페이지에서 방문자 데이터 생성
- [ ] Supabase에서 데이터 기록 확인
- [ ] 관리자 페이지 로그인 성공
- [ ] 실시간 접속자 목록 표시 확인
- [ ] 방문자 통계 차트 표시 확인
- [ ] Realtime 자동 업데이트 확인
- [ ] 테스트 실행 및 통과 확인
- [ ] 다크 모드 전환 확인

모든 항목이 완료되면 Phase 1-2가 정상적으로 구현된 것입니다! 🎉

---

**문제가 발생하면 다음을 확인하세요:**
1. 브라우저 콘솔 (F12) 에러 메시지
2. Supabase Dashboard → Logs
3. 터미널에서 npm start 실행 중 에러 메시지
