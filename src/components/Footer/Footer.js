import React from 'react';

const content = {
  ko: {
    copyright: '© 2026 (주)펄스피아. All Rights Reserved.',
    companyName: '주식회사 펄스피아',
    address: '경기도 광명시 소하로 190, B동 621-8호 (광명G타워)'
  },
  en: {
    copyright: '© 2026 Pulspia Inc. All Rights Reserved.',
    companyName: 'Pulspia Inc.',
    address: 'B-dong 621-8, 190, Soha-ro, Gwangmyeong-si, Gyeonggi-do, Korea (Gwangmyeong G Tower)'
  }
};

const Footer = ({ lang }) => {
  const c = content[lang];
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-6 transition-colors duration-300">
      <div className="container mx-auto text-center">
        <p className="mb-1">{c.copyright}</p>
        <p>{c.companyName}</p>
        <p className="text-sm">{c.address}</p>
      </div>
    </footer>
  );
};

export default Footer;
