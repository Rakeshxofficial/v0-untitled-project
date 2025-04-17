"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import SearchDialog from "@/app/components/search-dialog"

export default function SearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(true)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        aria-label="Search"
      >
        <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
