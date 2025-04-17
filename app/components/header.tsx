"use client"

import { Menu, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import SearchButton from "./search-button"

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user has a preference stored
    const darkModePreference = localStorage.getItem("darkMode") === "true"
    setIsDarkMode(darkModePreference)

    if (darkModePreference) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem("darkMode", String(newDarkMode))

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 shadow-sm backdrop-blur-[8px] frosted-glass header-animation border-b border-white/20 dark:border-gray-800/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="https://installmod.com" className="flex items-center gap-2">
            <div className="relative w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">G</span>
            </div>
            <div>
              <h1 className="font-bold text-xl">
                <span className="text-green-500">Get</span>
                <span className="text-gray-800 dark:text-white">modsapk</span>
              </h1>
              <p className="text-xs text-orange-400">download & enjoy</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavItem icon="home" label="Home" active />
            <NavItem icon="games" label="Games" />
            <NavItem icon="apps" label="Apps" />
            <NavItem icon="blog" label="Blog" />
            <NavItem icon="faq" label="FAQ" />
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <SearchButton />
            <button
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mt-4 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md frosted-glass rounded-b-xl p-2 border-t border-white/20 dark:border-gray-800/30">
            <nav className="flex flex-col space-y-2">
              <MobileNavItem href="https://installmod.com/" label="Home" active />
              <MobileNavItem href="https://installmod.com/games" label="Games" />
              <MobileNavItem href="https://installmod.com/apps" label="Apps" />
              <MobileNavItem href="https://installmod.com/blog" label="Blog" />
              <MobileNavItem href="https://installmod.com/faq" label="FAQ" />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

function NavItem({ icon, label, active = false }) {
  const getIcon = () => {
    const iconClasses = "w-5 h-5"
    const iconColor = active ? "text-white" : "text-gray-600 dark:text-gray-300"

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
        active ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full ${active ? "bg-blue-500" : "bg-gray-100 dark:bg-gray-800"} flex items-center justify-center`}
      >
        {getIcon()}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </a>
  )
}

function MobileNavItem({ href, label, active = false }) {
  return (
    <a
      href={href}
      className={`px-4 py-2 rounded-md ${
        active ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </a>
  )
}
