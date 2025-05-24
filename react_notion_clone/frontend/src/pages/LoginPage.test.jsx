import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import LoginPage from './LoginPage';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { server } from '../mocks/server'; // MSW server
import { http, HttpResponse } from 'msw'; // For overriding handlers if needed

const theme = createTheme();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


// Mock component to verify navigation
const HomePageMock = () => {
  const { user } = useAuth();
  return <div data-testid="homepage">Welcome, {user?.username}</div>;
};

describe('LoginPage Integration Test', () => {
  beforeEach(() => {
    localStorageMock.clear(); // Clear localStorage before each test
    server.resetHandlers(); // Reset MSW handlers
    // Ensure default successful login handler is active
    server.use(
      http.post('http://localhost:5000/api/auth/login', async ({ request }) => {
        const { username } = await request.json();
        if (username === 'testuser') {
          return HttpResponse.json({ 
            token: 'fake-jwt-token', 
            user: { id: '1', username: 'testuser', created_at: new Date().toISOString() } 
          });
        }
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 400 });
      })
    );
  });

  const renderLoginPageWithProviders = () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<HomePageMock />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  it('should allow a user to log in and redirect to homepage', async () => {
    renderLoginPageWithProviders();
    const user = userEvent.setup();

    // Check initial state (optional)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();

    // Fill in the form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for navigation and check for homepage content
    await waitFor(() => {
      expect(screen.getByTestId('homepage')).toBeInTheDocument();
    });
    expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();

    // Check if token and user were stored in localStorage
    expect(localStorageMock.getItem('token')).toBe('fake-jwt-token');
    expect(JSON.parse(localStorageMock.getItem('user')).username).toBe('testuser');
  });

  it('should display an error message for invalid credentials', async () => {
    // Override MSW handler for this specific test to simulate login failure
    server.use(
      http.post('http://localhost:5000/api/auth/login', () => {
        return HttpResponse.json({ message: 'Invalid username or password' }, { status: 400 });
      })
    );
    
    renderLoginPageWithProviders();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/username/i), 'wronguser');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
    });
    
    // Ensure no navigation occurred / still on login page
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(localStorageMock.getItem('token')).toBeNull();
  });

  it('should display an error if username or password is not provided', async () => {
    renderLoginPageWithProviders();
    const user = userEvent.setup();

    // Only fill username
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username and password are required./i)).toBeInTheDocument();
    });
  });
});
