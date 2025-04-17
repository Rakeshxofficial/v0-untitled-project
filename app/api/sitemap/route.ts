import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

// Helper function to format date to ISO string
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString()
}

// Get the base URL - hardcoded to the correct domain
const getBaseUrl = (): string => {
  return "https://installmod.com"
}

// Helper function to check if a URL should be excluded
const shouldExcludeUrl = async (url: string, exclusions: any[]): Promise<boolean> => {
  for (const exclusion of exclusions) {
    const pattern = exclusion.url_pattern.replace(/\./g, "\\.").replace(/\//g, "\\/").replace(/\*/g, ".*")

    const regex = new RegExp(`^${pattern}$`)
    if (regex.test(url)) {
      return true
    }
  }
  return false
}

export async function GET() {
  try {
    const baseUrl = getBaseUrl()
    const currentDate = new Date().toISOString()

    // Fetch URL exclusions
    const { data: exclusions, error: exclusionsError } = await supabase.from("sitemap_exclusions").select("url_pattern")

    if (exclusionsError) {
      console.error("Error fetching sitemap exclusions:", exclusionsError)
    }

    const urlExclusions = exclusions || []

    // Initialize XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    // Add static routes
    const staticRoutes = [
      { url: `${baseUrl}`, priority: 1.0, changefreq: "daily" },
      { url: `${baseUrl}/apps`, priority: 0.9, changefreq: "daily" },
      { url: `${baseUrl}/games`, priority: 0.9, changefreq: "daily" },
      { url: `${baseUrl}/blogs`, priority: 0.9, changefreq: "daily" },
      { url: `${baseUrl}/faqs`, priority: 0.7, changefreq: "weekly" },
      { url: `${baseUrl}/blogs/category`, priority: 0.7, changefreq: "weekly" },
      { url: `${baseUrl}/blogs/tag`, priority: 0.7, changefreq: "weekly" },
      { url: `${baseUrl}/publisher`, priority: 0.7, changefreq: "weekly" },
      { url: `${baseUrl}/latestapps`, priority: 0.8, changefreq: "daily" },
      { url: `${baseUrl}/latestgames`, priority: 0.8, changefreq: "daily" },
      { url: `${baseUrl}/trendingapps`, priority: 0.8, changefreq: "daily" },
    ]

    for (const route of staticRoutes) {
      if (await shouldExcludeUrl(route.url, urlExclusions)) {
        continue
      }

      xml += `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    }

    // Fetch all published apps
    const { data: apps, error: appsError } = await supabase
      .from("apps")
      .select("slug, updated_at")
      .eq("status", "published")

    if (!appsError && apps) {
      for (const app of apps) {
        const appUrl = `${baseUrl}/app/${app.slug}`

        if (await shouldExcludeUrl(appUrl, urlExclusions)) {
          continue
        }

        xml += `
  <url>
    <loc>${appUrl}</loc>
    <lastmod>${app.updated_at ? formatDate(app.updated_at) : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      }
    }

    // Fetch all published games
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("slug, updated_at")
      .eq("status", "published")

    if (!gamesError && games) {
      for (const game of games) {
        const gameUrl = `${baseUrl}/app/${game.slug}`

        if (await shouldExcludeUrl(gameUrl, urlExclusions)) {
          continue
        }

        xml += `
  <url>
    <loc>${gameUrl}</loc>
    <lastmod>${game.updated_at ? formatDate(game.updated_at) : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      }
    }

    // Fetch all published blogs
    const { data: blogs, error: blogsError } = await supabase
      .from("blogs")
      .select("slug, updated_at")
      .eq("status", "published")

    if (!blogsError && blogs) {
      for (const blog of blogs) {
        const blogUrl = `${baseUrl}/blog/${blog.slug}`

        if (await shouldExcludeUrl(blogUrl, urlExclusions)) {
          continue
        }

        xml += `
  <url>
    <loc>${blogUrl}</loc>
    <lastmod>${blog.updated_at ? formatDate(blog.updated_at) : currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
      }
    }

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("slug, type, updated_at")

    if (!categoriesError && categories) {
      for (const category of categories) {
        let categoryUrl = ""
        if (category.type === "app" || category.type === "game") {
          categoryUrl = `${baseUrl}/category/${category.slug}`
        } else if (category.type === "blog") {
          categoryUrl = `${baseUrl}/blogs/category/${category.slug}`
        }

        if (categoryUrl && !(await shouldExcludeUrl(categoryUrl, urlExclusions))) {
          xml += `
  <url>
    <loc>${categoryUrl}</loc>
    <lastmod>${category.updated_at ? formatDate(category.updated_at) : currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
        }
      }
    }

    // Try to fetch publishers
    try {
      const { data: publishers, error: publishersError } = await supabase.from("publishers").select("id, updated_at")

      if (!publishersError && publishers) {
        for (const publisher of publishers) {
          const publisherUrl = `${baseUrl}/publisher/${publisher.id}`

          if (await shouldExcludeUrl(publisherUrl, urlExclusions)) {
            continue
          }

          xml += `
  <url>
    <loc>${publisherUrl}</loc>
    <lastmod>${publisher.updated_at ? formatDate(publisher.updated_at) : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
        }
      } else {
        // Alternative approach if publishers table doesn't exist
        const { data: blogPublishers, error: blogPublishersError } = await supabase
          .from("blogs")
          .select("publisher, updated_at")
          .eq("status", "published")

        if (!blogPublishersError && blogPublishers) {
          // Create a unique list of publishers from blogs
          const uniquePublishers = [...new Set(blogPublishers.map((blog) => blog.publisher))]
            .filter(Boolean)
            .map((publisher) => ({
              id: publisher,
              updated_at: blogPublishers.find((blog) => blog.publisher === publisher)?.updated_at || currentDate,
            }))

          for (const publisher of uniquePublishers) {
            if (publisher.id) {
              const publisherUrl = `${baseUrl}/publisher/${publisher.id}`

              if (await shouldExcludeUrl(publisherUrl, urlExclusions)) {
                continue
              }

              xml += `
  <url>
    <loc>${publisherUrl}</loc>
    <lastmod>${formatDate(publisher.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching publishers for sitemap:", error)
    }

    // Try to fetch tags
    try {
      const { data: tags, error: tagsError } = await supabase.from("tags").select("slug, updated_at")

      if (!tagsError && tags) {
        for (const tag of tags) {
          const tagUrl = `${baseUrl}/blogs/tag/${tag.slug}`

          if (await shouldExcludeUrl(tagUrl, urlExclusions)) {
            continue
          }

          xml += `
  <url>
    <loc>${tagUrl}</loc>
    <lastmod>${tag.updated_at ? formatDate(tag.updated_at) : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
        }
      }
    } catch (error) {
      console.error("Error fetching tags for sitemap:", error)
    }

    // Add footer pages
    const footerPages = ["about-us", "contact-us", "privacy-policy", "terms-of-service", "dmca-disclaimer"]

    for (const page of footerPages) {
      const pageUrl = `${baseUrl}/footerpages/${page}`

      if (await shouldExcludeUrl(pageUrl, urlExclusions)) {
        continue
      }

      xml += `
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`
    }

    // Add custom sitemap entries
    try {
      const { data: customEntries, error: customEntriesError } = await supabase
        .from("custom_sitemap_entries")
        .select("*")
        .eq("include_in_sitemap", true)

      if (!customEntriesError && customEntries && customEntries.length > 0) {
        for (const entry of customEntries) {
          xml += `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.last_modified ? formatDate(entry.last_modified) : currentDate}</lastmod>
    <changefreq>${entry.change_frequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
        }
      }
    } catch (error) {
      console.error("Error fetching custom sitemap entries:", error)
    }

    // Close XML
    xml += `
</urlset>`

    // Return XML with proper content type
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}
