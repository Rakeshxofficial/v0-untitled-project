"use client"

import { useState, useEffect } from "react"
// Link component removed in favor of standard <a> tags
import { Menu, Search, X, Moon, Sun, Home, Gamepad2, Smartphone, FileText, HelpCircle } from "lucide-react"
import SearchDialog from "@/app/components/search-dialog"
// import { usePathname } from "next/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  // const pathname = usePathname()

  // Handle scroll effect for shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle dark mode toggle
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

  // Handle menu open/close with animation
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    // Prevent scrolling when menu is open
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isMenuOpen && !target.closest(".menu-container") && !target.closest(".menu-button")) {
        setIsMenuOpen(false)
        document.body.style.overflow = "auto"
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    document.body.style.overflow = "auto"
  }, [])

  // Add this after the other useEffect hooks
  useEffect(() => {
    // Add padding to the body element to prevent content from being hidden behind the fixed header
    document.body.style.paddingTop = "48px" // 64px = 4rem = height of header (h-16)

    return () => {
      // Clean up when component unmounts
      document.body.style.paddingTop = "0"
    }
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "shadow-[0_8px_20px_rgba(0,0,0,0.1)]" : ""
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between backdrop-blur-xl bg-white/10 dark:bg-black/30 border-b border-white/20 dark:border-gray-800/20">
        {/* Left: Hamburger Menu */}
        <button
          onClick={toggleMenu}
          className="menu-button relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 group"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors" />
        </button>

        {/* Center: Logo and Brand */}
        <a href="https://installmod.com" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            <span className="text-white text-lg font-bold">I</span>
            <div className="absolute inset-0 bg-white/10 rounded-full"></div>
          </div>
          <div className="flex flex-col items-start">
            <h2 className="font-bold text-lg leading-tight">
              <span className="text-green-500">Install</span>
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">MOD</span>
            </h2>
            <p className="text-[10px] text-orange-400 -mt-0.5 group-hover:text-orange-500 transition-colors">
              download & enjoy
            </p>
          </div>
        </a>

        {/* Right: Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 group"
          aria-label="Search"
        >
          <Search className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors" />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      >
        <div
          className={`menu-container fixed top-0 left-0 h-full w-[300px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
              <a href="https://installmod.com/" className="flex items-center gap-2">
                <div className="relative w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                  <span className="text-white text-lg font-bold">I</span>
                </div>
                <div className="flex flex-col items-start">
                  <h2 className="font-bold text-lg leading-tight">
                    <span className="text-green-500">Install</span>
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                      MOD
                    </span>
                  </h2>
                  <p className="text-[10px] text-orange-400 -mt-0.5">download & enjoy</p>
                </div>
              </a>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-3">
                <MenuItem href="https://installmod.com/" icon={<Home className="w-5 h-5" />} label="Home" isActive={false} />
                <MenuItem href="https://installmod.com/games" icon={<Gamepad2 className="w-5 h-5" />} label="Games" isActive={false} />
                <MenuItem href="https://installmod.com/apps" icon={<Smartphone className="w-5 h-5" />} label="Apps" isActive={false} />
                <MenuItem href="https://installmod.com/blogs" icon={<FileText className="w-5 h-5" />} label="Blog" isActive={false} />
                <MenuItem href="https://installmod.com/faqs" icon={<HelpCircle className="w-5 h-5" />} label="FAQ" isActive={false} />
              </ul>
            </nav>

            {/* Menu Footer with Dark Mode Toggle */}
            <div className="p-4 border-t dark:border-gray-800">
              <button
                onClick={toggleDarkMode}
                className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 mr-3 shadow-md">
                  {isDarkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
                </div>
                <span className="text-gray-800 dark:text-white font-medium">
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Search Dialog */}
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}

// Menu Item Component
function MenuItem({ href, icon, label, isActive }) {
  return (
    <li>
      <a
        href={href}
        className={`flex items-center px-4 py-3 rounded-xl transition-all ${
          isActive
            ? "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-green-600 dark:text-green-400 shadow-sm"
            : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        }`}
      >
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full mr-3 shadow-sm ${
            isActive
              ? "bg-gradient-to-br from-green-400 to-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </a>
    </li>
  )
}
