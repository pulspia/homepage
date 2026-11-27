import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const VisitorStats = () => {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    referrerData: [],
    deviceData: [],
    browserData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // Refresh every 60 seconds
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      // Total visitors
      const { count: totalCount } = await supabase
        .from('visitor_analytics')
        .select('*', { count: 'exact', head: true });

      // Today's visitors
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayCount } = await supabase
        .from('visitor_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', today.toISOString());

      // Referrer distribution
      const { data: referrerData } = await supabase
        .from('visitor_analytics')
        .select('referrer_type');

      const referrerCounts = {};
      referrerData?.forEach((item) => {
        const type = item.referrer_type || 'Unknown';
        referrerCounts[type] = (referrerCounts[type] || 0) + 1;
      });

      const referrerChartData = Object.entries(referrerCounts).map(([name, value]) => ({
        name,
        value,
      }));

      // Device distribution
      const { data: deviceData } = await supabase
        .from('visitor_analytics')
        .select('device_type');

      const deviceCounts = {};
      deviceData?.forEach((item) => {
        const type = item.device_type || 'Unknown';
        deviceCounts[type] = (deviceCounts[type] || 0) + 1;
      });

      const deviceChartData = Object.entries(deviceCounts).map(([name, value]) => ({
        name,
        value,
      }));

      // Browser distribution
      const { data: browserData } = await supabase
        .from('visitor_analytics')
        .select('browser');

      const browserCounts = {};
      browserData?.forEach((item) => {
        const browser = item.browser || 'Unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });

      const browserChartData = Object.entries(browserCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 browsers

      setStats({
        totalVisitors: totalCount || 0,
        todayVisitors: todayCount || 0,
        referrerData: referrerChartData,
        deviceData: deviceChartData,
        browserData: browserChartData,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-blue-100 dark:bg-blue-900 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">전체 방문자</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
            {stats.totalVisitors}
          </p>
        </div>
        <div className="p-6 bg-green-100 dark:bg-green-900 rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">오늘 방문자</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
            {stats.todayVisitors}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrer Chart */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            📍 유입 경로
          </h3>
          {stats.referrerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.referrerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.referrerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              데이터 없음
            </div>
          )}
        </div>

        {/* Device Chart */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            📱 디바이스 유형
          </h3>
          {stats.deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              데이터 없음
            </div>
          )}
        </div>
      </div>

      {/* Browser Chart */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          🌐 브라우저 분포 (Top 5)
        </h3>
        {stats.browserData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.browserData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="방문자 수" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorStats;
