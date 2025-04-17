import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// List of reserved subdomains that should not be treated as app slugs
const RESERVED_SUBDOMAINS = [
  "www",
  "search",
  "blogs",
  "tools",
  "admin",
  "api",
  "auth",
  "cdn",
  "static",
  "assets",
  "images",
  "media",
  "download",
  "app",
  "apps",
  "game",
  "games",
  "blog",
  "category",
  "publisher",
  "tag",
  "faqs",
  "footerpages",
  "trendingapps",
  "latestgames",
  "latestapps",
  "gamecategories",
  "appcategories",
  "catagory",
]

// Special paths that should not be treated as app slugs
const RESERVED_PATHS = ["robots.txt", "sitemap.xml", "favicon.ico", "ads.txt"]

// Blog post URL patterns
const BLOG_POST_PATTERNS = [
  // Blog posts typically have more than 4 hyphens
  (slug: string) => slug.split("-").length > 5,
  // Blog posts are typically longer than 40 characters
  (slug: string) => slug.length > 40,
  // Blog posts often contain certain keywords
  (slug: string) => /how-to|guide|tutorial|review|what-is|tips|tricks|best|top|vs/.test(slug),
]

// Initialize Supabase client for database checks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cache for blog post slugs to avoid repeated database queries
const blogPostCache = new Map<string, boolean>()
const APP_SLUG_CACHE = new Map<string, boolean>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

/**
 * Check if a slug is likely a blog post based on patterns
 */
function isLikelyBlogPost(slug: string): boolean {
  return BLOG_POST_PATTERNS.some((pattern) => pattern(slug))
}

/**
 * Check if a slug exists in the blogs table
 * This function is async and should be used with caution in middleware
 */
async function isBlogPost(slug: string): Promise<boolean> {
  // Check cache first
  if (blogPostCache.has(slug)) {
    return blogPostCache.get(slug) || false
  }

  try {
    // Query the database to check if this slug exists in the blogs table
    const { data, error } = await supabase.from("blogs").select("slug").eq("slug", slug).single()

    const isBlog = !!data

    // Cache the result
    blogPostCache.set(slug, isBlog)

    // Set a timeout to clear the cache entry
    setTimeout(() => {
      blogPostCache.delete(slug)
    }, CACHE_TTL)

    return isBlog
  } catch (error) {
    console.error("Error checking blog post:", error)
    return false
  }
}

/**
 * Check if a slug exists in the apps or games table
 * This function is async and should be used with caution in middleware
 */
async function isAppOrGame(slug: string): Promise<boolean> {
  // Check cache first
  if (APP_SLUG_CACHE.has(slug)) {
    return APP_SLUG_CACHE.get(slug) || false
  }

  try {
    // Query the database to check if this slug exists in the apps or games table
    const { data: appData, error: appError } = await supabase.from("apps").select("slug").eq("slug", slug).single()

    if (appData) {
      APP_SLUG_CACHE.set(slug, true)

      // Set a timeout to clear the cache entry
      setTimeout(() => {
        APP_SLUG_CACHE.delete(slug)
      }, CACHE_TTL)

      return true
    }

    const { data: gameData, error: gameError } = await supabase.from("games").select("slug").eq("slug", slug).single()

    const isApp = !!gameData

    // Cache the result
    APP_SLUG_CACHE.set(slug, isApp)

    // Set a timeout to clear the cache entry
    setTimeout(() => {
      APP_SLUG_CACHE.delete(slug)
    }, CACHE_TTL)

    return isApp
  } catch (error) {
    console.error("Error checking app or game:", error)
    return false
  }
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get("host") || ""
  const isLocalhost = hostname.includes("localhost")
  const isVercelPreview = hostname.includes("vercel.app")

  // Extract the root domain (installmod.com) for production or use localhost for development
  const rootDomain = isLocalhost
    ? "localhost:3000"
    : isVercelPreview
      ? hostname
          .split(".")
          .slice(-3)
          .join(".") // For vercel.app preview URLs
      : hostname.split(".").slice(-2).join(".") // For production (installmod.com)

  // Check if this is a subdomain request
  const isSubdomain =
    !isLocalhost && !hostname.startsWith("www.") && hostname !== rootDomain && hostname.endsWith(`.${rootDomain}`)

  // Extract the subdomain from the hostname
  let subdomain = ""
  if (isSubdomain) {
    subdomain = hostname.replace(`.${rootDomain}`, "")
  }

  // Special handling for robots.txt and sitemap.xml
  const isRobotsRequest = url.pathname === "/robots.txt"
  const isSitemapRequest = url.pathname === "/sitemap.xml"

  // Allow robots.txt access on both root domain and subdomains
  if (isRobotsRequest) {
    // Just continue with normal processing for robots.txt
    return NextResponse.next()
  }

  // For sitemap.xml, redirect subdomain requests to the root domain
  if (isSitemapRequest && isSubdomain) {
    // Create the correct root domain URL for sitemap.xml
    const protocol = request.nextUrl.protocol
    const rootDomainUrl = isLocalhost
      ? `${protocol}//${rootDomain}/sitemap.xml`
      : isVercelPreview
        ? `${protocol}//${hostname.split(".").slice(-3).join(".")}/sitemap.xml`
        : `${protocol}//${rootDomain}/sitemap.xml`

    // Return a 301 redirect to the root domain's sitemap.xml
    return NextResponse.redirect(rootDomainUrl, 301)
  }

  // For sitemap.xml on root domain, just serve it normally
  if (isSitemapRequest && !isSubdomain) {
    return NextResponse.next()
  }

  // Case 1: Handle redirects from old path-based URLs to new subdomain URLs
  if (!isSubdomain) {
    // Check if this is a request to /app/[slug] or /[slug] that should be redirected to a subdomain
    const pathSegments = url.pathname.split("/").filter(Boolean)

    // Skip processing if the path is empty or a reserved path
    if (pathSegments.length === 0 || RESERVED_PATHS.includes(pathSegments[0])) {
      return NextResponse.next()
    }

    // Check if this is a blog post URL pattern
    if (pathSegments.length === 1 && isLikelyBlogPost(pathSegments[0])) {
      // Skip redirection for likely blog posts
      return NextResponse.next()
    }

    // Check if the URL starts with /blog/ or /blogs/
    if (pathSegments.length > 0 && (pathSegments[0] === "blog" || pathSegments[0] === "blogs")) {
      // Skip redirection for blog URLs
      return NextResponse.next()
    }

    if (
      // Match /app/[slug] pattern
      (pathSegments.length >= 2 && pathSegments[0] === "app") ||
      // Match /[slug] pattern for apps/games (we'll need to verify this is an app/game slug)
      (pathSegments.length === 1 && !RESERVED_SUBDOMAINS.includes(pathSegments[0]))
    ) {
      const slug = pathSegments[0] === "app" ? pathSegments[1] : pathSegments[0]

      // Skip redirection for reserved paths
      if (RESERVED_SUBDOMAINS.includes(slug)) {
        // Continue normal processing
        const response = NextResponse.next()

        // Set headers to disable client-side navigation
        response.headers.set("X-Next-SSR-Only", "true")
        response.headers.set("Cache-Control", "no-store, max-age=0")
        response.headers.set("X-Frame-Options", "DENY")
        response.headers.set("X-Next-Prefetch", "false")

        return response
      }

      // Skip redirection for likely blog posts
      if (isLikelyBlogPost(slug)) {
        return NextResponse.next()
      }

      // Create the new subdomain URL
      const protocol = request.nextUrl.protocol
      const newUrl = `${protocol}//${slug}.${rootDomain}${url.pathname.replace(`/${pathSegments[0]}/${slug}`, "").replace(`/${slug}`, "")}`

      // Redirect to the subdomain URL with 301 (permanent redirect)
      return NextResponse.redirect(newUrl, 301)
    }
  }

  // Case 2: Handle subdomain requests by internally rewriting them to /app/[slug]
  if (isSubdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
    // Rewrite the request to /app/[subdomain] internally
    url.pathname = `/app/${subdomain}${url.pathname}`

    // Return the rewritten URL for internal handling
    const response = NextResponse.rewrite(url)

    // Set headers to disable client-side navigation
    response.headers.set("X-Next-SSR-Only", "true")
    response.headers.set("Cache-Control", "no-store, max-age=0")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Next-Prefetch", "false")

    return response
  }

  // Default case: continue with normal request processing
  const response = NextResponse.next()

  // Set headers to disable client-side navigation
  response.headers.set("X-Next-SSR-Only", "true")
  response.headers.set("Cache-Control", "no-store, max-age=0")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Next-Prefetch", "false")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
