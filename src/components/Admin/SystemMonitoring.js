import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MONITOR_SERVER_URL = '/monitor';

const SystemMonitoring = () => {
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [historicalMetrics, setHistoricalMetrics] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkServerStatus();
    loadCurrentMetrics();
    loadHistoricalMetrics();
    loadSystemInfo();
    checkDbHealth();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      checkServerStatus();
      loadCurrentMetrics();
      loadHistoricalMetrics();
      checkDbHealth();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${MONITOR_SERVER_URL}/health`);
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const loadCurrentMetrics = async () => {
    try {
      const response = await fetch(`${MONITOR_SERVER_URL}/api/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');

      const data = await response.json();
      setCurrentMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading current metrics:', error);
      setServerStatus('offline');
      setLoading(false);
    }
  };

  const loadHistoricalMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('server_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Reverse to show oldest to newest
      const formattedData = data
        .reverse()
        .map((item) => ({
          time: new Date(item.created_at).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          cpu: parseFloat(item.cpu_usage),
          memory: parseFloat(item.memory_usage),
          disk: parseFloat(item.disk_usage)
        }));

      setHistoricalMetrics(formattedData);
    } catch (error) {
      console.error('Error loading historical metrics:', error);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const response = await fetch(`${MONITOR_SERVER_URL}/api/system-info`);
      if (!response.ok) throw new Error('Failed to fetch system info');

      const data = await response.json();
      setSystemInfo(data);
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const checkDbHealth = async () => {
    try {
      const response = await fetch(`${MONITOR_SERVER_URL}/api/db-health`);
      const data = await response.json();
      setDbHealth(data);
    } catch (error) {
      console.error('Error checking DB health:', error);
      setDbHealth({ status: 'unhealthy', error: error.message });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (serverStatus === 'offline') {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 rounded-lg">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
            🔴 모니터링 서버 오프라인
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            모니터링 서버에 연결할 수 없습니다. 서버를 시작해주세요.
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm">
            cd server && node monitor.js
          </div>
        </div>
      </div>
    );
  }

  const getUsageColor = (usage) => {
    if (usage >= 80) return 'text-red-600 dark:text-red-400';
    if (usage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getUsageBgColor = (usage) => {
    if (usage >= 80) return 'bg-red-100 dark:bg-red-900';
    if (usage >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-green-100 dark:bg-green-900';
  };

  return (
    <div className="space-y-6">
      {/* Server Status */}
      <div className="p-4 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
              🟢 모니터링 서버 온라인
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              {currentMetrics?.timestamp && `마지막 업데이트: ${new Date(currentMetrics.timestamp).toLocaleString('ko-KR')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Current Metrics */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="CPU 사용량"
            value={currentMetrics.cpu.usage}
            unit="%"
            icon="🖥️"
            cores={currentMetrics.cpu.cores}
            getColor={getUsageColor}
            getBgColor={getUsageBgColor}
          />
          <MetricCard
            title="RAM 사용량"
            value={currentMetrics.memory.usage}
            unit="%"
            icon="💾"
            details={`${currentMetrics.memory.used} / ${currentMetrics.memory.total} GB`}
            getColor={getUsageColor}
            getBgColor={getUsageBgColor}
          />
          <MetricCard
            title="Disk 사용량"
            value={currentMetrics.disk.usage}
            unit="%"
            icon="💿"
            details={`${currentMetrics.disk.used} / ${currentMetrics.disk.total} GB`}
            getColor={getUsageColor}
            getBgColor={getUsageBgColor}
          />
        </div>
      )}

      {/* Database Health */}
      {dbHealth && (
        <div className={`p-6 rounded-lg border-l-4 ${
          dbHealth.status === 'healthy'
            ? 'bg-green-100 dark:bg-green-900 border-green-500'
            : 'bg-red-100 dark:bg-red-900 border-red-500'
        }`}>
          <h3 className={`text-lg font-bold mb-2 ${
            dbHealth.status === 'healthy'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {dbHealth.status === 'healthy' ? '✅ 데이터베이스 정상' : '❌ 데이터베이스 오류'}
          </h3>
          <div className={`text-sm ${
            dbHealth.status === 'healthy'
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {dbHealth.status === 'healthy' ? (
              <p>응답 시간: {dbHealth.responseTime}</p>
            ) : (
              <p>오류: {dbHealth.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Historical Charts */}
      {historicalMetrics.length > 0 && (
        <div className="space-y-6">
          {/* CPU Chart */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              📊 CPU 사용량 추이
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historicalMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#ef4444"
                  fill="#ef444440"
                  name="CPU %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Memory Chart */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              📊 메모리 사용량 추이
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historicalMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#eab308"
                  fill="#eab30840"
                  name="RAM %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Disk Chart */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              📊 디스크 사용량 추이
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historicalMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="disk"
                  stroke="#3b82f6"
                  fill="#3b82f640"
                  name="Disk %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* System Information */}
      {systemInfo && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            💻 시스템 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">운영체제</p>
              <p className="text-gray-800 dark:text-white font-semibold">
                {systemInfo.os.distro} {systemInfo.os.release}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">플랫폼</p>
              <p className="text-gray-800 dark:text-white font-semibold">
                {systemInfo.os.platform} ({systemInfo.os.arch})
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">시스템</p>
              <p className="text-gray-800 dark:text-white font-semibold">
                {systemInfo.system.manufacturer} {systemInfo.system.model}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">가동 시간</p>
              <p className="text-gray-800 dark:text-white font-semibold">
                {Math.floor(systemInfo.uptime / 3600)}시간 {Math.floor((systemInfo.uptime % 3600) / 60)}분
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, unit, icon, cores, details, getColor, getBgColor }) => {
  const usage = parseFloat(value);

  return (
    <div className={`p-6 rounded-lg border-l-4 ${getBgColor(usage)} border-${usage >= 80 ? 'red' : usage >= 60 ? 'yellow' : 'green'}-500 shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-4xl font-bold ${getColor(usage)}`}>
        {value}
        <span className="text-xl ml-1">{unit}</span>
      </p>
      {cores && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          코어 수: {cores}
        </p>
      )}
      {details && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {details}
        </p>
      )}
    </div>
  );
};

export default SystemMonitoring;
