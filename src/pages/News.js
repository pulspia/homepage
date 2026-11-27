import React, { useState, useEffect } from 'react';
import NewsList from '../components/News/NewsList';
import NewsForm from '../components/News/NewsForm';
import AdminLogin from '../components/Auth/AdminLogin';
import { getPosts } from '../utils/newsStorage';
import { supabase } from '../lib/supabaseClient';

const content = {
  ko: {
    pageTitle: '회사 뉴스',
    pageDescription: 'Pulspia의 최신 소식과 활동을 확인하세요',
    listTitle: '게시글 목록',
    formTitle: '게시글 작성',
    loginButton: '관리자 로그인',
    logoutButton: '로그아웃',
    loggedInAs: '로그인됨:',
    loginToWrite: '게시글을 작성하려면 로그인하세요',
  },
  en: {
    pageTitle: 'Company News',
    pageDescription: 'Check out the latest news and activities from Pulspia',
    listTitle: 'Posts',
    formTitle: 'Write a Post',
    loginButton: 'Admin Login',
    logoutButton: 'Logout',
    loggedInAs: 'Logged in as:',
    loginToWrite: 'Please log in to write a post',
  }
};

const News = ({ lang }) => {
  const c = content[lang];
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 게시글 목록 불러오기
  const loadPosts = async () => {
    const loadedPosts = await getPosts();
    setPosts(loadedPosts);
  };

  // 현재 사용자 세션 확인
  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    loadPosts();
    checkUser();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // 클린업
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로그인 성공 핸들러
  const handleLoginSuccess = (user) => {
    setUser(user);
    setShowLogin(false);
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 새 게시글이 추가되면 목록 갱신
  const handlePostAdded = () => {
    loadPosts();
  };

  // 게시글이 삭제되면 목록 갱신
  const handlePostDeleted = () => {
    loadPosts();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-20">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            {c.pageTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {c.pageDescription}
          </p>

          {/* 로그인/로그아웃 버튼 */}
          <div className="mt-6">
            {user ? (
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {c.loggedInAs} {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  {c.logoutButton}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(!showLogin)}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                {c.loginButton}
              </button>
            )}
          </div>
        </div>

        {/* 로그인 폼 (토글) */}
        {showLogin && !user && (
          <div className="max-w-4xl mx-auto mb-12">
            <AdminLogin lang={lang} onLoginSuccess={handleLoginSuccess} />
          </div>
        )}

        {/* 게시글 목록 섹션 */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {c.listTitle}
          </h2>
          <NewsList
            posts={posts}
            lang={lang}
            onPostDeleted={handlePostDeleted}
            user={user}
          />
        </div>

        {/* 구분선 */}
        <div className="max-w-4xl mx-auto border-t border-gray-300 dark:border-gray-700 my-12"></div>

        {/* 게시글 작성 폼 섹션 */}
        <div className="max-w-4xl mx-auto">
          {user ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {c.formTitle}
              </h2>
              <NewsForm lang={lang} onPostAdded={handlePostAdded} />
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {c.loginToWrite}
              </p>
              <button
                onClick={() => setShowLogin(true)}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                {c.loginButton}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
