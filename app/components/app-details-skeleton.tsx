export default function AppDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        {/* App icon and basic info */}
        <div className="w-full md:w-1/4">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-lg h-32 w-32 mb-4"></div>
          <div className="bg-gray-300 dark:bg-gray-700 h-8 w-3/4 rounded mb-2"></div>
          <div className="bg-gray-300 dark:bg-gray-700 h-6 w-1/2 rounded mb-4"></div>
          <div className="bg-gray-300 dark:bg-gray-700 h-10 w-full rounded mb-4"></div>
        </div>

        {/* App details */}
        <div className="w-full md:w-3/4">
          <div className="bg-gray-300 dark:bg-gray-700 h-8 w-3/4 rounded mb-4"></div>
          <div className="bg-gray-300 dark:bg-gray-700 h-4 w-full rounded mb-2"></div>
          <div className="bg-gray-300 dark:bg-gray-700 h-4 w-full rounded mb-2"></div>
          <div className="bg-gray-300 dark:bg-gray-700 h-4 w-3/4 rounded mb-6"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 dark:bg-gray-700 h-20 rounded"></div>
            ))}
          </div>

          <div className="bg-gray-300 dark:bg-gray-700 h-40 w-full rounded mb-6"></div>
        </div>
      </div>
    </div>
  )
}
