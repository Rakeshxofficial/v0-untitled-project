"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import SearchDialog from "./search-dialog"

export default function SearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(true)}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
