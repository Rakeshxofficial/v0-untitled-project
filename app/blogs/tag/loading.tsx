export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-8"></div>

      {/* Popular Tags Section */}
      <div className="mb-10">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex flex-wrap gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={`popular-${i}`} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Regular Tags Section */}
      <div className="mb-10">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex flex-wrap gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={`regular-${i}`} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Other Tags Section */}
      <div>
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex flex-wrap gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={`other-${i}`} className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
