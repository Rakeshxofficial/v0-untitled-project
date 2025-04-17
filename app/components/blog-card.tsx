import Image from "next/image"
import { Clock, User } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface BlogCardProps {
  blog: {
    id: string
    title: string
    slug: string
    excerpt: string
    featured_image: string | null
    created_at: string
    view_count: number
    read_time: number
    publisher?: string
    category?: {
      name: string
      slug: string
    }
    tags?: {
      id: string
      name: string
      slug: string
    }[]
  }
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        {blog.featured_image ? (
          <Image
            src={blog.featured_image || "/placeholder.svg"}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
            <Image
              src="/placeholder.svg?height=400&width=800"
              alt="Placeholder"
              width={800}
              height={400}
              className="object-cover"
            />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(blog.created_at)}</span>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Read: {blog.read_time} min</span>
          </div>
          {blog.publisher && (
            <a
              href={`/publisher/${encodeURIComponent(blog.publisher.replace(/\s+/g, "-"))}`}
              className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
            >
              <User className="h-4 w-4 mr-1" />
              <span>{blog.publisher}</span>
            </a>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          <a href={`/${blog.slug}`} className="hover:text-green-500 transition-colors">
            {blog.title}
          </a>
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{blog.excerpt}</p>
        <div className="flex items-center justify-between">
          {blog.category && (
            <a
              href={`/blogs/category/${blog.category.slug}`}
              className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {blog.category.name}
            </a>
          )}
          <a href={`/${blog.slug}`} className="text-green-500 hover:text-green-600 text-sm font-medium">
            Read full
          </a>
        </div>
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {blog.tags.map((tag) => (
              <a
                key={tag.id}
                href={`/blogs/tag/${tag.slug}`}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {tag.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
