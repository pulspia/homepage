import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';

const Header = ({ toggleTheme, currentTheme, toggleLang, lang }) => {
  const navLinks = {
    ko: {
      services: '서비스',
      about: '회사 소개',
      contact: '문의하기',
    },
    en: {
      services: 'Services',
      about: 'About Us',
      contact: 'Contact',
    }
  };

  return (
    <header className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">JAHA LABS</h1>
        <nav className="hidden md:flex items-center space-x-6">
          <ul className="flex items-center space-x-6">
            <li><a href="#services" className="hover:text-blue-500 dark:hover:text-blue-400">{navLinks[lang].services}</a></li>
            <li><a href="#about" className="hover:text-blue-500 dark:hover:text-blue-400">{navLinks[lang].about}</a></li>
            <li><a href="#contact" className="hover:text-blue-500 dark:hover:text-blue-400">{navLinks[lang].contact}</a></li>
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
