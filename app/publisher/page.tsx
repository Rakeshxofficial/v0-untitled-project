import type { Metadata } from "next"
// Link component removed in favor of standard <a> tags
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { generateSeoMetadata } from "@/app/components/seo-metadata"
import CanonicalTag from "@/app/components/canonical-tag"

export const metadata: Metadata = generateSeoMetadata({
  title: "Publishers | installMOD",
  description: "Browse all publishers on installMOD. Find apps and games from your favorite publishers.",
  path: "/publisher",
})

// Helper function to create a slug from a string
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

async function getPublishers() {
  try {
    // First, check the structure of the publishers table
    const { data: tableInfo, error: tableError } = await supabase.from("publishers").select("*").limit(1)

    if (tableError) {
      console.error("Error checking publishers table:", tableError)

      // Fallback: Get publishers from blogs table
      const { data: blogPublishers, error: blogError } = await supabase
        .from("blogs")
        .select("publisher")
        .not("publisher", "is", null)
        .order("publisher")

      if (blogError) {
        console.error("Error fetching publishers from blogs:", blogError)
        return []
      }

      // Extract unique publishers and generate slugs
      const uniquePublishers = Array.from(new Set(blogPublishers.map((b) => b.publisher)))
        .filter(Boolean)
        .map((name) => ({
          id: name,
          name: name,
          slug: generateSlug(name),
          description: null,
          logo_url: null,
          count: blogPublishers.filter((b) => b.publisher === name).length,
        }))

      return uniquePublishers
    }

    // Check if the table has a slug column
    const hasSlugColumn = tableInfo && tableInfo.length > 0 && "slug" in tableInfo[0]

    // Fetch publishers with appropriate columns
    const selectQuery = hasSlugColumn
      ? "id, name, slug, description, logo_url, website"
      : "id, name, description, logo_url, website"

    const { data: publishers, error } = await supabase.from("publishers").select(selectQuery).order("name")

    if (error) {
      console.error("Error fetching publishers:", error)
      return []
    }

    // For each publisher, count the number of blogs and add slug if missing
    const publishersWithCount = await Promise.all(
      publishers.map(async (publisher) => {
        const { count, error: countError } = await supabase
          .from("blogs")
          .select("*", { count: "exact", head: true })
          .eq("publisher", publisher.name)
          .eq("status", "published")

        // Generate slug if it doesn't exist in the table
        const slug = hasSlugColumn ? publisher.slug : generateSlug(publisher.name)

        return {
          ...publisher,
          slug,
          count: countError ? 0 : count || 0,
        }
      }),
    )

    return publishersWithCount
  } catch (error) {
    console.error("Error in getPublishers:", error)
    return []
  }
}

export default async function PublishersPage() {
  const publishers = await getPublishers()

  return (
    <div className="container mx-auto px-4 py-12">
      <CanonicalTag />
      <h1 className="text-3xl font-bold mb-2">Publishers</h1>
      <p className="text-gray-500 mb-8">Browse all publishers on installMOD</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishers.map((publisher) => (
          <a
            href={`/publisher/${publisher.slug}`}
            key={publisher.id}
            className="flex p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mr-4 flex-shrink-0">
              {publisher.logo_url ? (
                <Image
                  src={publisher.logo_url || "/placeholder.svg"}
                  alt={publisher.name}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-[60px] h-[60px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xl font-bold">
                  {publisher.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{publisher.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                {publisher.description || "No description available"}
              </p>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {publisher.count} {publisher.count === 1 ? "article" : "articles"}
              </span>
            </div>
          </a>
        ))}

        {publishers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No publishers found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
