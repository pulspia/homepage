import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLogin from '../../components/Auth/AdminLogin';
import { supabase } from '../../lib/supabaseClient';

// Mock Supabase
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('AdminLogin Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders login form with email and password inputs', () => {
    render(<AdminLogin />);

    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  test('renders with Korean language by default', () => {
    render(<AdminLogin />);

    expect(screen.getByText('관리자 로그인')).toBeInTheDocument();
    expect(screen.getByText('게시글 작성 및 관리를 위해 로그인하세요')).toBeInTheDocument();
  });

  test('renders with English language when lang prop is "en"', () => {
    render(<AdminLogin lang="en" />);

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByText('Please log in to create and manage posts')).toBeInTheDocument();
  });

  test('updates email and password inputs when user types', () => {
    render(<AdminLogin />);

    const emailInput = screen.getByPlaceholderText('admin@pulspia.com');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('testpassword');
  });

  test('shows loading state when submitting form', async () => {
    // Mock a delayed response
    supabase.auth.signInWithPassword.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: { user: { email: 'test@example.com' } }, error: null }), 100)
      )
    );

    render(<AdminLogin />);

    const emailInput = screen.getByPlaceholderText('admin@pulspia.com');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
    const loginButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    // Check loading state
    expect(await screen.findByText('로그인 중...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();

    // Wait for login to complete
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'testpassword',
      });
    });
  });

  test('shows error message on invalid credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' },
    });

    render(<AdminLogin />);

    const emailInput = screen.getByPlaceholderText('admin@pulspia.com');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
    const loginButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    });
  });

  test('calls onLoginSuccess callback on successful login', async () => {
    const mockOnLoginSuccess = jest.fn();
    const mockUser = { email: 'test@example.com', id: '123' };

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByPlaceholderText('admin@pulspia.com');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
    const loginButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  test('shows general error message on unexpected error', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Network error' },
    });

    render(<AdminLogin />);

    const emailInput = screen.getByPlaceholderText('admin@pulspia.com');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
    const loginButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('로그인 중 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  test('disables form inputs while loading', async () => {
    supabase.auth.signInWithPassword.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: { user: { email: 'test@example.com' } }, error: null }), 100)
      )
    );

    render(<AdminLogin />);

    const emailInput = screen.getByPlaceholderText('admin@pulspia.com');
    const passwordInput = screen.getByPlaceholderText('비밀번호를 입력하세요');
    const loginButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(loginButton).toBeDisabled();
    });
  });
});
