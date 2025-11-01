import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authService } from "@/services/auth"
import { useNavigate } from "react-router-dom"
import type { LoginRequest, RegisterRequest } from "@/types"

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      authService.setToken(data.token)
      authService.setUser(data.user)
      queryClient.setQueryData(["currentUser"], data.user)
      navigate("/dashboard")
    },
  })

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      authService.setToken(data.token)
      authService.setUser(data.user)
      queryClient.setQueryData(["currentUser"], data.user)
      navigate("/dashboard")
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      authService.clearAuth()
      queryClient.clear()
      navigate("/login")
    },
    onError: () => {
      // Even if logout fails on server, clear local storage
      authService.clearAuth()
      queryClient.clear()
      navigate("/login")
    },
  })

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: !!authService.getToken(),
    retry: false,
    initialData: authService.getUser(),
  })

  const isAuthenticated = !!authService.getToken()

  return {
    // Mutations
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    
    // States
    user: currentUser,
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    isAuthenticated,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}

