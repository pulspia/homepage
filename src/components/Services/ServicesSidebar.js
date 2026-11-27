import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const ServicesSidebar = ({ lang, selectedService, onSelectService }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const services = {
    ko: [
      {
        id: 'ai-mbti',
        name: 'AI MBTI 테스트',
        description: '20개 질문으로 알아보는 성격 유형',
        icon: '🎯'
      },
      {
        id: 'img-gen',
        name: '미니 이미지 생성기',
        description: '한국어로 설명하면 AI가 이미지를 생성',
        icon: '🎨'
      }
    ],
    en: [
      {
        id: 'ai-mbti',
        name: 'AI MBTI Test',
        description: 'Personality test with 20 questions',
        icon: '🎯'
      },
      {
        id: 'img-gen',
        name: 'Mini Image Generator',
        description: 'AI generates images from Korean descriptions',
        icon: '🎨'
      }
    ]
  };

  const currentServices = services[lang];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-20 left-4 z-50 md:hidden p-2 bg-blue-500 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-72 bg-gray-100 dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto
        `}
        style={{ marginTop: '64px' }} // Header height offset
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {lang === 'ko' ? '서비스 목록' : 'Services'}
          </h2>

          <div className="space-y-3">
            {currentServices.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  onSelectService(service.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full text-left p-4 rounded-lg
                  transition-all duration-200
                  ${
                    selectedService === service.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                    <p
                      className={`text-sm ${
                        selectedService === service.id
                          ? 'text-blue-100'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {lang === 'ko'
                ? '더 많은 AI 서비스가 곧 추가될 예정입니다.'
                : 'More AI services coming soon.'}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          style={{ marginTop: '64px' }}
        />
      )}
    </>
  );
};

export default ServicesSidebar;
