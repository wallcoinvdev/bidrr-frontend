const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

console.log("[v0] API Client initialized with BASE_URL:", BASE_URL)

import { errorLogger } from "./error-logger"

export async function checkBackendHealth(): Promise<{
  isReachable: boolean
  error?: string
  corsIssue?: boolean
  currentOrigin?: string
}> {
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "unknown"

  console.log("[v0] Testing backend connectivity from origin:", currentOrigin)

  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    })

    if (response.ok) {
      console.log("[v0] Backend is reachable and CORS is configured correctly")
      return { isReachable: true, currentOrigin }
    }

    return {
      isReachable: false,
      error: `Backend returned status ${response.status}`,
      currentOrigin,
    }
  } catch (error: any) {
    console.error("[v0] Backend health check failed:", error)

    // Detect CORS-specific errors
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

  async get<T>(endpoint: string, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET", requiresAuth: options.requiresAuth ?? true })
  }

  async post<T>(endpoint: string, body?: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth: options.requiresAuth ?? true,
    })
  }

  async put<T>(endpoint: string, body?: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth: options.requiresAuth ?? true,
    })
  }

  async patch<T>(endpoint: string, body?: any, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth: options.requiresAuth ?? true,
    })
  }

  async delete<T>(endpoint: string, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE", requiresAuth: options.requiresAuth ?? true })
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = options

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    }

    if (requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
        console.log("[v0] ✅ Authorization header added for:", endpoint)
      } else {
        console.log("[v0] ⚠️ No token available for authenticated request:", endpoint)
      }
    }

    try {
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "unknown"
      const requestStartTime = Date.now()

      console.log("[v0] ========== API REQUEST START ==========")
      console.log("[v0] Endpoint:", endpoint)
      console.log("[v0] Method:", fetchOptions.method || "GET")
      console.log("[v0] Full URL:", `${this.baseUrl}${endpoint}`)
      console.log("[v0] Headers:", Object.keys(headers))
      console.log("[v0] Has body:", !!fetchOptions.body)
      console.log("[v0] Requires auth:", requiresAuth)
      console.log("[v0] Origin:", currentOrigin)
      console.log("[v0] Timestamp:", new Date().toISOString())

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
        mode: "cors",
        credentials: "omit",
      })

      const requestEndTime = Date.now()
      const requestDuration = requestEndTime - requestStartTime

      console.log("[v0] ========== API RESPONSE RECEIVED ==========")
      console.log("[v0] Endpoint:", endpoint)
      console.log("[v0] Status:", response.status, response.statusText)
      console.log("[v0] OK:", response.ok)
      console.log("[v0] Request duration:", requestDuration, "ms")
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.status === 401 && requiresAuth) {
        console.log("[v0] ========== 401 UNAUTHORIZED DETECTED ==========")
        console.log("[v0] ❌ This is the 'account deletion' trigger")
        console.log("[v0] Endpoint that returned 401:", endpoint)
        console.log("[v0] Current token exists:", !!this.getAuthToken())
        console.log("[v0] Current token (first 30 chars):", this.getAuthToken()?.substring(0, 30))
        console.log("[v0] Current refresh_token exists:", !!localStorage.getItem("refresh_token"))
        console.log("[v0] Attempting token refresh...")

        const refreshStartTime = Date.now()
        const newToken = await this.refreshToken()
        const refreshEndTime = Date.now()

        if (newToken) {
          console.log("[v0] ✅ Token refresh successful (took", refreshEndTime - refreshStartTime, "ms)")
          console.log("[v0] New token (first 30 chars):", newToken.substring(0, 30))
          console.log("[v0] Retrying original request...")

          headers["Authorization"] = `Bearer ${newToken}`
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
            mode: "cors",
            credentials: "omit",
          })

          console.log("[v0] Retry response status:", retryResponse.status)

          if (!retryResponse.ok) {
            console.log("[v0] ❌ Retry also failed after token refresh")
            console.log("[v0] Both original and retry request failed")
            throw new Error(`HTTP error! status: ${retryResponse.status}`)
          }

          console.log("[v0] ✅ Retry succeeded after token refresh")
          console.log("[v0] ========== 401 RECOVERY SUCCESSFUL ==========")
          return await retryResponse.json()
        } else {
          console.log("[v0] ❌ Token refresh FAILED")
          console.log("[v0] No refresh_token available or refresh endpoint failed")
          console.log("[v0] ========== AUTOMATIC LOGOUT TRIGGERED ==========")
          console.log("[v0] This is where 'account deletion' happens")
          console.log("[v0] Clearing localStorage and redirecting to login")
          console.log("[v0] User will think their account was deleted")
          console.log("[v0] ===================================================")

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
        const text = await response.text()
        console.log("[v0] ⚠️ Non-JSON response received:", text.substring(0, 200))
        throw new Error(`Server returned non-JSON response. Status: ${response.status}`)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log("[v0] ========== API ERROR ==========")
        console.log("[v0] Status:", response.status)
        console.log("[v0] Endpoint:", endpoint)
        console.log("[v0] Method:", fetchOptions.method || "GET")
        console.log("[v0] Error data:", JSON.stringify(errorData, null, 2))
        console.log("[v0] Request body:", fetchOptions.body)
        console.log("[v0] ====================================")

        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`

        errorLogger.log({
          error: errorMessage,
          errorName: "ApiError",
          endpoint,
          statusCode: response.status,
          stack: errorData.details,
          userId: this.getUserIdFromToken(),
          userEmail: this.getUserEmailFromToken(),
        })

        throw new ApiError(errorMessage, response.status, errorData)
      }

      const result = await response.json()
      console.log("[v0] ✅ API request successful")
      console.log("[v0] ========== API REQUEST COMPLETE ==========")
      return result
    } catch (error: any) {
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "unknown"
      console.error("[v0] ========== API REQUEST FAILED ==========")
      console.error("[v0] Error:", error.message)
      console.error("[v0] Error type:", error.name)
      console.error("[v0] Endpoint:", endpoint)
      console.error("[v0] Base URL:", this.baseUrl)
      console.error("[v0] Full URL:", `${this.baseUrl}${endpoint}`)
      console.error("[v0] Origin:", currentOrigin)
      console.error("[v0] Stack:", error.stack)
      console.error("[v0] ===========================================")

      if (!(error instanceof ApiError)) {
        errorLogger.log({
          error: error.message,
          errorName: error.name || "NetworkError",
          endpoint,
          stack: error.stack,
          userId: this.getUserIdFromToken(),
          userEmail: this.getUserEmailFromToken(),
        })
      }

      if (error.message === "Failed to fetch") {
        throw new Error(
          `Network error: Unable to reach ${this.baseUrl} from ${currentOrigin}. ` +
            `This could be a CORS issue, network connectivity problem, or the backend is not running.`,
        )
      }

      throw error
    }
  }

  async uploadFormData<T>(
    endpoint: string,
    formData: FormData,
    method: "POST" | "PUT" = "POST",
    requiresAuth = true,
  ): Promise<T> {
    console.log("[v0] uploadFormData called:", {
      endpoint,
      method,
      requiresAuth,
      baseUrl: this.baseUrl,
      fullUrl: `${this.baseUrl}${endpoint}`,
    })

    const headers: HeadersInit = {}

    if (requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
        console.log("[v0] Authorization header added to upload")
      } else {
        console.log("[v0] WARNING: No auth token for upload request")
      }
    }

    try {
      console.log("[v0] Sending upload request to:", `${this.baseUrl}${endpoint}`)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: formData,
      })

      console.log("[v0] Upload response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log("[v0] Backend error response:", {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          method,
          errorData,
        })

        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`
        throw new ApiError(errorMessage, response.status, errorData)
      }

      const result = await response.json()
      console.log("[v0] Upload successful:", result)
      return result
    } catch (error) {
      console.error("[v0] Upload failed:", error)
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
