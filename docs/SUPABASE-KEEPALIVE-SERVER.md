# Supabase Keep-Alive 설정 가이드 (직접 호스팅 서버용)

Supabase 무료 티어가 7일 비활성화로 자동 정지되는 것을 방지하는 설정 가이드입니다.
**GitHub를 사용하지 않고 직접 호스팅 서버에서 사용하는 경우**를 위한 문서입니다.

## 📋 목차

1. [개요](#개요)
2. [방법 비교](#방법-비교)
3. [방법 1: Linux/Mac Cron Job (권장)](#방법-1-linuxmac-cron-job-권장)
4. [방법 2: Windows Task Scheduler](#방법-2-windows-task-scheduler)
5. [방법 3: Node.js 자동 서비스 (PM2)](#방법-3-nodejs-자동-서비스-pm2)
6. [테스트 및 모니터링](#테스트-및-모니터링)
7. [문제 해결](#문제-해결)

---

## 개요

### 문제
Supabase 무료 티어는 **7일간 활동이 없으면 자동으로 프로젝트를 일시 중지**합니다.

### 해결 방법
서버에서 **6일마다 자동으로** Supabase에 간단한 API 호출을 보내 활동을 유지합니다.

### 생성된 파일
```
server/
├── supabase-keepalive.js          # 단일 실행 스크립트
├── supabase-keepalive-service.js  # 자동 스케줄링 서비스
├── setup-cron.sh                  # Linux/Mac 자동 설정
└── setup-windows.bat              # Windows 자동 설정
```

---

## 방법 비교

| 방법 | 장점 | 단점 | 권장 대상 |
|------|------|------|-----------|
| **Cron Job (Linux/Mac)** | 간단, 안정적, 리소스 적음 | Linux/Mac만 가능 | Linux 서버 사용자 |
| **Task Scheduler (Windows)** | Windows 네이티브 지원 | 설정 복잡, 간격 제한 | Windows 서버 사용자 |
| **Node.js 서비스 (PM2)** | OS 무관, 유연함 | 상시 실행 필요 | 24시간 서버 운영 |

---

## 방법 1: Linux/Mac Cron Job (권장)

### 자동 설정 (권장)

```bash
# 1. 실행 권한 부여
chmod +x server/setup-cron.sh

# 2. 자동 설정 스크립트 실행
./server/setup-cron.sh
```

스크립트가 자동으로:
- Node.js 확인
- 의존성 설치 (`@supabase/supabase-js`, `dotenv`)
- Cron Job 등록 (6일마다 오전 9시)
- 로그 디렉토리 생성 (`logs/`)
- 테스트 실행

### 수동 설정

#### 1단계: 의존성 설치
```bash
npm install --save @supabase/supabase-js dotenv
```

#### 2단계: 스크립트 테스트
```bash
# 방법 A: .env 파일에 REACT_APP_SUPABASE_* 변수가 있는 경우 (권장)
node server/supabase-keepalive.js
# ✅ 기존 React 환경 변수를 자동으로 인식합니다!

# 방법 B: 직접 환경 변수 설정
export SUPABASE_URL="https://xxxxx.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGc..."
node server/supabase-keepalive.js

# 방법 C: REACT_APP_ 접두사로 설정
export REACT_APP_SUPABASE_URL="https://xxxxx.supabase.co"
export REACT_APP_SUPABASE_ANON_KEY="eyJhbGc..."
node server/supabase-keepalive.js
```

#### 3단계: Cron Job 등록
```bash
# Crontab 편집기 열기
crontab -e

# 다음 줄 추가 (6일마다 오전 9시)
0 9 */6 * * cd /path/to/homepage && /usr/bin/env node /path/to/homepage/server/supabase-keepalive.js >> /path/to/homepage/logs/keepalive.log 2>&1
```

**중요**: `/path/to/homepage`를 실제 프로젝트 경로로 변경하세요!

#### 4단계: Cron Job 확인
```bash
# 등록된 Cron Job 확인
crontab -l

# 로그 확인 (실행 후)
tail -f logs/keepalive.log
```

### Cron 스케줄 변경

다른 주기로 변경하려면:

```bash
# 3일마다 오전 9시
0 9 */3 * * cd /path/to/homepage && node ...

# 매주 월요일 오전 9시
0 9 * * 1 cd /path/to/homepage && node ...

# 매일 오전 9시 (테스트용)
0 9 * * * cd /path/to/homepage && node ...
```

---

## 방법 2: Windows Task Scheduler

### 자동 설정 (권장)

```batch
REM 관리자 권한으로 명령 프롬프트 실행 필수!
server\setup-windows.bat
```

스크립트가 자동으로:
- Node.js 확인
- 의존성 설치
- Windows 작업 스케줄러 등록
- 로그 디렉토리 생성
- 테스트 실행

### 수동 설정

#### 1단계: 의존성 설치
```batch
npm install --save @supabase/supabase-js dotenv
```

#### 2단계: 스크립트 테스트
```batch
REM 방법 A: .env 파일에 REACT_APP_SUPABASE_* 변수가 있는 경우 (권장)
node server\supabase-keepalive.js
REM ✅ 기존 React 환경 변수를 자동으로 인식합니다!

REM 방법 B: 직접 환경 변수 설정
set SUPABASE_URL=https://xxxxx.supabase.co
set SUPABASE_ANON_KEY=eyJhbGc...
node server\supabase-keepalive.js

REM 방법 C: REACT_APP_ 접두사로 설정
set REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
set REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
node server\supabase-keepalive.js
```

#### 3단계: 작업 스케줄러 설정

**GUI 방법**:
1. **작업 스케줄러** 실행 (Win + R → `taskschd.msc`)
2. **작업 만들기** 클릭
3. **일반** 탭:
   - 이름: `SupabaseKeepAlive`
   - "가장 높은 수준의 권한으로 실행" 체크
4. **트리거** 탭:
   - **새로 만들기** 클릭
   - **한 번**: 시작 날짜 선택
   - **고급 설정**: "작업 반복 간격" → `6일`, 기간 `무기한`
5. **동작** 탭:
   - **새로 만들기** 클릭
   - **프로그램/스크립트**: `node`
   - **인수 추가**: `C:\path\to\homepage\server\supabase-keepalive.js`
   - **시작 위치**: `C:\path\to\homepage`
6. **조건** 및 **설정** 탭: 기본값 유지
7. **확인** 클릭

**명령줄 방법**:
```batch
REM 매월 1, 7, 13, 19, 25일 오전 9시 (대략 6일 간격)
schtasks /create /tn "SupabaseKeepAlive" /tr "node C:\path\to\homepage\server\supabase-keepalive.js" /sc monthly /d 1,7,13,19,25 /st 09:00 /f
```

#### 4단계: 작업 확인
```batch
REM 작업 목록 확인
schtasks /query /tn "SupabaseKeepAlive"

REM 즉시 실행 (테스트)
schtasks /run /tn "SupabaseKeepAlive"

REM 로그 확인
type logs\keepalive.log
```

---

## 방법 3: Node.js 자동 서비스 (PM2)

이 방법은 **별도의 Cron 설정 없이** Node.js 스크립트가 스스로 스케줄링합니다.

### 1단계: 의존성 설치
```bash
npm install --save @supabase/supabase-js dotenv node-cron
npm install -g pm2  # PM2 글로벌 설치
```

### 2단계: 환경 변수 설정

**✅ 기존 `.env` 파일에 이미 Supabase 설정이 있다면 추가 설정 불필요!**

스크립트는 다음 환경 변수를 **자동으로 인식**합니다:
- `REACT_APP_SUPABASE_URL` 또는 `SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY` 또는 `SUPABASE_ANON_KEY`

#### 방법 A: 기존 React 환경 변수 사용 (권장 ⭐)
`.env` 파일에 이미 다음이 있다면 **그대로 사용**:
```env
# React 앱에서 사용 중인 기존 변수 (변경 불필요!)
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...

# 선택사항 (Keep-Alive 커스터마이징)
KEEPALIVE_CRON_SCHEDULE=0 9 */6 * *   # Cron 표현식 (기본: 6일마다 오전 9시)
KEEPALIVE_RUN_ON_START=true            # 시작 시 즉시 실행 (기본: true)
KEEPALIVE_LOG_FILE=/path/to/logs/keepalive.log  # 로그 파일 경로 (선택)
TZ=Asia/Seoul                          # 타임존 (기본: Asia/Seoul)
```

#### 방법 B: 별도의 환경 변수 사용
```env
# Keep-Alive 전용 변수 (REACT_APP_ 접두사 없음)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...

# 선택사항
KEEPALIVE_CRON_SCHEDULE=0 9 */6 * *
KEEPALIVE_RUN_ON_START=true
TZ=Asia/Seoul
```

**💡 팁**: 두 가지 모두 설정되어 있으면 `REACT_APP_*` 변수가 우선 사용됩니다.

### 3단계: PM2로 서비스 시작
```bash
# 서비스 시작
pm2 start server/supabase-keepalive-service.js --name supabase-keepalive

# 서버 재부팅 시 자동 시작 설정
pm2 startup
pm2 save

# 상태 확인
pm2 status

# 로그 확인
pm2 logs supabase-keepalive

# 중지/재시작/삭제
pm2 stop supabase-keepalive
pm2 restart supabase-keepalive
pm2 delete supabase-keepalive
```

### 4단계: 모니터링
```bash
# 실시간 로그
pm2 logs supabase-keepalive --lines 100

# 상태 확인
pm2 status

# 상세 정보
pm2 show supabase-keepalive
```

### 장점
- ✅ OS 무관 (Linux, Mac, Windows 모두 지원)
- ✅ 자동 재시작 (크래시 시)
- ✅ 로그 관리 자동화
- ✅ 웹 모니터링 (PM2 Plus)

### 단점
- ❌ PM2 프로세스가 상시 실행되어야 함
- ❌ 약간의 메모리 사용 (약 30-50MB)

---

## 테스트 및 모니터링

### 즉시 테스트 실행

#### 방법 1 & 2 (Cron/Task Scheduler)
```bash
# Linux/Mac
node server/supabase-keepalive.js

# Windows
node server\supabase-keepalive.js
```

#### 방법 3 (PM2 서비스)
```bash
# 현재 실행 중인 서비스의 로그 확인
pm2 logs supabase-keepalive

# 수동으로 ping 트리거 (서비스 재시작)
pm2 restart supabase-keepalive
```

### 성공 메시지 예시
```
[2025-01-17T09:00:00.000Z] 🏓 Supabase 연결 시작...
[2025-01-17T09:00:00.123Z] ✅ 환경 변수 확인 완료
[2025-01-17T09:00:00.124Z] 📍 Supabase URL: https://xxxxx.supabase.co
[2025-01-17T09:00:00.456Z] ✅ Supabase 연결 성공!
[2025-01-17T09:00:00.457Z] 📊 쿼리 결과: 1개 행 반환
[2025-01-17T09:00:00.458Z] 🎉 Keep-alive ping 완료!
```

### 로그 확인

#### Linux/Mac (Cron)
```bash
# 전체 로그 확인
cat logs/keepalive.log

# 실시간 로그 확인
tail -f logs/keepalive.log

# 최근 50줄
tail -n 50 logs/keepalive.log
```

#### Windows (Task Scheduler)
```batch
REM 전체 로그 확인
type logs\keepalive.log

REM 마지막 20줄
powershell "Get-Content logs\keepalive.log -Tail 20"
```

#### PM2 서비스
```bash
# 실시간 로그
pm2 logs supabase-keepalive

# 최근 100줄
pm2 logs supabase-keepalive --lines 100

# 로그 파일 위치
pm2 show supabase-keepalive
```

---

## 문제 해결

### 1. "환경 변수가 필요합니다" 오류

**원인**: `.env` 파일이 없거나 환경 변수가 설정되지 않음

**해결**:
```bash
# .env 파일 생성 (프로젝트 루트)
cat > .env << EOF
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
EOF

# 또는 시스템 환경 변수 설정
# Linux/Mac
export SUPABASE_URL="https://xxxxx.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGc..."

# Windows
setx SUPABASE_URL "https://xxxxx.supabase.co"
setx SUPABASE_ANON_KEY "eyJhbGc..."
```

### 2. "Supabase 쿼리 실패" 오류

**원인**:
- Supabase 프로젝트가 일시 중지됨
- `news_posts` 테이블이 없음
- 잘못된 인증 정보

**해결**:
1. [Supabase Dashboard](https://app.supabase.com)에서 프로젝트 상태 확인
2. 프로젝트가 paused 상태라면 **Resume** 클릭
3. `news_posts` 테이블 존재 확인
4. Settings → API에서 URL과 Key 재확인

### 3. Cron Job이 실행되지 않음

**원인**:
- 잘못된 경로
- 실행 권한 없음
- Node.js 경로 문제

**해결**:
```bash
# 절대 경로 사용
which node  # Node.js 절대 경로 확인 (예: /usr/bin/node)

# Cron Job 수정 (절대 경로 사용)
0 9 */6 * * /usr/bin/node /home/user/homepage/server/supabase-keepalive.js

# 실행 권한 확인
chmod +x server/supabase-keepalive.js

# Cron 로그 확인
grep CRON /var/log/syslog  # Ubuntu/Debian
grep CRON /var/log/cron    # CentOS/RHEL
```

### 4. Windows 작업이 실행되지 않음

**원인**:
- 관리자 권한 부족
- 잘못된 경로
- Node.js 경로 문제

**해결**:
1. **작업 스케줄러**에서 작업 우클릭 → **실행** 테스트
2. **기록** 탭에서 오류 메시지 확인
3. **프로그램/스크립트**에 Node.js 전체 경로 사용:
   ```batch
   C:\Program Files\nodejs\node.exe
   ```
4. **인수 추가**에 스크립트 전체 경로 사용:
   ```batch
   C:\inetpub\wwwroot\homepage\server\supabase-keepalive.js
   ```

### 5. PM2 서비스가 계속 재시작됨

**원인**: 스크립트 오류로 인한 크래시

**해결**:
```bash
# 상세 로그 확인
pm2 logs supabase-keepalive --err

# 환경 변수 확인
pm2 env 0  # 0은 프로세스 ID

# 환경 변수 추가 (필요시)
pm2 delete supabase-keepalive
pm2 start server/supabase-keepalive-service.js \
  --name supabase-keepalive \
  --env production \
  -- --env-file=.env
```

---

## 고급 설정

### 커스텀 Cron 스케줄 (PM2 서비스)

`.env` 파일:
```env
# 3일마다 오전 9시
KEEPALIVE_CRON_SCHEDULE=0 9 */3 * *

# 매주 월요일 오전 9시
KEEPALIVE_CRON_SCHEDULE=0 9 * * 1

# 매일 오전 9시와 오후 9시
KEEPALIVE_CRON_SCHEDULE=0 9,21 * * *
```

Cron 표현식 도움: [crontab.guru](https://crontab.guru/)

### 로그 파일 지정

```env
# Linux/Mac
KEEPALIVE_LOG_FILE=/var/log/supabase-keepalive.log

# Windows
KEEPALIVE_LOG_FILE=C:\logs\supabase-keepalive.log
```

### 로그 로테이션 (Linux)

`/etc/logrotate.d/supabase-keepalive`:
```
/path/to/homepage/logs/keepalive.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

---

## 비교 요약

| 기능 | Cron Job | Task Scheduler | PM2 서비스 |
|------|----------|----------------|------------|
| OS | Linux/Mac | Windows | 전체 |
| 설정 난이도 | 쉬움 | 중간 | 중간 |
| 리소스 사용 | 최소 | 최소 | 약간 |
| 자동 재시작 | ❌ | ❌ | ✅ |
| 로그 관리 | 수동 | 수동 | 자동 |
| 모니터링 | 수동 | 수동 | 웹 UI |

**권장 사항**:
- **Linux 서버** → Cron Job (방법 1)
- **Windows 서버** → Task Scheduler (방법 2)
- **유연성 필요** → PM2 서비스 (방법 3)

---

## 참고 자료

- [Crontab Guru](https://crontab.guru/) - Cron 표현식 생성기
- [PM2 Documentation](https://pm2.keymetrics.io/) - PM2 공식 문서
- [Supabase 무료 티어 정책](https://supabase.com/docs/guides/platform/org-based-billing#free-plan)
- [Node.js 환경 변수](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
