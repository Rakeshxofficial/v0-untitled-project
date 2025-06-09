import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import AppDetailsPage from "../app/[slug]/page"
import BlogDetailPage from "../blog/[slug]/page"
import type { Metadata } from "next"

// Function to check if a slug exists in apps/games
async function checkAppExists(slug: string) {
  // First check apps
  const { data: appData } = await supabase.from("apps").select("id").eq("slug", slug).eq("status", "published").single()

  if (appData) return { exists: true, type: "app" }

  // Then check games
  const { data: gameData } = await supabase
    .from("games")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (gameData) return { exists: true, type: "game" }

  return { exists: false, type: null }
}

// Function to check if a slug exists in blogs
async function checkBlogExists(slug: string) {
  const { data: blogData } = await supabase
    .from("blogs")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  return { exists: !!blogData, type: "blog" }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  // Check if it's an app/game
  const appResult = await checkAppExists(slug)
  if (appResult.exists) {
    // Import and use the app metadata generator
    const { generateMetadata: appMetadataGenerator } = await import("../app/[slug]/page")
    return appMetadataGenerator({ params: Promise.resolve({ slug }) })
  }

  // Check if it's a blog
  const blogResult = await checkBlogExists(slug)
  if (blogResult.exists) {
    // Import and use the blog metadata generator
    const { generateMetadata: blogMetadataGenerator } = await import("../blog/[slug]/page")
    return blogMetadataGenerator({ params: Promise.resolve({ slug }) })
  }

  // Default metadata if not found
  return {
    title: "Content Not Found - InstallMOD",
    description: "The requested content could not be found.",
  }
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Check if it's an app/game
  const appResult = await checkAppExists(slug)
  if (appResult.exists) {
    // Render the app details page
    return <AppDetailsPage params={params} />
  }

  // Check if it's a blog
  const blogResult = await checkBlogExists(slug)
  if (blogResult.exists) {
    // Render the blog details page
    return <BlogDetailPage params={params} />
  }

  // If not found in either, return 404
  notFound()
}

// Generate static paths for common content to improve performance
export async function generateStaticParams() {
  // Fetch popular apps
  const { data: popularApps } = await supabase
    .from("apps")
    .select("slug")
    .eq("status", "published")
    .order("download_count", { ascending: false })
    .limit(20)

  // Fetch popular games
  const { data: popularGames } = await supabase
    .from("games")
    .select("slug")
    .eq("status", "published")
    .order("download_count", { ascending: false })
    .limit(20)

  // Fetch popular blogs
  const { data: popularBlogs } = await supabase
    .from("blogs")
    .select("slug")
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .limit(20)

  const appParams = (popularApps || []).map((app) => ({
    slug: app.slug,
  }))

  const gameParams = (popularGames || []).map((game) => ({
    slug: game.slug,
  }))

  const blogParams = (popularBlogs || []).map((blog) => ({
    slug: blog.slug,
  }))

  return [...appParams, ...gameParams, ...blogParams]
}
