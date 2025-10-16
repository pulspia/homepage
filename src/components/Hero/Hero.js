import React, { useState } from 'react';

const content = {
  ko: {
    title: '사람을 위한 AI 솔루션',
    subtitle1: '저희 자하랩스는 비즈니스 성장을 주도하는 지능형 소프트웨어 개발 및 데이터 분석 서비스를 제공합니다.',
    subtitle2: 'AI Solutions for Humans',
    button: '문의하기',
  },
  en: {
    title: 'AI Solutions for Humans',
    subtitle1: 'JAHA LABS provides intelligent software development and data analysis services to drive business growth.',
    subtitle2: 'AI Solutions for Humans',
    button: 'Get in Touch',
  }
};

const Hero = ({ lang }) => {
  const c = content[lang];
  const [videoLoaded, setVideoLoaded] = useState(true);

  const handleVideoError = () => {
    setVideoLoaded(false);
  };

  return (
    <section id="hero" className="relative bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white text-center py-20 md:py-32 transition-colors duration-300 overflow-hidden">
      {/* Background Video */}
      {videoLoaded && (
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover opacity-60 dark:opacity-50"
            autoPlay
            muted
            loop
            playsInline
            onError={handleVideoError}
          >
            <source src={`${process.env.PUBLIC_URL}/videos/ai-background.mp4`} type="video/mp4" />
          </video>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 opacity-40"></div>
        </div>
      )}
      
      {/* Animated background pattern fallback or additional visual element */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-50"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{c.title}</h2>
        <p className="text-lg md:text-xl mb-2 max-w-3xl mx-auto drop-shadow-md">{c.subtitle1}</p>
        <p className="text-lg md:text-xl mb-8 font-semibold text-blue-600 dark:text-blue-400 drop-shadow-md">{c.subtitle2}</p>
        <a href="#contact" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg">
          {c.button}
        </a>
      </div>
    </section>
  );
};

export default Hero;
