"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Gamepad2, ChevronRight } from "lucide-react"
import { supabase, type Category } from "@/lib/supabase"

export default function GameCategories() {
  const [gameCategories, setGameCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch of categories
    fetchGameCategories()

    // Set up real-time subscription
    const subscription = supabase
      .channel("game-categories-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: "type=eq.game",
        },
        () => {
          // When any change happens to game categories, refetch
          fetchGameCategories()
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchGameCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("categories").select("*").eq("type", "game").order("name")

      if (error) {
        console.error("Error fetching game categories:", error)
        return
      }

      setGameCategories(data as Category[])
    } catch (error) {
      console.error("Error in fetchGameCategories:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
            <Gamepad2 className="w-5 h-5 text-white" />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30 -z-10"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Game Categories</h2>
        </div>
        <Link
          href="/gamecategories"
          className="flex items-center text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm font-medium transition-colors group"
        >
          View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : gameCategories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {gameCategories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-1 group"
            >
              <span className="text-green-500 group-hover:text-green-600 dark:group-hover:text-green-400 font-medium transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md">
          <p className="text-gray-600 dark:text-gray-400">
            No game categories found. Add categories from the admin panel.
          </p>
        </div>
      )}
    </section>
  )
}
