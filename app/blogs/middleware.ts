import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the URL matches the old pattern /blogs/tags/[tag-name]
  if (pathname.startsWith("/blogs/tags/")) {
    // Extract the tag name
    const tagName = pathname.split("/blogs/tags/")[1]

    // Create the new URL with the correct pattern /blogs/tag/[tag-name]
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = `/blogs/tag/${tagName}`

    // Redirect to the new URL
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/blogs/tags/:path*",
}
