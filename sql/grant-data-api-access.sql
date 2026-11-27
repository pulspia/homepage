-- ========================================
-- Data API GRANT 적용 (안전 실행용)
-- ========================================
-- Supabase 이메일 안내(2026-05-14) 대응:
-- Oct 30, 2026부터 public 스키마 테이블에 명시적 GRANT 필요
--
-- 이 파일은 기존 데이터를 건드리지 않습니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- ========================================

-- ----------------------------------------
-- news_posts (홈페이지 뉴스 게시판)
-- ----------------------------------------
GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO service_role;

-- ----------------------------------------
-- admin_settings (사이트 설정)
-- ----------------------------------------
GRANT SELECT ON public.admin_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.admin_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO service_role;

-- ----------------------------------------
-- visitor_analytics (방문자 세션)
-- ----------------------------------------
GRANT INSERT, UPDATE ON public.visitor_analytics TO anon;
GRANT SELECT, INSERT, UPDATE ON public.visitor_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_analytics TO service_role;

-- ----------------------------------------
-- page_views (페이지 조회 기록)
-- ----------------------------------------
GRANT INSERT ON public.page_views TO anon;
GRANT SELECT, INSERT ON public.page_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_views TO service_role;

-- ----------------------------------------
-- system_logs (에러 로그)
-- ----------------------------------------
GRANT INSERT ON public.system_logs TO anon;
GRANT SELECT, INSERT ON public.system_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_logs TO service_role;

-- ----------------------------------------
-- server_metrics (서버 메트릭)
-- ----------------------------------------
GRANT SELECT, INSERT ON public.server_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.server_metrics TO service_role;

-- ----------------------------------------
-- ip_blacklist (IP 차단 목록)
-- ----------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ip_blacklist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ip_blacklist TO service_role;

-- ----------------------------------------
-- admin_activity_logs (관리자 활동 로그)
-- ----------------------------------------
GRANT SELECT, INSERT ON public.admin_activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_activity_logs TO service_role;

-- ----------------------------------------
-- alert_history (알람 이력)
-- ----------------------------------------
GRANT SELECT, INSERT, UPDATE ON public.alert_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_history TO service_role;

-- ========================================
-- 완료 확인
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Data API GRANT 적용 완료';
  RAISE NOTICE '========================================';
  RAISE NOTICE '대상 테이블: 9개';
  RAISE NOTICE '- news_posts';
  RAISE NOTICE '- admin_settings';
  RAISE NOTICE '- visitor_analytics';
  RAISE NOTICE '- page_views';
  RAISE NOTICE '- system_logs';
  RAISE NOTICE '- server_metrics';
  RAISE NOTICE '- ip_blacklist';
  RAISE NOTICE '- admin_activity_logs';
  RAISE NOTICE '- alert_history';
  RAISE NOTICE '========================================';
END $$;
