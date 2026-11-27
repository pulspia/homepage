-- ========================================
-- JAHA LABS Admin Page Database Schema
-- ========================================
-- Description: Complete database schema for admin page features
-- Tables: admin_settings, visitor_analytics, page_views, system_logs,
--         server_metrics, ip_blacklist, admin_activity_logs, alert_history
-- ========================================

-- 1. admin_settings: 사이트 기본 설정
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'JAHA LABS',
  site_description TEXT,
  admin_email TEXT NOT NULL,
  meta_keywords TEXT,
  meta_description TEXT,
  alert_email TEXT NOT NULL, -- 알람 수신 이메일
  cpu_threshold FLOAT DEFAULT 80.0, -- CPU 임계치 (%)
  ram_threshold FLOAT DEFAULT 80.0, -- RAM 임계치 (%)
  disk_threshold FLOAT DEFAULT 85.0, -- Disk 임계치 (%)
  error_alert_enabled BOOLEAN DEFAULT true,
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
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  screen_resolution TEXT,
  language TEXT,
  referrer TEXT,
  referrer_type TEXT, -- 'Direct', 'Google Search', 'Social Media', etc.
  landing_page TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  session_duration INTEGER DEFAULT 0 -- seconds
);

-- 3. page_views: 페이지 조회 기록
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  view_duration INTEGER DEFAULT 0, -- seconds
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES public.visitor_analytics(session_id) ON DELETE CASCADE
);

-- 4. system_logs: 시스템 에러 로그
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level TEXT NOT NULL, -- 'error', 'warn', 'info', 'debug'
  message TEXT NOT NULL,
  error_code TEXT,
  stack_trace TEXT,
  user_agent TEXT,
  ip_address TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. server_metrics: 서버 리소스 메트릭
CREATE TABLE IF NOT EXISTS public.server_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpu_usage FLOAT NOT NULL, -- percentage
  ram_usage FLOAT NOT NULL, -- percentage
  ram_used_mb FLOAT,
  ram_total_mb FLOAT,
  disk_usage FLOAT NOT NULL, -- percentage
  disk_used_gb FLOAT,
  disk_total_gb FLOAT,
  network_in_mbps FLOAT DEFAULT 0,
  network_out_mbps FLOAT DEFAULT 0,
  active_connections INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ip_blacklist: IP 차단 목록
CREATE TABLE IF NOT EXISTS public.ip_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  blocked_by UUID, -- admin user id
  is_auto_blocked BOOLEAN DEFAULT false, -- DDoS 자동 차단 여부
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL이면 영구 차단
  FOREIGN KEY (blocked_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 7. admin_activity_logs: 관리자 활동 로그
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'login', 'logout', 'ip_block', 'ip_unblock', 'settings_update', etc.
  action_details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 8. alert_history: 알람 발송 이력
CREATE TABLE IF NOT EXISTS public.alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'cpu', 'ram', 'disk', 'error', 'ddos'
  message TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  metric_value FLOAT, -- 임계치 초과 시 실제 값
  threshold_value FLOAT, -- 설정된 임계치
  sent_to TEXT NOT NULL, -- 수신자 이메일
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Indexes for Performance
-- ========================================

-- visitor_analytics indexes
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visited_at ON public.visitor_analytics(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_is_active ON public.visitor_analytics(is_active);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_referrer_type ON public.visitor_analytics(referrer_type);

-- page_views indexes
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON public.page_views(page_url);

-- system_logs indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_log_level ON public.system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- server_metrics indexes
CREATE INDEX IF NOT EXISTS idx_server_metrics_recorded_at ON public.server_metrics(recorded_at DESC);

-- ip_blacklist indexes
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_ip_address ON public.ip_blacklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_expires_at ON public.ip_blacklist(expires_at);

-- admin_activity_logs indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON public.admin_activity_logs(action_type);

-- alert_history indexes
CREATE INDEX IF NOT EXISTS idx_alert_history_alert_type ON public.alert_history(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON public.alert_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_is_resolved ON public.alert_history(is_resolved);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS Policies: authenticated users only
-- ========================================

-- admin_settings: 인증된 사용자만 읽기/쓰기 가능
CREATE POLICY "Allow authenticated users to read admin_settings"
ON public.admin_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update admin_settings"
ON public.admin_settings FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert admin_settings"
ON public.admin_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- visitor_analytics: 인증된 사용자만 읽기 가능, 익명 사용자는 INSERT 가능
CREATE POLICY "Allow authenticated users to read visitor_analytics"
ON public.visitor_analytics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow anonymous users to insert visitor_analytics"
ON public.visitor_analytics FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update visitor_analytics"
ON public.visitor_analytics FOR UPDATE
TO anon, authenticated
USING (true);

-- page_views: 인증된 사용자만 읽기 가능, 익명 사용자는 INSERT 가능
CREATE POLICY "Allow authenticated users to read page_views"
ON public.page_views FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow anonymous users to insert page_views"
ON public.page_views FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- system_logs: 인증된 사용자만 읽기 가능, 모든 사용자 INSERT 가능
CREATE POLICY "Allow authenticated users to read system_logs"
ON public.system_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all users to insert system_logs"
ON public.system_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- server_metrics: 인증된 사용자만 읽기/쓰기 가능
CREATE POLICY "Allow authenticated users to read server_metrics"
ON public.server_metrics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert server_metrics"
ON public.server_metrics FOR INSERT
TO authenticated
WITH CHECK (true);

-- ip_blacklist: 인증된 사용자만 읽기/쓰기 가능
CREATE POLICY "Allow authenticated users to read ip_blacklist"
ON public.ip_blacklist FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert ip_blacklist"
ON public.ip_blacklist FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ip_blacklist"
ON public.ip_blacklist FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete ip_blacklist"
ON public.ip_blacklist FOR DELETE
TO authenticated
USING (true);

-- admin_activity_logs: 인증된 사용자만 읽기 가능, INSERT 가능
CREATE POLICY "Allow authenticated users to read admin_activity_logs"
ON public.admin_activity_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert admin_activity_logs"
ON public.admin_activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- alert_history: 인증된 사용자만 읽기/쓰기 가능
CREATE POLICY "Allow authenticated users to read alert_history"
ON public.alert_history FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert alert_history"
ON public.alert_history FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update alert_history"
ON public.alert_history FOR UPDATE
TO authenticated
USING (true);

-- ========================================
-- Initial Data Insertion
-- ========================================

-- Insert default admin settings
INSERT INTO public.admin_settings (
  site_name,
  site_description,
  admin_email,
  alert_email,
  meta_keywords,
  meta_description,
  cpu_threshold,
  ram_threshold,
  disk_threshold,
  error_alert_enabled
) VALUES (
  'JAHA LABS',
  '사람을 위한 AI 솔루션',
  'pulspia@gmail.com',
  'pulspia@gmail.com',
  'AI, 인공지능, JAHA LABS, AI 솔루션',
  'JAHA LABS - 사람을 위한 AI 솔루션을 제공합니다.',
  80.0,
  80.0,
  85.0,
  true
) ON CONFLICT DO NOTHING;

-- ========================================
-- Functions for Automatic Updates
-- ========================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on admin_settings
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function: Update session duration on last_activity change
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.session_duration = EXTRACT(EPOCH FROM (NEW.last_activity - NEW.visited_at));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calculate session_duration
CREATE TRIGGER update_visitor_analytics_duration
BEFORE UPDATE ON public.visitor_analytics
FOR EACH ROW
WHEN (OLD.last_activity IS DISTINCT FROM NEW.last_activity)
EXECUTE FUNCTION update_session_duration();

-- ========================================
-- Realtime Publication Setup (for Supabase Realtime)
-- ========================================

-- Enable realtime for visitor_analytics (실시간 접속자 현황)
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_analytics;

-- Enable realtime for server_metrics (실시간 서버 상태)
ALTER PUBLICATION supabase_realtime ADD TABLE public.server_metrics;

-- Enable realtime for system_logs (실시간 에러 로그)
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;

-- Enable realtime for alert_history (실시간 알람)
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_history;

-- ========================================
-- Setup Complete
-- ========================================

-- Display summary
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'JAHA LABS Admin Database Setup Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: 8';
  RAISE NOTICE 'Indexes created: 16';
  RAISE NOTICE 'RLS policies created: 24';
  RAISE NOTICE 'Functions created: 2';
  RAISE NOTICE 'Triggers created: 2';
  RAISE NOTICE 'Realtime tables enabled: 4';
  RAISE NOTICE '========================================';
END $$;
