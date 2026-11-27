import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const IPBlacklist = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIP, setNewIP] = useState('');
  const [newReason, setNewReason] = useState('');
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoDetect, setAutoDetect] = useState(true);

  useEffect(() => {
    loadBlacklist();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('ip_blacklist_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ip_blacklist' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBlacklist((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setBlacklist((prev) => prev.filter((item) => item.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setBlacklist((prev) =>
            prev.map((item) => (item.id === payload.new.id ? payload.new : item))
          );
        }
      })
      .subscribe();

    // Auto-detect suspicious IPs every 10 minutes
    if (autoDetect) {
      const interval = setInterval(detectSuspiciousIPs, 10 * 60 * 1000);
      detectSuspiciousIPs(); // Initial check

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [autoDetect]);

  const loadBlacklist = async () => {
    try {
      const { data, error } = await supabase
        .from('ip_blacklist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBlacklist(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading blacklist:', error);
      setLoading(false);
    }
  };

  const detectSuspiciousIPs = async () => {
    try {
      // Find IPs with excessive requests (more than 100 requests in 1 minute)
      const oneMinuteAgo = new Date();
      oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

      const { data: recentViews, error } = await supabase
        .from('page_views')
        .select('session_id, visitor_analytics(ip_address)')
        .gte('viewed_at', oneMinuteAgo.toISOString());

      if (error) throw error;

      // Count requests per IP
      const ipCounts = {};
      recentViews?.forEach((view) => {
        const ip = view.visitor_analytics?.ip_address;
        if (ip) {
          ipCounts[ip] = (ipCounts[ip] || 0) + 1;
        }
      });

      // Find suspicious IPs (more than 100 requests in 1 minute)
      const suspiciousIPs = Object.entries(ipCounts)
        .filter(([ip, count]) => count > 100)
        .map(([ip, count]) => ({ ip, count }));

      // Auto-block suspicious IPs
      for (const { ip, count } of suspiciousIPs) {
        // Check if already blacklisted
        const { data: existing } = await supabase
          .from('ip_blacklist')
          .select('id')
          .eq('ip_address', ip)
          .single();

        if (!existing) {
          await addToBlacklist(ip, `자동 차단: 1분 내 ${count}회 요청 감지 (DDoS 의심)`, true);
        }
      }
    } catch (error) {
      console.error('Error detecting suspicious IPs:', error);
    }
  };

  const addToBlacklist = async (ip = newIP, reason = newReason, isAuto = false) => {
    if (!isAuto) setAdding(true);

    try {
      // Validate IP address format
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(ip)) {
        alert('올바른 IP 주소 형식이 아닙니다.');
        return;
      }

      // Check if IP already exists
      const { data: existing } = await supabase
        .from('ip_blacklist')
        .select('id')
        .eq('ip_address', ip)
        .single();

      if (existing) {
        if (!isAuto) alert('이미 차단된 IP입니다.');
        return;
      }

      // Add to blacklist
      const { error } = await supabase.from('ip_blacklist').insert({
        ip_address: ip,
        reason: reason || '관리자에 의해 차단',
        is_active: true
      });

      if (error) throw error;

      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        action: 'ip_blacklist_add',
        description: `IP 차단: ${ip}`,
        metadata: { ip, reason, auto: isAuto }
      });

      // Generate Nginx config (if needed)
      if (!isAuto) {
        await generateNginxConfig();
      }

      if (!isAuto) {
        setNewIP('');
        setNewReason('');
        alert('IP가 차단 목록에 추가되었습니다.');
      }
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      if (!isAuto) alert('IP 차단 중 오류가 발생했습니다.');
    } finally {
      if (!isAuto) setAdding(false);
    }
  };

  const removeFromBlacklist = async (id, ip) => {
    if (!window.confirm(`IP ${ip}를 차단 목록에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('ip_blacklist').delete().eq('id', id);

      if (error) throw error;

      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        action: 'ip_blacklist_remove',
        description: `IP 차단 해제: ${ip}`,
        metadata: { ip }
      });

      await generateNginxConfig();
      alert('IP가 차단 목록에서 제거되었습니다.');
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      alert('IP 제거 중 오류가 발생했습니다.');
    }
  };

  const toggleActive = async (id, ip, currentStatus) => {
    try {
      const { error } = await supabase
        .from('ip_blacklist')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        action: 'ip_blacklist_toggle',
        description: `IP 차단 ${!currentStatus ? '활성화' : '비활성화'}: ${ip}`,
        metadata: { ip, status: !currentStatus }
      });

      await generateNginxConfig();
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const generateNginxConfig = async () => {
    try {
      // Get active blacklisted IPs
      const { data, error } = await supabase
        .from('ip_blacklist')
        .select('ip_address')
        .eq('is_active', true);

      if (error) throw error;

      // Generate Nginx config content
      const nginxConfig = `# Auto-generated IP blacklist - ${new Date().toISOString()}
# This file is auto-generated. Do not edit manually.

# Deny blacklisted IPs
${data.map((item) => `deny ${item.ip_address};`).join('\n')}

# Allow all other IPs
allow all;
`;

      // In a real implementation, this would write to a file on the server
      // For now, we'll just show it in a download
      const blob = new Blob([nginxConfig], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ip-blacklist.conf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Nginx config:', error);
    }
  };

  const filteredBlacklist = blacklist.filter(
    (item) =>
      item.ip_address.includes(searchTerm) ||
      item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Auto-detect Toggle */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-lg">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoDetect}
            onChange={(e) => setAutoDetect(e.target.checked)}
            className="rounded"
          />
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            의심스러운 IP 자동 차단 (1분 내 100회 이상 요청)
          </span>
        </label>
      </div>

      {/* Add IP Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          🚫 IP 차단 추가
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={newIP}
            onChange={(e) => setNewIP(e.target.value)}
            placeholder="IP 주소 (예: 192.168.1.1)"
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
          />
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="차단 사유"
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
          />
          <button
            onClick={() => addToBlacklist()}
            disabled={adding || !newIP}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {adding ? '추가 중...' : '차단 추가'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="IP 또는 사유 검색..."
          className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
        />
      </div>

      {/* Blacklist Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            차단된 IP 목록 ({filteredBlacklist.length})
          </h3>
          <button
            onClick={generateNginxConfig}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            📄 Nginx 설정 다운로드
          </button>
        </div>

        {filteredBlacklist.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            차단된 IP가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP 주소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    차단 사유
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    차단 시각
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBlacklist.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800 dark:text-white">
                      {item.ip_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.is_active
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {item.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(item.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => toggleActive(item.id, item.ip_address, item.is_active)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {item.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => removeFromBlacklist(item.id, item.ip_address)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Nginx 설정 파일을 다운로드한 후, 서버의 `/etc/nginx/conf.d/ip-blacklist.conf` 경로에 업로드하고 Nginx를 재시작해주세요.
        </p>
        <pre className="text-xs mt-2 bg-gray-900 text-gray-100 p-2 rounded">
sudo systemctl reload nginx
        </pre>
      </div>
    </div>
  );
};

export default IPBlacklist;
