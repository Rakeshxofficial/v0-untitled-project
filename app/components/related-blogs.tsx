import Link from "next/link"
import Image from "next/image"
import { Eye, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface RelatedBlogsProps {
  blogs: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    featured_image: string | null
    created_at: string
    view_count: number
  }>
}

export default function RelatedBlogs({ blogs }: RelatedBlogsProps) {
  if (!blogs || blogs.length === 0) {
    return null
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-10 mt-10">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Related Posts</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((post) => (
          <Link
            key={post.id}
            href={`/${post.slug}`}
            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
              <Image
                src={post.featured_image || "/placeholder.svg?height=400&width=600"}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(post.created_at)}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {post.view_count || 0} views
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
