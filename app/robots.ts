import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  // Use the correct website URL, not Supabase URL
  const baseUrl = "https://installmod.com"

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/_next/static", "/images/"], // Allow Googlebot to access static assets and images
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"], // Keep disallowing admin and api routes for all user agents
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
