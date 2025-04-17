"use client"

import { Facebook, Twitter, Linkedin, Link2 } from "lucide-react"

interface ShareButtonsProps {
  title: string
  description: string
  iconBgColor?: string
}

export default function ShareButtons({ title, description, iconBgColor = "#3E3E3E" }: ShareButtonsProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    alert("Link copied to clipboard!")
  }

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    openShareWindow(url)
  }

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
    openShareWindow(url)
  }

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl,
    )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
    openShareWindow(url)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Share this app</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={shareOnFacebook}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: iconBgColor }}
          aria-label="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
          <span className="hidden sm:inline">Facebook</span>
        </button>
        <button
          onClick={shareOnTwitter}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: iconBgColor }}
          aria-label="Share on Twitter"
        >
          <Twitter className="w-5 h-5" />
          <span className="hidden sm:inline">Twitter</span>
        </button>
        <button
          onClick={shareOnLinkedIn}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: iconBgColor }}
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
          <span className="hidden sm:inline">LinkedIn</span>
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
          aria-label="Copy link"
        >
          <Link2 className="w-5 h-5" style={{ color: iconBgColor }} />
          <span className="hidden sm:inline">Copy Link</span>
        </button>
      </div>
    </div>
  )
}
