import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Eye, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default async function FromOurBlog() {
  // Fetch latest published blog posts
  const { data: blogPosts, error } = await supabase
    .from("blogs")
    .select("id, title, excerpt, featured_image, view_count, created_at, slug")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Error fetching blog posts:", error)
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg relative">
            <FileText className="w-5 h-5 text-white" />
            {/* Add glow effect */}
            <div className="absolute inset-0 bg-orange-400 rounded-full blur-md opacity-30 -z-10"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">From Our Blog</h2>
        </div>
        <Link
          href="/blogs"
          className="flex items-center text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm font-medium transition-colors group"
        >
          View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts && blogPosts.length > 0 ? (
          blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                <Image
                  src={post.featured_image || "/placeholder.svg?height=192&width=384"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Eye className="w-3 h-3 mr-1" /> {post.view_count || 0} views
                  </span>
                  <Link
                    href={`/${post.slug}`}
                    className="text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm font-medium transition-colors"
                  >
                    Read full post
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Fallback content if no blog posts are available
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No blog posts available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}
