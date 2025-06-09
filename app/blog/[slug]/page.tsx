import { notFound } from "next/navigation"
import Image from "next/image"
// Link component removed in favor of standard <a> tags
import { supabase } from "@/lib/supabase"
import { Eye, Calendar, ArrowLeft, Clock, User } from "lucide-react"
import Footer from "@/app/components/footer"
import TelegramButton from "@/app/components/telegram-button"
import type { Metadata } from "next"
import ShareButtons from "@/app/components/share-buttons"
import BlogComments from "@/app/components/blog-comments"
import RelatedBlogs from "@/app/components/related-blogs"
import { getCanonicalUrl } from "@/lib/canonical-url"

// Import the schema markup component at the top of the file
import { BlogSchemaMarkup } from "@/app/components/schema-markup"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Use the supabase instance directly
  const { data: blog } = await supabase.from("blogs").select("*").eq("slug", params.slug).single()

  if (!blog) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
    }
  }

  // Generate the canonical URL for this blog - now without the /blog/ prefix
  const canonicalUrl = getCanonicalUrl(`/${params.slug}`)

  return {
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt,
    keywords: blog.meta_keywords,
    // Add canonical URL to metadata
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.og_title || blog.title,
      description: blog.og_description || blog.excerpt,
      type: blog.og_type || "article",
      url: blog.og_url || canonicalUrl,
      images: blog.og_image
        ? [
            {
              url: blog.og_image,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: blog.twitter_card || "summary_large_image",
      title: blog.twitter_title || blog.title,
      description: blog.twitter_description || blog.excerpt,
      images: blog.twitter_image ? [blog.twitter_image] : undefined,
    },
  }
}

// Rest of the component remains the same
export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  // Use the supabase instance directly
  const { data: blog, error } = await supabase
    .from("blogs")
    .select(`*, category:categories(name, slug), tags:blog_tags(tags:tags(id, name, slug))`)
    .eq("slug", params.slug)
    .eq("status", "published")
    .single()

  // After fetching the blog post, add this code to transform the tags data structure
  // Add this after the blog fetch and before the notFound() check
  let transformedBlog = blog
  if (blog && blog.tags) {
    // Transform nested tags structure to a simpler format
    transformedBlog = {
      ...blog,
      tags: blog.tags.map((tagObj) => tagObj.tags),
    }
  }

  // Update the notFound check to use transformedBlog
  if (error || !transformedBlog) {
    console.error("Error fetching blog:", error)
    notFound()
  }

  // Increment view count
  await supabase
    .from("blogs")
    .update({ view_count: (transformedBlog.view_count || 0) + 1 })
    .eq("id", transformedBlog.id)

  // Format date
  const publishDate = new Date(transformedBlog.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Fetch related blog posts based on category and tags
  const { data: relatedPosts } = await supabase
    .from("blogs")
    .select(`id, title, slug, excerpt, featured_image, created_at, view_count`)
    .eq("status", "published")
    .neq("id", transformedBlog.id)
    .in("category_id", [transformedBlog.category_id])
    .order("created_at", { ascending: false })
    .limit(3)

  // Get the full URL for sharing
  const siteUrl = "https://installmod.com"
  const fullUrl = `${siteUrl}/${params.slug}`

  // Inside the BlogDetailPage component, before the return statement, add this code to prepare breadcrumb data
  // Add this after fetching related posts and before the return statement
  const breadcrumbData = [
    { name: "Home", url: "https://installmod.com" },
    { name: "Blog", url: "https://installmod.com/blogs" },
    {
      name: transformedBlog.category?.name || "Category",
      url: `https://installmod.com/blogs/category/${transformedBlog.category?.slug || ""}`,
    },
    { name: transformedBlog.title, url: `https://installmod.com/${params.slug}` },
  ]

  // In the return statement, add the schema markup component right after the opening div
  // Add this right after the first div in the return statement
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Schema Markup */}
      <BlogSchemaMarkup blog={transformedBlog} breadcrumbs={breadcrumbData} />

      {/* Rest of the component remains the same */}

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <a href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              Home
            </a>
            <span className="mx-2">/</span>
            <a href="/blogs" className="hover:text-gray-700 dark:hover:text-gray-300">
              Blog
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{transformedBlog.title}</span>
          </div>

          {/* Back button */}
          <a href="/blogs" className="inline-flex items-center text-green-500 hover:text-green-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all posts
          </a>

          {/* Blog header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {transformedBlog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {publishDate}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {transformedBlog.view_count || 0} views
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {transformedBlog.read_time || 5} min read
              </div>
              {transformedBlog.publisher && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <a
                    href={`/publisher/${encodeURIComponent(transformedBlog.publisher.replace(/\s+/g, "-"))}`}
                    className="hover:text-green-500 transition-colors"
                  >
                    {transformedBlog.publisher}
                  </a>
                </div>
              )}
              {transformedBlog.category && (
                <a
                  href={`/blogs/category/${transformedBlog.category.slug}`}
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {transformedBlog.category.name}
                </a>
              )}
            </div>
          </div>

          {/* Tags */}
          {transformedBlog.tags && transformedBlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {transformedBlog.tags.map((tag) => (
                <a
                  key={tag.id}
                  href={`/blogs/tag/${tag.slug}`}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  #{tag.name}
                </a>
              ))}
            </div>
          )}

          {/* Featured image */}
          {transformedBlog.featured_image && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={transformedBlog.featured_image || "/placeholder.svg"}
                alt={transformedBlog.title}
                width={1200}
                height={630}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Blog content */}
          <div
            className="prose prose-lg max-w-none dark:prose-invert mb-12"
            dangerouslySetInnerHTML={{ __html: transformedBlog.content }}
          />

          {/* Social Share Buttons */}
          <div className="flex justify-end mb-8">
            <ShareButtons
              url={`/blog/${params.slug}`}
              title={transformedBlog.title}
              description={transformedBlog.excerpt}
            />
          </div>

          {/* Related posts */}
          {relatedPosts && relatedPosts.length > 0 && <RelatedBlogs blogs={relatedPosts} />}

          {/* Comments Section */}
          <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-10">
            <BlogComments blogId={transformedBlog.id} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Telegram Button */}
      <TelegramButton />
    </div>
  )
}
