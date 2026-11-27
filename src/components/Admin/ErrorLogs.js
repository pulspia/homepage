import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const MONITOR_SERVER_URL = 'http://localhost:8002';

const ErrorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, error, warning, info
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLogs();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('system_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadLogs, 30000);
    }

    return () => {
      subscription.unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    applyFilters();
  }, [logs, filter, searchTerm]);

  const loadLogs = async () => {
    try {
      const response = await fetch(`${MONITOR_SERVER_URL}/api/error-logs?limit=100`);
      if (!response.ok) {
        // Fallback to direct Supabase query if server is offline
        const { data, error } = await supabase
          .from('system_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setLogs(data);
      } else {
        const data = await response.json();
        setLogs(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading logs:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Filter by log level
    if (filter !== 'all') {
      filtered = filtered.filter((log) => log.log_level === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.error_details && log.error_details.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.source && log.source.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLogs(filtered);
  };

  const clearOldLogs = async () => {
    if (!window.confirm('30일 이상 된 로그를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${MONITOR_SERVER_URL}/api/logs/cleanup`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('오래된 로그가 삭제되었습니다.');
        loadLogs();
      } else {
        throw new Error('Failed to cleanup logs');
      }
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      alert('로그 삭제 중 오류가 발생했습니다.');
    }
  };

  const getLogLevelBadge = (level) => {
    const badges = {
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };

    return badges[level] || badges.info;
  };

  const getLogIcon = (level) => {
    const icons = {
      error: '🔴',
      warning: '🟡',
      info: '🔵'
    };

    return icons[level] || '⚪';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            전체 ({logs.length})
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            오류 ({logs.filter((l) => l.log_level === 'error').length})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            경고 ({logs.filter((l) => l.log_level === 'warning').length})
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            정보 ({logs.filter((l) => l.log_level === 'info').length})
          </button>
        </div>

        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            자동 새로고침
          </label>
          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            🔄 새로고침
          </button>
          <button
            onClick={clearOldLogs}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            🗑️ 정리
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="로그 메시지 검색..."
          className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            로그가 없습니다.
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{getLogIcon(log.log_level)}</span>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getLogLevelBadge(log.log_level)}`}>
                        {log.log_level.toUpperCase()}
                      </span>
                      {log.source && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {log.source}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-white font-medium mb-1">
                      {log.message}
                    </p>
                    {log.error_details && (
                      <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 p-2 rounded mt-2 overflow-x-auto">
                        {log.error_details}
                      </pre>
                    )}
                    {log.stack_trace && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer">
                          스택 트레이스 보기
                        </summary>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
                          {log.stack_trace}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          표시 중: {filteredLogs.length}개 / 전체: {logs.length}개
        </p>
      </div>
    </div>
  );
};

export default ErrorLogs;
