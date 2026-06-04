export interface User {
  id: string;
  name: string;
  role: string;
  userId: string;
}

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  status: "success" | "error";
  message: string;
  data?: {
    token: string;
    user: User;
  };
}
