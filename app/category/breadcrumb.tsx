import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export default function CategoryBreadcrumb() {
  return (
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="https://installmod.com" className="hover:text-green-500 transition-colors flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
        </li>
        <li className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">Categories</span>
        </li>
      </ol>
    </nav>
  )
}
