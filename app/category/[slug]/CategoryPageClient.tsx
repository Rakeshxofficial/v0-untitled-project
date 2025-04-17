"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Smartphone, Gamepad2 } from "lucide-react"
import { supabase, type Category, type App, type Game } from "@/lib/supabase"

interface CategoryPageClientProps {
  initialCategory: Category
  slug: string
}

export default function CategoryPageClient({ initialCategory, slug }: CategoryPageClientProps) {
  const [category, setCategory] = useState<Category>(initialCategory)
  const [items, setItems] = useState<(App | Game)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    fetchItems()

    // Set up real-time subscription for category changes
    const categorySubscription = supabase
      .channel("category-detail-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `slug=eq.${slug}`,
        },
        () => {
          fetchCategory()
        },
      )
      .subscribe()

    // Set up real-time subscription for items changes
    const itemsSubscription = supabase
      .channel("category-items-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: category.type === "app" ? "apps" : "games",
          filter: `category_id=eq.${category.id}`,
        },
        () => {
          fetchItems()
        },
      )
      .subscribe()

    return () => {
      categorySubscription.unsubscribe()
      itemsSubscription.unsubscribe()
    }
  }, [slug, category.id, category.type])

  const fetchCategory = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single()

      if (error) {
        console.error("Error fetching category:", error)
        return
      }

      if (data) {
        setCategory(data as Category)
      }
    } catch (error) {
      console.error("Error in fetchCategory:", error)
    }
  }

  const fetchItems = async () => {
    try {
      setLoading(true)

      // Determine which table to query based on category type
      const table = category.type === "app" ? "apps" : "games"

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("category_id", category.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })

      if (error) {
        console.error(`Error fetching ${table}:`, error)
        return
      }

      setItems(data as (App | Game)[])
    } catch (error) {
      console.error("Error in fetchItems:", error)
    } finally {
      setLoading(false)
    }
  }

  const CategoryIcon = category.type === "app" ? Smartphone : Gamepad2
  const iconColorClass =
    category.type === "app" ? "from-purple-400 to-purple-600 bg-purple-400" : "from-red-400 to-red-600 bg-red-400"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={category.type === "app" ? "/apps" : "/games"}
          className="inline-flex items-center text-green-500 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {category.type === "app" ? "Apps" : "Games"}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${iconColorClass} rounded-full flex items-center justify-center shadow-md relative`}
        >
          <CategoryIcon className="w-6 h-6 text-white" />
          <div className={`absolute inset-0 ${iconColorClass} rounded-full blur-md opacity-30 -z-10`}></div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{category.name}</h1>
      </div>

      {category.description && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <p className="text-gray-700 dark:text-gray-300">{category.description}</p>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {category.type === "app" ? "Apps" : "Games"} in this category
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${item.slug}`}
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl p-4 text-center transition-all duration-300 hover:-translate-y-1 flex flex-col items-center"
            >
              {item.icon_url ? (
                <img
                  src={item.icon_url || "/placeholder.svg"}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg mb-3 object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                  <CategoryIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              <h3 className="font-medium text-gray-800 dark:text-white mb-1 line-clamp-2">{item.title}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">v{item.version}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-md">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No {category.type === "app" ? "apps" : "games"} found in this category yet.
          </p>
          <Link
            href={category.type === "app" ? "/apps" : "/games"}
            className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse All {category.type === "app" ? "Apps" : "Games"}
          </Link>
        </div>
      )}
    </div>
  )
}
