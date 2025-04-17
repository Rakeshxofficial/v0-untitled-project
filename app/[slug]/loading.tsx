import { Skeleton } from "@/components/ui/skeleton"

export default function ContentLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Main content skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
              {/* Title skeleton */}
              <Skeleton className="h-10 w-3/4 mx-auto mb-6" />

              {/* Icon skeleton */}
              <div className="flex justify-center mb-6">
                <Skeleton className="h-32 w-32 rounded-2xl" />
              </div>

              {/* Info grid skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>

              {/* Button skeleton */}
              <Skeleton className="h-12 w-full mt-6" />
            </div>

            {/* Content skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full mb-4" />
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <Skeleton className="h-8 w-1/2 mb-4" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full mb-3" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
