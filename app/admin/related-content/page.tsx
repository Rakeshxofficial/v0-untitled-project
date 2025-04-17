"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Search, Plus, Trash2, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getPublicUrl } from "@/lib/utils"

type ContentItem = {
  id: string
  title: string
  slug: string
  version: string
  icon_url: string
  icon_bg_color?: string
  content_type: "app" | "game"
}

type RelatedItem = ContentItem & {
  position: number
}

export default function RelatedContentManager() {
  // States for the component
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | "app" | "game">("all")
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([])
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Fetch all content items on component mount
  useEffect(() => {
    const fetchAllContent = async () => {
      setLoading(true)
      try {
        // Fetch published apps
        const { data: apps, error: appsError } = await supabase
          .from("apps")
          .select("id, title, slug, version, icon_url, icon_bg_color")
          .eq("status", "published")
          .order("title")

        if (appsError) throw appsError

        // Fetch published games
        const { data: games, error: gamesError } = await supabase
          .from("games")
          .select("id, title, slug, version, icon_url, icon_bg_color")
          .eq("status", "published")
          .order("title")

        if (gamesError) throw gamesError

        // Combine and format the data
        const formattedApps = (apps || []).map((app) => ({
          ...app,
          content_type: "app" as const,
        }))

        const formattedGames = (games || []).map((game) => ({
          ...game,
          content_type: "game" as const,
        }))

        const allContent = [...formattedApps, ...formattedGames].sort((a, b) => a.title.localeCompare(b.title))
        setContentItems(allContent)
        setFilteredItems(allContent)
      } catch (error) {
        console.error("Error fetching content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllContent()
  }, [])

  // Filter content items based on search query and content type
  useEffect(() => {
    let filtered = [...contentItems]

    // Filter by content type
    if (contentTypeFilter !== "all") {
      filtered = filtered.filter((item) => item.content_type === contentTypeFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.slug.toLowerCase().includes(query) ||
          item.version.toLowerCase().includes(query),
      )
    }

    setFilteredItems(filtered)
  }, [searchQuery, contentTypeFilter, contentItems])

  // Fetch related items when a content item is selected
  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!selectedContent) {
        setRelatedItems([])
        return
      }

      try {
        // Fetch manually set related content
        const { data: relatedData, error: relatedError } = await supabase
          .from("related_content")
          .select("*")
          .eq("content_id", selectedContent.id)
          .eq("content_type", selectedContent.content_type)
          .order("position")

        if (relatedError) throw relatedError

        if (relatedData && relatedData.length > 0) {
          // Fetch details for each related item
          const relatedDetails = await Promise.all(
            relatedData.map(async (relation) => {
              const { data, error } = await supabase
                .from(relation.related_type === "app" ? "apps" : "games")
                .select("id, title, slug, version, icon_url, icon_bg_color")
                .eq("id", relation.related_id)
                .single()

              if (error || !data) {
                console.error(`Error fetching related ${relation.related_type}:`, error)
                return null
              }

              return {
                ...data,
                content_type: relation.related_type as "app" | "game",
                position: relation.position,
              }
            }),
          )

          // Filter out any null values and sort by position
          const validRelatedItems = relatedDetails
            .filter((item): item is RelatedItem => item !== null)
            .sort((a, b) => a.position - b.position)

          setRelatedItems(validRelatedItems)
        } else {
          setRelatedItems([])
        }
      } catch (error) {
        console.error("Error fetching related items:", error)
        setRelatedItems([])
      }
    }

    fetchRelatedItems()
  }, [selectedContent])

  // Handle selecting a content item
  const handleSelectContent = (item: ContentItem) => {
    setSelectedContent(item)
  }

  // Handle adding a related item
  const handleAddRelatedItem = (item: ContentItem) => {
    // Don't add if it's the same as the selected content
    if (selectedContent && item.id === selectedContent.id && item.content_type === selectedContent.content_type) {
      setNotification({
        type: "error",
        message: "Cannot add the same item as related content",
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Don't add if it's already in the related items
    const alreadyExists = relatedItems.some(
      (relatedItem) => relatedItem.id === item.id && relatedItem.content_type === item.content_type,
    )

    if (alreadyExists) {
      setNotification({
        type: "error",
        message: "This item is already in the related content list",
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Add the item to related items with the next position
    const nextPosition = relatedItems.length > 0 ? Math.max(...relatedItems.map((item) => item.position)) + 1 : 0
    setRelatedItems([...relatedItems, { ...item, position: nextPosition }])
  }

  // Handle removing a related item
  const handleRemoveRelatedItem = (index: number) => {
    const newRelatedItems = [...relatedItems]
    newRelatedItems.splice(index, 1)

    // Reorder positions
    const reorderedItems = newRelatedItems.map((item, idx) => ({
      ...item,
      position: idx,
    }))

    setRelatedItems(reorderedItems)
  }

  // Handle moving a related item up in the list
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newRelatedItems = [...relatedItems]
    const temp = newRelatedItems[index]
    newRelatedItems[index] = { ...newRelatedItems[index - 1], position: index }
    newRelatedItems[index - 1] = { ...temp, position: index - 1 }
    setRelatedItems(newRelatedItems)
  }

  // Handle moving a related item down in the list
  const handleMoveDown = (index: number) => {
    if (index === relatedItems.length - 1) return
    const newRelatedItems = [...relatedItems]
    const temp = newRelatedItems[index]
    newRelatedItems[index] = { ...newRelatedItems[index + 1], position: index }
    newRelatedItems[index + 1] = { ...temp, position: index + 1 }
    setRelatedItems(newRelatedItems)
  }

  // Handle saving the related items
  const handleSaveRelatedItems = async () => {
    if (!selectedContent) return

    setSaving(true)
    try {
      // First, delete all existing related content for this item
      const { error: deleteError } = await supabase
        .from("related_content")
        .delete()
        .eq("content_id", selectedContent.id)
        .eq("content_type", selectedContent.content_type)

      if (deleteError) throw deleteError

      // Then, insert the new related items
      if (relatedItems.length > 0) {
        const relatedData = relatedItems.map((item, index) => ({
          content_id: selectedContent.id,
          content_type: selectedContent.content_type,
          related_id: item.id,
          related_type: item.content_type,
          position: index, // Ensure positions are sequential
        }))

        const { error: insertError } = await supabase.from("related_content").insert(relatedData)

        if (insertError) throw insertError
      }

      setNotification({
        type: "success",
        message: "Related content saved successfully",
      })
      setTimeout(() => setNotification(null), 3000)
    } catch (error: any) {
      console.error("Error saving related items:", error)
      setNotification({
        type: "error",
        message: `Error saving related content: ${error.message}`,
      })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading content...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Related Content Manager</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage manually selected related content for apps and games
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Selection Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Select Content</h2>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="Search by title or slug..."
              />
            </div>
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value as "all" | "app" | "game")}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="app">Apps Only</option>
              <option value="game">Games Only</option>
            </select>
          </div>

          {/* Content List */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No content items found. Try adjusting your search.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map((item) => (
                    <li
                      key={`${item.content_type}-${item.id}`}
                      className={`flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedContent &&
                        selectedContent.id === item.id &&
                        selectedContent.content_type === item.content_type
                          ? "bg-green-50 dark:bg-green-900/20"
                          : ""
                      }`}
                      onClick={() => handleSelectContent(item)}
                    >
                      <div
                        className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: item.icon_bg_color || "#3E3E3E" }}
                      >
                        <Image
                          src={getPublicUrl(item.icon_url, "app-icons") || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium text-gray-800 dark:text-white truncate">{item.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.content_type === "app" ? "App" : "Game"} • v{item.version}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddRelatedItem(item)
                        }}
                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                        title="Add to related content"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Related Content Management Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {selectedContent
              ? `Related Content for ${selectedContent.title}`
              : "Select content to manage related items"}
          </h2>

          {selectedContent ? (
            <>
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-3">
                <div
                  className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: selectedContent.icon_bg_color || "#3E3E3E" }}
                >
                  <Image
                    src={getPublicUrl(selectedContent.icon_url, "app-icons") || "/placeholder.svg"}
                    alt={selectedContent.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{selectedContent.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedContent.content_type === "app" ? "App" : "Game"} • v{selectedContent.version}
                  </p>
                </div>
              </div>

              {/* Related Items List */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
                <div className="max-h-[400px] overflow-y-auto">
                  {relatedItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No related items added yet. Add items from the content list.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {relatedItems.map((item, index) => (
                        <li
                          key={`related-${item.content_type}-${item.id}`}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-16">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === relatedItems.length - 1}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              ↓
                            </button>
                          </div>
                          <div
                            className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: item.icon_bg_color || "#3E3E3E" }}
                          >
                            <Image
                              src={getPublicUrl(item.icon_url, "app-icons") || "/placeholder.svg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-gray-800 dark:text-white truncate">{item.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.content_type === "app" ? "App" : "Game"} • v{item.version}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRelatedItem(index)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                            title="Remove from related content"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveRelatedItems}
                disabled={saving}
                className="w-full flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Related Content"}
              </button>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Content Selected</h3>
              <p>Select an app or game from the list to manage its related content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
