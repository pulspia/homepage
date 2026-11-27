/**
 * Supabase Keep-Alive Script
 *
 * 이 스크립트는 Supabase 무료 티어 프로젝트가 7일 비활성화로 인해
 * 자동 정지되는 것을 방지하기 위해 주기적으로 간단한 API 호출을 보냅니다.
 */

const { createClient } = require('@supabase/supabase-js');

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 오류: SUPABASE_URL과 SUPABASE_ANON_KEY 환경 변수가 필요합니다.');
  process.exit(1);
}

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function pingSupabase() {
  try {
    console.log('🏓 Supabase 연결 확인 중...');
    console.log(`📍 URL: ${supabaseUrl}`);

    // 간단한 쿼리 실행 (news_posts 테이블에서 1개 행만 가져오기)
    const { data, error } = await supabase
      .from('news_posts')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Supabase 쿼리 실패:', error.message);
      process.exit(1);
    }

    console.log('✅ Supabase 연결 성공!');
    console.log(`📊 쿼리 결과: ${data ? data.length : 0}개 행 반환`);
    console.log(`⏰ 실행 시간: ${new Date().toISOString()}`);
    console.log('🎉 Keep-alive ping 완료!');

    process.exit(0);
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err.message);
    process.exit(1);
  }
}

// 스크립트 실행
pingSupabase();
