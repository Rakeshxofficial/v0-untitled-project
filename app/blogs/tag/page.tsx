import type { Metadata } from "next"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { generateSeoMetadata } from "@/app/components/seo-metadata"
import CanonicalTag from "@/app/components/canonical-tag"

export const metadata: Metadata = generateSeoMetadata({
  title: "Blog Tags | installMOD",
  description: "Browse all blog tags on installMOD. Find articles by topic, technology, and more.",
  path: "/blogs/tag",
})

export default async function BlogTagsPage() {
  try {
    // First, check if the tags table exists
    const { data: tableExists, error: tableError } = await supabase
      .from("tags")
      .select("id", { count: "exact", head: true })
      .limit(1)

    // If there's an error with the tags table, try a different approach
    if (tableError) {
      console.error("Error checking tags table:", tableError)

      // Try to get tags from blog_tags junction table
      const { data: blogTags, error: blogTagsError } = await supabase
        .from("blog_tags")
        .select("tag_name, tag_slug, blog_id")
        .order("tag_name")

      if (blogTagsError) {
        // If that fails too, try to extract tags from blogs content
        console.error("Error fetching from blog_tags:", blogTagsError)
        throw new Error("Could not fetch tags from any source")
      }

      // Group by tag name and count occurrences
      const tagCounts = {}
      blogTags.forEach((tag) => {
        if (!tagCounts[tag.tag_name]) {
          tagCounts[tag.tag_name] = {
            id: tag.tag_slug,
            name: tag.tag_name,
            slug: tag.tag_slug || tag.tag_name.toLowerCase().replace(/\s+/g, "-"),
            count: 0,
          }
        }
        tagCounts[tag.tag_name].count++
      })

      const tags = Object.values(tagCounts)
      return renderTagsList(tags)
    }

    // If the tags table exists, fetch all tags
    const { data: tags, error } = await supabase.from("tags").select("id, name, slug").order("name")

    if (error) {
      console.error("Error fetching blog tags:", error)
      throw error
    }

    // For each tag, count the number of blogs
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const { count, error: countError } = await supabase
          .from("blog_tags")
          .select("*", { count: "exact", head: true })
          .eq("tag_id", tag.id)

        if (countError) {
          console.error(`Error counting blogs for tag ${tag.id}:`, countError)
          return { ...tag, count: 0 }
        }

        return { ...tag, count: count || 0 }
      }),
    )

    // Sort by count (descending)
    tagsWithCount.sort((a, b) => b.count - a.count)

    return renderTagsList(tagsWithCount)
  } catch (error) {
    console.error("Error in BlogTagsPage:", error)
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Blog Tags</h1>
        <p className="text-red-500">Failed to load tags. Please try again later.</p>
        <p className="text-gray-500 mt-2">Error details: {error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    )
  }
}

function renderTagsList(tags) {
  // Group tags by popularity
  const popularTags = tags.filter((tag) => tag.count >= 5)
  const regularTags = tags.filter((tag) => tag.count >= 2 && tag.count < 5)
  const otherTags = tags.filter((tag) => tag.count < 2)

  return (
    <div className="container mx-auto px-4 py-12">
      <CanonicalTag />
      <h1 className="text-3xl font-bold mb-2">Blog Tags</h1>
      <p className="text-gray-500 mb-8">Browse all blog tags on installMOD</p>

      {popularTags.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
          <div className="flex flex-wrap gap-3">
            {popularTags.map((tag) => (
              <Link
                href={`/blogs/tag/${tag.slug}`}
                key={tag.id}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {tag.name} <span className="ml-1 opacity-80">({tag.count})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {regularTags.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Regular Tags</h2>
          <div className="flex flex-wrap gap-3">
            {regularTags.map((tag) => (
              <Link
                href={`/blogs/tag/${tag.slug}`}
                key={tag.id}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {tag.name} <span className="ml-1 opacity-80">({tag.count})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {otherTags.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Other Tags</h2>
          <div className="flex flex-wrap gap-3">
            {otherTags.map((tag) => (
              <Link
                href={`/blogs/tag/${tag.slug}`}
                key={tag.id}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {tag.name} <span className="ml-1 opacity-80">({tag.count})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tags.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tags found.</p>
        </div>
      )}
    </div>
  )
}
