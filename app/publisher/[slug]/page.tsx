import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { ExternalLink, BookOpen, Smartphone, Gamepad2 } from "lucide-react"
import Footer from "@/app/components/footer"
import TelegramButton from "@/app/components/telegram-button"
import { createAppSlug } from "@/app/utils/slug-utils"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Decode the slug to get the publisher name
  const publisherName = decodeURIComponent(params.slug.replace(/-/g, " "))

  // Fetch publisher details
  const { data: publisher } = await supabase.from("publishers").select("*").ilike("name", publisherName).single()

  if (!publisher) {
    return {
      title: "Publisher Not Found",
      description: "The requested publisher could not be found.",
    }
  }

  return {
    title: `${publisher.name} - Publisher Profile`,
    description: publisher.description || `Check out content from ${publisher.name}`,
  }
}

export default async function PublisherProfilePage({ params }: { params: { slug: string } }) {
  // Decode the slug to get the publisher name
  const publisherName = decodeURIComponent(params.slug.replace(/-/g, " "))

  // Fetch publisher details
  const { data: publisher, error: publisherError } = await supabase
    .from("publishers")
    .select("*")
    .ilike("name", publisherName)
    .single()

  if (publisherError || !publisher) {
    notFound()
  }

  // Fetch blogs by this publisher
  const { data: blogs } = await supabase
    .from("blogs")
    .select(`
      id, 
      title, 
      slug, 
      excerpt, 
      featured_image, 
      created_at, 
      view_count,
      read_time,
      category:categories(name, slug)
    `)
    .eq("publisher", publisherName)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Fetch apps by this publisher
  const { data: apps } = await supabase
    .from("apps")
    .select(`
      id, 
      title, 
      slug, 
      version, 
      size, 
      icon_url,
      updated_at,
      category:categories(name, slug)
    `)
    .eq("publisher", publisherName)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Fetch games by this publisher
  const { data: games } = await supabase
    .from("games")
    .select(`
      id, 
      title, 
      slug, 
      version, 
      size, 
      icon_url,
      updated_at,
      category:categories(name, slug)
    `)
    .eq("publisher", publisherName)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Add a subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10"></div>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-300">Publisher</span>
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{publisher.name}</span>
          </div>

          {/* Publisher Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">{publisher.name}</h1>

            {publisher.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{publisher.description}</p>
            )}

            {publisher.website && (
              <a
                href={publisher.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Visit Website <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            )}
          </div>

          {/* Blog Posts Section */}
          {blogs && blogs.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg relative">
                  <BookOpen className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-30 -z-10"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Blog Posts</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                      <Image
                        src={blog.featured_image || "/placeholder.svg?height=400&width=600"}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">{blog.excerpt}</p>
                      {blog.category && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                          {blog.category.name}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Apps Section */}
          {apps && apps.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg relative">
                  <Smartphone className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-30 -z-10"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Apps</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {apps.map((app) => {
                  const appSlug = app.slug || createAppSlug(app.title, app.category?.name || "app")
                  return (
                    <Link
                      key={app.id}
                      href={`/app/${appSlug}`}
                      className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="relative">
                        <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                          <Image
                            src={app.icon_url || "/placeholder.svg?height=128&width=128"}
                            alt={app.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm">
                            MOD
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-sm text-center mb-2 text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
                          {app.title}
                        </h3>
                        {app.category && <p className="text-green-500 text-xs text-center mb-3">{app.category.name}</p>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Games Section */}
          {games && games.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
                  <Gamepad2 className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30 -z-10"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Games</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {games.map((game) => {
                  const gameSlug = game.slug || createAppSlug(game.title, game.category?.name || "game")
                  return (
                    <Link
                      key={game.id}
                      href={`/app/${gameSlug}`}
                      className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="relative">
                        <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                          <Image
                            src={game.icon_url || "/placeholder.svg?height=128&width=128"}
                            alt={game.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm">
                            MOD
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-sm text-center mb-2 text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
                          {game.title}
                        </h3>
                        {game.category && (
                          <p className="text-green-500 text-xs text-center mb-3">{game.category.name}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Content Message */}
          {(!blogs || blogs.length === 0) && (!apps || apps.length === 0) && (!games || games.length === 0) && (
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl text-center">
              <p className="text-gray-500 dark:text-gray-400">No content available from this publisher yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Telegram Button */}
      <TelegramButton />
    </div>
  )
}
