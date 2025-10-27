export function containsContactInfo(text: string): { hasContact: boolean; type?: string } {
  if (!text) return { hasContact: false }

  // Email patterns
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
  if (emailPattern.test(text)) {
    return { hasContact: true, type: "email" }
  }

  // Phone number patterns (various formats)
  const phonePatterns = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // 123-456-7890, 123.456.7890, 123 456 7890
    /$$\d{3}$$\s?\d{3}[-.\s]?\d{4}/g, // (123) 456-7890
    /\b\d{10}\b/g, // 1234567890
    /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // +1-123-456-7890, +44 20 1234 5678
  ]

  for (const pattern of phonePatterns) {
    if (pattern.test(text)) {
      return { hasContact: true, type: "phone" }
    }
  }

  return { hasContact: false }
}
