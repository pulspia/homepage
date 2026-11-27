-- ========================================
-- Supabase Storage 정책 설정
-- ========================================
-- news-images 버킷에 대한 RLS 정책을 설정합니다
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. news-images 버킷에 대한 정책 삭제 (기존 정책이 있을 경우)
-- ========================================
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- 2. 읽기 정책: 누구나 이미지를 볼 수 있음
-- ========================================
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

-- 3. 업로드 정책: 인증된 사용자만 이미지 업로드 가능
-- ========================================
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news-images'
  AND auth.uid() IS NOT NULL
);

-- 4. 수정 정책: 자신이 업로드한 이미지만 수정 가능
-- ========================================
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'news-images'
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'news-images'
  AND auth.uid() = owner
);

-- 5. 삭제 정책: 자신이 업로드한 이미지만 삭제 가능
-- ========================================
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'news-images'
  AND auth.uid() = owner
);

-- ========================================
-- 6. 관리자 정책 (선택사항)
-- ========================================
-- 관리자가 모든 이미지를 관리할 수 있도록 추가 정책
-- 아래 주석을 제거하고 pulspia@gmail.com을 실제 관리자 이메일로 변경하세요

/*
-- 관리자는 모든 이미지 업로드 가능
DROP POLICY IF EXISTS "Admins can upload any images" ON storage.objects;
CREATE POLICY "Admins can upload any images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news-images'
  AND auth.jwt()->>'email' = 'pulspia@gmail.com'
);

-- 관리자는 모든 이미지 수정 가능
DROP POLICY IF EXISTS "Admins can update any images" ON storage.objects;
CREATE POLICY "Admins can update any images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'news-images'
  AND auth.jwt()->>'email' = 'pulspia@gmail.com'
)
WITH CHECK (
  bucket_id = 'news-images'
  AND auth.jwt()->>'email' = 'pulspia@gmail.com'
);

-- 관리자는 모든 이미지 삭제 가능
DROP POLICY IF EXISTS "Admins can delete any images" ON storage.objects;
CREATE POLICY "Admins can delete any images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'news-images'
  AND auth.jwt()->>'email' = 'pulspia@gmail.com'
);
*/

-- ========================================
-- 완료!
-- ========================================
-- 이제 로그인한 사용자는 이미지를 업로드할 수 있습니다.
-- 관리자는 모든 이미지를 관리할 수 있습니다 (주석 제거 후).
