import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceContent = ({ lang, selectedService }) => {
  const navigate = useNavigate();

  const content = {
    ko: {
      'ai-mbti': {
        title: 'AI MBTI 테스트',
        subtitle: '20개의 질문으로 나의 성격 유형을 알아보세요',
        loading: '서비스를 불러오는 중...'
      },
      'img-gen': {
        title: '미니 이미지 생성기',
        subtitle: '한국어로 설명하면 AI가 이미지를 생성합니다',
        loading: '서비스를 불러오는 중...'
      },
      default: {
        title: '서비스 선택',
        subtitle: '왼쪽에서 서비스를 선택해주세요',
        message: '다양한 AI 서비스를 경험해보세요.'
      }
    },
    en: {
      'ai-mbti': {
        title: 'AI MBTI Test',
        subtitle: 'Discover your personality type with 20 questions',
        loading: 'Loading service...'
      },
      'img-gen': {
        title: 'Mini Image Generator',
        subtitle: 'AI generates images from Korean descriptions',
        loading: 'Loading service...'
      },
      default: {
        title: 'Select a Service',
        subtitle: 'Please select a service from the left',
        message: 'Experience various AI services.'
      }
    }
  };

  const currentContent = content[lang][selectedService] || content[lang].default;

  // useEffect for navigation to avoid render-time side effects
  useEffect(() => {
    if (selectedService === 'ai-mbti') {
      navigate('/services/mbti');
    } else if (selectedService === 'img-gen') {
      navigate('/services/img-gen');
    }
  }, [selectedService, navigate]);

  // Return null during navigation
  if (selectedService === 'ai-mbti' || selectedService === 'img-gen') {
    return null;
  }

  // Default view when no service is selected
  return (
    <main className="flex-1 bg-white dark:bg-gray-900 overflow-auto">
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            {currentContent.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {currentContent.subtitle}
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            {currentContent.message}
          </p>
        </div>
      </div>
    </main>
  );
};

export default ServiceContent;
