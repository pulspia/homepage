import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const SiteSettings = () => {
  const [settings, setSettings] = useState({
    site_name: 'Pulspia',
    site_description: 'AI Solutions Company',
    contact_email: 'pulspia@gmail.com',
    meta_title_ko: 'Pulspia - AI 솔루션',
    meta_title_en: 'Pulspia - AI Solutions',
    meta_description_ko: 'Pulspia는 혁신적인 AI 솔루션을 제공합니다.',
    meta_description_en: 'Pulspia provides innovative AI solutions.',
    meta_keywords: 'AI, Machine Learning, Data Science, Pulspia',
    analytics_enabled: true,
    maintenance_mode: false,
    services_page_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'site_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.setting_value) {
        setSettings({ ...settings, ...data.setting_value });
        setLastSaved(data.updated_at);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert(
          {
            setting_key: 'site_settings',
            setting_value: settings,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'setting_key' }
        );

      if (error) throw error;

      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        action: 'site_settings_update',
        description: '사이트 설정 업데이트',
        metadata: settings
      });

      setLastSaved(new Date().toISOString());
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (!window.confirm('기본 설정으로 초기화하시겠습니까?')) {
      return;
    }

    setSettings({
      site_name: 'Pulspia',
      site_description: 'AI Solutions Company',
      contact_email: 'pulspia@gmail.com',
      meta_title_ko: 'Pulspia - AI 솔루션',
      meta_title_en: 'Pulspia - AI Solutions',
      meta_description_ko: 'Pulspia는 혁신적인 AI 솔루션을 제공합니다.',
      meta_description_en: 'Pulspia provides innovative AI solutions.',
      meta_keywords: 'AI, Machine Learning, Data Science, Pulspia',
      analytics_enabled: true,
      maintenance_mode: false,
      services_page_enabled: true
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              ⚙️ 사이트 설정
            </h3>
            {lastSaved && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                마지막 저장: {new Date(lastSaved).toLocaleString('ko-KR')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              초기화
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '💾 저장'}
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          기본 정보
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              사이트 이름
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              사이트 설명
            </label>
            <input
              type="text"
              value={settings.site_description}
              onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              연락처 이메일
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* SEO Settings (Korean) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          SEO 설정 (한국어)
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              메타 제목 (한국어)
            </label>
            <input
              type="text"
              value={settings.meta_title_ko}
              onChange={(e) => setSettings({ ...settings, meta_title_ko: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
              maxLength="60"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {settings.meta_title_ko.length}/60 글자
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              메타 설명 (한국어)
            </label>
            <textarea
              value={settings.meta_description_ko}
              onChange={(e) => setSettings({ ...settings, meta_description_ko: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
              rows="3"
              maxLength="160"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {settings.meta_description_ko.length}/160 글자
            </p>
          </div>
        </div>
      </div>

      {/* SEO Settings (English) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          SEO Settings (English)
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Meta Title (English)
            </label>
            <input
              type="text"
              value={settings.meta_title_en}
              onChange={(e) => setSettings({ ...settings, meta_title_en: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
              maxLength="60"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {settings.meta_title_en.length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Meta Description (English)
            </label>
            <textarea
              value={settings.meta_description_en}
              onChange={(e) => setSettings({ ...settings, meta_description_en: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
              rows="3"
              maxLength="160"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {settings.meta_description_en.length}/160 characters
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Meta Keywords
            </label>
            <input
              type="text"
              value={settings.meta_keywords}
              onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              쉼표(,)로 구분
            </p>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          기능 설정
        </h4>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={settings.analytics_enabled}
              onChange={(e) => setSettings({ ...settings, analytics_enabled: e.target.checked })}
              className="rounded w-5 h-5"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">방문자 분석 활성화</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                방문자 추적 및 분석 기능을 활성화합니다.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="rounded w-5 h-5"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">유지보수 모드</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                활성화 시 일반 사용자에게 유지보수 페이지가 표시됩니다. (관리자는 정상 접근 가능)
              </p>
            </div>
          </label>

          {settings.maintenance_mode && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ 유지보수 모드가 활성화되어 있습니다. 일반 사용자는 사이트에 접근할 수 없습니다.
              </p>
            </div>
          )}

          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={settings.services_page_enabled}
              onChange={(e) => setSettings({ ...settings, services_page_enabled: e.target.checked })}
              className="rounded w-5 h-5"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">서비스 페이지 활성화</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                활성화 시 헤더의 "서비스" 메뉴가 /services 페이지로 연결됩니다.
                비활성화 시 메인 페이지의 "핵심 서비스" 섹션으로 연결됩니다.
              </p>
            </div>
          </label>

          {!settings.services_page_enabled && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ℹ️ 서비스 페이지가 비활성화되어 있습니다. 헤더의 "서비스" 메뉴 클릭 시 메인 페이지의 핵심 서비스 섹션으로 이동합니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SEO Preview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          검색 결과 미리보기
        </h4>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">한국어 (Google 검색 결과)</p>
            <div className="mt-2">
              <p className="text-blue-600 dark:text-blue-400 text-xl">{settings.meta_title_ko}</p>
              <p className="text-green-700 dark:text-green-500 text-sm">https://pulspia.com</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                {settings.meta_description_ko}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">English (Google Search Result)</p>
            <div className="mt-2">
              <p className="text-blue-600 dark:text-blue-400 text-xl">{settings.meta_title_en}</p>
              <p className="text-green-700 dark:text-green-500 text-sm">https://pulspia.com</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                {settings.meta_description_en}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 설정을 변경한 후에는 반드시 "저장" 버튼을 클릭해야 적용됩니다.
        </p>
      </div>
    </div>
  );
};

export default SiteSettings;
