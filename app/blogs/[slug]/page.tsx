import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Clock, Calendar, Eye, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import ShareButtons from "@/app/components/share-buttons"
import BlogComments from "@/app/components/blog-comments"
import RelatedBlogs from "@/app/components/related-blogs"

interface BlogPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = params

  // Fetch blog post with category
  const { data: blog, error } = await supabase
    .from("blogs")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !blog) {
    notFound()
  }

  // Increment view count
  await supabase.rpc("increment_blog_view", { blog_id: blog.id })

  // Fetch tags for this blog
  const { data: tags } = await supabase
    .from("blog_tags")
    .select(
      `
      tags:tags(id, name, slug)
    `,
    )
    .eq("blog_id", blog.id)

  const blogTags = tags?.map((tag) => tag.tags) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-green-500">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blogs" className="hover:text-green-500">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-300">{blog.title}</span>
        </div>

        {/* Blog Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{blog.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(blog.created_at)}</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Eye className="h-4 w-4 mr-1" />
              <span>{blog.view_count} views</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>Read: {blog.read_time || 5} min</span>
            </div>
            {blog.publisher && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4 mr-1" />
                <span>{blog.publisher}</span>
              </div>
            )}
            {blog.category && (
              <Link
                href={`/blogs/category/${blog.category.slug}`}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {blog.category.name}
              </Link>
            )}
          </div>

          {/* Featured Image */}
          {blog.featured_image && (
            <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image
                src={blog.featured_image || "/placeholder.svg"}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Share Buttons */}
          <ShareButtons title={blog.title} url={`/blogs/${blog.slug}`} />
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {/* Tags */}
        {blogTags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blogTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blogs/tag/${tag.slug}`}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <BlogComments blogId={blog.id} />

        {/* Related Posts */}
        <RelatedBlogs currentBlogId={blog.id} categoryId={blog.category?.id} />
      </div>
    </div>
  )
}
