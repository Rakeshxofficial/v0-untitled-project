import { logError } from "./error-logger"

type FetchOptions = {
  componentName?: string
  fallbackData?: any
  retryCount?: number
  maxRetries?: number
  retryDelay?: number
}

/**
 * Safely fetch data from Supabase with error handling and retries
 */
export async function safeFetch<T>(
  fetchFn: () => Promise<{ data: T | null; error: any }>,
  options: FetchOptions = {},
): Promise<{ data: T | null; error: any; isError: boolean }> {
  const { componentName = "unknown", fallbackData = null, retryCount = 0, maxRetries = 3, retryDelay = 1000 } = options

  try {
    const result = await fetchFn()

    if (result.error) {
      // Log the error
      logError(new Error(`Supabase query error: ${result.error.message}`), componentName, {
        supabaseError: result.error,
      })

      // Retry logic
      if (retryCount < maxRetries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (retryCount + 1)))

        // Retry with incremented count
        return safeFetch(fetchFn, {
          ...options,
          retryCount: retryCount + 1,
        })
      }

      return { data: fallbackData, error: result.error, isError: true }
    }

    return { data: result.data, error: null, isError: false }
  } catch (error: any) {
    // Log the unexpected error
    logError(error, componentName, { attemptCount: retryCount + 1 })

    // Retry logic for unexpected errors
    if (retryCount < maxRetries) {
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (retryCount + 1)))

      // Retry with incremented count
      return safeFetch(fetchFn, {
        ...options,
        retryCount: retryCount + 1,
      })
    }

    return { data: fallbackData, error, isError: true }
  }
}

// Example usage:
// const { data, error, isError } = await safeFetch(
//   () => supabase.from('apps').select('*').eq('slug', slug),
//   { componentName: 'AppDetailsPage', fallbackData: [] }
// )
