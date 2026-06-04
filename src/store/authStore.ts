import { create } from "zustand";
import { authApi } from "../api/authApi";
import { LoginRequest, User } from "../types/auth";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../utils/constants";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

const readStoredUser = (): User | null => {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(AUTH_TOKEN_KEY),
  user: readStoredUser(),
  isLoading: false,

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(payload);

      if (response.status !== "success" || !response.data?.token) {
        throw new Error(response.message || "Login failed");
      }

      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
      set({ token: response.data.token, user: response.data.user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    set({ token: null, user: null });
  }
}));
