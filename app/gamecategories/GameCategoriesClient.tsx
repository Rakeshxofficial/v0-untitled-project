"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Gamepad2, ArrowLeft } from "lucide-react"
import { supabase, type Category } from "@/lib/supabase"

export default function GameCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    fetchCategories()

    // Set up real-time subscription
    const subscription = supabase
      .channel("game-categories-page-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: "type=eq.game",
        },
        () => {
          fetchCategories()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("categories").select("*").eq("type", "game").order("name")

      if (error) {
        console.error("Error fetching game categories:", error)
        return
      }

      setCategories(data as Category[])
    } catch (error) {
      console.error("Error in fetchCategories:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-green-500 hover:text-green-600 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
          <Gamepad2 className="w-6 h-6 text-white" />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30 -z-10"></div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Game Categories</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 animate-pulse h-24">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center h-full"
            >
              <h2 className="text-xl font-semibold text-green-500 group-hover:text-green-600 dark:group-hover:text-green-400 mb-2">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{category.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-md">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No game categories found. Check back later or browse our games directly.
          </p>
          <Link
            href="/games"
            className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse All Games
          </Link>
        </div>
      )}
    </div>
  )
}
