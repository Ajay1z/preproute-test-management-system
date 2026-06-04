import apiClient from "./axios";
import { LoginRequest, LoginResponse } from "../types/auth";

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", payload);
    return response.data;
  }
};
