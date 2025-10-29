// Utility for handling and logging form errors
import { errorLogger } from "./error-logger"

interface FormErrorOptions {
  formName: string
  fieldName?: string
  userId?: number
  userEmail?: string
}

export function logFormError(error: Error | string, options: FormErrorOptions) {
  const errorMessage = typeof error === "string" ? error : error.message
  const errorStack = typeof error === "string" ? undefined : error.stack

  errorLogger.log({
    error: errorMessage,
    errorName: "FormError",
    stack: errorStack,
    userId: options.userId,
    userEmail: options.userEmail,
    context: {
      formName: options.formName,
      fieldName: options.fieldName,
      formError: true,
    },
  })

  console.error(`[Form Error] ${options.formName}:`, errorMessage)
}

export function logValidationError(validationErrors: Record<string, string>, options: FormErrorOptions) {
  errorLogger.log({
    error: "Form validation failed",
    errorName: "ValidationError",
    userId: options.userId,
    userEmail: options.userEmail,
    context: {
      formName: options.formName,
      validationErrors,
      formError: true,
    },
  })

  console.error(`[Validation Error] ${options.formName}:`, validationErrors)
}
