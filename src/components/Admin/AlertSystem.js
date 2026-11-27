import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import emailjs from '@emailjs/browser';
import config from '../../config';

const MONITOR_SERVER_URL = 'http://localhost:8002';
const DEFAULT_THRESHOLDS = {
  cpu: 80,
  memory: 80,
  disk: 85
};

const AlertSystem = () => {
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    recipientEmail: 'pulspia@gmail.com',
    enabled: true
  });
  const [testingAlert, setTestingAlert] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAlertHistory();
    startMonitoring();

    // Subscribe to alert history updates
    const subscription = supabase
      .channel('alert_history_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alert_history' }, (payload) => {
        setAlertHistory((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'alert_thresholds')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.setting_value) {
        setThresholds(data.setting_value);
      }

      // Load email config
      const { data: emailData } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'alert_email')
        .single();

      if (emailData && emailData.setting_value) {
        setEmailConfig(emailData.setting_value);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const loadAlertHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAlertHistory(data || []);
    } catch (error) {
      console.error('Error loading alert history:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save thresholds
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'alert_thresholds',
          setting_value: thresholds,
          updated_at: new Date().toISOString()
        });

      // Save email config
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'alert_email',
          setting_value: emailConfig,
          updated_at: new Date().toISOString()
        });

      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const startMonitoring = () => {
    // Check metrics every 5 minutes
    const interval = setInterval(async () => {
      await checkMetrics();
    }, 5 * 60 * 1000);

    // Initial check
    checkMetrics();

    return () => clearInterval(interval);
  };

  const checkMetrics = async () => {
    if (!emailConfig.enabled) return;

    try {
      const response = await fetch(`${MONITOR_SERVER_URL}/api/metrics`);
      if (!response.ok) return;

      const metrics = await response.json();

      // Check CPU
      if (parseFloat(metrics.cpu.usage) >= thresholds.cpu) {
        await sendAlert('CPU', metrics.cpu.usage, thresholds.cpu);
      }

      // Check Memory
      if (parseFloat(metrics.memory.usage) >= thresholds.memory) {
        await sendAlert('RAM', metrics.memory.usage, thresholds.memory);
      }

      // Check Disk
      if (parseFloat(metrics.disk.usage) >= thresholds.disk) {
        await sendAlert('Disk', metrics.disk.usage, thresholds.disk);
      }
    } catch (error) {
      console.error('Error checking metrics:', error);
    }
  };

  const sendAlert = async (resourceType, currentValue, threshold) => {
    try {
      // Check if alert was sent in the last hour (prevent spam)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data: recentAlerts } = await supabase
        .from('alert_history')
        .select('*')
        .eq('alert_type', resourceType)
        .gte('created_at', oneHourAgo.toISOString())
        .limit(1);

      if (recentAlerts && recentAlerts.length > 0) {
        console.log(`Alert for ${resourceType} already sent recently, skipping...`);
        return;
      }

      // Initialize EmailJS
      emailjs.init(config.emailjs.publicKey);

      // Send email
      const templateParams = {
        to_email: emailConfig.recipientEmail,
        resource_type: resourceType,
        current_value: currentValue,
        threshold: threshold,
        timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        site_name: 'Pulspia'
      };

      await emailjs.send(
        config.emailjs.serviceId,
        'template_alert', // Create this template in EmailJS
        templateParams
      );

      // Save to history
      await supabase.from('alert_history').insert({
        alert_type: resourceType,
        message: `${resourceType} 사용량이 임계치를 초과했습니다 (${currentValue}% >= ${threshold}%)`,
        severity: currentValue >= threshold + 10 ? 'critical' : 'warning',
        sent_to: emailConfig.recipientEmail,
        metadata: { currentValue, threshold }
      });

      console.log(`Alert sent for ${resourceType}`);
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  };

  const testAlert = async () => {
    setTestingAlert(true);
    try {
      emailjs.init(config.emailjs.publicKey);

      const templateParams = {
        to_email: emailConfig.recipientEmail,
        resource_type: 'TEST',
        current_value: '95',
        threshold: '80',
        timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        site_name: 'Pulspia'
      };

      await emailjs.send(
        config.emailjs.serviceId,
        'template_alert',
        templateParams
      );

      await supabase.from('alert_history').insert({
        alert_type: 'TEST',
        message: '테스트 알람 발송',
        severity: 'info',
        sent_to: emailConfig.recipientEmail,
        metadata: { test: true }
      });

      alert('테스트 알람이 발송되었습니다. 이메일을 확인해주세요.');
    } catch (error) {
      console.error('Error sending test alert:', error);
      alert('테스트 알람 발송 중 오류가 발생했습니다.');
    } finally {
      setTestingAlert(false);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('모든 알람 이력을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase.from('alert_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setAlertHistory([]);
      alert('알람 이력이 삭제되었습니다.');
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('이력 삭제 중 오류가 발생했습니다.');
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };

    return badges[severity] || badges.info;
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
      {/* Alert Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          🔔 알람 설정
        </h3>

        {/* Email Settings */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={emailConfig.enabled}
              onChange={(e) => setEmailConfig({ ...emailConfig, enabled: e.target.checked })}
              className="rounded"
            />
            <span className="text-gray-800 dark:text-white font-medium">이메일 알람 활성화</span>
          </label>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              수신 이메일
            </label>
            <input
              type="email"
              value={emailConfig.recipientEmail}
              onChange={(e) => setEmailConfig({ ...emailConfig, recipientEmail: e.target.value })}
              className="w-full p-2 rounded-lg bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              CPU 임계치 (%)
            </label>
            <input
              type="number"
              value={thresholds.cpu}
              onChange={(e) => setThresholds({ ...thresholds, cpu: parseInt(e.target.value) })}
              min="0"
              max="100"
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              RAM 임계치 (%)
            </label>
            <input
              type="number"
              value={thresholds.memory}
              onChange={(e) => setThresholds({ ...thresholds, memory: parseInt(e.target.value) })}
              min="0"
              max="100"
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Disk 임계치 (%)
            </label>
            <input
              type="number"
              value={thresholds.disk}
              onChange={(e) => setThresholds({ ...thresholds, disk: parseInt(e.target.value) })}
              min="0"
              max="100"
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '💾 설정 저장'}
          </button>
          <button
            onClick={testAlert}
            disabled={testingAlert || !emailConfig.enabled}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {testingAlert ? '발송 중...' : '📧 테스트 알람 발송'}
          </button>
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            📜 알람 이력
          </h3>
          <button
            onClick={clearHistory}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            이력 삭제
          </button>
        </div>

        {alertHistory.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            알람 이력이 없습니다.
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {alertHistory.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-gray-300 dark:border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity?.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {alert.alert_type}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-white mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      발송: {alert.sent_to} | {new Date(alert.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 알람은 5분마다 자동으로 확인되며, 동일한 알람은 1시간에 한 번만 발송됩니다.
        </p>
      </div>
    </div>
  );
};

export default AlertSystem;
