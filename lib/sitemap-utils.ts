/**
 * Utility functions for sitemap management
 */

// Function to ping search engines when content is updated
export async function pingSearchEngines() {
  try {
    // Only ping in production environment
    if (process.env.NODE_ENV !== "production") {
      console.log("Skipping search engine ping in non-production environment")
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://installmod.com"
    await fetch(`${baseUrl}/api/ping-search-engines`, {
      method: "GET",
      cache: "no-store",
    })

    console.log("Successfully triggered search engine ping")
  } catch (error) {
    console.error("Error pinging search engines:", error)
  }
}

// Function to be called after content updates to refresh the sitemap
export async function refreshSitemap() {
  try {
    // Only refresh in production environment
    if (process.env.NODE_ENV !== "production") {
      console.log("Skipping sitemap refresh in non-production environment")
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://installmod.com"

    // Fetch the sitemap to trigger a regeneration
    await fetch(`${baseUrl}/api/sitemap`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    console.log("Successfully triggered sitemap refresh")

    // Ping search engines after sitemap refresh
    await pingSearchEngines()
  } catch (error) {
    console.error("Error refreshing sitemap:", error)
  }
}
