import apiClient from "./api"
import type {
  Role,
  Permission,
  User,
  LaravelPaginatedResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AssignPermissionsToRoleRequest,
  AssignRoleToUserRequest,
  AssignPermissionsToUserRequest,
} from "@/types"

export const rbacService = {
  // Roles
  getRoles: async (page: number = 1): Promise<LaravelPaginatedResponse<Role>> => {
    const response = await apiClient.get<LaravelPaginatedResponse<Role>>(
      `/roles?page=${page}`
    )
    return response.data
  },

  getRoleById: async (id: number): Promise<Role> => {
    const response = await apiClient.get<Role>(`/roles/${id}`)
    return response.data
  },

  createRole: async (roleData: CreateRoleRequest): Promise<Role> => {
    const response = await apiClient.post<Role>("/roles", roleData)
    return response.data
  },

  updateRole: async (id: number, roleData: UpdateRoleRequest): Promise<Role> => {
    const response = await apiClient.put<Role>(`/roles/${id}`, roleData)
    return response.data
  },

  deleteRole: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/roles/${id}`)
    return response.data
  },

  assignPermissionsToRole: async (
    id: number,
    data: AssignPermissionsToRoleRequest
  ): Promise<Role> => {
    const response = await apiClient.post<Role>(`/roles/${id}/permissions`, data)
    return response.data
  },

  // Permissions
  getPermissions: async (page: number = 1): Promise<LaravelPaginatedResponse<Permission>> => {
    const response = await apiClient.get<LaravelPaginatedResponse<Permission>>(
      `/permissions?page=${page}`
    )
    return response.data
  },

  getPermissionById: async (id: number): Promise<Permission> => {
    const response = await apiClient.get<Permission>(`/permissions/${id}`)
    return response.data
  },

  createPermission: async (permissionData: CreatePermissionRequest): Promise<Permission> => {
    const response = await apiClient.post<Permission>("/permissions", permissionData)
    return response.data
  },

  updatePermission: async (
    id: number,
    permissionData: UpdatePermissionRequest
  ): Promise<Permission> => {
    const response = await apiClient.put<Permission>(`/permissions/${id}`, permissionData)
    return response.data
  },

  deletePermission: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/permissions/${id}`)
    return response.data
  },

  // User RBAC Management
  assignRoleToUser: async (
    userId: number,
    data: AssignRoleToUserRequest
  ): Promise<User> => {
    const response = await apiClient.post<User>(`/users/${userId}/assign-role`, data)
    return response.data
  },

  assignPermissionsToUser: async (
    userId: number,
    data: AssignPermissionsToUserRequest
  ): Promise<User> => {
    const response = await apiClient.post<User>(`/users/${userId}/permissions`, data)
    return response.data
  },
}

