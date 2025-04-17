"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Search, Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function ManageTrendingApps() {
  const [apps, setApps] = useState([])
  const [trendingApps, setTrendingApps] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch all published apps
        const { data: appsData, error: appsError } = await supabase
          .from("apps")
          .select(`
            id, 
            title, 
            version, 
            size, 
            icon_url,
            category:categories(name)
          `)
          .eq("status", "published")
          .order("title")

        if (appsError) throw appsError

        // Fetch current trending apps
        const { data: trendingData, error: trendingError } = await supabase
          .from("trending_apps")
          .select("*")
          .order("position")

        if (trendingError) throw trendingError

        // Map trending apps to include app details
        const trendingWithDetails = await Promise.all(
          trendingData.map(async (item) => {
            const app = appsData.find((app) => app.id === item.app_id)
            return {
              ...item,
              app,
            }
          }),
        )

        setApps(appsData)
        setTrendingApps(trendingWithDetails)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = apps.filter(
      (app) =>
        app.title.toLowerCase().includes(query) ||
        (app.category?.name && app.category.name.toLowerCase().includes(query)),
    )
    setSearchResults(results)
  }, [searchQuery, apps])

  const addToTrending = (app) => {
    // Check if app is already in trending
    if (trendingApps.some((item) => item.app_id === app.id)) {
      toast({
        title: "Already Added",
        description: "This app is already in the trending list.",
        variant: "default",
      })
      return
    }

    const newTrendingApp = {
      id: `temp-${Date.now()}`, // Temporary ID for UI
      app_id: app.id,
      position: trendingApps.length,
      app, // Include app details for UI
    }

    setTrendingApps([...trendingApps, newTrendingApp])
    setSearchQuery("")
    setSearchResults([])
  }

  const removeFromTrending = (index) => {
    const newTrendingApps = [...trendingApps]
    newTrendingApps.splice(index, 1)

    // Update positions
    const updatedTrendingApps = newTrendingApps.map((item, idx) => ({
      ...item,
      position: idx,
    }))

    setTrendingApps(updatedTrendingApps)
  }

  const moveItem = (index, direction) => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === trendingApps.length - 1)) {
      return
    }

    const newTrendingApps = [...trendingApps]
    const newIndex = direction === "up" ? index - 1 : index + 1

    // Swap items
    const temp = newTrendingApps[index]
    newTrendingApps[index] = newTrendingApps[newIndex]
    newTrendingApps[newIndex] = temp

    // Update positions
    const updatedTrendingApps = newTrendingApps.map((item, idx) => ({
      ...item,
      position: idx,
    }))

    setTrendingApps(updatedTrendingApps)
  }

  const saveTrendingApps = async () => {
    setSaving(true)
    try {
      // Delete all existing trending apps
      const { error: deleteError } = await supabase.from("trending_apps").delete().not("id", "is", null)

      if (deleteError) throw deleteError

      // Insert new trending apps
      if (trendingApps.length > 0) {
        // Remove any duplicate app_ids by creating a map
        const uniqueAppsMap = new Map()
        trendingApps.forEach((item, index) => {
          if (!uniqueAppsMap.has(item.app_id)) {
            uniqueAppsMap.set(item.app_id, {
              app_id: item.app_id,
              position: index,
            })
          }
        })

        // Convert map values to array
        const trendingToInsert = Array.from(uniqueAppsMap.values())

        const { error: insertError } = await supabase.from("trending_apps").insert(trendingToInsert)

        if (insertError) throw insertError

        // Refresh the trending apps list after saving
        const { data: refreshedData, error: refreshError } = await supabase
          .from("trending_apps")
          .select("*")
          .order("position")

        if (refreshError) throw refreshError

        // Map trending apps to include app details
        const refreshedWithDetails = await Promise.all(
          refreshedData.map(async (item) => {
            const app = apps.find((app) => app.id === item.app_id)
            return {
              ...item,
              app,
            }
          }),
        )

        setTrendingApps(refreshedWithDetails)
      }

      toast({
        title: "Success",
        description: "Trending apps have been updated successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error saving trending apps:", error)
      toast({
        title: "Error",
        description: "Failed to save trending apps. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Manage Trending Apps</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Manage Trending Apps</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Search and Add Apps */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Search Apps</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by app name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Search Results ({searchResults.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden relative">
                          {app.icon_url && (
                            <img
                              src={app.icon_url || "/placeholder.svg"}
                              alt={app.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{app.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {app.category?.name || "App"} • v{app.version}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToTrending(app)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full"
                        title="Add to trending"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Current Trending Apps */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Current Trending Apps</h2>
              <button
                onClick={saveTrendingApps}
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>

            {trendingApps.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No trending apps selected. Search and add apps from the left panel.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {trendingApps.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500 dark:text-gray-400 font-medium w-6 text-center">{index + 1}</div>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden relative">
                        {item.app?.icon_url && (
                          <img
                            src={item.app.icon_url || "/placeholder.svg"}
                            alt={item.app.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{item.app?.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.app?.category?.name || "App"} • v{item.app?.version}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === trendingApps.length - 1}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromTrending(index)}
                        className="text-red-500 hover:text-red-600 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
