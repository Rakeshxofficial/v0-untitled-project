"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)

    // Send error to analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "error", {
        error_message: error.message,
        error_stack: error.stack,
        error_digest: error.digest,
        page_location: window.location.href,
      })
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400 max-w-md">
        We're sorry, but there was an error loading this page. Our team has been notified.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline">
          <a href="/">Return to homepage</a>
        </Button>
      </div>
    </div>
  )
}
