import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import BlogCard from "@/app/components/blog-card"
import { getCanonicalUrl } from "@/lib/canonical-url"
import type { Metadata } from "next"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params

  // Generate the canonical URL for this category page
  const canonicalUrl = getCanonicalUrl(`/blogs/category/${slug}`)

  // Fetch category by slug
  const { data: category, error } = await supabase
    .from("categories")
    .select("name, meta_title, meta_description")
    .eq("slug", slug)
    .eq("type", "blog")
    .single()

  if (error || !category) {
    return {
      title: "Category Not Found",
      description: "Category not found",
      alternates: {
        canonical: canonicalUrl,
      },
    }
  }

  return {
    title: category.meta_title || `${category.name} Blog Posts`,
    description: category.meta_description || `All blog posts in the ${category.name} category.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: category.meta_title || `${category.name} Blog Posts | InstallMOD`,
      description: category.meta_description || `Browse all blog posts in the ${category.name} category on InstallMOD.`,
      url: canonicalUrl,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params

  // Fetch category by slug
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .eq("type", "blog")
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch blog posts for this category
  const { data: blogs, error: blogsError } = await supabase
    .from("blogs")
    .select(`*, category:categories(name, slug)`)
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (blogsError) {
    console.error("Error fetching blogs:", blogsError)
    return <div>Error loading blog posts.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Category: {category.name}</h1>
      {blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No posts found</h3>
          <p className="text-gray-600 dark:text-gray-300">There are no blog posts in this category yet.</p>
        </div>
      )}
    </div>
  )
}
