import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Analytics utility functions for tracking visitors and page views
 */

// Generate a unique session ID
export const generateSessionId = () => {
  return uuidv4();
};

// Get or create session ID from localStorage
export const getSessionId = () => {
  let sessionId = localStorage.getItem('jaha_session_id');

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('jaha_session_id', sessionId);
  }

  return sessionId;
};

// Parse User Agent to get device, browser, and OS info
export const parseUserAgent = () => {
  const ua = navigator.userAgent;

  // Detect device type
  let deviceType = 'desktop';
  if (/mobile/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  }

  // Detect browser
  let browser = 'Unknown';
  let browserVersion = '';

  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.indexOf('Edg') > -1) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
    browser = 'Internet Explorer';
    browserVersion = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/)?.[1] || '';
  }

  // Detect OS
  let os = 'Unknown';
  let osVersion = '';

  if (ua.indexOf('Windows NT 10.0') > -1) {
    os = 'Windows';
    osVersion = '10';
  } else if (ua.indexOf('Windows NT 6.3') > -1) {
    os = 'Windows';
    osVersion = '8.1';
  } else if (ua.indexOf('Windows NT 6.2') > -1) {
    os = 'Windows';
    osVersion = '8';
  } else if (ua.indexOf('Windows NT 6.1') > -1) {
    os = 'Windows';
    osVersion = '7';
  } else if (ua.indexOf('Mac OS X') > -1) {
    os = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (ua.indexOf('Android') > -1) {
    os = 'Android';
    osVersion = ua.match(/Android (\d+\.\d+)/)?.[1] || '';
  } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    os = 'iOS';
    osVersion = ua.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (ua.indexOf('Linux') > -1) {
    os = 'Linux';
  }

  // Get screen resolution
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  // Get language
  const language = navigator.language || 'Unknown';

  return {
    deviceType,
    browser,
    browserVersion,
    os,
    osVersion,
    screenResolution,
    language,
  };
};

// Classify referrer source
export const classifyReferrer = (referrer) => {
  if (!referrer || referrer === '') {
    return 'Direct';
  }

  const url = referrer.toLowerCase();

  // Search engines
  if (url.includes('google')) return 'Google Search';
  if (url.includes('bing')) return 'Bing Search';
  if (url.includes('yahoo')) return 'Yahoo Search';
  if (url.includes('naver')) return 'Naver Search';
  if (url.includes('daum')) return 'Daum Search';

  // Social media
  if (url.includes('facebook')) return 'Facebook';
  if (url.includes('twitter') || url.includes('t.co')) return 'Twitter';
  if (url.includes('instagram')) return 'Instagram';
  if (url.includes('linkedin')) return 'LinkedIn';
  if (url.includes('youtube')) return 'YouTube';

  // Others
  return 'Other';
};

// 세션 상태 갱신. 익명 사용자는 RLS 때문에 직접 UPDATE가 반영되지 않으므로
// DB 함수(sql/visitor-heartbeat.sql)를 사용한다. 반환값: 세션 존재 여부
const touchSession = async (sessionId, isActive) => {
  const { data, error } = await supabase.rpc('touch_visitor_session', {
    p_session_id: sessionId,
    p_is_active: isActive,
  });

  if (error) {
    console.error('Error updating visitor session:', error);
    return false;
  }

  return data === true;
};

// 세션이 없으면 생성. 세션 존재 확인 또는 생성이 끝난 뒤 resolve
const createSessionIfMissing = async (sessionId) => {
  if (await touchSession(sessionId, true)) {
    return;
  }

  const userAgent = parseUserAgent();
  const referrer = document.referrer;

  const { error } = await supabase
    .from('visitor_analytics')
    .insert({
      session_id: sessionId,
      device_type: userAgent.deviceType,
      browser: userAgent.browser,
      browser_version: userAgent.browserVersion,
      os: userAgent.os,
      os_version: userAgent.osVersion,
      screen_resolution: userAgent.screenResolution,
      language: userAgent.language,
      referrer: referrer || null,
      referrer_type: classifyReferrer(referrer),
      landing_page: window.location.pathname,
      is_active: true,
      visited_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    });

  // 23505: 다른 탭에서 같은 세션을 먼저 생성한 경우
  if (error && error.code !== '23505') {
    throw error;
  }
};

// 페이지 조회 기록은 세션 행을 참조하므로, 한 번만 실행하고 그 결과를 공유
let sessionPromise = null;

const ensureSession = () => {
  if (!sessionPromise) {
    sessionPromise = createSessionIfMissing(getSessionId()).catch((error) => {
      sessionPromise = null; // 실패하면 다음 호출에서 다시 시도
      throw error;
    });
  }
  return sessionPromise;
};

// Initialize visitor tracking
export const initVisitorTracking = async () => {
  try {
    const sessionId = getSessionId();
    await ensureSession();

    // Start heartbeat to update last_activity every 2 minutes (120 seconds)
    setInterval(async () => {
      await updateSessionHeartbeat(sessionId);
    }, 120000); // 2 minutes in milliseconds

    return sessionId;
  } catch (error) {
    console.error('Error initializing visitor tracking:', error);
    return null;
  }
};

// Update session heartbeat
export const updateSessionHeartbeat = async (sessionId) => {
  try {
    await touchSession(sessionId, true);
  } catch (error) {
    console.error('Error updating session heartbeat:', error);
  }
};

// Track page view
export const trackPageView = async (pageUrl, pageTitle) => {
  try {
    const sessionId = getSessionId();
    await ensureSession();

    await supabase
      .from('page_views')
      .insert({
        session_id: sessionId,
        page_url: pageUrl,
        page_title: pageTitle || document.title,
        viewed_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Mark session as inactive (on page hide)
// 페이지가 닫히는 중에도 전송되도록 supabase-js 대신 keepalive fetch 사용
export const markSessionInactive = () => {
  fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/rpc/touch_visitor_session`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: process.env.REACT_APP_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_session_id: getSessionId(), p_is_active: false }),
  }).catch((error) => {
    console.error('Error marking session inactive:', error);
  });
};

// Log system error
export const logSystemError = async (error, errorContext = {}) => {
  try {
    await supabase
      .from('system_logs')
      .insert({
        log_level: 'error',
        message: error.message || String(error),
        error_code: error.code || null,
        stack_trace: error.stack || null,
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        created_at: new Date().toISOString(),
        ...errorContext,
      });
  } catch (logError) {
    console.error('Error logging system error:', logError);
  }
};
