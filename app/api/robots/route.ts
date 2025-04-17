import { NextResponse } from "next/server"

export async function GET() {
  // Use the correct website URL, not Supabase URL
  const baseUrl = "https://installmod.com"

  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Admin pages
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/api/sitemap
`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
