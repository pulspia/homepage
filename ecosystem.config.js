/**
 * PM2 Ecosystem Configuration
 * Pulspia 서비스 프로덕션 설정
 *
 * 구조:
 *   - 개발: /mnt/e/dev/web/
 *   - 배포: /var/www/pulspia.com/
 *
 * 배포 명령: cd /mnt/e/dev/web && ./deploy-services.sh
 */

// 배포 경로 상수
const PROD_BASE = '/var/www/pulspia.com';
const PROD_SERVICES = `${PROD_BASE}/services`;
const PROD_BACKEND = `${PROD_BASE}/backend`;

module.exports = {
  apps: [
    //=========================================================================
    // 프론트엔드: Next.js (web-mbti, mini-chat, img-gen 페이지 통합)
    //=========================================================================
    {
      name: 'web-mbti',
      script: '/home/bhhan/.nvm/versions/node/v22.23.4/bin/npm',
      args: 'run start -- -p 3001',
      cwd: PROD_SERVICES,  // 배포 경로
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: `${PROD_SERVICES}/logs/error.log`,
      out_file: `${PROD_SERVICES}/logs/out.log`,
      log_file: `${PROD_SERVICES}/logs/combined.log`,
      time: true
    },

    //=========================================================================
    // MBTI 백엔드: FastAPI (포트 8001)
    //=========================================================================
    {
      name: 'mbti-backend',
      script: `${PROD_BACKEND}/mbti-backend/venv/bin/uvicorn`,
      args: 'app.main:app --host 127.0.0.1 --port 8001',
      cwd: `${PROD_BACKEND}/mbti-backend`,  // 배포 경로
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: `${PROD_BACKEND}/mbti-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/mbti-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/mbti-backend/logs/combined.log`,
      time: true
    },

    //=========================================================================
    // Image Generation 백엔드: FastAPI + GPU (포트 8003)
    //=========================================================================
    {
      name: 'img-gen-backend',
      script: `${PROD_BACKEND}/img-gen-backend/venv/bin/uvicorn`,
      args: 'app.main:app --host 127.0.0.1 --port 8003',
      cwd: `${PROD_BACKEND}/img-gen-backend`,  // 배포 경로
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      // max_memory_restart disabled - GPU model handles own memory via enable_model_cpu_offload()
      // Memory can spike during generation but GPU offload keeps it within GPU VRAM limits
      error_file: `${PROD_BACKEND}/img-gen-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/img-gen-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/img-gen-backend/logs/combined.log`,
      time: true,
      restart_delay: 10000,           // 재시작 간 10초 대기
      kill_timeout: 30000,            // 종료 대기 30초
      listen_timeout: 120000,         // 시작 대기 120초 (GPU 초기화)
      max_restarts: 3,                // 최대 재시작 횟수
      min_uptime: 60000,              // 60초 이상 실행되어야 안정으로 판단
      cron_restart: '0 4 * * *'       // 매일 새벽 4시 자동 재시작
    },

    //=========================================================================
    // ECG 파형 예측 백엔드: FastAPI + GPU (포트 8004)
    //=========================================================================
    {
      name: 'ecg-pred-backend',
      script: `${PROD_BACKEND}/ecg-pred-backend/venv/bin/uvicorn`,
      args: 'main:app --host 127.0.0.1 --port 8004',
      cwd: `${PROD_BACKEND}/ecg-pred-backend/app`,
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: `${PROD_BACKEND}/ecg-pred-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/ecg-pred-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/ecg-pred-backend/logs/combined.log`,
      time: true,
      restart_delay: 10000,
      kill_timeout: 30000,
      listen_timeout: 120000,
      max_restarts: 3,
      min_uptime: 60000
    },

    //=========================================================================
    // ECG 부정맥 검출 백엔드: FastAPI + GPU (포트 8005)
    //=========================================================================
    {
      name: 'ecg-arr-backend',
      script: `${PROD_BACKEND}/ecg-arr-backend/venv/bin/uvicorn`,
      args: 'main:app --host 127.0.0.1 --port 8005',
      cwd: `${PROD_BACKEND}/ecg-arr-backend/app`,
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: `${PROD_BACKEND}/ecg-arr-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/ecg-arr-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/ecg-arr-backend/logs/combined.log`,
      time: true,
      restart_delay: 10000,
      kill_timeout: 30000,
      listen_timeout: 120000,
      max_restarts: 3,
      min_uptime: 60000
    },

    //=========================================================================
    // PPG/ABP 부정맥 예측 백엔드: FastAPI + GPU (포트 8006)
    //=========================================================================
    {
      name: 'ppg-arr-backend',
      script: `${PROD_BACKEND}/ppg-arr-backend/venv/bin/uvicorn`,
      args: 'main:app --host 127.0.0.1 --port 8006',
      cwd: `${PROD_BACKEND}/ppg-arr-backend/app`,
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: `${PROD_BACKEND}/ppg-arr-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/ppg-arr-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/ppg-arr-backend/logs/combined.log`,
      time: true,
      restart_delay: 10000,
      kill_timeout: 30000,
      listen_timeout: 120000,
      max_restarts: 3,
      min_uptime: 60000
    },

    //=========================================================================
    // Stress Prediction 백엔드: FastAPI + GPU (포트 8007)
    //=========================================================================
    {
      name: 'stress-pred-backend',
      script: `${PROD_BACKEND}/stress-pred-backend/venv/bin/uvicorn`,
      args: 'app.main:app --host 127.0.0.1 --port 8007',
      cwd: `${PROD_BACKEND}/stress-pred-backend`,
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: `${PROD_BACKEND}/stress-pred-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/stress-pred-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/stress-pred-backend/logs/combined.log`,
      time: true,
      restart_delay: 10000,
      kill_timeout: 30000,
      listen_timeout: 120000,
      max_restarts: 3,
      min_uptime: 60000
    },

    //=========================================================================
    // AI Calory Calculator 백엔드: FastAPI + GPU (포트 8008)
    //=========================================================================
    {
      name: 'cal-pred-backend',
      script: `${PROD_BACKEND}/cal-pred-backend/venv/bin/uvicorn`,
      args: 'main:app --host 127.0.0.1 --port 8008',
      cwd: `${PROD_BACKEND}/cal-pred-backend`,
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: `${PROD_BACKEND}/cal-pred-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/cal-pred-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/cal-pred-backend/logs/combined.log`,
      time: true,
      restart_delay: 10000,
      kill_timeout: 30000,
      listen_timeout: 120000,
      max_restarts: 3,
      min_uptime: 60000
    },

    //=========================================================================
    // FBG Prediction 백엔드: FastAPI (포트 8009)
    //=========================================================================
    {
      name: 'fbg-pred-backend',
      script: `${PROD_BACKEND}/fbg-pred-backend/venv/bin/uvicorn`,
      args: 'main:app --host 127.0.0.1 --port 8009',
      cwd: `${PROD_BACKEND}/fbg-pred-backend`,
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: `${PROD_BACKEND}/fbg-pred-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/fbg-pred-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/fbg-pred-backend/logs/combined.log`,
      time: true,
      restart_delay: 5000,
      kill_timeout: 10000,
      max_restarts: 5,
      min_uptime: 30000
    },

    //=========================================================================
    // PPG2ABP Calculator 백엔드: FastAPI + GPU (포트 8010)
    //=========================================================================
    {
      name: 'ppg2abp-backend',
      script: `${PROD_BACKEND}/ppg2abp-backend/venv/bin/uvicorn`,
      args: 'main:app --host 127.0.0.1 --port 8010',
      cwd: `${PROD_BACKEND}/ppg2abp-backend`,
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: `${PROD_BACKEND}/ppg2abp-backend/logs/error.log`,
      out_file: `${PROD_BACKEND}/ppg2abp-backend/logs/out.log`,
      log_file: `${PROD_BACKEND}/ppg2abp-backend/logs/combined.log`,
      time: true,
      restart_delay: 10000,
      kill_timeout: 30000,
      listen_timeout: 120000,
      max_restarts: 3,
      min_uptime: 60000
    },

    //=========================================================================
    // 모니터링 서버 (포트 8002)
    //=========================================================================
    {
      name: 'monitoring-server',
      script: `${PROD_BASE}/server/monitor.js`,
      cwd: PROD_BASE,  // 배포 경로
      env: {
        NODE_ENV: 'production',
        REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
        REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: `${PROD_BASE}/server/logs/monitor-error.log`,
      out_file: `${PROD_BASE}/server/logs/monitor-out.log`,
      log_file: `${PROD_BASE}/server/logs/monitor-combined.log`,
      time: true,
      restart_delay: 3000
    }
  ]
};
