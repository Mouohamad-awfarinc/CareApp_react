import apiClient from "./api"
import type { User, LaravelPaginatedResponse, CreateUserRequest, UpdateUserRequest } from "@/types"

export const usersService = {
  // Get all users with pagination (Laravel format)
  getUsers: async (
    page: number = 1,
    filters?: {
      search?: string
      role_id?: number | null
      status?: string | null
    }
  ): Promise<LaravelPaginatedResponse<User>> => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    
    if (filters?.search && filters.search !== "") {
      params.append("search", filters.search)
    }
    
    if (filters?.role_id !== undefined && filters.role_id !== null) {
      params.append("role_id", filters.role_id.toString())
    }
    
    if (filters?.status !== undefined && filters.status !== null && filters.status !== "all") {
      params.append("status", filters.status)
    }
    
    const response = await apiClient.get<LaravelPaginatedResponse<User>>(
      `/users?${params.toString()}`
    )
    return response.data
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`)
    return response.data
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>("/users", userData)
    return response.data
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, userData)
    return response.data
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}

