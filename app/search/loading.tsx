import { Gamepad2, Smartphone, FileText } from "lucide-react"

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse"></div>

        {/* Search form skeleton */}
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="mb-4 h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>

      {/* Apps section skeleton */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Games section skeleton */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blogs section skeleton */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="w-24 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
