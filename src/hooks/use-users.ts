import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersService } from "@/services/users"
import type { UpdateUserRequest } from "@/types"

export function useUsers(
  page: number = 1,
  filters?: {
    search?: string
    role_id?: number | null
    status?: string | null
  }
) {
  return useQuery({
    queryKey: ["users", page, filters],
    queryFn: () => usersService.getUsers(page, filters),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      usersService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

