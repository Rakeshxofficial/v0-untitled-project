"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, ChevronRight, Home, Star } from "lucide-react"
import { getPublicUrl } from "@/lib/utils"
import DownloadButton from "./download-button"
import { incrementDownloadCount } from "@/app/actions/download-actions"
import { supabase } from "@/lib/supabase"

interface AppDetailsHeaderProps {
  app: {
    id: string
    title: string
    version: string
    mod_info: string
    icon_url: string
    icon_bg_color?: string
    updated_at: string
    size: string
    category: {
      name: string
      slug: string
    }
    rating?: number
    total_ratings?: number
    download_url: string
  }
  contentType: "app" | "game"
}

export default function AppDetailsHeader({ app, contentType }: AppDetailsHeaderProps) {
  // State for app data that might change in real-time
  const [appData, setAppData] = useState(app)
  // Default icon background color if not set in admin
  const [iconBgColor, setIconBgColor] = useState<string>(app.icon_bg_color || "#3E3E3E")

  // Set up real-time subscription to app changes
  useEffect(() => {
    // Set initial data
    setAppData(app)
    setIconBgColor(app.icon_bg_color || "#3E3E3E")

    // Create a real-time subscription to the specific app
    const channel = supabase
      .channel(`app-${app.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: contentType === "app" ? "apps" : "games",
          filter: `id=eq.${app.id}`,
        },
        (payload) => {
          console.log("Real-time update received:", payload)
          // Update the app data with the new values
          const updatedApp = payload.new as typeof app
          setAppData((prevData) => ({ ...prevData, ...updatedApp }))

          // Update the icon background color specifically
          if (updatedApp.icon_bg_color) {
            setIconBgColor(updatedApp.icon_bg_color)
            console.log("Updated icon background color:", updatedApp.icon_bg_color)
          }
        },
      )
      .subscribe()

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel)
    }
  }, [app.id, contentType, app])

  // Get the public URL for the app icon
  const iconUrl = getPublicUrl(appData.icon_url, "app-icons")

  // Format the date
  const formattedDate = new Date(appData.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Default rating values if not provided
  const rating = appData.rating || 4.5
  const totalRatings = appData.total_ratings || 100

  // Generate stars based on rating
  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    // Use the app's icon background color for stars
    const starColor = iconBgColor

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className={`w-6 h-6 fill-current text-current`} style={{ color: starColor }} />,
      )
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`w-6 h-6 fill-current text-current`} style={{ color: starColor }} />
          <Star
            className={`absolute top-0 left-0 w-6 h-6 fill-current text-current opacity-50`}
            style={{ color: starColor }}
          />
        </div>,
      )
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-6 h-6 text-gray-300 dark:text-gray-600" />)
    }

    return stars
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* Breadcrumb Navigation */}
      <nav
        className="flex items-center text-sm text-gray-500 dark:text-gray-400 p-4 border-b border-gray-100 dark:border-gray-700"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="https://installmod.com/"
              className="transition-colors flex items-center hover:text-current"
              style={{ color: iconBgColor }}
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <Link
                href={`https://installmod.com/category/${appData.category.slug}`}
                className="transition-colors hover:text-current"
                style={{ color: iconBgColor }}
              >
                {appData.category.name}
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">{appData.title}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="p-6">
        {/* App Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg"
            style={{ backgroundColor: iconBgColor }}
          >
            <Image src={iconUrl || "/placeholder.svg"} alt={appData.title} fill className="object-cover" priority />
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white text-center mb-4">
          {appData.title} v{appData.version} <span style={{ color: iconBgColor }}>[{appData.mod_info}]</span>
        </h1>

        {/* Version & Last Updated */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
            v{appData.version}
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-1" style={{ color: iconBgColor }} />
            {formattedDate}
          </div>
        </div>

        {/* Ratings */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="flex">{renderStars()}</div>
          <span className="text-gray-700 dark:text-gray-300">
            <span style={{ color: iconBgColor }}>{rating}</span> ({totalRatings.toLocaleString()} votes)
          </span>
        </div>

        {/* Download Button */}
        <DownloadButton
          downloadUrl={appData.download_url}
          size={appData.size}
          contentId={appData.id}
          contentType={contentType}
          formAction={incrementDownloadCount}
          style={{
            background: `linear-gradient(to right, ${iconBgColor}, ${iconBgColor}dd)`,
            filter: "brightness(1)",
            transition: "filter 0.3s ease",
          }}
          className="hover:brightness-90"
        />
      </div>
    </div>
  )
}
