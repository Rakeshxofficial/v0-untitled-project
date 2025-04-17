import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Update the supabase client creation to enable real-time
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Update the getSupabaseClient function to enable real-time
export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

// Re-export createClient to ensure it's available for import
export { createClient }

// Database types based on our schema
export type App = {
  id: string
  title: string
  slug: string
  version: string
  category_id: string
  publisher: string
  requirements: string
  size: string
  mod_info: string
  description: string
  google_play_link: string
  status: "draft" | "published"
  icon_url: string
  download_url: string
  download_count: number
  created_at: string
  updated_at: string
  // Basic SEO fields
  meta_title: string
  meta_description: string
  meta_keywords: string
  // Open Graph fields
  og_title: string
  og_description: string
  og_type: string
  og_url: string
  og_image: string
  // Twitter Card fields
  twitter_title: string
  twitter_description: string
  twitter_card: string
  twitter_image: string
  category?: {
    id: string
    name: string
    slug: string
    type: "app" | "game" | "blog" | "faq"
    description: string
    created_at: string
    updated_at: string
  }
}

export type Game = {
  id: string
  title: string
  slug: string
  version: string
  category_id: string
  publisher: string
  requirements: string
  size: string
  mod_info: string
  description: string
  google_play_link: string
  status: "draft" | "published"
  icon_url: string
  download_url: string
  download_count: number
  created_at: string
  updated_at: string
  // Basic SEO fields
  meta_title: string
  meta_description: string
  meta_keywords: string
  // Open Graph fields
  og_title: string
  og_description: string
  og_type: string
  og_url: string
  og_image: string
  // Twitter Card fields
  twitter_title: string
  twitter_description: string
  twitter_card: string
  twitter_image: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

export type Blog = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category_id: string
  featured_image: string
  status: "draft" | "published"
  author_id: string
  created_at: string
  updated_at: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  view_count: number
  // Open Graph fields
  og_title: string
  og_description: string
  og_type: string
  og_url: string
  og_image: string
  // Twitter Card fields
  twitter_title: string
  twitter_description: string
  twitter_card: string
  twitter_image: string
  publisher: string
  read_time: number
}

export type FAQ = {
  id: string
  question: string
  answer: string
  category_id: string
  order: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  type: "app" | "game" | "blog" | "faq"
  description: string
  created_at: string
  updated_at: string
  // SEO fields
  meta_title: string
  meta_description: string
  meta_keywords: string
  og_title: string
  og_description: string
  og_image: string
  twitter_title: string
  twitter_description: string
  twitter_image: string
}

export type Comment = {
  id: string
  content_id: string
  content_type: "app" | "game" | "blog"
  name: string
  email: string
  message: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  reply_to?: string | null
}

export type HomepageFeature = {
  id: string
  content_id: string
  content_type: "app" | "game"
  position: number
  created_at: string
}

export type ModFeature = {
  id: string
  content_id: string
  content_type: "app" | "game"
  feature: string
  created_at: string
}

export type Screenshot = {
  id: string
  content_id: string
  content_type: "app" | "game"
  url: string
  created_at: string
}

export type Analytics = {
  id: string
  date: string
  app_count: number
  game_count: number
  blog_count: number
  download_count: number
  view_count: number
  active_users: number
}

// Add the Publisher type to the existing types
export type Publisher = {
  id: string
  name: string
  description: string
  website: string
  created_at: string
  updated_at: string
}

// Add the RelatedContent type
export type RelatedContent = {
  id: string
  content_id: string
  content_type: "app" | "game"
  related_id: string
  related_type: "app" | "game"
  position: number
  created_at: string
  updated_at: string
}

// Helper functions for common database operations
export async function fetchCategories(type: "app" | "game" | "blog" | "faq") {
  const { data, error } = await supabase.from("categories").select("*").eq("type", type).order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data
}

export async function createSlug(title: string, table: string) {
  // Create a URL-friendly slug from the title
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  // Check if the slug already exists
  const { data } = await supabase.from(table).select("slug").eq("slug", slug).single()

  // If the slug exists, append a random string
  if (data) {
    const randomString = Math.random().toString(36).substring(2, 8)
    slug = `${slug}-${randomString}`
  }

  return slug
}

/**
 * Upload a file to Supabase Storage or use a direct URL
 * @param file The file to upload (optional if url is provided)
 * @param bucket The storage bucket name
 * @param folder Optional folder path within the bucket
 * @param url The direct URL to use instead of uploading (optional)
 * @returns Object with success status, path, and URL if successful
 */
export async function uploadFileOrUseUrl(file: File | null, bucket: string, folder = "", url?: string | null) {
  if (url) {
    // Use the provided URL directly
    return { success: true, path: url, url }
  }

  if (!file) {
    return { success: false, error: "No file provided for upload" }
  }

  try {
    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return { success: true, path: filePath, url: publicUrl }
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return { success: false, error: error.message }
  }
}

// Add a new function to fetch related content
export async function fetchManualRelatedContent(contentId: string, contentType: "app" | "game") {
  const { data, error } = await supabase
    .from("related_content")
    .select("*")
    .eq("content_id", contentId)
    .eq("content_type", contentType)
    .order("position")

  if (error) {
    console.error("Error fetching related content:", error)
    return []
  }

  return data
}
