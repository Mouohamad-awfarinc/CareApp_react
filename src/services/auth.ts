import apiClient from "./api"
import type { LoginRequest, RegisterRequest, AuthResponse, LogoutResponse, User } from "@/types"

export const authService = {
  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/register", userData)
    return response.data
  },

  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/login", credentials)
    return response.data
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/user")
    return response.data
  },

  // Logout user
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/logout", {})
    return response.data
  },

  // Helper methods for token management
  getToken: (): string | null => {
    return localStorage.getItem("auth_token")
  },

  setToken: (token: string) => {
    localStorage.setItem("auth_token", token)
  },

  removeToken: () => {
    localStorage.removeItem("auth_token")
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  setUser: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user))
  },

  removeUser: () => {
    localStorage.removeItem("user")
  },

  clearAuth: () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  },
}

