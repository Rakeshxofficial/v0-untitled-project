"use client"

import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"
import Footer from "@/app/components/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Add a subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10"></div>

      <main className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-blue-500 rounded-full shadow-lg">
            <span className="text-white text-4xl font-bold">404</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Page Not Found</h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>

            <button
              onClick={() => window.history.back()}
              className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
