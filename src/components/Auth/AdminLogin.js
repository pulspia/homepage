import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const content = {
  ko: {
    title: '관리자 로그인',
    subtitle: '게시글 작성 및 관리를 위해 로그인하세요',
    email: '이메일',
    password: '비밀번호',
    loginButton: '로그인',
    loggingIn: '로그인 중...',
    errorInvalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
    errorGeneral: '로그인 중 오류가 발생했습니다.',
    emailPlaceholder: 'admin@pulspia.com',
    passwordPlaceholder: '비밀번호를 입력하세요',
  },
  en: {
    title: 'Admin Login',
    subtitle: 'Please log in to create and manage posts',
    email: 'Email',
    password: 'Password',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    errorInvalidCredentials: 'Invalid email or password.',
    errorGeneral: 'An error occurred during login.',
    emailPlaceholder: 'admin@pulspia.com',
    passwordPlaceholder: 'Enter your password',
  }
};

const AdminLogin = ({ lang = 'ko', onLoginSuccess }) => {
  const c = content[lang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid') || signInError.message.includes('credentials')) {
          setError(c.errorInvalidCredentials);
        } else {
          setError(c.errorGeneral);
        }
        console.error('Login error:', signInError);
        return;
      }

      // 로그인 성공
      if (data.user) {
        console.log('Login successful:', data.user.email);
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      setError(c.errorGeneral);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
        {c.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm">
        {c.subtitle}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이메일 입력 */}
        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {c.email}
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={c.emailPlaceholder}
            required
            disabled={loading}
            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {c.password}
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={c.passwordPlaceholder}
            required
            disabled={loading}
            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? c.loggingIn : c.loginButton}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
