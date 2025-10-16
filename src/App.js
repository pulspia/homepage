import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Services from './components/Services/Services';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';

const titles = {
  ko: '자하랩스 - 사람을 위한 AI 솔루션',
  en: 'JAHA LABS - AI Solutions for Humans'
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('ko');

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
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header 
        toggleTheme={toggleTheme} 
        currentTheme={theme} 
        toggleLang={toggleLang}
        lang={lang}
      />
      <main>
        <Hero lang={lang} />
        <Services lang={lang} />
        <About lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}

export default App;
