"use client"

import Link from "next/link"
import { Calendar, User, Smartphone, Tag, Database, ExternalLink, Star } from "lucide-react"

export default function AppInfoGrid({ appData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">App Name</div>
          <div className="font-medium text-gray-800 dark:text-white">{appData.name}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Tag className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Version</div>
          <div className="font-medium text-gray-800 dark:text-white">{appData.version}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Last Updated</div>
          <div className="font-medium text-gray-800 dark:text-white">{appData.lastUpdated}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Publisher</div>
          <div className="font-medium text-gray-800 dark:text-white">{appData.publisher}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Requirements</div>
          <div className="font-medium text-gray-800 dark:text-white">{appData.requirements}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Tag className="w-4 h-4 text-indigo-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Category</div>
          <Link
            href={`https://installmod.com/category/${appData.categorySlug}`}
            className="font-medium text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {appData.category}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Database className="w-4 h-4 text-cyan-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Size</div>
          <div className="font-medium text-gray-800 dark:text-white">{appData.size}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <ExternalLink className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Google Play</div>
          <a
            href={appData.googlePlayLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            View on Play Store
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Star className="w-4 h-4 text-yellow-500" />
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Rating</div>
          <div className="flex items-center">
            <div className="flex mr-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(appData.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : i < appData.rating
                        ? "text-yellow-400 fill-yellow-400 opacity-50"
                        : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium text-gray-800 dark:text-white">
              {appData.rating} ({appData.totalRatings})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
