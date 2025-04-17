import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { supabase } from "@/lib/supabase"

export async function middleware(request: NextRequest) {
  // Extract the blog ID from the URL
  const pathname = request.nextUrl.pathname
  const blogId = pathname.split("/")[2] // /blog/[id] -> id will be at index 2

  // Check if this is a UUID pattern (old URL format)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (uuidPattern.test(blogId)) {
    // This is an old URL format with UUID, fetch the blog to get its slug
    const { data: blog } = await supabase.from("blogs").select("slug").eq("id", blogId).single()

    if (blog?.slug) {
      // Redirect to the new slug-based URL
      const newUrl = request.nextUrl.clone()
      newUrl.pathname = `/blog/${blog.slug}`
      return NextResponse.redirect(newUrl)
    }
  }

  // Continue with the request for new URL format or if blog not found
  return NextResponse.next()
}

export const config = {
  matcher: "/blog/:path*",
}
