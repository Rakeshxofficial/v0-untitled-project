import Image from "next/image"
import { Zap, Download, Smartphone } from "lucide-react"
import Footer from "@/app/components/footer"
import TelegramButton from "@/app/components/telegram-button"
import { createAppSlug } from "@/app/utils/slug-utils"
import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"

// Add this metadata export before the component
export const metadata: Metadata = {
  title: "Latest Apps - New Modded Android Applications - InstallMOD",
  description:
    "Discover and download the newest modded apps for Android. Get the latest MOD APKs with premium features unlocked as soon as they're available.",
  openGraph: {
    title: "Latest Modded Apps - InstallMOD",
    description: "Stay up-to-date with the newest modded Android applications. Fresh MOD APKs added regularly.",
    type: "website",
  },
}

export default async function LatestAppsPage() {
  // Fetch latest apps from Supabase
  const { data: apps, error } = await supabase
    .from("apps")
    .select(`
      *,
      category:categories(name)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(24)

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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Latest Apps</h1>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400 mb-6">
              Error loading apps: {error.message}
            </div>
          )}

          {!error && apps && apps.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl text-center">
              <p className="text-gray-500 dark:text-gray-400">No apps available yet. Check back soon!</p>
            </div>
          )}

          {/* Apps grid */}
          {!error && apps && apps.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {apps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}

          {/* View more button */}
          <div className="mt-8 text-center">
            <a
              href="/apps"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors inline-flex items-center"
            >
              View All Apps
            </a>
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

function AppCard({ app }) {
  const appSlug = app.slug || createAppSlug(app.title, app.category?.name || "app")
  const categoryName = app.category?.name || "App"

  return (
    <a
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
        <p className="text-green-500 text-xs text-center mb-3">{categoryName}</p>
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
