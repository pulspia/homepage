import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminLogin from '../../components/Auth/AdminLogin';
import RealTimeVisitors from '../../components/Admin/RealTimeVisitors';
import VisitorStats from '../../components/Admin/VisitorStats';
import SystemMonitoring from '../../components/Admin/SystemMonitoring';
import ErrorLogs from '../../components/Admin/ErrorLogs';
import AlertSystem from '../../components/Admin/AlertSystem';
import IPBlacklist from '../../components/Admin/IPBlacklist';
import AdminActivityLogs from '../../components/Admin/AdminActivityLogs';
import SiteSettings from '../../components/Admin/SiteSettings';

const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Log admin activity
      // Will be implemented in Phase 5
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  const tabs = [
    { id: 'dashboard', label: '📊 대시보드' },
    { id: 'monitoring', label: '🖥️ 시스템 모니터링' },
    { id: 'logs', label: '📋 에러 로그' },
    { id: 'alerts', label: '🔔 알람 시스템' },
    { id: 'security', label: '🔒 보안 설정' },
    { id: 'activity', label: '👤 활동 로그' },
    { id: 'settings', label: '⚙️ 사이트 설정' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            🔐 Pulspia 관리자 페이지
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session.user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    📊 대시보드
                  </h2>

                  {/* Real-time Visitors */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <RealTimeVisitors />
                  </div>

                  {/* Visitor Statistics */}
                  <div>
                    <VisitorStats />
                  </div>
                </div>
              )}

              {activeTab === 'monitoring' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    🖥️ 시스템 모니터링
                  </h2>
                  <SystemMonitoring />
                </div>
              )}

              {activeTab === 'logs' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    📋 에러 로그
                  </h2>
                  <ErrorLogs />
                </div>
              )}

              {activeTab === 'alerts' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    🔔 알람 시스템
                  </h2>
                  <AlertSystem />
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    🔒 보안 설정 - IP 차단 목록
                  </h2>
                  <IPBlacklist />
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    👤 관리자 활동 로그
                  </h2>
                  <AdminActivityLogs />
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <SiteSettings />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
