import Image from "next/image"
import { Download } from "lucide-react"
import TrendingApps from "@/app/components/trendingapps"
import LatestGames from "@/app/components/latestgames"
import LatestApps from "@/app/components/latestapps"
import GameCategories from "@/app/components/gamecategories"
import AppCategories from "@/app/components/appcategories"
import FromOurBlog from "@/app/components/fromourblog"
import Footer from "@/app/components/footer"
import TelegramButton from "@/app/components/telegram-button"
// Import the schema markup component at the top of the file
import { HomeSchemaMarkup } from "@/app/components/schema-markup"

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Schema Markup */}
      <HomeSchemaMarkup />
      {/* Add a subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10"></div>

      <main className="container mx-auto px-4 pb-8">
        {/* Trending Apps Section */}
        <div className="mt-4">
          <TrendingApps />
        </div>

        {/* Latest Games Section */}
        <div className="mt-10">
          <LatestGames />
        </div>

        {/* Latest Apps Section */}
        <div className="mt-10">
          <LatestApps />
        </div>

        {/* Game Categories Section */}
        <div className="mt-10">
          <GameCategories />
        </div>

        {/* App Categories Section */}
        <div className="mt-10">
          <AppCategories />
        </div>

        {/* Blog Section */}
        <div className="mt-10">
          <FromOurBlog />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Telegram Button */}
      <TelegramButton />
    </div>
  )
}

// Navigation Item Component
function NavItem({ icon, label, active = false }) {
  const getIcon = () => {
    const iconClasses = "w-5 h-5"
    const iconColor = active ? "text-white" : "text-gray-600"

    switch (icon) {
      case "home":
        return <div className={`${iconClasses} ${iconColor}`}>🏠</div>
      case "games":
        return <div className={`${iconClasses} ${iconColor}`}>🎮</div>
      case "apps":
        return <div className={`${iconClasses} ${iconColor}`}>📱</div>
      case "blog":
        return <div className={`${iconClasses} ${iconColor}`}>📝</div>
      case "faq":
        return <div className={`${iconClasses} ${iconColor}`}>❓</div>
      default:
        return null
    }
  }

  return (
    <a
      href={icon === "home" ? "/" : `/${icon}`}
      className={`flex flex-col items-center px-3 py-2 rounded-full ${
        active ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full ${active ? "bg-blue-500" : "bg-gray-100"} flex items-center justify-center`}
      >
        {getIcon()}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </a>
  )
}

// Game Card Component
function GameCard({ game }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="relative h-32 bg-gray-200">
          <Image src={game.image || "/placeholder.svg"} alt={game.title} fill className="object-cover" />
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-sm font-medium">MOD</span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-sm font-medium">UPDATED</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-center mb-1">{game.title}</h3>
        <p className="text-green-500 text-xs text-center mb-2">{game.category}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center">
            <Download className="w-3 h-3 mr-1" />
            <span>v{game.version}</span>
          </div>
          <div>{game.size}</div>
        </div>
      </div>
    </div>
  )
}

// Sample Data
const games = [
  {
    title: "Tacticool",
    category: "Action",
    version: "1.81.1",
    size: "910 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "Stickman Archer Online",
    category: "Action",
    version: "25.0.0.4",
    size: "210 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "Indian Train Sim 2024",
    category: "Simulation",
    version: "39.0",
    size: "400 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "Dolphin Emulator",
    category: "Arcade",
    version: "2503-18.7",
    size: "18 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "Critical Ops",
    category: "Action",
    version: "1.49.0.f2480",
    size: "944 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "MadOut 2",
    category: "Action",
    version: "15.01",
    size: "1.61 GB",
    image: "/placeholder.svg?height=128&width=128",
  },
]

const apps = [
  {
    title: "YouTube Premium",
    category: "Entertainment",
    version: "18.32.39",
    size: "134 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "Spotify Premium",
    category: "Music",
    version: "8.8.22.510",
    size: "98 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "Netflix MOD",
    category: "Entertainment",
    version: "8.79.0",
    size: "156 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "Instagram Plus",
    category: "Social",
    version: "302.0.0.0.34",
    size: "87 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "TikTok Pro",
    category: "Social",
    version: "31.1.4",
    size: "112 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
  {
    title: "WhatsApp Plus",
    category: "Communication",
    version: "2.23.24.12",
    size: "76 MB",
    image: "/placeholder.svg?height=128&width=128",
  },
]

const blogPosts = [
  {
    id: 1,
    title: "How to Fix 'App Not Installed' Error on Android",
    excerpt:
      "Learn the common causes and solutions for the frustrating 'App Not Installed' error that many Android users encounter when installing APK files.",
    image: "/placeholder.svg?height=192&width=384",
    views: "2.5K",
  },
  {
    id: 2,
    title: "Top 10 Gaming APKs You Must Try in 2025",
    excerpt:
      "Discover the best modded gaming APKs that offer unlimited resources, unlocked features, and enhanced gameplay for Android devices.",
    image: "/placeholder.svg?height=192&width=384",
    views: "4.8K",
  },
  {
    id: 3,
    title: "Is It Safe to Use Modded APKs? The Complete Guide",
    excerpt:
      "We explore the safety concerns, risks, and best practices when downloading and installing modified APK files on your Android device.",
    image: "/placeholder.svg?height=192&width=384",
    views: "7.2K",
  },
]
