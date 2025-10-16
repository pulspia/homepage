import React from 'react';

const content = {
  ko: {
    copyright: '© 2025 (주)자하랩스. All Rights Reserved.',
    companyName: 'JAHA LABS Co. Ltd.'
  },
  en: {
    copyright: '© 2025 JAHA LABS Co. Ltd. All Rights Reserved.',
    companyName: 'JAHA LABS Co. Ltd.'
  }
};

const Footer = ({ lang }) => {
  const c = content[lang];
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-6 transition-colors duration-300">
      <div className="container mx-auto text-center">
        <p className="mb-1">{c.copyright}</p>
        <p>{c.companyName}</p>
      </div>
    </footer>
  );
};

export default Footer;
