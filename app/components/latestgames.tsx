"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Zap, Download, Gamepad2 } from "lucide-react"
import { supabase, type Game } from "@/lib/supabase"
import { createAppSlug } from "@/app/utils/slug-utils"

export default function LatestGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestGames = async () => {
      try {
        setLoading(true)

        // First check if there are featured games in homepage_features
        const { data: featuredData, error: featuredError } = await supabase
          .from("homepage_features")
          .select("*")
          .eq("content_type", "game")
          .order("position")
          .limit(6)

        if (featuredError) throw featuredError

        // If we have featured games, fetch those games by their IDs
        if (featuredData && featuredData.length > 0) {
          const contentIds = featuredData.map((item) => item.content_id)

          const { data: featuredGames, error: gamesError } = await supabase
            .from("games")
            .select(`
              *,
              category:categories(name)
            `)
            .in("id", contentIds)
            .eq("status", "published")

          if (gamesError) throw gamesError

          // Sort the games in the same order as the featured items
          const sortedGames = contentIds.map((id) => featuredGames.find((game) => game.id === id)).filter(Boolean)

          setGames(sortedGames as Game[])
        } else {
          // Otherwise, fetch the latest published games
          const { data, error } = await supabase
            .from("games")
            .select(`
              *,
              category:categories(name)
            `)
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(6)

          if (error) throw error
          setGames(data as Game[])
        }
      } catch (err: any) {
        console.error("Error fetching latest games:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestGames()
  }, [])

  if (loading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
              <Gamepad2 className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30 -z-10"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Latest Games</h2>
          </div>
          <Link
            href="/latestgames"
            className="flex items-center text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm font-medium transition-colors group"
          >
            View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
              <Gamepad2 className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30 -z-10"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Latest Games</h2>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400">
          Error loading games: {error}
        </div>
      </section>
    )
  }

  if (games.length === 0) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
              <Gamepad2 className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30 -z-10"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Latest Games</h2>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl text-center">
          <p className="text-gray-500 dark:text-gray-400">No games available yet. Check back soon!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
            <Gamepad2 className="w-5 h-5 text-white" />
            <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-30 -z-10"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Latest Games</h2>
        </div>
        <Link
          href="/latestgames"
          className="flex items-center text-green-500 hover:text-green-600 dark:hover:text-green-400 text-sm font-medium transition-colors group"
        >
          View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  )
}

function GameCard({ game }: { game: Game }) {
  const gameSlug = game.slug || createAppSlug(game.title, game.category?.name || "game")
  const categoryName = game.category?.name || "Game"

  return (
    <Link
      href={`https://${gameSlug}.installmod.com/`}
      className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="relative">
        <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
          <Image
            src={game.icon_url || "/placeholder.svg?height=128&width=128"}
            alt={game.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm">
            MOD
          </span>
        </div>
        {game.updated_at && new Date(game.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-sm">
              UPDATED
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm text-center mb-2 text-gray-800 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">
          {game.title}
        </h3>
        <p className="text-green-500 text-xs text-center mb-3">{categoryName}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-1">
          <div className="flex items-center">
            <Zap className="w-3 h-3 mr-1 text-yellow-500" />
            <span>v{game.version}</span>
          </div>
          <div className="flex items-center">
            <Download className="w-3 h-3 mr-1 text-blue-500" />
            <span>{game.size}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
