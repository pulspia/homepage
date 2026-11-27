import React, { useState } from 'react';
import { addPost, uploadImage } from '../../utils/newsStorage';

const content = {
  ko: {
    formTitle: '새 게시글 작성',
    titleLabel: '제목',
    titlePlaceholder: '게시글 제목을 입력하세요',
    contentLabel: '내용',
    contentPlaceholder: '게시글 내용을 입력하세요',
    imageLabel: '이미지 (선택사항)',
    imageButton: '이미지 선택',
    imageSelected: '이미지 선택됨',
    imageUploading: '이미지 업로드 중...',
    submitButton: '작성하기',
    submitting: '작성 중...',
    successMessage: '게시글이 성공적으로 작성되었습니다!',
    errorAuth: '로그인이 필요합니다.',
    errorGeneral: '게시글 작성에 실패했습니다. 다시 시도해주세요.',
    errorImage: '이미지 업로드에 실패했습니다.',
  },
  en: {
    formTitle: 'Write New Post',
    titleLabel: 'Title',
    titlePlaceholder: 'Enter post title',
    contentLabel: 'Content',
    contentPlaceholder: 'Enter post content',
    imageLabel: 'Image (Optional)',
    imageButton: 'Select Image',
    imageSelected: 'Image Selected',
    imageUploading: 'Uploading Image...',
    submitButton: 'Submit',
    submitting: 'Submitting...',
    successMessage: 'Post created successfully!',
    errorAuth: 'Please log in first.',
    errorGeneral: 'Failed to create post. Please try again.',
    errorImage: 'Failed to upload image.',
  }
};

const NewsForm = ({ lang, onPostAdded }) => {
  const c = content[lang];
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        setStatus({ type: 'error', message: 'Please select an image file.' });
        return;
      }

      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Image size must be less than 5MB.' });
        return;
      }

      setImageFile(file);

      // 이미지 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      let imageUrl = null;

      // 이미지 업로드 (선택된 경우)
      if (imageFile) {
        setIsUploadingImage(true);
        const uploadResult = await uploadImage(imageFile);
        setIsUploadingImage(false);

        if (!uploadResult.success) {
          setStatus({ type: 'error', message: `${c.errorImage} ${uploadResult.error}` });
          setIsLoading(false);
          return;
        }

        imageUrl = uploadResult.url;
      }

      // 게시글 추가
      const result = await addPost({
        title: formData.title,
        content: formData.content,
        lang: lang,
        image_url: imageUrl,
      });

      if (result.success) {
        setStatus({ type: 'success', message: c.successMessage });
        setFormData({ title: '', content: '' });
        setImageFile(null);
        setImagePreview(null);

        // 부모 컴포넌트에 알림
        if (onPostAdded) {
          onPostAdded();
        }
      } else {
        if (result.error && result.error.includes('로그인')) {
          setStatus({ type: 'error', message: c.errorAuth });
        } else {
          setStatus({ type: 'error', message: `${c.errorGeneral} ${result.error || ''}` });
        }
      }
    } catch (error) {
      setStatus({ type: 'error', message: c.errorGeneral });
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {c.formTitle}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 제목 입력 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {c.titleLabel}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={c.titlePlaceholder}
            required
            disabled={isLoading}
            className="w-full p-3 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* 내용 입력 */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {c.contentLabel}
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder={c.contentPlaceholder}
            rows="6"
            required
            disabled={isLoading}
            className="w-full p-3 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {c.imageLabel}
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
            className="hidden"
          />
          <label
            htmlFor="image"
            className={`inline-block px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {imageFile ? c.imageSelected : c.imageButton}
          </label>

          {/* 이미지 미리보기 */}
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto max-h-64 rounded shadow-md"
              />
            </div>
          )}

          {/* 이미지 업로드 중 표시 */}
          {isUploadingImage && (
            <p className="mt-2 text-sm text-blue-500 dark:text-blue-400">
              {c.imageUploading}
            </p>
          )}
        </div>

        {/* 상태 메시지 */}
        {status.message && (
          <div className={`p-3 rounded ${
            status.type === 'success'
              ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200'
          }`}>
            {status.message}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
        >
          {isLoading ? c.submitting : c.submitButton}
        </button>
      </form>
    </div>
  );
};

export default NewsForm;
