-- ========================================
-- JAHA LABS Admin Page Database Schema (FIXED)
-- ========================================
-- 이 파일은 코드와 일치하도록 수정된 스키마입니다
-- ========================================

-- 기존 테이블 삭제 (재설정)
DROP TABLE IF EXISTS public.alert_history CASCADE;
DROP TABLE IF EXISTS public.admin_activity_logs CASCADE;
DROP TABLE IF EXISTS public.ip_blacklist CASCADE;
DROP TABLE IF EXISTS public.server_metrics CASCADE;
DROP TABLE IF EXISTS public.system_logs CASCADE;
DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.visitor_analytics CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;

-- 1. admin_settings: Key-Value 구조로 변경
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL, -- 'alert_thresholds', 'site_settings' 등
  setting_value JSONB NOT NULL, -- 설정 값을 JSON으로 저장
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. visitor_analytics: 방문자 세션 정보
CREATE TABLE IF NOT EXISTS public.visitor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  screen_resolution TEXT,
  language TEXT,
  referrer TEXT,
  referrer_type TEXT,
  landing_page TEXT,
  current_page TEXT, -- 현재 페이지 추가
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  session_duration INTEGER DEFAULT 0
);

-- 3. page_views: 페이지 조회 기록
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  view_duration INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES public.visitor_analytics(session_id) ON DELETE CASCADE
);

-- 4. system_logs: 시스템 에러 로그
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level TEXT NOT NULL,
  message TEXT NOT NULL,
  error_code TEXT,
  error_details TEXT, -- stack_trace 대신
  source TEXT, -- 어느 컴포넌트에서 발생했는지
  user_agent TEXT,
  ip_address TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. server_metrics: 서버 리소스 메트릭 (created_at 추가)
CREATE TABLE IF NOT EXISTS public.server_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpu_usage FLOAT NOT NULL,
  cpu_cores INTEGER,
  memory_usage FLOAT NOT NULL,
  memory_total_gb FLOAT,
  memory_used_gb FLOAT,
  disk_usage FLOAT NOT NULL,
  disk_total_gb FLOAT,
  disk_used_gb FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW() -- 추가
);

-- 6. ip_blacklist: IP 차단 목록 (created_at 추가)
CREATE TABLE IF NOT EXISTS public.ip_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true, -- 활성화/비활성화
  created_at TIMESTAMPTZ DEFAULT NOW() -- 추가
);

-- 7. admin_activity_logs: 관리자 활동 로그 (구조 변경)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT, -- admin_id 대신 이메일
  action TEXT NOT NULL, -- action_type 대신
  description TEXT, -- action_details 대신
  ip_address TEXT,
  metadata JSONB, -- 추가 정보
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. alert_history: 알람 발송 이력
CREATE TABLE IF NOT EXISTS public.alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  metric_value FLOAT,
  threshold_value FLOAT,
  sent_to TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visited_at ON public.visitor_analytics(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_is_active ON public.visitor_analytics(is_active);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views(viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_log_level ON public.system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_server_metrics_created_at ON public.server_metrics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ip_blacklist_ip_address ON public.ip_blacklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_created_at ON public.ip_blacklist(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON public.admin_activity_logs(action);

CREATE INDEX IF NOT EXISTS idx_alert_history_alert_type ON public.alert_history(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON public.alert_history(created_at DESC);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- admin_settings: 인증된 사용자만 읽기/쓰기
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

-- visitor_analytics: 읽기는 인증, 쓰기는 모두 가능
CREATE POLICY "Allow authenticated read visitor_analytics"
ON public.visitor_analytics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow anon insert visitor_analytics"
ON public.visitor_analytics FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anon update visitor_analytics"
ON public.visitor_analytics FOR UPDATE
TO anon, authenticated
USING (true);

-- page_views: 읽기는 인증, 쓰기는 모두 가능
CREATE POLICY "Allow authenticated read page_views"
ON public.page_views FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow anon insert page_views"
ON public.page_views FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- system_logs: 읽기는 인증, 쓰기는 모두 가능
CREATE POLICY "Allow authenticated read system_logs"
ON public.system_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all insert system_logs"
ON public.system_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- server_metrics: 인증된 사용자만
CREATE POLICY "Allow authenticated read server_metrics"
ON public.server_metrics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert server_metrics"
ON public.server_metrics FOR INSERT
TO authenticated
WITH CHECK (true);

-- ip_blacklist: 인증된 사용자만
CREATE POLICY "Allow authenticated read ip_blacklist"
ON public.ip_blacklist FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert ip_blacklist"
ON public.ip_blacklist FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update ip_blacklist"
ON public.ip_blacklist FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete ip_blacklist"
ON public.ip_blacklist FOR DELETE
TO authenticated
USING (true);

-- admin_activity_logs: 인증된 사용자만
CREATE POLICY "Allow authenticated read admin_activity_logs"
ON public.admin_activity_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert admin_activity_logs"
ON public.admin_activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- alert_history: 인증된 사용자만
CREATE POLICY "Allow authenticated read alert_history"
ON public.alert_history FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert alert_history"
ON public.alert_history FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update alert_history"
ON public.alert_history FOR UPDATE
TO authenticated
USING (true);

-- ========================================
-- Data API GRANT (Supabase Oct 30, 2026 보안 정책 변경 대응)
-- ========================================
-- anon: 방문자 데이터 기록 + site_settings 읽기
GRANT SELECT ON public.admin_settings TO anon;
GRANT INSERT, UPDATE ON public.visitor_analytics TO anon;
GRANT INSERT ON public.page_views TO anon;
GRANT INSERT ON public.system_logs TO anon;

-- authenticated: 관리자 기능 전체
GRANT SELECT, INSERT, UPDATE ON public.admin_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.visitor_analytics TO authenticated;
GRANT SELECT, INSERT ON public.page_views TO authenticated;
GRANT SELECT, INSERT ON public.system_logs TO authenticated;
GRANT SELECT, INSERT ON public.server_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ip_blacklist TO authenticated;
GRANT SELECT, INSERT ON public.admin_activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.alert_history TO authenticated;

-- service_role: 백엔드 서버 풀 액세스
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_analytics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_views TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.server_metrics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ip_blacklist TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_activity_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_history TO service_role;

-- ========================================
-- Initial Data
-- ========================================

-- 기본 알람 임계치 설정
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('alert_thresholds', '{"cpu_threshold": 80.0, "ram_threshold": 80.0, "disk_threshold": 85.0, "alert_email": "pulspia@gmail.com"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- 기본 사이트 설정
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('site_settings', '{
  "site_name": "JAHA LABS",
  "site_description": "AI Solutions Company",
  "contact_email": "pulspia@gmail.com",
  "meta_title_ko": "JAHA LABS - AI 솔루션",
  "meta_title_en": "JAHA LABS - AI Solutions",
  "meta_description_ko": "JAHA LABS는 혁신적인 AI 솔루션을 제공합니다.",
  "meta_description_en": "JAHA LABS provides innovative AI solutions.",
  "meta_keywords": "AI, Machine Learning, Data Science, JAHA LABS",
  "analytics_enabled": true,
  "maintenance_mode": false
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- Functions & Triggers
-- ========================================

-- auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- auto-calculate session_duration
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.session_duration = EXTRACT(EPOCH FROM (NEW.last_activity - NEW.visited_at));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_visitor_analytics_duration
BEFORE UPDATE ON public.visitor_analytics
FOR EACH ROW
WHEN (OLD.last_activity IS DISTINCT FROM NEW.last_activity)
EXECUTE FUNCTION update_session_duration();

-- ========================================
-- Realtime Setup
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_history;

-- ========================================
-- Setup Complete
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'JAHA LABS Admin Database Setup Complete (FIXED)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: 8';
  RAISE NOTICE 'Indexes created: 16';
  RAISE NOTICE 'RLS policies created: 24';
  RAISE NOTICE '========================================';
END $$;
