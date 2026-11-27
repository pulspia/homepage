#!/usr/bin/env node

/**
 * 환경 변수 테스트 스크립트
 *
 * .env 파일의 Supabase 환경 변수가 제대로 설정되었는지 확인합니다.
 *
 * 사용 방법:
 *   node server/test-env.js
 */

require('dotenv').config();

console.log('====================================================================');
console.log('🔍 Supabase 환경 변수 확인');
console.log('====================================================================');
console.log('');

// 환경 변수 읽기
const reactAppUrl = process.env.REACT_APP_SUPABASE_URL;
const reactAppKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('📋 발견된 환경 변수:');
console.log('');

// REACT_APP_ 변수
if (reactAppUrl) {
  console.log('✅ REACT_APP_SUPABASE_URL:', reactAppUrl);
} else {
  console.log('❌ REACT_APP_SUPABASE_URL: 설정되지 않음');
}

if (reactAppKey) {
  console.log('✅ REACT_APP_SUPABASE_ANON_KEY:', reactAppKey.substring(0, 20) + '...');
} else {
  console.log('❌ REACT_APP_SUPABASE_ANON_KEY: 설정되지 않음');
}

console.log('');

// 일반 변수
if (supabaseUrl) {
  console.log('✅ SUPABASE_URL:', supabaseUrl);
} else {
  console.log('ℹ️  SUPABASE_URL: 설정되지 않음 (선택사항)');
}

if (supabaseKey) {
  console.log('✅ SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...');
} else {
  console.log('ℹ️  SUPABASE_ANON_KEY: 설정되지 않음 (선택사항)');
}

console.log('');
console.log('====================================================================');
console.log('🎯 Keep-Alive 스크립트에서 사용할 값:');
console.log('====================================================================');
console.log('');

// 실제로 사용될 값 (우선순위: REACT_APP_ > 일반)
const finalUrl = reactAppUrl || supabaseUrl;
const finalKey = reactAppKey || supabaseKey;

if (finalUrl) {
  console.log('✅ URL:', finalUrl);
} else {
  console.log('❌ URL: 없음');
}

if (finalKey) {
  console.log('✅ KEY:', finalKey.substring(0, 20) + '...');
} else {
  console.log('❌ KEY: 없음');
}

console.log('');

// 최종 검증
if (finalUrl && finalKey) {
  console.log('====================================================================');
  console.log('🎉 환경 변수 설정 완료!');
  console.log('====================================================================');
  console.log('');
  console.log('다음 명령어로 Keep-Alive 스크립트를 테스트할 수 있습니다:');
  console.log('  npm run keepalive');
  console.log('');
  console.log('또는 PM2 서비스 시작:');
  console.log('  npm run keepalive:service');
  console.log('');
  process.exit(0);
} else {
  console.log('====================================================================');
  console.log('❌ 환경 변수 설정 불완전');
  console.log('====================================================================');
  console.log('');
  console.log('.env 파일에 다음 중 하나를 추가하세요:');
  console.log('');
  console.log('방법 1 (권장): React 앱 환경 변수 사용');
  console.log('  REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('  REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...');
  console.log('');
  console.log('방법 2: Keep-Alive 전용 환경 변수');
  console.log('  SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('  SUPABASE_ANON_KEY=eyJhbGc...');
  console.log('');
  console.log('Supabase 인증 정보는 다음에서 확인:');
  console.log('  https://app.supabase.com → 프로젝트 선택 → Settings → API');
  console.log('');
  process.exit(1);
}
