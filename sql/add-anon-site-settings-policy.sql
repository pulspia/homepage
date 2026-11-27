-- admin_settings에 anon 사용자 읽기 권한 추가
-- site_settings만 읽을 수 있도록 제한

CREATE POLICY "Allow anon read site_settings only"
ON public.admin_settings FOR SELECT
TO anon
USING (setting_key = 'site_settings');
