import { NextResponse } from "next/server"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://installmod.com"
    const sitemapUrl = `${baseUrl}/sitemap.xml`

    // Ping Google
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)

    // Ping Bing
    await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)

    return NextResponse.json({
      success: true,
      message: "Successfully pinged search engines",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error pinging search engines:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error pinging search engines",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
