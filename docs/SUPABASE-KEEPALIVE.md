# Supabase Keep-Alive 자동화 가이드

Supabase 무료 티어 프로젝트가 7일 비활성화로 자동 정지되는 것을 방지하는 GitHub Actions 자동화 설정 가이드입니다.

## 📋 목차

1. [문제 설명](#문제-설명)
2. [해결 방법](#해결-방법)
3. [설정 방법](#설정-방법)
4. [테스트](#테스트)
5. [모니터링](#모니터링)

---

## 문제 설명

Supabase 무료 티어는 **7일간 활동이 없으면 자동으로 프로젝트를 일시 중지**합니다.
- 일시 중지 후 90일 이내에 수동으로 재개할 수 있습니다
- 90일이 지나면 프로젝트는 복원할 수 없지만 데이터는 다운로드 가능합니다
- Pro 플랜으로 업그레이드하면 자동 정지가 없습니다

## 해결 방법

**GitHub Actions**를 사용하여 **6일마다 자동으로** Supabase에 간단한 API 호출을 보내 활동을 유지합니다.

### 장점
✅ 완전 무료 (GitHub Actions 무료 한도 내)
✅ 완전 자동화 (수동 작업 불필요)
✅ 안전 (GitHub Secrets로 인증 정보 보호)
✅ 모니터링 가능 (GitHub Actions 로그)

---

## 설정 방법

### 1단계: GitHub Repository에 코드 푸시

프로젝트가 GitHub에 업로드되어 있어야 합니다.

```bash
# 아직 GitHub에 푸시하지 않았다면
git add .
git commit -m "Add Supabase keep-alive automation"
git push origin main
```

### 2단계: GitHub Secrets 설정

GitHub Actions가 Supabase에 접근할 수 있도록 인증 정보를 추가합니다.

1. **GitHub Repository 페이지**로 이동
2. **Settings** 탭 클릭
3. 좌측 메뉴에서 **Secrets and variables** > **Actions** 클릭
4. **New repository secret** 버튼 클릭
5. 다음 2개의 secret 추가:

#### Secret 1: SUPABASE_URL
- **Name**: `SUPABASE_URL`
- **Secret**: 본인의 Supabase Project URL (예: `https://xxxxx.supabase.co`)
- **Save secret** 클릭

#### Secret 2: SUPABASE_ANON_KEY
- **Name**: `SUPABASE_ANON_KEY`
- **Secret**: 본인의 Supabase anon public key (예: `eyJhbGc...`)
- **Save secret** 클릭

### Supabase 인증 정보 찾는 방법
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 (`jahalabs-homepage`)
3. 좌측 메뉴 **Settings** (톱니바퀴 아이콘) > **API** 클릭
4. **Project URL**과 **anon public** 키 복사

---

## 자동화 작동 방식

### 파일 구조
```
.github/
└── workflows/
    └── supabase-keepalive.yml   # GitHub Actions 워크플로우

scripts/
└── supabase-ping.js              # Supabase ping 스크립트
```

### 실행 스케줄
- **자동 실행**: 매 6일마다 오전 9시(UTC, 한국시간 오후 6시)
- **수동 실행**: GitHub Actions 페이지에서 언제든 수동 실행 가능

### 실행 내용
1. Ubuntu 환경에서 Node.js 18 설정
2. `@supabase/supabase-js` 패키지 설치
3. `scripts/supabase-ping.js` 실행
   - Supabase `news_posts` 테이블에서 1개 행 조회
   - 연결 성공 여부 로그 출력
4. 성공 메시지 출력

---

## 테스트

### 방법 1: 수동 실행으로 즉시 테스트

1. GitHub Repository 페이지로 이동
2. **Actions** 탭 클릭
3. 좌측 메뉴에서 **Supabase Keep-Alive** 워크플로우 선택
4. **Run workflow** 버튼 클릭 (우측 상단)
5. **Run workflow** 확인
6. 워크플로우 실행 확인 (약 30초 소요)

### 방법 2: 로컬에서 스크립트 테스트

```bash
# 환경 변수 설정 (윈도우 PowerShell)
$env:SUPABASE_URL="https://xxxxx.supabase.co"
$env:SUPABASE_ANON_KEY="eyJhbGc..."

# 또는 환경 변수 설정 (윈도우 CMD)
set SUPABASE_URL=https://xxxxx.supabase.co
set SUPABASE_ANON_KEY=eyJhbGc...

# 또는 환경 변수 설정 (Mac/Linux)
export SUPABASE_URL="https://xxxxx.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGc..."

# 의존성 설치
npm install @supabase/supabase-js

# 스크립트 실행
node scripts/supabase-ping.js
```

### 성공 메시지 예시
```
🏓 Supabase 연결 확인 중...
📍 URL: https://xxxxx.supabase.co
✅ Supabase 연결 성공!
📊 쿼리 결과: 1개 행 반환
⏰ 실행 시간: 2025-01-17T09:00:00.000Z
🎉 Keep-alive ping 완료!
```

---

## 모니터링

### GitHub Actions 로그 확인

1. GitHub Repository > **Actions** 탭
2. **Supabase Keep-Alive** 워크플로우 클릭
3. 실행 기록 확인
   - ✅ 녹색 체크: 성공
   - ❌ 빨간 X: 실패
4. 각 실행을 클릭하면 상세 로그 확인 가능

### 다음 실행 예정 시간 확인

현재 설정: **매 6일마다** 실행

- 첫 실행: 워크플로우 푸시 후 첫 번째 스케줄 시간
- 이후: 마지막 실행 + 6일

### 알림 설정 (선택사항)

실패 시 이메일 알림을 받으려면:
1. GitHub 프로필 > **Settings**
2. **Notifications** > **Actions**
3. **Send notifications for failed workflows** 체크

---

## 문제 해결

### "환경 변수가 필요합니다" 오류
**원인**: GitHub Secrets가 올바르게 설정되지 않음
**해결**:
- Repository Settings > Secrets and variables > Actions 확인
- `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 존재 확인
- Secret 이름 철자 확인 (대소문자 구분)

### "Supabase 쿼리 실패" 오류
**원인**: Supabase 프로젝트가 일시 중지되었거나 테이블이 없음
**해결**:
1. Supabase Dashboard에서 프로젝트 상태 확인
2. 프로젝트가 paused 상태라면 **Resume** 버튼 클릭
3. `news_posts` 테이블 존재 확인

### "워크플로우가 실행되지 않음" 오류
**원인**: GitHub Actions가 비활성화되었거나 권한 문제
**해결**:
1. Repository > Settings > Actions > General
2. **Allow all actions and reusable workflows** 선택
3. **Workflow permissions**를 **Read and write permissions**로 설정

---

## 비용 정보

### GitHub Actions 무료 한도
- **Public Repository**: 무제한 무료
- **Private Repository**: 월 2,000분 무료

이 워크플로우는 **실행당 약 30초** 소요:
- 월 5회 실행 (6일 × 5 = 30일)
- 총 사용 시간: 약 2.5분/월
- **완전 무료** 범위 내

---

## 대안 방법

GitHub Actions 외에 다른 방법도 가능합니다:

### 1. Vercel/Netlify Cron Job
- Vercel/Netlify에 배포된 경우 serverless function 사용
- 설정이 GitHub Actions보다 복잡

### 2. Uptime Robot
- 무료 웹사이트 모니터링 서비스
- API endpoint를 5분마다 ping 가능
- 단, Supabase에 직접 접근하려면 별도 API endpoint 필요

### 3. 수동 관리
- 6일마다 직접 홈페이지 방문
- 권장하지 않음 (잊어버릴 가능성)

---

## 추천 설정

현재 설정이 **가장 권장되는 방법**입니다:
✅ 완전 자동화
✅ 무료
✅ 안전
✅ 모니터링 가능

특별한 이유가 없다면 이 설정을 그대로 사용하세요!

---

## 참고 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Supabase 무료 티어 정책](https://supabase.com/docs/guides/platform/org-based-billing#free-plan)
- [Cron 스케줄 표현식](https://crontab.guru/)
