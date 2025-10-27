const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.homehero.app"

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
          "ngrok-skip-browser-warning": "true",
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

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = options

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...fetchOptions.headers,
    }

    if (requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
        console.log("[v0] Added Authorization header to request:", endpoint)
      } else {
        console.log("[v0] No token available for authenticated request:", endpoint)
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      })

      // Handle 401 - try to refresh token
      if (response.status === 401 && requiresAuth) {
        const newToken = await this.refreshToken()
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
          })

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`)
          }

          return await retryResponse.json()
        } else {
          // Redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("token")
            localStorage.removeItem("refresh_token")
            window.location.href = "/login"
          }
          throw new Error("Authentication required")
        }
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.log("[v0] Non-JSON response received:", text.substring(0, 200))
        throw new Error(`Server returned non-JSON response. Status: ${response.status}`)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log("[v0] Backend error response:", {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          method: fetchOptions.method || "GET",
          errorData,
          requestBody: fetchOptions.body,
        })

        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`
        throw new ApiError(errorMessage, response.status, errorData)
      }

      return await response.json()
    } catch (error) {
      console.log("[v0] API request failed:", error)
      throw error
    }
  }

  async uploadFormData<T>(
    endpoint: string,
    formData: FormData,
    method: "POST" | "PUT" = "POST",
    requiresAuth = true,
  ): Promise<T> {
    const headers: HeadersInit = {
      "ngrok-skip-browser-warning": "true",
    }

    if (requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: formData,
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

    return await response.json()
  }
}

export const apiClient = new ApiClient(BASE_URL)
export { ApiError }
