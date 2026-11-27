import React, { useState } from 'react';
import { deletePost, deleteImage } from '../../utils/newsStorage';

const content = {
  ko: {
    noPostsYet: '아직 게시글이 없습니다.',
    clickToExpand: '클릭하여 전체 내용 보기',
    deleteButton: '삭제',
    deleteConfirm: '이 게시글을 삭제하시겠습니까?',
    deleteSuccess: '게시글이 삭제되었습니다.',
    deleteError: '삭제에 실패했습니다.',
    deleting: '삭제 중...',
    confirmButton: '확인',
    cancelButton: '취소',
  },
  en: {
    noPostsYet: 'No posts yet.',
    clickToExpand: 'Click to view full content',
    deleteButton: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this post?',
    deleteSuccess: 'Post deleted successfully.',
    deleteError: 'Failed to delete post.',
    deleting: 'Deleting...',
    confirmButton: 'Confirm',
    cancelButton: 'Cancel',
  }
};

const NewsList = ({ posts, lang, onPostDeleted, user }) => {
  const c = content[lang];
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ postId: null, message: '', type: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpand = (postId) => {
    setExpandedId(expandedId === postId ? null : postId);
  };

  const handleDeleteClick = (e, postId) => {
    e.stopPropagation(); // 게시글 확장 방지
    setDeletingId(postId);
    setDeleteStatus({ postId: null, message: '', type: '' });
  };

  const handleDeleteConfirm = async (e, post) => {
    e.stopPropagation();
    setIsDeleting(true);

    try {
      // 이미지가 있으면 먼저 삭제
      if (post.image_url) {
        await deleteImage(post.image_url);
      }

      // 게시글 삭제
      const result = await deletePost(post.id);

      if (result.success) {
        setDeleteStatus({ postId: post.id, message: c.deleteSuccess, type: 'success' });
        setDeletingId(null);

        // 부모 컴포넌트에 알림
        if (onPostDeleted) {
          setTimeout(() => {
            onPostDeleted();
            setDeleteStatus({ postId: null, message: '', type: '' });
          }, 1000);
        }
      } else {
        setDeleteStatus({ postId: post.id, message: c.deleteError + ' ' + result.error, type: 'error' });
      }
    } catch (error) {
      setDeleteStatus({ postId: post.id, message: c.deleteError, type: 'error' });
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = (e) => {
    e.stopPropagation();
    setDeletingId(null);
    setDeleteStatus({ postId: null, message: '', type: '' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (lang === 'ko') {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">{c.noPostsYet}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
          onClick={() => toggleExpand(post.id)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex-1">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(post.created_at)}
                </span>
                {/* 로그인한 사용자만 삭제 버튼 표시 */}
                {user && (
                  <button
                    onClick={(e) => handleDeleteClick(e, post.id)}
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  >
                    {c.deleteButton}
                  </button>
                )}
              </div>
            </div>

            {/* 이미지 표시 */}
            {post.image_url && expandedId === post.id && (
              <div className="mt-4 mb-4">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="max-w-full h-auto rounded shadow-md"
                  loading="lazy"
                />
              </div>
            )}

            {expandedId === post.id ? (
              <div className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {post.content}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {post.content}
              </p>
            )}

            {/* 삭제 확인 UI */}
            {deletingId === post.id && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded border-2 border-red-500" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {c.deleteConfirm}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleDeleteConfirm(e, post)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
                  >
                    {isDeleting ? c.deleting : c.confirmButton}
                  </button>
                  <button
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white rounded font-medium transition-colors"
                  >
                    {c.cancelButton}
                  </button>
                </div>
              </div>
            )}

            {/* 삭제 상태 메시지 */}
            {deleteStatus.postId === post.id && deleteStatus.message && (
              <div className={`mt-4 p-3 rounded ${
                deleteStatus.type === 'success'
                  ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200'
              }`}>
                {deleteStatus.message}
              </div>
            )}

            {deletingId !== post.id && (
              <div className="mt-4 text-sm text-blue-500 dark:text-blue-400 hover:underline">
                {expandedId === post.id ? '▲ 접기' : '▼ ' + c.clickToExpand}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsList;
