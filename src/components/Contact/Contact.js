import React, { useState } from 'react';
import { Mail, Send, Copy, Check } from 'lucide-react';

const CONTACT_EMAIL = 'pulspia@gmail.com';

const content = {
  ko: {
    title: '문의하기',
    description: '궁금한 점은 이메일로 보내주세요.',
    mailApp: '메일 쓰기',
    gmail: 'Gmail로 쓰기',
    copy: '주소 복사',
    copied: '복사되었습니다',
    copyError: '복사하지 못했습니다. 위 주소를 직접 선택해 복사해주세요.',
    subject: '[Pulspia 문의]',
    body: '성함:\r\n회사/소속:\r\n문의 내용:\r\n',
  },
  en: {
    title: 'Contact Us',
    description: 'Send us your questions by email.',
    mailApp: 'Write Email',
    gmail: 'Write with Gmail',
    copy: 'Copy Address',
    copied: 'Copied',
    copyError: 'Could not copy. Please select the address above and copy it.',
    subject: '[Pulspia Inquiry]',
    body: 'Name:\r\nCompany:\r\nMessage:\r\n',
  }
};

const primaryButton =
  'inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105';
const secondaryButton =
  'inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105';

const Contact = ({ lang }) => {
  const c = content[lang];
  const [copyStatus, setCopyStatus] = useState('idle');

  const subject = encodeURIComponent(c.subject);
  const body = encodeURIComponent(c.body);
  const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${subject}&body=${body}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      setCopyStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{c.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{c.description}</p>
        <p className="text-2xl font-semibold text-gray-800 dark:text-white mb-8 select-all break-all">
          {CONTACT_EMAIL}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a href={mailtoUrl} className={primaryButton}>
            <Mail size={18} />
            {c.mailApp}
          </a>
          <a href={gmailUrl} target="_blank" rel="noopener noreferrer" className={primaryButton}>
            <Send size={18} />
            {c.gmail}
          </a>
          <button type="button" onClick={copyEmail} className={secondaryButton}>
            {copyStatus === 'copied' ? <Check size={18} /> : <Copy size={18} />}
            {copyStatus === 'copied' ? c.copied : c.copy}
          </button>
        </div>
        {copyStatus === 'error' && (
          <p role="alert" className="mt-4 text-red-600 dark:text-red-300">{c.copyError}</p>
        )}
      </div>
    </section>
  );
};

export default Contact;
