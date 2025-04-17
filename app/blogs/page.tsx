import type { Metadata } from "next"
// Link component removed in favor of standard <a> tags
import { supabase } from "@/lib/supabase"
import BlogCard from "@/app/components/blog-card"

export const metadata: Metadata = {
  title: "Blog Posts | InstallMOD",
  description: "Read the latest articles and updates from InstallMOD",
}

export default async function BlogsPage() {
  // Fetch categories
  const { data: categories } = await supabase.from("categories").select("*").eq("type", "blog").order("name")

  // Fetch published blog posts with their categories
  const { data: blogs } = await supabase
    .from("blogs")
    .select(
      `
     *,
     category:categories(name, slug)
   `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })

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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
          </div>

          {/* Category Filter */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              <a
                href="/blogs"
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors whitespace-nowrap"
              >
                All Posts
              </a>
              {categories?.map((category) => (
                <a
                  key={category.id}
                  href={`/blogs/category/${category.slug}`}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                >
                  {category.name}
                </a>
              ))}
            </div>
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
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No posts found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                There are no blog posts available at the moment. Please check back later.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Categories</h3>
            <ul className="space-y-2">
              {categories?.map((category) => (
                <li key={category.id}>
                  <a
                    href={`/blogs/category/${category.slug}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Popular Posts</h3>
            <div className="space-y-4">
              {blogs
                ?.sort((a, b) => b.view_count - a.view_count)
                .slice(0, 5)
                .map((blog) => (
                  <div key={blog.id} className="flex items-start">
                    <div className="flex-1">
                      <a
                        href={`/blog/${blog.slug}`}
                        className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 font-medium transition-colors"
                      >
                        {blog.title}
                      </a>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {blog.view_count} views • Read: {blog.read_time} min
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
