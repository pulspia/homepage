import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import News from './pages/News';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { initVisitorTracking, trackPageView, markSessionInactive, updateSessionHeartbeat, getSessionId } from './utils/analytics';

const titles = {
  ko: '펄스피아 - 사람을 위한 AI 솔루션',
  en: 'Pulspia - AI Solutions for Humans'
};

// Component to track page views on route change
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);

  return null;
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('ko');

  // Initialize visitor tracking on app mount
  useEffect(() => {
    initVisitorTracking();

    // Mark session as inactive when user leaves the page
    const handlePageHide = () => {
      markSessionInactive();
    };

    // 뒤로/앞으로 가기로 캐시된 페이지가 복원되면 다시 접속 중으로 표시
    const handlePageShow = (event) => {
      if (event.persisted) {
        updateSessionHeartbeat(getSessionId());
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    document.title = titles[lang];
  }, [lang]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    setLang(lang === 'ko' ? 'en' : 'ko');
  };

  return (
    <Router>
      <PageViewTracker />
      <div className="bg-white dark:bg-gray-900 transition-colors duration-300 font-sans">
        <Header
          toggleTheme={toggleTheme}
          currentTheme={theme}
          toggleLang={toggleLang}
          lang={lang}
        />
        <Routes>
          <Route path="/" element={<Home lang={lang} />} />
          <Route path="/news" element={<News lang={lang} />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Footer lang={lang} />
      </div>
    </Router>
  );
}

export default App;
