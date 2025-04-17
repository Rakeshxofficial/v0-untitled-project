"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
// Link component removed in favor of standard <a> tags
import { Zap, Download, Smartphone } from "lucide-react"
import Footer from "@/app/components/footer"
import TelegramButton from "@/app/components/telegram-button"
import { supabase, type App, type Category } from "@/lib/supabase"

export default function AppsPageClient() {
  const [apps, setApps] = useState<App[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "app")
          .order("name")

        if (categoriesError) throw categoriesError

        // Fetch published apps
        const { data: appsData, error: appsError } = await supabase
          .from("apps")
          .select(`
            *,
            category:categories(id, name)
          `)
          .eq("status", "published")
          .order("created_at", { ascending: false })

        if (appsError) throw appsError

        setCategories(categoriesData as Category[])
        setApps(appsData as App[])
      } catch (err: any) {
        console.error("Error fetching apps:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter apps by selected category
  const filteredApps = selectedCategory === "All" ? apps : apps.filter((app) => app.category?.id === selectedCategory)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Add a subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10"></div>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg relative">
              <Smartphone className="w-5 h-5 text-white" />
              {/* Add glow effect */}
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-30 -z-10"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">All Apps</h1>
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "All"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              All Apps
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-64 animate-pulse"></div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400">
              Error loading apps: {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredApps.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {selectedCategory === "All"
                  ? "No apps available yet. Check back soon!"
                  : "No apps in this category yet."}
              </p>
            </div>
          )}

          {/* Apps grid */}
          {!loading && !error && filteredApps.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
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

function AppCard({ app }: { app: App }) {
  return (
    <a
      href={`https://${app.slug}.installmod.com/`}
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
        {app.updated_at && new Date(app.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm">
              UPDATED
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm text-center mb-2 text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
          {app.title}
        </h3>
        <p className="text-green-500 text-xs text-center mb-3">{app.category?.name || "App"}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-1">
          <div className="flex items-center">
            <Zap className="w-3 h-3 mr-1 text-yellow-500" />
            <span>v{app.version}</span>
          </div>
          <div className="flex items-center">
            <Download className="w-3 h-3 mr-1 text-blue-500" />
            <span>{app.size}</span>
          </div>
        </div>
      </div>
    </a>
  )
}
