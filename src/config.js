// 환경 변수 설정
// ✅ 이 파일의 모든 값은 클라이언트에 노출되어도 안전합니다.
// EmailJS Public Key는 클라이언트 측에서 사용하도록 설계되었으며,
// EmailJS 서비스에서 rate limiting과 도메인 제한으로 보호됩니다.

const config = {
  // EmailJS 설정 (Contact 폼에서 사용)
  emailjs: {
    serviceId: 'service_lz6ciiq',
    templateId: 'template_gl8ndns',
    publicKey: 'GS3Jau05r6XdU9n5a'
  }

  // 📌 참고: 회사 뉴스 게시판은 Supabase Authentication을 사용합니다.
  // 관리자 비밀번호는 Supabase에서 안전하게 관리되며,
  // 이 파일에는 노출되지 않습니다.
};

export default config;
