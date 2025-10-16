import React from 'react';
import { Cpu, Database, BrainCircuit, Heart, Eye } from 'lucide-react';

const content = {
  ko: {
    title: '핵심 서비스',
    services: [
      {
        icon: <Heart size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: 'AI 헬스케어 서비스',
        description: 'AI 모델링을 통해 건강한 삶을 영위할 수 있도록 자신의 건강지표를 모니터링하고 관리할 수 있는 서비스를 제공합니다.',
      },
      {
        icon: <Eye size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: '머신 비전 서비스',
        description: '카메라 영상 또는 동영상을 AI로 분석하여 워크플로우나 프로세스를 inspection하고 개선할 수 있는 서비스를 제공합니다.',
      },
      {
        icon: <Cpu size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: 'AI 소프트웨어 개발',
        description: '고객의 비즈니스 요구에 맞춘 머신러닝 모델, 지능형 자동화 등 맞춤형 AI 솔루션을 개발합니다.',
      },
      {
        icon: <Database size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: '데이터 분석 및 인사이트',
        description: '데이터의 잠재력을 최대한 활용하세요. 심층 분석, 시각화 및 실행 가능한 인사이트를 제공합니다.',
      },
      {
        icon: <BrainCircuit size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: '머신러닝 모델',
        description: '예측, 분류 등 다양한 목적을 위한 강력한 머신러닝 모델을 개발하고 배포합니다.',
      },
    ]
  },
  en: {
    title: 'Our Core Services',
    services: [
      {
        icon: <Heart size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: 'AI Healthcare Services',
        description: 'We provide AI modeling services to help you monitor and manage your health indicators for a healthier life.',
      },
      {
        icon: <Eye size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: 'Machine Vision Services',
        description: 'We analyze camera images or videos with AI to inspect and improve your workflows and processes.',
      },
      {
        icon: <Cpu size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: 'AI Software Development',
        description: 'We develop custom AI solutions, including machine learning models and intelligent automation, tailored to your business needs.',
      },
      {
        icon: <Database size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: 'Data Analysis & Insights',
        description: 'Unlock the full potential of your data. We provide in-depth analysis, visualization, and actionable insights.',
      },
      {
        icon: <BrainCircuit size={48} className="mb-4 text-blue-500 dark:text-blue-400" />,
        title: 'Machine Learning Models',
        description: 'We develop and deploy robust machine learning models for various purposes such as prediction and classification.',
      },
    ]
  }
};

const Services = ({ lang }) => {
  const c = content[lang];
  return (
    <section id="services" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-12">{c.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {c.services.map((service, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-gray-700 dark:text-gray-300 transform hover:-translate-y-2 transition-transform duration-300">
              {service.icon}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
