-- ========================================
-- JAHA LABS 회사 뉴스 게시판 설정
-- ========================================
-- 이 SQL 파일을 Supabase SQL Editor에서 실행하세요
-- Supabase Dashboard > SQL Editor > New query

-- 1. news_posts 테이블 생성
-- ========================================
CREATE TABLE IF NOT EXISTS public.news_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  lang VARCHAR(5) DEFAULT 'ko',
  image_url TEXT, -- 이미지 URL (선택사항)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 검색을 위한 인덱스
  CONSTRAINT title_not_empty CHECK (char_length(title) > 0),
  CONSTRAINT content_not_empty CHECK (char_length(content) > 0)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_news_posts_created_at ON public.news_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_posts_lang ON public.news_posts(lang);
CREATE INDEX IF NOT EXISTS idx_news_posts_author ON public.news_posts(author_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_news_posts_updated_at ON public.news_posts;
CREATE TRIGGER update_news_posts_updated_at
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. RLS (Row Level Security) 활성화
-- ========================================
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- 3. Data API GRANT (Supabase Oct 30, 2026 보안 정책 변경 대응)
-- ========================================
GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO service_role;

-- 4. RLS 정책 설정
-- ========================================

-- 읽기: 누구나 게시글을 읽을 수 있음
DROP POLICY IF EXISTS "Anyone can read news posts" ON public.news_posts;
CREATE POLICY "Anyone can read news posts"
ON public.news_posts
FOR SELECT
USING (true);

-- 작성: 인증된 사용자만 게시글 작성 가능
DROP POLICY IF EXISTS "Authenticated users can insert news posts" ON public.news_posts;
CREATE POLICY "Authenticated users can insert news posts"
ON public.news_posts
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 수정: 자신이 작성한 게시글만 수정 가능
DROP POLICY IF EXISTS "Users can update own posts" ON public.news_posts;
CREATE POLICY "Users can update own posts"
ON public.news_posts
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 삭제: 자신이 작성한 게시글만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own posts" ON public.news_posts;
CREATE POLICY "Users can delete own posts"
ON public.news_posts
FOR DELETE
USING (auth.uid() = author_id);

-- 5. 테스트 데이터 (선택사항)
-- ========================================
-- 관리자 계정으로 로그인한 후에 사용 가능
-- 아래 주석을 제거하고 실행하면 샘플 게시글이 생성됩니다

/*
INSERT INTO public.news_posts (title, content, lang, author_id)
VALUES
  ('JAHA LABS 설립', 'JAHA LABS가 AI 솔루션 전문 기업으로 설립되었습니다.', 'ko', auth.uid()),
  ('Company Founded', 'JAHA LABS has been established as an AI solutions company.', 'en', auth.uid());
*/

-- 6. 관리자 계정 이메일 확인
-- ========================================
-- 관리자 계정의 이메일을 확인하려면:
-- SELECT email FROM auth.users;

-- 특정 사용자만 모든 게시글을 수정/삭제할 수 있도록 추가 정책 (선택사항)
-- 아래 주석을 제거하고 pulspia@gmail.com을 실제 관리자 이메일로 변경하세요


-- 관리자는 모든 게시글 수정 가능
DROP POLICY IF EXISTS "Admins can update all posts" ON public.news_posts;
CREATE POLICY "Admins can update all posts"
ON public.news_posts
FOR UPDATE
USING (
  auth.jwt()->>'email' = 'pulspia@gmail.com'
);

-- 관리자는 모든 게시글 삭제 가능
DROP POLICY IF EXISTS "Admins can delete all posts" ON public.news_posts;
CREATE POLICY "Admins can delete all posts"
ON public.news_posts
FOR DELETE
USING (
  auth.jwt()->>'email' = 'pulspia@gmail.com'
);


-- ========================================
-- 완료!
-- ========================================
-- 다음 단계:
-- 1. Supabase Dashboard > Authentication > Users 에서 관리자 계정 생성
--    이메일: pulspia@gmail.com (또는 원하는 이메일)
--    비밀번호: 안전한 비밀번호 설정
--
-- 2. Storage 버킷 생성 (이미지 업로드용)
--    - Supabase Dashboard > Storage > Create a new bucket
--    - Bucket name: news-images
--    - Public bucket: Yes (이미지를 공개적으로 접근 가능하게)
