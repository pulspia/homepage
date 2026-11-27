# Pulspia Monitoring Server

서버 리소스 모니터링을 위한 Express 서버입니다. CPU, RAM, Disk 사용량을 추적하고 Supabase에 저장합니다.

## 설치

```bash
# 의존성 설치
npm install
```

필요한 패키지:
- `express` - HTTP 서버
- `cors` - CORS 지원
- `systeminformation` - 시스템 메트릭 수집
- `@supabase/supabase-js` - Supabase 클라이언트
- `dotenv` - 환경 변수 로드

## 환경 설정

루트 디렉토리의 `.env` 파일에 다음 변수를 설정하세요:

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

## 사용법

### 방법 1: 백그라운드 실행 (권장)

모니터링 서버를 백그라운드에서 실행하여 터미널을 계속 사용할 수 있습니다.

```bash
# 서버 시작
./start-monitor.sh

# 서버 상태 확인
./status-monitor.sh

# 로그 실시간 확인
tail -f monitor.log

# 서버 중지
./stop-monitor.sh
```

### 방법 2: 포그라운드 실행 (개발/디버깅용)

```bash
node monitor.js
```

## API 엔드포인트

모니터링 서버는 `http://localhost:8002`에서 실행됩니다.

### 1. 헬스 체크
```bash
GET /health
```

응답 예시:
```json
{
  "status": "OK",
  "timestamp": "2024-11-29T00:24:00.000Z"
}
```

### 2. 현재 메트릭
```bash
GET /api/metrics
```

응답 예시:
```json
{
  "cpu": {
    "usage": "45.23",
    "cores": 8
  },
  "memory": {
    "total": "16.00",
    "used": "8.50",
    "free": "7.50",
    "usage": "53.13"
  },
  "disk": {
    "total": "512.00",
    "used": "256.00",
    "available": "256.00",
    "usage": "50.00"
  },
  "timestamp": "2024-11-29T00:24:00.000Z"
}
```

### 3. 시스템 정보
```bash
GET /api/system-info
```

### 4. 데이터베이스 헬스
```bash
GET /api/db-health
```

### 5. 최근 에러 로그
```bash
GET /api/error-logs?limit=50
```

### 6. 오래된 로그 정리
```bash
DELETE /api/logs/cleanup
```

30일 이상 된 로그를 삭제합니다.

## 스크립트 설명

### `start-monitor.sh`
- 모니터링 서버를 백그라운드에서 시작
- PID를 `monitor.pid` 파일에 저장
- 로그를 `monitor.log` 파일에 기록
- 이미 실행 중이면 에러 메시지 표시

### `stop-monitor.sh`
- 실행 중인 모니터링 서버 중지
- PID 파일 확인 후 프로세스 종료
- 정상 종료 실패 시 강제 종료 (kill -9)
- PID 파일 정리

### `status-monitor.sh`
- 서버 실행 상태 확인
- PID 및 포트 정보 표시
- HTTP 헬스 체크 수행
- 최근 10개 로그 라인 출력

## 데이터베이스 스키마

모니터링 서버는 다음 Supabase 테이블을 사용합니다:

### `server_metrics`
- `cpu_usage` - CPU 사용률 (%)
- `cpu_cores` - CPU 코어 수
- `memory_usage` - 메모리 사용률 (%)
- `memory_total_gb` - 총 메모리 (GB)
- `disk_usage` - 디스크 사용률 (%)
- `disk_total_gb` - 총 디스크 용량 (GB)
- `created_at` - 기록 시각

### `system_logs`
- `log_level` - 로그 레벨 (info, warning, error)
- `message` - 로그 메시지
- `error_details` - 에러 상세 정보
- `source` - 로그 소스 (monitor-server)
- `created_at` - 로그 생성 시각

## 주요 기능

1. **자동 메트릭 수집**: `/api/metrics` 호출 시 자동으로 Supabase에 저장
2. **에러 로깅**: 오류 발생 시 자동으로 `system_logs` 테이블에 기록
3. **헬스 모니터링**: 서버 및 데이터베이스 상태 확인
4. **Graceful Shutdown**: SIGINT 시그널 처리로 안전한 종료

## 트러블슈팅

### 서버가 시작되지 않는 경우
1. 로그 파일 확인: `cat server/monitor.log`
2. 포트 8002가 이미 사용 중인지 확인: `lsof -i :8002`
3. .env 파일의 Supabase 설정 확인

### 데이터베이스 연결 오류
1. `.env` 파일에 올바른 Supabase URL과 키가 설정되었는지 확인
2. Supabase 프로젝트가 활성 상태인지 확인
3. `/api/db-health` 엔드포인트로 연결 테스트

### 백그라운드 프로세스가 종료된 경우
1. `./status-monitor.sh`로 상태 확인
2. 로그 파일에서 에러 확인: `tail -50 monitor.log`
3. `./start-monitor.sh`로 재시작

## 프로덕션 배포

프로덕션 환경에서는 PM2 사용을 권장합니다:

```bash
# PM2 설치
npm install -g pm2

# 서버 시작
pm2 start monitor.js --name "jaha-monitor"

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save

# 상태 확인
pm2 status

# 로그 확인
pm2 logs jaha-monitor

# 서버 중지
pm2 stop jaha-monitor
```

## 로그 관리

로그는 `monitor.log` 파일에 저장됩니다.

```bash
# 실시간 로그 보기
tail -f monitor.log

# 최근 100줄
tail -n 100 monitor.log

# 로그 검색
grep "error" monitor.log

# 로그 파일 크기 확인
ls -lh monitor.log

# 로그 파일 정리 (주의!)
> monitor.log
```
