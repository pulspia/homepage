import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Header = ({ toggleTheme, currentTheme, toggleLang, lang }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [servicesPageEnabled, setServicesPageEnabled] = useState(true);

  // Load site settings to check if services page is enabled
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'site_settings')
          .single();

        if (!error && data?.setting_value) {
          // Default to true if not set
          setServicesPageEnabled(data.setting_value.services_page_enabled !== false);
        }
      } catch (error) {
        // Silently fail - default to true
        console.debug('Site settings not available, using defaults');
      }
    };

    loadSiteSettings();
  }, []);

  const navLinks = {
    ko: {
      services: '서비스',
      about: '회사 소개',
      location: '회사 위치',
      news: '회사 뉴스',
      contact: '문의하기',
    },
    en: {
      services: 'Services',
      about: 'About Us',
      location: 'Location',
      news: 'Company News',
      contact: 'Contact',
    }
  };

  // 홈페이지 섹션으로 이동하는 함수
  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();

    if (!isHome) {
      // News 페이지에서는 먼저 홈으로 이동한 후 섹션으로 스크롤
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // 이미 홈페이지에 있으면 바로 스크롤
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold hover:text-blue-500 dark:hover:text-blue-400">
          Pulspia
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <ul className="flex items-center space-x-6">
            <li>
              {servicesPageEnabled ? (
                <a
                  href="/services"
                  className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                >
                  {navLinks[lang].services}
                </a>
              ) : (
                <a
                  href="#services"
                  onClick={(e) => handleSectionClick(e, 'services')}
                  className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                >
                  {navLinks[lang].services}
                </a>
              )}
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => handleSectionClick(e, 'about')}
                className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
              >
                {navLinks[lang].about}
              </a>
            </li>
            <li>
              <a
                href="#location"
                onClick={(e) => handleSectionClick(e, 'location')}
                className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
              >
                {navLinks[lang].location}
              </a>
            </li>
            <li>
              <Link to="/news" className="hover:text-blue-500 dark:hover:text-blue-400">
                {navLinks[lang].news}
              </Link>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => handleSectionClick(e, 'contact')}
                className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
              >
                {navLinks[lang].contact}
              </a>
            </li>
          </ul>
          <button onClick={toggleLang} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <Globe size={20} />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
        <div className="md:hidden flex items-center space-x-2">
           <button onClick={toggleLang} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <Globe size={20} />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {/* Add mobile menu logic here if needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
