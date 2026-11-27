#!/usr/bin/env node

/**
 * Supabase Keep-Alive Service (자동 스케줄링)
 *
 * 이 스크립트는 Node.js 서비스로 실행되며,
 * 6일마다 자동으로 Supabase에 ping을 보냅니다.
 *
 * 별도의 Cron 설정 없이 이 스크립트만 실행하면
 * 자동으로 주기적인 ping을 수행합니다.
 *
 * 사용 방법:
 * 1. npm install @supabase/supabase-js dotenv node-cron
 * 2. .env 파일에 SUPABASE_URL과 SUPABASE_ANON_KEY 설정
 * 3. node server/supabase-keepalive-service.js
 *
 * 또는 PM2로 백그라운드 실행:
 * pm2 start server/supabase-keepalive-service.js --name supabase-keepalive
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// 스케줄 설정 (기본: 6일마다, 환경 변수로 변경 가능)
// CRON_SCHEDULE 예시:
// - '0 9 */6 * *'  → 6일마다 오전 9시
// - '0 0 * * 0'    → 매주 일요일 자정
// - '0 12 */3 * *' → 3일마다 정오
const CRON_SCHEDULE = process.env.KEEPALIVE_CRON_SCHEDULE || '0 9 */6 * *';

// 시작 시 즉시 실행 여부
const RUN_ON_START = process.env.KEEPALIVE_RUN_ON_START !== 'false';

// 로그 파일 경로 (선택사항)
const LOG_FILE = process.env.KEEPALIVE_LOG_FILE || null;
const fs = LOG_FILE ? require('fs') : null;

/**
 * 로그 메시지를 콘솔과 파일에 기록
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;

  console.log(logMessage);

  if (LOG_FILE && fs) {
    try {
      fs.appendFileSync(LOG_FILE, logMessage + '\n');
    } catch (err) {
      console.error('로그 파일 쓰기 실패:', err.message);
    }
  }
}

/**
 * 환경 변수 검증
 */
function validateEnvironment() {
  if (!supabaseUrl || !supabaseAnonKey) {
    log('❌ 오류: SUPABASE_URL과 SUPABASE_ANON_KEY 환경 변수가 필요합니다.');
    log('');
    log('.env 파일을 확인하거나 다음과 같이 환경 변수를 설정하세요:');
    log('  Linux/Mac: export SUPABASE_URL="https://xxxxx.supabase.co"');
    log('  Windows:   set SUPABASE_URL=https://xxxxx.supabase.co');
    log('');
    process.exit(1);
  }

  log('✅ 환경 변수 확인 완료');
  log(`📍 Supabase URL: ${supabaseUrl}`);
}

/**
 * Supabase에 ping 보내기
 */
async function pingSupabase() {
  try {
    log('');
    log('='.repeat(60));
    log('🏓 Supabase Keep-Alive Ping 시작');
    log('='.repeat(60));

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 간단한 쿼리 실행
    const { data, error } = await supabase
      .from('news_posts')
      .select('id')
      .limit(1);

    if (error) {
      log(`❌ Supabase 쿼리 실패: ${error.message}`);
      log(`   오류 코드: ${error.code || 'N/A'}`);
      return false;
    }

    log('✅ Supabase 연결 성공!');
    log(`📊 쿼리 결과: ${data ? data.length : 0}개 행 반환`);
    log('🎉 Keep-alive ping 완료!');
    log('='.repeat(60));
    log('');
    return true;

  } catch (err) {
    log(`❌ 예상치 못한 오류: ${err.message}`);
    return false;
  }
}

/**
 * 다음 실행 시간 계산 및 표시
 */
function logNextRun() {
  // Cron 표현식 해석 (간단한 버전)
  const parts = CRON_SCHEDULE.split(' ');
  const dayPart = parts[2] || '*';

  let nextRunDesc = '';
  if (dayPart.includes('*/')) {
    const days = dayPart.replace('*/', '');
    nextRunDesc = `약 ${days}일 후`;
  } else {
    nextRunDesc = 'Cron 스케줄에 따라';
  }

  log(`⏰ 다음 실행 예정: ${nextRunDesc}`);
  log(`📅 Cron 스케줄: ${CRON_SCHEDULE}`);
}

/**
 * 메인 함수
 */
async function main() {
  log('');
  log('*'.repeat(60));
  log('🚀 Supabase Keep-Alive Service 시작');
  log('*'.repeat(60));

  // 환경 변수 검증
  validateEnvironment();

  log(`⚙️  스케줄: ${CRON_SCHEDULE}`);
  log(`🔄 시작 시 즉시 실행: ${RUN_ON_START ? '예' : '아니오'}`);

  // 시작 시 즉시 실행
  if (RUN_ON_START) {
    log('🏃 시작 시 즉시 ping 실행...');
    await pingSupabase();
  }

  // Cron 작업 스케줄링
  log('');
  log('📆 Cron 작업 등록 중...');

  const task = cron.schedule(CRON_SCHEDULE, async () => {
    await pingSupabase();
    logNextRun();
  }, {
    timezone: process.env.TZ || 'Asia/Seoul'
  });

  log('✅ Cron 작업 등록 완료');
  logNextRun();
  log('');
  log('💡 서비스가 백그라운드에서 실행 중입니다...');
  log('   종료하려면 Ctrl+C를 누르세요.');
  log('*'.repeat(60));
  log('');

  // 프로세스 종료 시그널 처리
  process.on('SIGINT', () => {
    log('');
    log('⚠️  종료 시그널 수신');
    task.stop();
    log('✅ Cron 작업 중지됨');
    log('👋 서비스 종료');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('');
    log('⚠️  종료 시그널 수신 (SIGTERM)');
    task.stop();
    log('✅ Cron 작업 중지됨');
    log('👋 서비스 종료');
    process.exit(0);
  });
}

// 스크립트 실행
main();
