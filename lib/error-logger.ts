// Error logging utility for tracking frontend errors
interface ErrorLog {
  id: string
  timestamp: string
  userId?: number
  userEmail?: string
  error: string
  errorName: string
  endpoint?: string
  statusCode?: number
  stack?: string
  userAgent: string
  url: string
  context?: Record<string, any>
}

class ErrorLogger {
  private static instance: ErrorLogger
  private logs: ErrorLog[] = []
  private readonly MAX_LOGS = 100
  private readonly STORAGE_KEY = "homehero_error_logs"
  private sendToBackend = true

  private constructor() {
    // Load existing logs from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        try {
          this.logs = JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse stored error logs")
        }
      }
    }
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  log(error: {
    error: string
    errorName?: string
    endpoint?: string
    statusCode?: number
    stack?: string
    userId?: number
    userEmail?: string
    context?: Record<string, any>
  }): void {
    const errorLog: ErrorLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: error.userId,
      userEmail: error.userEmail,
      error: error.error,
      errorName: error.errorName || "Error",
      endpoint: error.endpoint,
      statusCode: error.statusCode,
      stack: error.stack,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      url: typeof window !== "undefined" ? window.location.href : "Unknown",
      context: error.context,
    }

    this.logs.unshift(errorLog)

    // Keep only the most recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS)
    }

    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs))
      } catch (e) {
        console.error("Failed to save error logs to localStorage")
      }
    }

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorLogger]", errorLog)
    }

    if (this.sendToBackend && typeof window !== "undefined") {
      this.sendToBackendAsync(errorLog).catch((err) => {
        console.error("[ErrorLogger] Failed to send error to backend:", err)
      })
    }
  }

  private async sendToBackendAsync(errorLog: ErrorLog): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/error-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error_id: errorLog.id,
          timestamp: errorLog.timestamp,
          user_id: errorLog.userId,
          user_email: errorLog.userEmail,
          error_message: errorLog.error,
          error_name: errorLog.errorName,
          endpoint: errorLog.endpoint,
          status_code: errorLog.statusCode,
          stack_trace: errorLog.stack,
          user_agent: errorLog.userAgent,
          url: errorLog.url,
          context: errorLog.context,
          severity: this.determineSeverity(errorLog),
        }),
      })

      if (!response.ok) {
        console.error("[ErrorLogger] Backend returned error:", response.status)
      }
    } catch (error) {
      console.error("[ErrorLogger] Network error sending to backend:", error)
    }
  }

  private determineSeverity(errorLog: ErrorLog): string {
    if (errorLog.errorName === "AuthenticationError") return "high"
    if (errorLog.statusCode && errorLog.statusCode >= 500) return "high"
    if (errorLog.errorName === "NetworkError") return "medium"
    if (errorLog.errorName === "ApiError") return "medium"
    return "low"
  }

  setBackendLogging(enabled: boolean): void {
    this.sendToBackend = enabled
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  getLogsByUser(userId: number): ErrorLog[] {
    return this.logs.filter((log) => log.userId === userId)
  }

  getLogsByEndpoint(endpoint: string): ErrorLog[] {
    return this.logs.filter((log) => log.endpoint?.includes(endpoint))
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    errorLogger.log({
      error: event.reason?.message || String(event.reason),
      errorName: "UnhandledPromiseRejection",
      stack: event.reason?.stack,
      context: { reason: event.reason },
    })
  })

  window.addEventListener("error", (event) => {
    errorLogger.log({
      error: event.message,
      errorName: event.error?.name || "GlobalError",
      stack: event.error?.stack,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    })
  })
}

export const errorLogger = ErrorLogger.getInstance()
export type { ErrorLog }
