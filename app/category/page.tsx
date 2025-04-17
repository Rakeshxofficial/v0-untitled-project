import type { Metadata } from "next"
import AllCategoriesClient from "./AllCategoriesClient"
import CategoryBreadcrumb from "./breadcrumb"
import { supabase } from "@/lib/supabase"

export const metadata: Metadata = {
  title: "All Categories - installMOD",
  description: "Browse all app and game categories available on installMOD",
  openGraph: {
    title: "All Categories - installMOD",
    description: "Browse all app and game categories available on installMOD",
    type: "website",
  },
}

// Pre-fetch categories for initial render
async function getInitialCategories() {
  const { data: appCategories } = await supabase.from("categories").select("*").eq("type", "app").order("name")

  const { data: gameCategories } = await supabase.from("categories").select("*").eq("type", "game").order("name")

  return {
    appCategories: appCategories || [],
    gameCategories: gameCategories || [],
  }
}

export default async function CategoriesPage() {
  const initialData = await getInitialCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryBreadcrumb />

      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">All Categories</h1>

      <AllCategoriesClient initialData={initialData} />
    </div>
  )
}
