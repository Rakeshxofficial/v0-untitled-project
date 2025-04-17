export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto mb-8 animate-pulse"></div>

      {/* App Categories Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(15)].map((_, index) => (
            <div key={`app-${index}`} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Categories Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(15)].map((_, index) => (
            <div key={`game-${index}`} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
