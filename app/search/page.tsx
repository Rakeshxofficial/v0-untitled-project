import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { Gamepad2, Smartphone, FileText, Folder, Tag, Search } from "lucide-react"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Promise<Metadata> {
  const query = searchParams.q || ""

  return {
    title: query ? `Search results for "${query}" - installMOD` : "Search - installMOD",
    description: query
      ? `Find apps, games, blogs, and more related to "${query}" on installMOD`
      : "Search for mod APKs, games, apps, tutorials and more on installMOD",
    openGraph: {
      title: query ? `Search results for "${query}" - installMOD` : "Search - installMOD",
      description: query
        ? `Find apps, games, blogs, and more related to "${query}" on installMOD`
        : "Search for mod APKs, games, apps, tutorials and more on installMOD",
    },
  }
}

// Main search page component
export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || ""
  const limit = 10 // More results per category for the dedicated page

  let results = {
    apps: [],
    games: [],
    blogs: [],
    categories: [],
    tags: [],
  }

  // Only fetch results if there's a query
  if (query) {
    // Search apps
    const { data: apps } = await supabase
      .from("apps")
      .select("id, title, slug, icon_url, version, size, category_id, categories(name), description")
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .eq("status", "published")
      .order("download_count", { ascending: false })
      .limit(limit)

    // Search games
    const { data: games } = await supabase
      .from("games")
      .select("id, title, slug, icon_url, version, size, category_id, categories(name), description")
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .eq("status", "published")
      .order("download_count", { ascending: false })
      .limit(limit)

    // Search blogs
    const { data: blogs } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, featured_image, created_at")
      .or(`title.ilike.%${query}%, content.ilike.%${query}%, excerpt.ilike.%${query}%`)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit)

    // Search categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, slug, type, description")
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .order("name")
      .limit(limit)

    // Search blog tags
    const { data: tags } = await supabase
      .from("tags")
      .select("id, name, slug")
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(limit)

    results = {
      apps: apps || [],
      games: games || [],
      blogs: blogs || [],
      categories: categories || [],
      tags: tags || [],
    }
  }

  const totalResults =
    results.apps.length + results.games.length + results.blogs.length + results.categories.length + results.tags.length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">{query ? `Search results for "${query}"` : "Search installMOD"}</h1>

        {/* Search form */}
        <form action="/search" method="get" className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search for apps, games, blogs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {query && (
        <div className="mb-4 text-sm text-gray-500">
          {totalResults === 0
            ? "No results found. Try a different search term."
            : `Found ${totalResults} result${totalResults === 1 ? "" : "s"}`}
        </div>
      )}

      {/* Search results */}
      <div className="space-y-10">
        {/* Apps */}
        {results.apps.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-500" />
              <span>Apps</span>
              <span className="text-sm font-normal text-gray-500">({results.apps.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.apps.map((app: any) => (
                <Link
                  key={app.id}
                  href={`https://${app.slug}.installmod.com`}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    <Image src={app.icon_url || "/placeholder.svg"} alt={app.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 truncate">{app.title}</h3>
                    <div className="text-sm text-gray-500 mb-1">{app.categories?.name || "App"}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {app.description?.substring(0, 120) || "Download this app now"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Games */}
        {results.games.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-green-500" />
              <span>Games</span>
              <span className="text-sm font-normal text-gray-500">({results.games.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.games.map((game: any) => (
                <Link
                  key={game.id}
                  href={`https://${game.slug}.installmod.com/`}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    <Image src={game.icon_url || "/placeholder.svg"} alt={game.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 truncate">{game.title}</h3>
                    <div className="text-sm text-gray-500 mb-1">{game.categories?.name || "Game"}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {game.description?.substring(0, 120) || "Download this game now"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blogs */}
        {results.blogs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              <span>Blogs</span>
              <span className="text-sm font-normal text-gray-500">({results.blogs.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.blogs.map((blog: any) => (
                <Link
                  key={blog.id}
                  href={`/${blog.slug}`}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    <Image
                      src={blog.featured_image || "/placeholder.svg"}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 truncate">{blog.title}</h3>
                    <div className="text-sm text-gray-500 mb-1">
                      {blog.created_at ? formatDate(blog.created_at) : "Recently published"}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {blog.excerpt || "Read this blog post for more information"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {results.categories.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-green-500" />
              <span>Categories</span>
              <span className="text-sm font-normal text-gray-500">({results.categories.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    {category.type === "app" ? (
                      <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : category.type === "game" ? (
                      <Gamepad2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Folder className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{category.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{category.type}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {results.tags.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-500" />
              <span>Tags</span>
              <span className="text-sm font-normal text-gray-500">({results.tags.length})</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {results.tags.map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/blogs/tag/${tag.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  <span>{tag.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query && totalResults === 0 && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">No results found</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any matches for "{query}". Try different keywords or check for typos.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!query && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">Search for apps, games, blogs and more</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter keywords in the search box above to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
