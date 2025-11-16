const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

import { errorLogger } from "./error-logger"

export async function checkBackendHealth(): Promise<{
  isReachable: boolean
  error?: string
  corsIssue?: boolean
  currentOrigin?: string
}> {
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "unknown"

  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    })

    if (response.ok) {
      return { isReachable: true, currentOrigin }
    }

    return {
      isReachable: false,
      error: `Backend returned status ${response.status}`,
      currentOrigin,
    }
  } catch (error: any) {
    const isCorsError = error.message === "Failed to fetch" || error.name === "TypeError"

    return {
      isReachable: false,
      error: error.message,
      corsIssue: isCorsError,
      currentOrigin,
    }
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorData: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("token")
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) return null

    try {
      const response = await fetch(`${this.baseUrl}/api/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("token", data.token)
        return data.token
      }
    } catch (error) {
      console.error("[v0] Token refresh failed:", error)
    }

    return null
  }

  async get<T = any>(endpoint: string, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET", requiresAuth: options.requiresAuth ?? true })
  }

  async post<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth: options.requiresAuth ?? true,
    })
  }

  async put<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth: options.requiresAuth ?? true,
    })
  }

  async patch<T = any>(
    endpoint: string,
    body?: any,
    options: Omit<RequestOptions, "method" | "body"> = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth: options.requiresAuth ?? true,
    })
  }

  async delete<T = any>(endpoint: string, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE", requiresAuth: options.requiresAuth ?? true })
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = options

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    }

    if (requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
        mode: "cors",
        credentials: "omit",
      })

      if (response.status === 401 && requiresAuth) {
        const newToken = await this.refreshToken()

        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
            mode: "cors",
            credentials: "omit",
          })

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`)
          }

          return await retryResponse.json()
        } else {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token")
            localStorage.removeItem("refresh_token")
            localStorage.removeItem("user")
            window.location.href = "/login?error=session_expired"
          }
          throw new Error("Authentication required")
        }
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const isExpected404 = response.status === 404 && endpoint.includes('/notifications/') && endpoint.includes('/mark-read')
        if (!isExpected404) {
          const text = await response.text()
          throw new Error(`Server returned non-JSON response. Status: ${response.status}`)
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`

        const isExpected404 = response.status === 404 && endpoint.includes('/notifications/') && endpoint.includes('/mark-read')
        
        if (!isExpected404) {
          errorLogger.log({
            error: errorMessage,
            errorName: "ApiError",
            endpoint,
            statusCode: response.status,
            stack: errorData.details,
            userId: this.getUserIdFromToken(),
            userEmail: this.getUserEmailFromToken(),
          })
        }

        throw new ApiError(errorMessage, response.status, errorData)
      }

      const result = await response.json()
      return result
    } catch (error: any) {
      const isExpected404 = error instanceof ApiError && 
                           error.statusCode === 404 && 
                           endpoint.includes('/notifications/') && 
                           endpoint.includes('/mark-read')
      
      if (!isExpected404) {
        if (!(error instanceof ApiError)) {
          console.error("[API Error]", endpoint, error.message)
          errorLogger.log({
            error: error.message,
            errorName: error.name || "NetworkError",
            endpoint,
            stack: error.stack,
            userId: this.getUserIdFromToken(),
            userEmail: this.getUserEmailFromToken(),
          })
        } else {
          console.error("[API Error]", endpoint, error.message)
        }
      }

      throw error
    }
  }

  async uploadFormData<T = any>(
    endpoint: string,
    formData: FormData,
    method: "POST" | "PUT" = "POST",
    requiresAuth = true,
  ): Promise<T> {
    const headers: HeadersInit = {}

    if (requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`
        throw new ApiError(errorMessage, response.status, errorData)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("[Upload Error]", endpoint, error)
      throw error
    }
  }

  private getUserIdFromToken(): number | undefined {
    if (typeof window === "undefined") return undefined
    try {
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        return userData.id
      }
    } catch (e) {
      return undefined
    }
  }

  private getUserEmailFromToken(): string | undefined {
    if (typeof window === "undefined") return undefined
    try {
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        return userData.email
      }
    } catch (e) {
      return undefined
    }
  }
}

export const apiClient = new ApiClient(BASE_URL)
export { ApiError }
