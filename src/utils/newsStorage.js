// Supabase를 사용한 회사 뉴스 게시판 데이터 관리
import { supabase } from '../lib/supabaseClient';

/**
 * 모든 게시글 조회
 * @returns {Promise<Array>} 게시글 배열 (최신순)
 */
export const getPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('게시글 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('게시글 조회 실패:', error);
    return [];
  }
};

/**
 * 새 게시글 추가
 * @param {Object} post - 게시글 객체 { title, content, lang, image_url }
 * @returns {Promise<Object>} { success: boolean, data?: object, error?: string }
 */
export const addPost = async (post) => {
  try {
    // 현재 로그인한 사용자 가져오기
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const newPost = {
      title: post.title,
      content: post.content,
      lang: post.lang || 'ko',
      image_url: post.image_url || null,
      author_id: user.id,
    };

    const { data, error } = await supabase
      .from('news_posts')
      .insert([newPost])
      .select()
      .single();

    if (error) {
      console.error('게시글 작성 실패:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('게시글 작성 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 게시글 삭제
 * @param {string} postId - 삭제할 게시글 ID (UUID)
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export const deletePost = async (postId) => {
  try {
    const { error } = await supabase
      .from('news_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('게시글 삭제 실패:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 이미지 업로드
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<Object>} { success: boolean, url?: string, error?: string }
 */
export const uploadImage = async (file) => {
  try {
    // 파일 이름 생성 (중복 방지)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // Storage에 업로드
    const { data, error } = await supabase.storage
      .from('news-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('이미지 업로드 실패:', error);
      return { success: false, error: error.message };
    }

    // Public URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('news-images')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 이미지 삭제
 * @param {string} imageUrl - 삭제할 이미지 URL
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export const deleteImage = async (imageUrl) => {
  try {
    // URL에서 파일 경로 추출
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage
      .from('news-images')
      .remove([filePath]);

    if (error) {
      console.error('이미지 삭제 실패:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    return { success: false, error: error.message };
  }
};
