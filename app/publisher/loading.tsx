export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="mr-4 flex-shrink-0">
              <div className="w-[60px] h-[60px] rounded-full bg-gray-200 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
