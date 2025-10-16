import React from 'react';

const content = {
  ko: {
    title: '회사 소개',
    description: '(주)자하랩스는 최첨단 솔루션 제공에 전념하는 열정적인 AI 개발자 및 데이터 과학자 팀입니다. 우리의 임무는 인공 지능의 혁신적인 힘으로 비즈니스를 강화하여 기술뿐만 아니라 경쟁 우위를 제공하는 것입니다.',
  },
  en: {
    title: 'About Us',
    description: 'JAHA LABS is a team of passionate AI developers and data scientists dedicated to providing cutting-edge solutions. Our mission is to empower businesses with the transformative power of artificial intelligence, delivering not just technology, but a competitive edge.',
  }
};

const About = ({ lang }) => {
  const c = content[lang];
  return (
    <section id="about" className="py-20 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-3xl font-bold mb-4">{c.title}</h2>
        <p className="max-w-3xl mx-auto text-lg">
          {c.description}
        </p>
      </div>
    </section>
  );
};

export default About;
