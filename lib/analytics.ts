// Google Analytics 4 Event Tracking Utility

// Type-safe event names
export type AnalyticsEvent =
  // Homepage events
  | "homepage_view"
  | "cta_click"
  | "service_search"
  | "section_view"
  // Onboarding events
  | "onboarding_started"
  | "form_field_completed"
  | "form_validation_error"
  | "form_submitted"
  | "form_submission_success"
  | "form_submission_error"
  // Phone verification events
  | "phone_verification_started"
  | "verification_code_requested"
  | "verification_code_sent"
  | "verification_code_failed"
  | "verification_code_entered"
  | "verification_success"
  | "verification_failed"
  | "verification_skipped"
  // Account events
  | "signup_complete"
  | "login_started"
  | "login_success"
  | "login_failed"
  | "password_reset_requested"
  // Contractor onboarding events
  | "service_area_setup"
  | "services_selected"
  | "profile_completed"
  // Job events
  | "job_post_started"
  | "job_post_submitted"
  | "job_post_success"
  | "job_viewed"
  // Bid events
  | "bid_started"
  | "bid_submitted"
  // Conversion events
  | "contractor_hired"
  | "job_completed"
  | "review_submitted"

// Event parameter types
export interface EventParams {
  // Common params
  role?: "homeowner" | "contractor"
  // CTA params
  button_name?: string
  location?: string
  // Form params
  field_name?: string
  error_type?: string
  error_message?: string
  // Search params
  search_term?: string
  // Section params
  section?: string
  // Verification params
  attempts?: number
  verification_status?: "verified" | "skipped"
  // Job params
  job_id?: string | number
  service_type?: string
  budget_range?: string
  // Bid params
  bid_amount?: number
  // Profile params
  has_photo?: boolean
  has_bio?: boolean
  // Service area params
  province?: string
  city_count?: number
  service_count?: number
  services?: string
  // Review params
  rating?: number
  final_amount?: number
  // Generic
  [key: string]: string | number | boolean | undefined
}

// Check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== "undefined" && typeof window.gtag === "function"
}

// Main tracking function
export const trackEvent = (eventName: AnalyticsEvent, params?: EventParams): void => {
  if (!isGtagAvailable()) {
    // Log in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] Event: ${eventName}`, params)
    }
    return
  }

  window.gtag("event", eventName, params)
}

// Track page views (for SPA navigation)
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] Page View: ${pagePath}`, pageTitle)
    }
    return
  }

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle,
  })
}

// Convenience function for form field tracking
export const trackFormField = (fieldName: string, role: "homeowner" | "contractor"): void => {
  trackEvent("form_field_completed", { field_name: fieldName, role })
}

// Convenience function for form validation errors
export const trackFormError = (fieldName: string, errorType: string, role: "homeowner" | "contractor"): void => {
  trackEvent("form_validation_error", { field_name: fieldName, error_type: errorType, role })
}

// Convenience function for CTA clicks
export const trackCTAClick = (buttonName: string, location: string): void => {
  trackEvent("cta_click", { button_name: buttonName, location })
}

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    gtag: (command: "event" | "config" | "js", targetId: string, params?: Record<string, unknown>) => void
  }
}
