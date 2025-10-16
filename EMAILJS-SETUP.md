# EmailJS 설정 가이드

현재 문의 폼은 **데모 모드**로 작동하며, 메시지는 브라우저 콘솔에 로그됩니다.
실제 이메일 전송을 활성화하려면 다음 단계를 따라하세요.

## 1. EmailJS 계정 생성
1. [emailjs.com](https://www.emailjs.com) 방문
2. 무료 계정 생성 (월 200개 이메일 무료)

## 2. Gmail 서비스 설정
1. Dashboard → Email Services → Add New Service
2. Gmail 선택 → Google 계정으로 연결
3. Service ID 복사 (예: `service_abc123`)

## 3. 이메일 템플릿 생성
1. Dashboard → Email Templates → Create New Template
2. 템플릿 내용 설정:
   ```
   Subject: 홈페이지 문의 - {{from_name}}
   
   From: {{from_name}} ({{from_email}})
   
   Message:
   {{message}}
   
   ---
   Sent from JAHA LABS Homepage
   ```
3. Template ID 복사 (예: `template_def456`)
4. **To Email**을 `pulspia@gmail.com`으로 설정

## 4. Public Key 확인
1. Dashboard → Account → General
2. Public Key 복사 (예: `abc123def456`)

## 5. 환경 변수 설정
`.env` 파일에서 다음 주석을 해제하고 실제 값으로 변경:
```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id  
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

## 6. 코드 활성화
`src/components/Contact/Contact.js`에서:
1. 라인 77-91의 주석 해제
2. 라인 55-92의 setTimeout 코드를 주석 처리하거나 삭제

## 테스트
1. `npm start`로 개발 서버 실행
2. 문의 폼 작성 후 전송
3. `pulspia@gmail.com`에서 이메일 확인

## 현재 상태
- ✅ UI 완료
- ✅ 폼 검증 완료  
- ✅ 로딩 상태 완료
- ✅ 성공/실패 메시지 완료
- ✅ 데모 모드 (콘솔 로깅)
- ⏳ 실제 이메일 전송 (설정 필요)

데모 모드에서도 모든 기능이 정상적으로 작동하며, 개발자 콘솔에서 전송될 메시지를 확인할 수 있습니다.