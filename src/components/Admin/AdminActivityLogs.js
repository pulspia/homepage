import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, login, logout, create, update, delete, settings
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month

  useEffect(() => {
    loadLogs();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('admin_activity_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_activity_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filter, searchTerm, dateRange]);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      setLogs(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading logs:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Filter by action type
    if (filter !== 'all') {
      filtered = filtered.filter((log) => log.action.includes(filter));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter((log) => new Date(log.created_at) >= startDate);
    }

    setFilteredLogs(filtered);
  };

  const clearOldLogs = async () => {
    if (!window.confirm('30일 이상 된 활동 로그를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabase
        .from('admin_activity_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      loadLogs();
      alert('오래된 로그가 삭제되었습니다.');
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('로그 삭제 중 오류가 발생했습니다.');
    }
  };

  const exportLogs = () => {
    const csv = [
      ['시각', '관리자', '작업', '설명', 'IP 주소'].join(','),
      ...filteredLogs.map((log) =>
        [
          new Date(log.created_at).toLocaleString('ko-KR'),
          log.user_email || 'N/A',
          log.action,
          `"${log.description?.replace(/"/g, '""') || ''}"`,
          log.ip_address || 'N/A'
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action) => {
    if (action.includes('login')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (action.includes('logout')) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    if (action.includes('create') || action.includes('add')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (action.includes('update') || action.includes('edit')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (action.includes('settings')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getActionIcon = (action) => {
    if (action.includes('login')) return '🔓';
    if (action.includes('logout')) return '🔒';
    if (action.includes('create') || action.includes('add')) return '➕';
    if (action.includes('update') || action.includes('edit')) return '✏️';
    if (action.includes('delete') || action.includes('remove')) return '🗑️';
    if (action.includes('settings')) return '⚙️';
    if (action.includes('blacklist')) return '🚫';
    return '📝';
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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
        {/* Action Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            전체 ({logs.length})
          </button>
          <button
            onClick={() => setFilter('login')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'login'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            로그인 ({logs.filter((l) => l.action.includes('login')).length})
          </button>
          <button
            onClick={() => setFilter('create')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            생성 ({logs.filter((l) => l.action.includes('create')).length})
          </button>
          <button
            onClick={() => setFilter('delete')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'delete'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            삭제 ({logs.filter((l) => l.action.includes('delete')).length})
          </button>
          <button
            onClick={() => setFilter('settings')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'settings'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            설정 ({logs.filter((l) => l.action.includes('settings')).length})
          </button>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 self-center">기간:</span>
          {['all', 'today', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {range === 'all' ? '전체' : range === 'today' ? '오늘' : range === 'week' ? '1주일' : '1개월'}
            </button>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="검색..."
            className="flex-grow p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
          />
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            📥 CSV 내보내기
          </button>
          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            🔄 새로고침
          </button>
          <button
            onClick={clearOldLogs}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            🗑️ 정리
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            관리자 활동 로그 ({filteredLogs.length})
          </h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            활동 로그가 없습니다.
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{getActionIcon(log.action)}</span>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      {log.user_email && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          👤 {log.user_email}
                        </span>
                      )}
                      {log.ip_address && (
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                          🌐 {log.ip_address}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        {new Date(log.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-white">{log.description}</p>
                    {log.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer">
                          세부 정보 보기
                        </summary>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">총 활동</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{filteredLogs.length}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">로그인/로그아웃</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredLogs.filter((l) => l.action.includes('login') || l.action.includes('logout')).length}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">생성/수정</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {filteredLogs.filter((l) => l.action.includes('create') || l.action.includes('update')).length}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">삭제</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {filteredLogs.filter((l) => l.action.includes('delete')).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;
