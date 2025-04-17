import Image from "next/image"
// Link component removed in favor of standard <a> tags
import { Zap, Download } from "lucide-react"
import { createAppSlug } from "@/app/utils/slug-utils"
import { supabase, fetchCategories } from "@/lib/supabase"
import type { Metadata } from "next"
import CategoryPageClient from "./CategoryPageClient"

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params

  // Fetch the category
  const { data: category } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    }
  }

  return {
    title: `${category.name} | installMOD`,
    description:
      category.description ||
      `Browse all ${category.name} ${category.type === "app" ? "apps" : "games"} on installMOD.`,
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // Fetch initial category data for SSR
  const { data: category } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The category you're looking for doesn't exist or has been removed.
        </p>
      </div>
    )
  }

  return <CategoryPageClient initialCategory={category} slug={slug} />
}

// Function to get category by slug
async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (error || !data) {
    return null
  }

  return data
}

// Function to get items by category
async function getItemsByCategory(categoryId: string, type: "app" | "game") {
  const table = type === "app" ? "apps" : "games"

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching ${type}s:`, error)
    return []
  }

  return data || []
}

// Reusable card component for both games and apps
function ItemCard({ item, isGame }) {
  const appSlug = item.slug || createAppSlug(item.title, item.category || "")

  return (
    <a
      href={`https://${appSlug}.installmod.com/`}
      className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="relative">
        <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
          <Image src={item.icon_url || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm">
            MOD
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm">
            UPDATED
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm text-center mb-2 text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-green-500 text-xs text-center mb-3">{item.category?.name || ""}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-1">
          <div className="flex items-center">
            <Zap className="w-3 h-3 mr-1 text-yellow-500" />
            <span>v{item.version}</span>
          </div>
          <div className="flex items-center">
            <Download className="w-3 h-3 mr-1 text-blue-500" />
            <span>{item.size}</span>
          </div>
        </div>
      </div>
    </a>
  )
}

// Generate static params for common categories to improve performance
export async function generateStaticParams() {
  // Fetch all categories
  const gameCategories = await fetchCategories("game")
  const appCategories = await fetchCategories("app")

  const gameParams = gameCategories.map((category) => ({
    slug: category.slug,
  }))

  const appParams = appCategories.map((category) => ({
    slug: category.slug,
  }))

  return [...gameParams, ...appParams]
}
