#!/usr/bin/env node

/**
 * Supabase Keep-Alive Script (서버용)
 *
 * 이 스크립트는 직접 호스팅 서버에서 실행되며,
 * Supabase 무료 티어가 7일 비활성화로 자동 정지되는 것을 방지합니다.
 *
 * 사용 방법:
 * 1. npm install @supabase/supabase-js dotenv
 * 2. .env 파일에 SUPABASE_URL과 SUPABASE_ANON_KEY 설정
 * 3. node server/supabase-keepalive.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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
    log('🏓 Supabase 연결 시작...');

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 간단한 쿼리 실행 (news_posts 테이블에서 1개 행만 가져오기)
    const { data, error } = await supabase
      .from('news_posts')
      .select('id')
      .limit(1);

    if (error) {
      log(`❌ Supabase 쿼리 실패: ${error.message}`);
      log(`   오류 코드: ${error.code || 'N/A'}`);
      log(`   힌트: ${error.hint || 'N/A'}`);
      return false;
    }

    log('✅ Supabase 연결 성공!');
    log(`📊 쿼리 결과: ${data ? data.length : 0}개 행 반환`);
    log('🎉 Keep-alive ping 완료!');
    log('');
    return true;

  } catch (err) {
    log(`❌ 예상치 못한 오류: ${err.message}`);
    log(`   스택: ${err.stack}`);
    return false;
  }
}

/**
 * 메인 함수
 */
async function main() {
  log('='.repeat(60));
  log('🚀 Supabase Keep-Alive 스크립트 시작');
  log('='.repeat(60));

  // 환경 변수 검증
  validateEnvironment();

  // Supabase ping 실행
  const success = await pingSupabase();

  // 종료 코드 설정 (크론 작업 모니터링용)
  const exitCode = success ? 0 : 1;

  log(`종료 코드: ${exitCode}`);
  log('='.repeat(60));

  process.exit(exitCode);
}

// 스크립트 실행
main();
