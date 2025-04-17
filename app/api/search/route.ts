import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")
  const limit = Number.parseInt(searchParams.get("limit") || "5")

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Search apps
    const { data: apps, error: appsError } = await supabase
      .from("apps")
      .select("id, title, slug, icon_url, version, size, category_id, categories(name)")
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .eq("status", "published")
      .order("download_count", { ascending: false })
      .limit(limit)

    if (appsError) throw appsError

    // Search games
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, title, slug, icon_url, version, size, category_id, categories(name)")
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .eq("status", "published")
      .order("download_count", { ascending: false })
      .limit(limit)

    if (gamesError) throw gamesError

    // Search blogs
    const { data: blogs, error: blogsError } = await supabase
      .from("blogs")
      .select("id, title, slug, excerpt, featured_image, created_at")
      .or(`title.ilike.%${query}%, content.ilike.%${query}%, excerpt.ilike.%${query}%`)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (blogsError) throw blogsError

    // Search categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug, type")
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .order("name")
      .limit(limit)

    if (categoriesError) throw categoriesError

    // Search blog tags
    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .select("id, name, slug")
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(limit)

    if (tagsError) throw tagsError

    return NextResponse.json({
      results: {
        apps: apps || [],
        games: games || [],
        blogs: blogs || [],
        categories: categories || [],
        tags: tags || [],
      },
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
