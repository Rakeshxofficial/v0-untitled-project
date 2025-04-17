import { notFound } from "next/navigation"
// Link component removed in favor of standard <a> tags
import { supabase } from "@/lib/supabase"
import BlogCard from "@/app/components/blog-card"
import { getCanonicalUrl } from "@/lib/canonical-url"
import type { Metadata } from "next"

interface TagPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = params

  // Generate the canonical URL for this tag page
  const canonicalUrl = getCanonicalUrl(`/blogs/tag/${slug}`)

  // Fetch tag by slug
  const { data: tag, error } = await supabase.from("tags").select("name").eq("slug", slug).single()

  if (error || !tag) {
    return {
      title: "Tag Not Found",
      description: "Tag not found",
      alternates: {
        canonical: canonicalUrl,
      },
    }
  }

  return {
    title: `${tag.name} - Blog Posts | InstallMOD`,
    description: `All blog posts tagged with ${tag.name}.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${tag.name} - Blog Posts | InstallMOD`,
      description: `Browse all blog posts tagged with ${tag.name} on InstallMOD.`,
      url: canonicalUrl,
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = params

  // Fetch tag by slug
  const { data: tag, error: tagError } = await supabase.from("tags").select("id, name").eq("slug", slug).single()

  if (tagError || !tag) {
    notFound()
  }

  // Fetch blog posts for this tag
  const { data: blogTags, error: blogTagsError } = await supabase
    .from("blog_tags")
    .select("blog_id")
    .eq("tag_id", tag.id)

  if (blogTagsError) {
    console.error("Error fetching blog tags:", blogTagsError)
    return <div>Error loading blog posts.</div>
  }

  const blogIds = blogTags?.map((bt) => bt.blog_id) || []

  // If no blogs with this tag, show empty state
  if (blogIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tag: {tag.name}</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No posts found</h3>
          <p className="text-gray-600 dark:text-gray-300">There are no blog posts with this tag yet.</p>
          <a
            href="/blogs"
            className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Browse all blogs
          </a>
        </div>
      </div>
    )
  }

  // Fetch blogs with these IDs
  const { data: blogs, error: blogsError } = await supabase
    .from("blogs")
    .select(`*, category:categories(name, slug)`)
    .in("id", blogIds)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (blogsError) {
    console.error("Error fetching blogs:", blogsError)
    return <div>Error loading blog posts.</div>
  }

  // Fetch all tags for sidebar
  const { data: allTags } = await supabase.from("tags").select("id, name, slug").order("name")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tag: {tag.name}</h1>
          </div>

          {/* Blog Posts Grid */}
          {blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No posts found</h3>
              <p className="text-gray-600 dark:text-gray-300">There are no blog posts with this tag yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags?.map((t) => (
                <a
                  key={t.id}
                  href={`/blogs/tag/${t.slug}`}
                  className={`text-sm px-3 py-1 rounded-full transition-colors ${
                    t.id === tag.id
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-800"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {t.name}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Browse</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/blogs"
                  className="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                  All Blog Posts
                </a>
              </li>
              <li>
                <a
                  href="/apps"
                  className="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                  Apps
                </a>
              </li>
              <li>
                <a
                  href="/games"
                  className="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                >
                  Games
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
