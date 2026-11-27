# 관리자 페이지 검증 가이드

SQL 스키마 수정 및 UI 개선 후 모든 기능이 정상 작동하는지 확인하는 가이드입니다.

## 사전 준비

### 1. SQL 스키마 업데이트
```bash
# Supabase SQL Editor에서 supabase-admin-setup-fixed.sql 실행
# 또는
supabase db reset  # 개발 환경에서만
```

### 2. 브라우저 캐시 클리어
- 크롬: Ctrl+Shift+Del → 캐시된 이미지 및 파일 삭제
- 또는 시크릿 모드로 테스트

### 3. 서버 재시작
```bash
# React 개발 서버
npm start

# 모니터링 서버
cd server
./start-monitor.sh
```

---

## 테스트 체크리스트

### ✅ 1. 로그인 및 인증

**테스트 항목:**
- [ ] 관리자 로그인 페이지 접속 (`http://localhost:3000/admin`)
- [ ] 이메일/비밀번호로 로그인
- [ ] 로그인 후 대시보드 표시 확인
- [ ] 헤더에 이메일 주소 표시 확인
- [ ] 로그아웃 버튼 작동 확인

**확인 사항:**
- 로그인 실패 시 적절한 에러 메시지 표시
- 세션 유지 (새로고침 후에도 로그인 상태 유지)

---

### ✅ 2. 다크모드 UI

**테스트 항목:**
- [ ] 시스템 테마 자동 감지
- [ ] 라이트/다크 모드 전환 정상 작동
- [ ] 알람 시스템 탭: 설정 박스 배경색 정상 (다크모드에서 회색)
- [ ] 사이트 설정 탭: 모든 박스 배경색 정상
- [ ] 대시보드 테이블: hover 시 배경색 정상 (흰색 아님)
- [ ] 에러 로그 테이블: hover 시 배경색 정상
- [ ] 활동 로그 테이블: hover 시 배경색 정상
- [ ] 실시간 방문자 테이블: hover 시 배경색 정상

**확인 방법:**
```
1. 시스템 다크모드 켜기
2. 관리자 페이지 접속
3. 모든 탭 순회하며 배경색 확인
4. 테이블에 마우스 올려보기
```

---

### ✅ 3. 사이드바 아이콘

**테스트 항목:**
- [ ] 사이드바 메뉴에 아이콘이 한 번만 표시되는지 확인

**이전 문제:** 📊 📊 대시보드 (아이콘 중복)
**수정 후:** 📊 대시보드 (아이콘 한 번)

---

### ✅ 4. 실시간 방문자 추적

**테스트 항목:**
- [ ] 대시보드에서 실시간 방문자 수 표시
- [ ] 새 탭/시크릿 모드로 접속 시 방문자 수 증가
- [ ] 방문자 정보 테이블에 데이터 표시:
  - 디바이스 타입 (💻 Desktop, 📱 Mobile)
  - 브라우저 (Chrome, Firefox 등)
  - 위치 (국가, 도시)
  - 현재 페이지
  - 체류 시간
  - 방문 시각

**테스트 방법:**
```bash
# 1. 관리자 페이지 접속
# 2. 시크릿 모드로 메인 페이지 접속
# 3. 관리자 페이지에서 실시간 방문자 확인
# 4. Supabase에서 직접 확인:
SELECT * FROM visitor_analytics ORDER BY visited_at DESC LIMIT 10;
```

**콘솔 에러 확인:**
- ❌ 400/404 에러 없어야 함
- ✅ visitor_analytics 테이블에 데이터 정상 삽입

---

### ✅ 5. 방문자 통계

**테스트 항목:**
- [ ] 오늘 방문자 수 표시
- [ ] 총 방문자 수 표시
- [ ] 활성 방문자 수 표시
- [ ] 평균 체류 시간 표시
- [ ] 페이지별 조회수 차트
- [ ] 디바이스별 분포 차트
- [ ] 시간대별 방문자 차트

**Supabase 확인:**
```sql
-- 방문자 데이터 확인
SELECT COUNT(*) as total_visitors FROM visitor_analytics;

-- 페이지 뷰 데이터 확인
SELECT COUNT(*) as total_views FROM page_views;
```

---

### ✅ 6. 시스템 모니터링

**테스트 항목:**
- [ ] CPU 사용률 표시 및 차트 렌더링
- [ ] 메모리 사용률 표시 및 차트 렌더링
- [ ] 디스크 사용률 표시 및 차트 렌더링
- [ ] 실시간 데이터 업데이트
- [ ] 차트가 정상적으로 그려지는지 확인

**모니터링 서버 확인:**
```bash
# 서버 상태 확인
cd server
./status-monitor.sh

# 메트릭 API 직접 호출
curl http://localhost:8002/api/metrics

# 로그 확인
tail -f monitor.log
```

**Supabase 확인:**
```sql
-- 메트릭 데이터 확인
SELECT * FROM server_metrics ORDER BY created_at DESC LIMIT 10;
```

**예상 결과:**
- `server_metrics` 테이블에 데이터가 있어야 함
- 차트가 데이터를 기반으로 정상 렌더링

---

### ✅ 7. 에러 로그

**테스트 항목:**
- [ ] 에러 로그 목록 표시
- [ ] 로그 레벨별 필터링 (전체, error, warning, info)
- [ ] 날짜별 필터링
- [ ] 검색 기능
- [ ] CSV 내보내기
- [ ] 로그 정리 기능

**테스트 방법:**
```bash
# 테스트 로그 생성 (모니터링 서버 재시작)
cd server
./stop-monitor.sh
./start-monitor.sh

# 관리자 페이지에서 에러 로그 탭 확인
```

**Supabase 확인:**
```sql
-- 로그 데이터 확인
SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 10;
```

---

### ✅ 8. 알람 시스템

**테스트 항목:**
- [ ] 알람 설정 저장
  - CPU 임계치 설정
  - RAM 임계치 설정
  - Disk 임계치 설정
  - 수신 이메일 설정
- [ ] 테스트 알람 발송 (EmailJS 템플릿 설정 필요)
- [ ] 알람 이력 표시
- [ ] 알람 이력 삭제

**EmailJS 템플릿 설정:**
1. `EMAILJS-ALERT-SETUP.md` 파일 참고
2. EmailJS 대시보드에서 `template_alert` 템플릿 생성
3. 관리자 페이지에서 테스트 알람 발송

**Supabase 확인:**
```sql
-- 알람 설정 확인
SELECT * FROM admin_settings WHERE setting_key = 'alert_thresholds';

-- 알람 이력 확인
SELECT * FROM alert_history ORDER BY created_at DESC LIMIT 10;
```

---

### ✅ 9. IP 차단 목록

**테스트 항목:**
- [ ] IP 주소 추가
  - 올바른 IP 형식 검증 (192.168.1.1)
  - 차단 사유 입력
- [ ] 차단 목록 표시
- [ ] IP 활성화/비활성화 토글
- [ ] IP 삭제
- [ ] Nginx 설정 파일 다운로드
- [ ] 자동 의심 IP 감지 토글

**테스트 방법:**
```
1. IP 차단 탭에서 테스트 IP 추가 (예: 1.2.3.4)
2. 목록에 추가되는지 확인
3. 활성화/비활성화 토글
4. Nginx 설정 다운로드 클릭
5. 다운로드된 파일에 IP가 포함되어 있는지 확인
```

**Supabase 확인:**
```sql
-- IP 차단 목록 확인
SELECT * FROM ip_blacklist ORDER BY created_at DESC;
```

**이전 에러:**
```
❌ Error adding to blacklist
❌ 400 Bad Request
```

**수정 후:**
```
✅ IP가 차단 목록에 추가되었습니다.
✅ Nginx 설정 파일 다운로드 성공
```

---

### ✅ 10. 관리자 활동 로그

**테스트 항목:**
- [ ] 활동 로그 자동 기록:
  - 로그인/로그아웃
  - IP 추가/삭제
  - 설정 변경
  - 사이트 설정 업데이트
- [ ] 활동 유형별 필터링
- [ ] 날짜별 필터링
- [ ] 검색 기능
- [ ] CSV 내보내기
- [ ] 오래된 로그 정리 (30일 이상)

**테스트 방법:**
```
1. 다양한 작업 수행 (IP 추가, 설정 변경 등)
2. 활동 로그 탭에서 기록 확인
3. 각 활동에 대한 세부 정보 확인
```

**Supabase 확인:**
```sql
-- 활동 로그 확인
SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 20;

-- 액션별 통계
SELECT action, COUNT(*) as count
FROM admin_activity_logs
GROUP BY action
ORDER BY count DESC;
```

**이전 문제:** 활동 로그가 기록되지 않음
**수정 후:** 모든 관리자 작업이 정상적으로 기록됨

---

### ✅ 11. 사이트 설정

**테스트 항목:**
- [ ] 기본 정보 수정
  - 사이트 이름
  - 사이트 설명
  - 연락처 이메일
- [ ] SEO 설정 (한국어)
  - 메타 제목 (60자 제한)
  - 메타 설명 (160자 제한)
- [ ] SEO 설정 (English)
  - Meta Title
  - Meta Description
  - Meta Keywords
- [ ] 기능 토글
  - 방문자 분석 활성화/비활성화
  - 유지보수 모드 활성화/비활성화
- [ ] 검색 결과 미리보기
- [ ] 설정 저장
- [ ] 초기화 버튼

**Supabase 확인:**
```sql
-- 사이트 설정 확인
SELECT * FROM admin_settings WHERE setting_key = 'site_settings';
```

---

### ✅ 12. 모니터링 서버

**테스트 항목:**
- [ ] 백그라운드 시작: `./start-monitor.sh`
- [ ] 상태 확인: `./status-monitor.sh`
- [ ] 로그 확인: `tail -f monitor.log`
- [ ] 중지: `./stop-monitor.sh`
- [ ] API 엔드포인트 응답:
  - `/health`
  - `/api/metrics`
  - `/api/system-info`
  - `/api/db-health`

**테스트 명령:**
```bash
cd server

# 서버 시작
./start-monitor.sh

# 상태 확인
./status-monitor.sh

# API 테스트
curl http://localhost:8002/health
curl http://localhost:8002/api/metrics
curl http://localhost:8002/api/system-info
curl http://localhost:8002/api/db-health

# 로그 확인
tail -20 monitor.log

# 서버 중지
./stop-monitor.sh
```

---

## 콘솔 에러 확인

### 브라우저 개발자 도구 (F12)

**Console 탭에서 확인해야 할 사항:**

✅ **정상 상태:**
```
No errors
또는
일반적인 React warning만 있음
```

❌ **수정 전 에러들 (이제 나오면 안 됨):**
```
404 (Not Found) - admin_settings
400 (Bad Request) - order=created_at.desc
400 (Bad Request) - order=recorded_at.desc
```

### Network 탭 확인

**주요 API 호출 확인:**
- `admin_settings` - Status 200
- `visitor_analytics` - Status 200
- `server_metrics` - Status 200
- `ip_blacklist` - Status 200
- `admin_activity_logs` - Status 200

---

## 성능 확인

### 페이지 로드 시간
- 대시보드 초기 로드: < 2초
- 탭 전환: < 500ms
- 데이터 새로고침: < 1초

### 메모리 사용량
- 브라우저 개발자 도구 → Performance → Memory
- 메모리 누수 없는지 확인

---

## 문제 발생 시 체크리스트

### 1. SQL 스키마 확인
```sql
-- 테이블 존재 여부 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'admin_settings',
    'visitor_analytics',
    'page_views',
    'system_logs',
    'server_metrics',
    'ip_blacklist',
    'admin_activity_logs',
    'alert_history'
);

-- admin_settings 구조 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'admin_settings';
```

**예상 컬럼:**
- `id` (UUID)
- `setting_key` (TEXT) - 이게 있어야 함!
- `setting_value` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. 환경 변수 확인
```bash
# .env 파일 확인
cat .env

# 필수 변수
REACT_APP_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY
```

### 3. 캐시 클리어
```bash
# npm 캐시
npm cache clean --force

# React 개발 서버 재시작
npm start
```

### 4. Supabase 연결 확인
```bash
# DB health check
curl http://localhost:8002/api/db-health
```

---

## 최종 확인 체크리스트

- [ ] SQL 스키마 업데이트 완료
- [ ] 브라우저 캐시 클리어 완료
- [ ] React 개발 서버 재시작 완료
- [ ] 모니터링 서버 시작 완료
- [ ] 모든 탭에서 콘솔 에러 없음
- [ ] 다크모드 UI 정상 작동
- [ ] 실시간 방문자 추적 작동
- [ ] IP 차단 기능 작동
- [ ] 활동 로그 기록 작동
- [ ] 알람 시스템 설정 저장 작동
- [ ] 사이트 설정 저장 작동
- [ ] 모든 차트 정상 렌더링
- [ ] EmailJS 템플릿 설정 완료 (선택)

---

## 다음 단계

### 프로덕션 배포 전 체크리스트
1. [ ] `.env` 파일을 프로덕션 서버에 복사
2. [ ] Supabase 프로덕션 데이터베이스에 SQL 스키마 적용
3. [ ] 모니터링 서버를 PM2로 설정
4. [ ] Nginx IP 차단 설정 적용
5. [ ] EmailJS 월 사용량 모니터링
6. [ ] 백업 계획 수립
7. [ ] 로그 보관 정책 설정 (30일)

---

## 문제 해결 가이드

**문제:** 방문자 수가 0으로 표시됨
**해결:**
1. Supabase에서 visitor_analytics 테이블 확인
2. RLS 정책 확인 (anon 사용자도 INSERT 가능해야 함)
3. 브라우저 콘솔에서 에러 확인

**문제:** 차트가 렌더링되지 않음
**해결:**
1. server_metrics 테이블에 데이터가 있는지 확인
2. 모니터링 서버가 실행 중인지 확인
3. /api/metrics 엔드포인트 응답 확인

**문제:** IP 차단이 추가되지 않음
**해결:**
1. ip_blacklist 테이블 구조 확인 (created_at 컬럼 존재)
2. IP 주소 형식 확인 (192.168.1.1)
3. Supabase RLS 정책 확인

**문제:** 활동 로그가 기록되지 않음
**해결:**
1. admin_activity_logs 테이블 구조 확인
2. 컬럼명 확인 (user_email, action, description)
3. 인증된 사용자로 로그인했는지 확인

---

모든 테스트를 완료하고 문제가 없으면 프로덕션 배포를 진행하세요!
