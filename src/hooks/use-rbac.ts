import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { rbacService } from "@/services/rbac"
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AssignPermissionsToRoleRequest,
  AssignRoleToUserRequest,
  AssignPermissionsToUserRequest,
} from "@/types"

// Roles hooks
export function useRoles(page: number = 1) {
  return useQuery({
    queryKey: ["roles", page],
    queryFn: () => rbacService.getRoles(page),
  })
}

export function useRole(id: number) {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => rbacService.getRoleById(id),
    enabled: !!id,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => rbacService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleRequest }) =>
      rbacService.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      queryClient.invalidateQueries({ queryKey: ["role", variables.id] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => rbacService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useAssignPermissionsToRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignPermissionsToRoleRequest }) =>
      rbacService.assignPermissionsToRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      queryClient.invalidateQueries({ queryKey: ["role", variables.id] })
    },
  })
}

// Permissions hooks
export function usePermissions(page: number = 1) {
  return useQuery({
    queryKey: ["permissions", page],
    queryFn: () => rbacService.getPermissions(page),
  })
}

export function usePermission(id: number) {
  return useQuery({
    queryKey: ["permission", id],
    queryFn: () => rbacService.getPermissionById(id),
    enabled: !!id,
  })
}

export function useCreatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePermissionRequest) => rbacService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermissionRequest }) =>
      rbacService.updatePermission(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
      queryClient.invalidateQueries({ queryKey: ["permission", variables.id] })
    },
  })
}

export function useDeletePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => rbacService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] })
    },
  })
}

// User RBAC hooks
export function useAssignRoleToUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: AssignRoleToUserRequest }) =>
      rbacService.assignRoleToUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] })
    },
  })
}

export function useAssignPermissionsToUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: number
      data: AssignPermissionsToUserRequest
    }) => rbacService.assignPermissionsToUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] })
    },
  })
}

