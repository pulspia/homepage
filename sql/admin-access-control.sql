-- ========================================
-- JAHA LABS Admin Access Control (Simple)
-- ========================================
-- Supabase 인증 사용자는 admin 관련 모든 권한 보유
-- site_settings만 anon 사용자도 읽기 가능 (Header용)
-- ========================================

-- 이전에 생성한 admin_users 테이블이 있다면 삭제
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- ========================================
-- admin_settings RLS 정책 재설정
-- ========================================
DROP POLICY IF EXISTS "Allow authenticated read admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow authenticated update admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow authenticated insert admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow anon read site_settings only" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow public read site_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow admin read all settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow admin update settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow admin insert settings" ON public.admin_settings;

-- 인증 사용자: 모든 설정 읽기/쓰기 가능
CREATE POLICY "Allow authenticated read admin_settings"
ON public.admin_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update admin_settings"
ON public.admin_settings FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert admin_settings"
ON public.admin_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- anon 사용자: site_settings만 읽기 가능 (Header에서 서비스 링크 설정 확인용)
CREATE POLICY "Allow anon read site_settings only"
ON public.admin_settings FOR SELECT
TO anon
USING (setting_key = 'site_settings');

-- ========================================
-- Data API GRANT (Supabase Oct 30, 2026 보안 정책 변경 대응)
-- ========================================
GRANT SELECT ON public.admin_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.admin_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO service_role;

-- ========================================
-- 설정 완료
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin Access Control Setup Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Policy:';
  RAISE NOTICE '- Authenticated users: Full access to all admin tables';
  RAISE NOTICE '- Anonymous users: Can only read site_settings';
  RAISE NOTICE '========================================';
END $$;
