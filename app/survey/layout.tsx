import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quick Survey | Bidrr",
  description:
    "Help us understand what matters most to you when hiring home service contractors. Take our quick 30-second survey.",
  openGraph: {
    title: "Quick Survey | Bidrr",
    description: "Help us understand what matters most to you when hiring home service contractors.",
    url: "https://bidrr.ca/survey",
    siteName: "Bidrr",
    images: [
      {
        url: "/images/bgr-bidrr-promo.png",
        width: 1200,
        height: 630,
        alt: "Bright Green Roof + Bidrr Partnership",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick Survey | Bidrr",
    description: "Help us understand what matters most to you when hiring home service contractors.",
    images: ["/images/bgr-bidrr-promo.png"],
  },
}

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
