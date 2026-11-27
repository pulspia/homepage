# Supabase 설정 가이드

Pulspia 홈페이지의 회사 뉴스 게시판을 Supabase로 전환하는 단계별 가이드입니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [데이터베이스 설정](#3-데이터베이스-설정)
4. [Storage 버킷 생성](#4-storage-버킷-생성)
5. [관리자 계정 생성](#5-관리자-계정-생성)
6. [테스트](#6-테스트)

---

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 가입
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 또는 Google 계정으로 가입

### 1.2 새 프로젝트 생성
1. Dashboard에서 "New Project" 클릭
2. 프로젝트 정보 입력:
   - **Name**: `jahalabs-homepage`
   - **Database Password**: 안전한 비밀번호 생성 및 저장 (나중에 필요!)
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Pricing Plan**: Free (무료) 선택
3. "Create new project" 클릭
4. 프로젝트 생성 대기 (약 2분 소요)

---

## 2. 환경 변수 설정

### 2.1 API 키 복사
프로젝트가 생성되면:
1. 좌측 메뉴에서 **Settings** (톱니바퀴 아이콘) 클릭
2. **API** 메뉴 클릭
3. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** 키: `eyJhbGc...` (긴 문자열)

### 2.2 .env 파일 업데이트
프로젝트 루트의 `.env` 파일을 열고 다음 값을 업데이트:

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 주의**:
- `YOUR_SUPABASE_URL_HERE`를 실제 Project URL로 교체
- `YOUR_SUPABASE_ANON_KEY_HERE`를 실제 anon public 키로 교체

### 2.3 개발 서버 재시작
환경 변수 변경 후 반드시 재시작:
```bash
# 터미널에서 Ctrl+C로 서버 종료 후
npm start
```

---

## 3. 데이터베이스 설정

### 3.1 SQL Editor 열기
1. Supabase Dashboard에서 **SQL Editor** 메뉴 클릭
2. **New query** 버튼 클릭

### 3.2 스키마 생성
1. `supabase-setup.sql` 파일의 내용을 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
4. "Success. No rows returned" 메시지 확인

### 3.3 테이블 확인
1. 좌측 메뉴에서 **Table Editor** 클릭
2. `news_posts` 테이블이 생성되었는지 확인
3. 컬럼 구조:
   - `id`: UUID (Primary Key)
   - `title`: 게시글 제목
   - `content`: 게시글 내용
   - `lang`: 언어 (ko/en)
   - `image_url`: 이미지 URL (선택사항)
   - `created_at`: 생성 시간
   - `updated_at`: 수정 시간
   - `author_id`: 작성자 ID

---

## 4. Storage 버킷 생성

이미지 업로드 기능을 위한 Storage 버킷을 생성합니다.

### 4.1 Storage 메뉴 열기
1. 좌측 메뉴에서 **Storage** 클릭
2. **Create a new bucket** 버튼 클릭

### 4.2 버킷 생성
1. **Bucket name**: `news-images`
2. **Public bucket**: ✅ 체크 (이미지를 공개적으로 접근 가능하게)
3. **File size limit**: `50MB` (기본값)
4. **Allowed MIME types**: 비워둠 (모든 이미지 타입 허용)
5. **Create bucket** 클릭

### 4.3 Storage 정책 설정 (자동)
Public 버킷으로 생성하면 다음 정책이 자동으로 적용됩니다:
- ✅ 읽기: 누구나 가능
- ✅ 업로드: 인증된 사용자만 가능
- ✅ 삭제: 파일 업로더만 가능

### 4.4 수동 정책 설정 (선택사항)
더 세밀한 제어가 필요한 경우:
1. Storage > **news-images** 버킷 클릭
2. **Policies** 탭 클릭
3. 필요한 정책 추가

---

## 5. 관리자 계정 생성

### 5.1 Authentication 설정
1. 좌측 메뉴에서 **Authentication** 클릭
2. **Users** 탭 클릭
3. **Add user** 버튼 클릭 (우측 상단, + 모양)

### 5.2 사용자 정보 입력
1. **Email**: `pulspia@gmail.com` (또는 원하는 이메일)
2. **Password**: 안전한 비밀번호 입력
3. **Auto Confirm User**: ✅ 체크 (이메일 확인 건너뛰기)
4. **Create user** 클릭

### 5.3 관리자 계정 확인
1. **Users** 목록에서 방금 생성한 계정 확인
2. **User UID** 복사 (나중에 필요할 수 있음)

---

## 6. 테스트

### 6.1 개발 서버 시작
```bash
npm start
```

### 6.2 로그인 테스트
1. 브라우저에서 http://localhost:3000/news 접속
2. 로그인 버튼 클릭
3. 관리자 계정으로 로그인:
   - Email: `admin@pulspia.com`
   - Password: 설정한 비밀번호

### 6.3 게시글 작성 테스트
1. 로그인 후 게시글 작성 폼 확인
2. 제목과 내용 입력
3. (선택) 이미지 업로드
4. "작성하기" 버튼 클릭
5. 게시글이 목록에 표시되는지 확인

### 6.4 이미지 업로드 테스트
1. 게시글 작성 시 이미지 파일 선택
2. 이미지가 업로드되고 미리보기가 표시되는지 확인
3. 게시글 저장 후 이미지가 제대로 표시되는지 확인

### 6.5 삭제 테스트
1. 게시글의 "삭제" 버튼 클릭
2. 게시글이 목록에서 제거되는지 확인

---

## 🔧 문제 해결

### "Supabase 환경 변수가 설정되지 않았습니다" 오류
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`REACT_APP_` 접두사 필수)
- 개발 서버를 재시작했는지 확인

### "Failed to fetch" 또는 "Network error"
- Supabase URL이 올바른지 확인
- 인터넷 연결 확인
- Supabase 프로젝트가 활성화되었는지 확인

### "Row Level Security policy violation"
- SQL 스크립트가 제대로 실행되었는지 확인
- RLS 정책이 활성화되었는지 확인
- 관리자 계정으로 로그인했는지 확인

### 이미지 업로드 실패
- Storage 버킷 `news-images`가 생성되었는지 확인
- 버킷이 Public으로 설정되었는지 확인
- 파일 크기가 50MB 이하인지 확인

---

## 📊 데이터 마이그레이션 (선택사항)

기존 localStorage 데이터를 Supabase로 옮기려면:

### 자동 마이그레이션 스크립트 (제공 예정)
```javascript
// 브라우저 콘솔에서 실행
// 기능 구현 예정
```

### 수동 마이그레이션
1. 기존 게시글을 수동으로 다시 작성
2. 이미지가 있다면 함께 업로드

---

## 🎉 완료!

모든 설정이 완료되었습니다. 이제 다음 기능을 사용할 수 있습니다:

✅ 안전한 관리자 인증
✅ 데이터베이스에 게시글 저장
✅ 이미지 업로드 및 표시
✅ 모든 사용자가 게시글 읽기 가능
✅ 관리자만 작성/수정/삭제 가능

---

## ⚠️ 중요: 무료 티어 자동 정지 방지

Supabase 무료 티어는 **7일간 활동이 없으면 자동으로 프로젝트를 일시 중지**합니다.

이를 방지하기 위해 자동화를 설정하세요:

### GitHub 사용자
- 매 6일마다 자동으로 Supabase에 ping을 보냅니다
- 완전 무료이며 수동 작업이 필요 없습니다
- 설정 방법: [SUPABASE-KEEPALIVE.md](SUPABASE-KEEPALIVE.md)

### 직접 호스팅 서버 사용자
- Linux/Mac Cron Job 또는 Windows Task Scheduler 사용
- Node.js PM2 서비스로 자동 스케줄링 가능
- 설정 방법: [SUPABASE-KEEPALIVE-SERVER.md](SUPABASE-KEEPALIVE-SERVER.md)

---

## 📚 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Keep-Alive 자동화 (GitHub)](SUPABASE-KEEPALIVE.md)
- [Keep-Alive 자동화 (직접 호스팅)](SUPABASE-KEEPALIVE-SERVER.md)
