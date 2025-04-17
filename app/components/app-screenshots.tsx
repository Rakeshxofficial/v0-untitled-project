"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { getPublicUrl } from "@/lib/utils"

// Define the possible screenshot types
type Screenshot = string | { id: string; url: string }

interface AppScreenshotsProps {
  screenshots: Screenshot[]
  title?: string
  iconBgColor?: string
}

export default function AppScreenshots({ screenshots, title = "App", iconBgColor = "#3E3E3E" }: AppScreenshotsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  // Process screenshots on component mount and when screenshots change
  useEffect(() => {
    // Convert all screenshots to their public URLs
    const urls = screenshots.map((screenshot) => {
      const url = getScreenshotUrl(screenshot)
      return getPublicUrl(url, "app-screenshots")
    })
    setImageUrls(urls)
  }, [screenshots])

  // Helper function to get the URL from a screenshot (whether it's a string or object)
  const getScreenshotUrl = (screenshot: Screenshot): string => {
    if (typeof screenshot === "string") {
      return screenshot
    } else if (screenshot && typeof screenshot === "object" && "url" in screenshot) {
      return screenshot.url
    }
    return ""
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1))
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setShowLightbox(true)
  }

  // If no screenshots, show a placeholder
  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">No screenshots available</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5" style={{ color: iconBgColor }} />
        Screenshots
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {screenshots.map((screenshot, index) => (
          <div
            key={typeof screenshot === "object" && "id" in screenshot ? screenshot.id : index}
            className="relative aspect-[9/16] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={imageUrls[index] || "/placeholder.svg"}
              alt={`${title} screenshot ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[60]"
            onClick={(e) => {
              e.stopPropagation()
              setShowLightbox(false)
            }}
            aria-label="Close lightbox"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors z-[60]"
            style={{ backgroundColor: `${iconBgColor}cc` }}
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          <div className="relative h-[80vh] w-full max-w-3xl flex items-center justify-center">
            {/* Use a regular img tag for better lightbox compatibility */}
            <img
              src={imageUrls[currentIndex] || "/placeholder.svg"}
              alt={`${title} screenshot ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
              style={{ margin: "0 auto" }}
            />
          </div>

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors z-[60]"
            style={{ backgroundColor: `${iconBgColor}cc` }}
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            aria-label="Next screenshot"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {screenshots.length}
          </div>
        </div>
      )}
    </div>
  )
}
