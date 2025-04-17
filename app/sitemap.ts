import { supabase } from "@/lib/supabase"
import type { MetadataRoute } from "next"

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const currentDate = new Date().toISOString()

  // Fetch URL exclusions
  const { data: exclusions, error: exclusionsError } = await supabase.from("sitemap_exclusions").select("url_pattern")

  if (exclusionsError) {
    console.error("Error fetching sitemap exclusions:", exclusionsError)
  }

  const urlExclusions = exclusions || []

  // Initialize sitemap with static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/apps`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogs/category`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogs/tag`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/publisher`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/latestapps`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/latestgames`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trendingapps`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]

  // Filter out excluded static routes
  const filteredStaticRoutes = []
  for (const route of staticRoutes) {
    if (!(await shouldExcludeUrl(route.url, urlExclusions))) {
      filteredStaticRoutes.push(route)
    }
  }

  // Fetch all published apps
  const { data: apps, error: appsError } = await supabase
    .from("apps")
    .select("slug, updated_at")
    .eq("status", "published")

  if (appsError) {
    console.error("Error fetching apps for sitemap:", appsError)
  }

  // Fetch all published games
  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select("slug, updated_at")
    .eq("status", "published")

  if (gamesError) {
    console.error("Error fetching games for sitemap:", gamesError)
  }

  // Fetch all published blogs
  const { data: blogs, error: blogsError } = await supabase
    .from("blogs")
    .select("slug, updated_at")
    .eq("status", "published")

  if (blogsError) {
    console.error("Error fetching blogs for sitemap:", blogsError)
  }

  // Fetch all app categories
  const { data: appCategories, error: appCategoriesError } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .eq("type", "app")

  if (appCategoriesError) {
    console.error("Error fetching app categories for sitemap:", appCategoriesError)
  }

  // Fetch all game categories
  const { data: gameCategories, error: gameCategoriesError } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .eq("type", "game")

  if (gameCategoriesError) {
    console.error("Error fetching game categories for sitemap:", gameCategoriesError)
  }

  // Fetch all blog categories
  const { data: blogCategories, error: blogCategoriesError } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .eq("type", "blog")

  if (blogCategoriesError) {
    console.error("Error fetching blog categories for sitemap:", blogCategoriesError)
  }

  // Fetch all publishers
  const { data: publishers, error: publishersError } = await supabase.from("publishers").select("id, updated_at")

  if (publishersError) {
    console.error("Error fetching publishers for sitemap:", publishersError)
    // Try alternative approach if publishers table doesn't exist
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

      // Add publisher routes to sitemap
      for (const publisher of uniquePublishers) {
        if (publisher.id) {
          const publisherUrl = `${baseUrl}/publisher/${publisher.id}`

          if (!(await shouldExcludeUrl(publisherUrl, urlExclusions))) {
            filteredStaticRoutes.push({
              url: publisherUrl,
              lastModified: formatDate(publisher.updated_at),
              changeFrequency: "weekly",
              priority: 0.6,
            })
          }
        }
      }
    }
  } else if (publishers) {
    // Add publisher routes to sitemap
    for (const publisher of publishers) {
      const publisherUrl = `${baseUrl}/publisher/${publisher.id}`

      if (!(await shouldExcludeUrl(publisherUrl, urlExclusions))) {
        filteredStaticRoutes.push({
          url: publisherUrl,
          lastModified: formatDate(publisher.updated_at),
          changeFrequency: "weekly",
          priority: 0.6,
        })
      }
    }
  }

  // Fetch all tags (if tags table exists)
  try {
    const { data: tags, error: tagsError } = await supabase.from("tags").select("slug, updated_at")

    if (!tagsError && tags) {
      // Add tag routes to sitemap
      for (const tag of tags) {
        const tagUrl = `${baseUrl}/blogs/tag/${tag.slug}`

        if (!(await shouldExcludeUrl(tagUrl, urlExclusions))) {
          filteredStaticRoutes.push({
            url: tagUrl,
            lastModified: tag.updated_at ? formatDate(tag.updated_at) : currentDate,
            changeFrequency: "weekly",
            priority: 0.5,
          })
        }
      }
    }
  } catch (error) {
    console.error("Error fetching tags for sitemap:", error)
  }

  // Add app routes to sitemap - UPDATED to use subdomains
  const appRoutes: MetadataRoute.Sitemap = []
  if (apps) {
    for (const app of apps) {
      const appUrl = `https://${app.slug}.installmod.com` // Using subdomain format

      if (!(await shouldExcludeUrl(appUrl, urlExclusions))) {
        appRoutes.push({
          url: appUrl,
          lastModified: app.updated_at ? formatDate(app.updated_at) : currentDate,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    }
  }

  // Add game routes to sitemap - UPDATED to use subdomains
  const gameRoutes: MetadataRoute.Sitemap = []
  if (games) {
    for (const game of games) {
      const gameUrl = `https://${game.slug}.installmod.com` // Using subdomain format

      if (!(await shouldExcludeUrl(gameUrl, urlExclusions))) {
        gameRoutes.push({
          url: gameUrl,
          lastModified: game.updated_at ? formatDate(game.updated_at) : currentDate,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    }
  }

  // Add blog routes to sitemap - UPDATED to remove /blog/ prefix
  const blogRoutes: MetadataRoute.Sitemap = []
  if (blogs) {
    for (const blog of blogs) {
      const blogUrl = `${baseUrl}/${blog.slug}` // Removed /blog/ prefix

      if (!(await shouldExcludeUrl(blogUrl, urlExclusions))) {
        blogRoutes.push({
          url: blogUrl,
          lastModified: blog.updated_at ? formatDate(blog.updated_at) : currentDate,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    }
  }

  // Add app category routes to sitemap
  const appCategoryRoutes: MetadataRoute.Sitemap = []
  if (appCategories) {
    for (const category of appCategories) {
      const categoryUrl = `${baseUrl}/category/${category.slug}`

      if (!(await shouldExcludeUrl(categoryUrl, urlExclusions))) {
        appCategoryRoutes.push({
          url: categoryUrl,
          lastModified: category.updated_at ? formatDate(category.updated_at) : currentDate,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    }
  }

  // Add game category routes to sitemap
  const gameCategoryRoutes: MetadataRoute.Sitemap = []
  if (gameCategories) {
    for (const category of gameCategories) {
      const categoryUrl = `${baseUrl}/category/${category.slug}`

      if (!(await shouldExcludeUrl(categoryUrl, urlExclusions))) {
        gameCategoryRoutes.push({
          url: categoryUrl,
          lastModified: category.updated_at ? formatDate(category.updated_at) : currentDate,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    }
  }

  // Add blog category routes to sitemap
  const blogCategoryRoutes: MetadataRoute.Sitemap = []
  if (blogCategories) {
    for (const category of blogCategories) {
      const categoryUrl = `${baseUrl}/blogs/category/${category.slug}`

      if (!(await shouldExcludeUrl(categoryUrl, urlExclusions))) {
        blogCategoryRoutes.push({
          url: categoryUrl,
          lastModified: category.updated_at ? formatDate(category.updated_at) : currentDate,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    }
  }

  // Add footer pages
  const footerPages = ["about-us", "contact-us", "privacy-policy", "terms-of-service", "dmca-disclaimer"]

  const footerRoutes: MetadataRoute.Sitemap = []
  for (const page of footerPages) {
    const pageUrl = `${baseUrl}/footerpages/${page}`

    if (!(await shouldExcludeUrl(pageUrl, urlExclusions))) {
      footerRoutes.push({
        url: pageUrl,
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: 0.4,
      })
    }
  }

  // Add custom sitemap entries
  const customRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: customEntries, error: customEntriesError } = await supabase
      .from("custom_sitemap_entries")
      .select("*")
      .eq("include_in_sitemap", true)

    if (!customEntriesError && customEntries && customEntries.length > 0) {
      for (const entry of customEntries) {
        customRoutes.push({
          url: entry.url,
          lastModified: entry.last_modified ? formatDate(entry.last_modified) : currentDate,
          changeFrequency: entry.change_frequency as any,
          priority: entry.priority,
        })
      }
    }
  } catch (error) {
    console.error("Error fetching custom sitemap entries:", error)
  }

  // Combine all routes
  return [
    ...filteredStaticRoutes,
    ...appRoutes,
    ...gameRoutes,
    ...blogRoutes,
    ...appCategoryRoutes,
    ...gameCategoryRoutes,
    ...blogCategoryRoutes,
    ...footerRoutes,
    ...customRoutes,
  ]
}
