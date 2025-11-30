import { apiClient } from "./api-client"

export async function initiateStripeCheckout() {
  try {
    const response = await apiClient.request<{ url: string }>("/api/bids/create-checkout", {
      method: "POST",
      requiresAuth: true,
    })

    if (response.url) {
      const newWindow = window.open(response.url, "_self")

      if (!newWindow) {
        window.open(response.url, "_blank")
      }
    } else {
      throw new Error("No checkout URL returned")
    }
  } catch (error: any) {
    console.error("Checkout error:", error.message)
    throw error
  }
}
