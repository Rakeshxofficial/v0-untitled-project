"use client"

import { useEffect } from "react"
import { logError } from "@/lib/error-logger"

export default function ClientErrorHandler() {
  useEffect(() => {
    // Handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault()
      logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), "global", { reason: event.reason })
    }

    // Handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault()
      logError(new Error(`Uncaught Error: ${event.message}`), "global", {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      })
    }

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [])

  // This component doesn't render anything
  return null
}
