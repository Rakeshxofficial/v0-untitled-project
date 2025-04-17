"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { Search, X, Download, Gamepad2, Smartphone, ArrowRight, FileText } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export default function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any>({
    apps: [],
    games: [],
    blogs: [],
    categories: [],
    tags: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key to close
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({
          apps: [],
          games: [],
          blogs: [],
          categories: [],
          tags: [],
        })
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=3`)
        if (!response.ok) throw new Error("Search failed")
        const data = await response.json()
        setResults(data.results)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search requests
    const timeoutId = setTimeout(() => {
      fetchResults()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle form submission to navigate to search page
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`https://installmod.com/search?q=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  if (!isOpen) return null

  const hasResults =
    results.apps.length > 0 ||
    results.games.length > 0 ||
    results.blogs.length > 0 ||
    results.categories.length > 0 ||
    results.tags.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Search input */}
        <form onSubmit={handleSubmit} className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for apps, games, blogs..."
            className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </form>

        {/* Search results */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              <p>Searching...</p>
            </div>
          ) : !query.trim() ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Type to search for apps, games, blogs, categories, and tags</p>
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for "{query}"</p>
              <button
                onClick={handleSubmit}
                className="mt-4 inline-flex items-center text-green-500 hover:text-green-600"
              >
                View all search results
                <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-2">
              {/* Apps */}
              {results.apps.length > 0 && (
                <div className="mb-6">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Apps</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
                    {results.apps.map((app: any) => (
                      <a
                        key={app.id}
                        href={`https://${app.slug}.installmod.com`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          <Image
                            src={app.icon_url || "/placeholder.svg"}
                            alt={app.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{app.title}</h3>
                          <div className="flex items-center text-xs text-gray-500 gap-2">
                            <span>{app.categories?.name || "App"}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              <span>v{app.version}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 px-3">
                    <button
                      onClick={handleSubmit}
                      className="text-sm text-green-500 hover:text-green-600 flex items-center"
                    >
                      View all apps
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Games */}
              {results.games.length > 0 && (
                <div className="mb-6">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    <span>Games</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
                    {results.games.map((game: any) => (
                      <a
                        key={game.id}
                        href={`https://${game.slug}.installmod.com`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          <Image
                            src={game.icon_url || "/placeholder.svg"}
                            alt={game.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{game.title}</h3>
                          <div className="flex items-center text-xs text-gray-500 gap-2">
                            <span>{game.categories?.name || "Game"}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              <span>v{game.version}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 px-3">
                    <button
                      onClick={handleSubmit}
                      className="text-sm text-green-500 hover:text-green-600 flex items-center"
                    >
                      View all games
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Blogs */}
              {results.blogs.length > 0 && (
                <div className="mb-6">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Blogs</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 px-2">
                    {results.blogs.map((blog: any) => (
                      <a
                        key={blog.id}
                        href={`/${blog.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          <Image
                            src={blog.featured_image || "/placeholder.svg"}
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{blog.title}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {blog.created_at
                              ? formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })
                              : "Recently published"}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 px-3">
                    <button
                      onClick={handleSubmit}
                      className="text-sm text-green-500 hover:text-green-600 flex items-center"
                    >
                      View all blogs
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* View all results button */}
              <div className="px-4 py-3 border-t dark:border-gray-700">
                <button
                  onClick={handleSubmit}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  View all search results
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="p-3 border-t dark:border-gray-700 text-xs text-gray-500 flex justify-between">
          <div>Press ESC to close</div>
          <div>
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs mr-1">↑</span>
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs mr-1">↓</span>
            to navigate
          </div>
        </div>
      </div>
    </div>
  )
}
