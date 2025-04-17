"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Smartphone, Gamepad2 } from "lucide-react"
import { supabase, type Category } from "@/lib/supabase"

type AllCategoriesProps = {
  initialData: {
    appCategories: Category[]
    gameCategories: Category[]
  }
}

export default function AllCategoriesClient({ initialData }: AllCategoriesProps) {
  const [appCategories, setAppCategories] = useState<Category[]>(initialData.appCategories)
  const [gameCategories, setGameCategories] = useState<Category[]>(initialData.gameCategories)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Set up real-time subscription for app categories
    const appSubscription = supabase
      .channel("app-categories-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: "type=eq.app",
        },
        () => {
          // When any change happens to app categories, refetch
          fetchAppCategories()
        },
      )
      .subscribe()

    // Set up real-time subscription for game categories
    const gameSubscription = supabase
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

    // Cleanup subscriptions on unmount
    return () => {
      appSubscription.unsubscribe()
      gameSubscription.unsubscribe()
    }
  }, [])

  const fetchAppCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("categories").select("*").eq("type", "app").order("name")

      if (error) {
        console.error("Error fetching app categories:", error)
        return
      }

      setAppCategories(data as Category[])
    } catch (error) {
      console.error("Error in fetchAppCategories:", error)
    } finally {
      setLoading(false)
    }
  }

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
    <div className="space-y-12">
      {/* App Categories Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md relative">
            <Smartphone className="w-6 h-6 text-white" />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-30 -z-10"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">App Categories</h2>
        </div>

        {loading && appCategories.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : appCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {appCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-1 group"
              >
                <span className="text-purple-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 font-medium transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md">
            <p className="text-gray-600 dark:text-gray-400">
              No app categories found. Add categories from the admin panel.
            </p>
          </div>
        )}
      </section>

      {/* Game Categories Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
            <Gamepad2 className="w-6 h-6 text-white" />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30 -z-10"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Game Categories</h2>
        </div>

        {loading && gameCategories.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : gameCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gameCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-1 group"
              >
                <span className="text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400 font-medium transition-colors">
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
    </div>
  )
}
