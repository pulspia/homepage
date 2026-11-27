-- ========================================
-- 방문자 세션 갱신 함수
-- ========================================
-- 익명 사용자는 visitor_analytics 조회 권한(RLS)이 없어 직접 UPDATE가 반영되지 않는다.
-- 조회 권한을 열지 않고, 자신의 session_id 에 대한 활동 시각/상태만 갱신하도록 허용한다.
-- Supabase SQL Editor 에서 실행.
-- ========================================

CREATE OR REPLACE FUNCTION public.touch_visitor_session(
  p_session_id TEXT,
  p_is_active BOOLEAN DEFAULT true
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.visitor_analytics
  SET is_active = p_is_active,
      last_activity = CASE WHEN p_is_active THEN now() ELSE last_activity END
  WHERE session_id = p_session_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_visitor_session(TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_visitor_session(TEXT, BOOLEAN) TO anon, authenticated;

-- 과거에 종료 처리되지 못한 세션 정리
UPDATE public.visitor_analytics
SET is_active = false
WHERE is_active = true
  AND last_activity < now() - INTERVAL '5 minutes';
