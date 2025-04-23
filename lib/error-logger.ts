type ErrorSeverity = "low" | "medium" | "high" | "critical"

type ErrorLogData = {
  message: string
  stack?: string
  componentName?: string
  url?: string
  userId?: string
  timestamp: string
  severity: ErrorSeverity
  additionalData?: Record<string, any>
}

// In-memory store for errors before they're sent to the server
let errorQueue: ErrorLogData[] = []
let isSendingErrors = false

// Function to determine error severity based on message and stack
function determineSeverity(error: Error): ErrorSeverity {
  const criticalPatterns = ["failed to fetch", "network error", "supabase error", "authentication failed"]

  const highPatterns = [
    "undefined is not an object",
    "null is not an object",
    "cannot read property",
    "is not a function",
    "is not defined",
    "unexpected token",
  ]

  const mediumPatterns = ["warning:", "deprecated", "timeout", "not found"]

  const errorString = `${error.message} ${error.stack || ""}`.toLowerCase()

  if (criticalPatterns.some((pattern) => errorString.includes(pattern))) {
    return "critical"
  }

  if (highPatterns.some((pattern) => errorString.includes(pattern))) {
    return "high"
  }

  if (mediumPatterns.some((pattern) => errorString.includes(pattern))) {
    return "medium"
  }

  return "low"
}

// Log error to console and prepare for sending to server
export function logError(error: Error, componentName?: string, additionalData?: Record<string, any>) {
  const severity = determineSeverity(error)

  // Always log to console
  console.error(`[${severity.toUpperCase()}] Error in ${componentName || "unknown component"}:`, error)

  // Prepare error data for server
  const errorData: ErrorLogData = {
    message: error.message,
    stack: error.stack,
    componentName,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
    severity,
    additionalData,
  }

  // Add to queue
  errorQueue.push(errorData)

  // Send errors if not already sending
  if (!isSendingErrors) {
    sendErrorsToServer()
  }

  // Track in Google Analytics if available
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "error", {
      event_category: "Error",
      event_label: `${severity}: ${error.message}`,
      value: severity === "critical" ? 1 : 0,
      non_interaction: true,
    })
  }
}

// Send batched errors to server
async function sendErrorsToServer() {
  if (errorQueue.length === 0 || isSendingErrors) return

  isSendingErrors = true

  try {
    const errorsToSend = [...errorQueue]
    errorQueue = []

    // Send to your API endpoint
    const response = await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ errors: errorsToSend }),
    })

    if (!response.ok) {
      // If sending fails, add back to queue
      errorQueue = [...errorsToSend, ...errorQueue]
      console.warn("Failed to send errors to server, will retry later")
    }
  } catch (e) {
    console.error("Error sending logs to server:", e)
  } finally {
    isSendingErrors = false

    // If there are more errors, try again
    if (errorQueue.length > 0) {
      setTimeout(sendErrorsToServer, 5000) // Retry after 5 seconds
    }
  }
}

// Set up interval to periodically send errors
if (typeof window !== "undefined") {
  // Send errors every 30 seconds if there are any
  setInterval(() => {
    if (errorQueue.length > 0) {
      sendErrorsToServer()
    }
  }, 30000)

  // Send errors when user is about to leave the page
  window.addEventListener("beforeunload", () => {
    if (errorQueue.length > 0) {
      navigator.sendBeacon("/api/log-error", JSON.stringify({ errors: errorQueue }))
    }
  })
}
