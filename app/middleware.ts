import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { initializeStorageBuckets } from "./actions/storage-actions"

export async function middleware(request: NextRequest) {
  // Clone the request URL for potential modifications
  const url = request.nextUrl.clone()
  const { pathname, search, hash } = url

  // 1. Check for uppercase characters in the URL and redirect to lowercase
  if (/[A-Z]/.test(pathname)) {
    const lowercasePath = pathname.toLowerCase()
    url.pathname = lowercasePath
    return NextResponse.redirect(url, 301)
  }

  // Initialize storage buckets in production (maintain existing functionality)
  if (process.env.NODE_ENV === "production") {
    try {
      await initializeStorageBuckets()
    } catch (error) {
      console.error("Error initializing storage buckets:", error)
    }
  }

  return NextResponse.next()
}

// Configure matcher to exclude static files and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
