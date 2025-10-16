import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const content = {
  ko: {
    title: '문의하기',
    name: '성함',
    email: '이메일',
    message: '문의 내용',
    button: '메시지 보내기',
    sending: '전송 중...',
    success: '메시지가 성공적으로 전송되었습니다!',
    error: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
  },
  en: {
    title: 'Contact Us',
    name: 'Your Name',
    email: 'Your Email',
    message: 'Your Message',
    button: 'Send Message',
    sending: 'Sending...',
    success: 'Message sent successfully!',
    error: 'Failed to send message. Please try again.',
  }
};

const Contact = ({ lang }) => {
  const c = content[lang];
  const form = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Initialize EmailJS
  useEffect(() => {
    // Initialize EmailJS with public key from environment variable
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    // Get form data
    const formData = new FormData(form.current);
    const messageData = {
      from_name: formData.get('from_name'),
      from_email: formData.get('from_email'),
      message: formData.get('message'),
      to_email: 'pulspia@gmail.com',
      timestamp: new Date().toLocaleString('ko-KR')
    };

    // Debug: Log the data being sent
    console.log('📧 전송할 데이터:', messageData);
    console.log('✉️ from_email 값:', messageData.from_email);

    // Real EmailJS sending
    emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      messageData,
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    ).then((result) => {
      console.log('이메일 전송 성공:', result.text);
      setStatus({ type: 'success', message: c.success });
      form.current.reset();
      setIsLoading(false);
    }).catch((error) => {
      console.error('이메일 전송 실패:', error);
      setStatus({ type: 'error', message: c.error });
      setIsLoading(false);
    });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{c.title}</h2>
        <form ref={form} onSubmit={sendEmail} className="max-w-xl mx-auto">
          <div className="mb-4">
            <input 
              type="text" 
              name="from_name"
              placeholder={c.name} 
              required
              className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="mb-4">
            <input 
              type="email" 
              name="from_email"
              placeholder={c.email} 
              required
              className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="mb-4">
            <textarea 
              name="message"
              placeholder={c.message} 
              rows="4" 
              required
              className="w-full p-3 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          {/* Status Message */}
          {status.message && (
            <div className={`mb-4 p-3 rounded ${
              status.type === 'success' 
                ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200'
            }`}>
              {status.message}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? c.sending : c.button}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
