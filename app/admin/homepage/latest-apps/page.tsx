"use client"

import { useState, useEffect } from "react"
import { Save, X, Smartphone, ArrowUp, ArrowDown } from "lucide-react"
import { supabase, type App, type HomepageFeature } from "@/lib/supabase"

export default function ManageLatestApps() {
  const [apps, setApps] = useState<App[]>([])
  const [featuredApps, setFeaturedApps] = useState<HomepageFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch apps and featured apps on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all apps
        const { data: appsData, error: appsError } = await supabase
          .from("apps")
          .select(`
            *,
            category:categories(name)
          `)
          .eq("status", "published")
          .order("title")

        if (appsError) throw appsError

        // Fetch featured apps
        const { data: featuredData, error: featuredError } = await supabase
          .from("homepage_features")
          .select("*")
          .eq("content_type", "app")
          .order("position")

        if (featuredError) throw featuredError

        setApps(appsData as App[])
        setFeaturedApps(featuredData as HomepageFeature[])
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(error.message || "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Add app to featured list
  const addToFeatured = (appId: string) => {
    // Check if already featured
    if (featuredApps.some((item) => item.content_id === appId)) {
      return
    }

    // Add to featured list with next position
    const nextPosition = featuredApps.length > 0 ? Math.max(...featuredApps.map((item) => item.position)) + 1 : 0

    setFeaturedApps([
      ...featuredApps,
      {
        id: `temp-${Date.now()}`, // Temporary ID until saved
        content_id: appId,
        content_type: "app",
        position: nextPosition,
        created_at: new Date().toISOString(),
      },
    ])
  }

  // Remove app from featured list
  const removeFromFeatured = (appId: string) => {
    setFeaturedApps(featuredApps.filter((item) => item.content_id !== appId))
  }

  // Move app up in the featured list
  const moveUp = (index: number) => {
    if (index === 0) return

    const newFeaturedApps = [...featuredApps]
    const temp = newFeaturedApps[index]
    newFeaturedApps[index] = newFeaturedApps[index - 1]
    newFeaturedApps[index - 1] = temp

    // Update positions
    newFeaturedApps.forEach((item, i) => {
      item.position = i
    })

    setFeaturedApps(newFeaturedApps)
  }

  // Move app down in the featured list
  const moveDown = (index: number) => {
    if (index === featuredApps.length - 1) return

    const newFeaturedApps = [...featuredApps]
    const temp = newFeaturedApps[index]
    newFeaturedApps[index] = newFeaturedApps[index + 1]
    newFeaturedApps[index + 1] = temp

    // Update positions
    newFeaturedApps.forEach((item, i) => {
      item.position = i
    })

    setFeaturedApps(newFeaturedApps)
  }

  // Save featured apps
  const saveFeaturedApps = async () => {
    setSaving(true)

    try {
      // Delete all existing featured apps
      await supabase.from("homepage_features").delete().eq("content_type", "app")

      // Insert new featured apps
      if (featuredApps.length > 0) {
        const { error } = await supabase.from("homepage_features").insert(
          featuredApps.map((item, index) => ({
            content_id: item.content_id,
            content_type: "app",
            position: index,
          })),
        )

        if (error) throw error
      }

      alert("Featured apps saved successfully!")
    } catch (error: any) {
      console.error("Error saving featured apps:", error)
      alert("Failed to save featured apps: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Get app details by ID
  const getAppById = (appId: string) => {
    return apps.find((app) => app.id === appId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Latest Apps</h1>
          <p className="text-gray-500 dark:text-gray-400">Select which apps appear on the homepage</p>
        </div>
        <button
          onClick={saveFeaturedApps}
          disabled={saving}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl">{error}</div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading apps...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Featured Apps */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Featured Apps</h2>

            {featuredApps.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No apps featured yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Select apps from the list on the right to feature them on the homepage
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {featuredApps.map((featured, index) => {
                  const app = getAppById(featured.content_id)
                  if (!app) return null

                  return (
                    <div
                      key={featured.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                          {app.icon_url ? (
                            <img
                              src={app.icon_url || "/placeholder.svg"}
                              alt={app.title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Smartphone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{app.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{app.category?.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === featuredApps.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromFeatured(app.id)}
                          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Available Apps */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Available Apps</h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {apps
                .filter((app) => !featuredApps.some((item) => item.content_id === app.id))
                .map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => addToFeatured(app.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        {app.icon_url ? (
                          <img
                            src={app.icon_url || "/placeholder.svg"}
                            alt={app.title}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Smartphone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{app.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{app.category?.name}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{app.version}</div>
                  </div>
                ))}

              {apps.filter((app) => !featuredApps.some((item) => item.content_id === app.id)).length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">All published apps are featured</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
