import axios, { AxiosError } from "axios"
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as Record<string, unknown>
      
      // Get the config to check the endpoint
      const config = error.config as InternalAxiosRequestConfig & { url?: string }
      const isLoginOrRegister = config?.url?.includes('/login') || config?.url?.includes('/register')

      // Handle unauthorized errors
      if (status === 401) {
        // Only redirect to unauthorized page if it's not a login/register attempt
        // For login/register failures, let the component handle the error
        if (!isLoginOrRegister) {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user")
          window.location.href = "/unauthorized"
        }
      }

      // Handle not found
      if (status === 404) {
        console.error("Resource not found")
      }

      // Handle forbidden
      if (status === 403) {
        console.error("Access forbidden")
      }

      // Handle server errors
      if (status >= 500) {
        console.error("Server error occurred")
      }

      // Transform Laravel validation errors into a more user-friendly format
      if (status === 422 && data.errors && typeof data.errors === 'object') {
        // Extract first error message from validation errors
        const errors = data.errors as Record<string, string[]>
        const firstErrorKey = Object.keys(errors)[0]
        const firstErrorMessage = errors[firstErrorKey]?.[0] || 
          (typeof data.message === 'string' ? data.message : "Validation failed")
        error.message = firstErrorMessage
      } else if (typeof data.message === 'string') {
        // Use the message from the response
        error.message = data.message
      }
    } else if (error.request) {
      // Request was made but no response received
      error.message = "Network error - no response received"
      console.error("Network error - no response received")
    }

    return Promise.reject(error)
  }
)

export default apiClient

