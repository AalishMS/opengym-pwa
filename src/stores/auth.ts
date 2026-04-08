import { create } from 'zustand';
import Cookies from 'js-cookie';
import { api } from '@/lib/api/http';
import type { AuthResponse, User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  checkAuth: () => void;
}

const TOKEN_KEY = 'opengym_access_token';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    const { access_token } = response.data;
    
    Cookies.set(TOKEN_KEY, access_token, { expires: 7, sameSite: 'Lax' });
    
    set({
      user: { id: 'unknown', email },
      isAuthenticated: true
    });
  },

  logout: () => {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem('opengym.accessToken');
    set({ user: null, isAuthenticated: false });
  },

  register: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password });
    const { access_token } = response.data;
    
    Cookies.set(TOKEN_KEY, access_token, { expires: 7, sameSite: 'Lax' });
    
    set({
      user: { id: 'unknown', email },
      isAuthenticated: true
    });
  },

  checkAuth: () => {
    const token = Cookies.get(TOKEN_KEY) || localStorage.getItem('opengym.accessToken');
    if (token) {
      set({ isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  }
}));
