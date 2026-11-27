import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

// 이 시간 안에 활동 기록이 있는 세션만 접속 중으로 간주 (heartbeat 주기: 2분)
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

const RealTimeVisitors = () => {
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveVisitors();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('visitor_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'visitor_analytics'
      }, () => {
        loadActiveVisitors();
      })
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(loadActiveVisitors, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadActiveVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('visitor_analytics')
        .select('*')
        .eq('is_active', true)
        .gte('last_activity', new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString())
        .order('last_activity', { ascending: false });

      if (error) throw error;

      setActiveVisitors(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading active visitors:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        👥 실시간 접속자: {activeVisitors.length}명
      </h3>

      {activeVisitors.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          현재 활성 접속자가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  디바이스
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  브라우저
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  OS
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  유입 경로
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  마지막 활동
                </th>
              </tr>
            </thead>
            <tbody>
              {activeVisitors.map((visitor) => (
                <tr
                  key={visitor.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    <span className="inline-flex items-center">
                      {visitor.device_type === 'mobile' && '📱'}
                      {visitor.device_type === 'tablet' && '📱'}
                      {visitor.device_type === 'desktop' && '💻'}
                      <span className="ml-2 capitalize">{visitor.device_type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {visitor.browser} {visitor.browser_version}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {visitor.os} {visitor.os_version}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {visitor.referrer_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(visitor.last_activity).toLocaleString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RealTimeVisitors;
