import type { Metadata } from "next"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { generateSeoMetadata } from "@/app/components/seo-metadata"
import CanonicalTag from "@/app/components/canonical-tag"

// Set metadata for blog categories page
export const metadata: Metadata = generateSeoMetadata({
  title: "All Blog Categories",
  description: "Browse all blog categories on InstallMOD",
  path: "/blogs/category",
  robots: {
    index: true,
    follow: true,
    maxSnippet: 200,
  },
})

export default async function BlogCategoriesPage() {
  // Fetch all blog categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select(`
      id, 
      name, 
      slug, 
      description
    `)
    .eq("type", "blog")
    .order("name")

  if (error) {
    console.error("Error fetching blog categories:", error)
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Blog Categories</h1>
        <p className="text-red-500">Failed to load categories. Please try again later.</p>
      </div>
    )
  }

  // For each category, count the number of blogs
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const { count, error: countError } = await supabase
        .from("blogs")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("status", "published")

      if (countError) {
        console.error(`Error counting blogs for category ${category.id}:`, countError)
        return { ...category, count: 0 }
      }

      return { ...category, count: count || 0 }
    }),
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <CanonicalTag />
      <h1 className="text-3xl font-bold mb-2">Blog Categories</h1>
      <p className="text-gray-500 mb-8">Browse all blog categories on installMOD</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithCount.map((category) => (
          <Link
            href={`/blogs/category/${category.slug}`}
            key={category.id}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {category.description || "Browse articles in this category"}
            </p>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {category.count} {category.count === 1 ? "article" : "articles"}
            </span>
          </Link>
        ))}

        {categoriesWithCount.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No categories found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
