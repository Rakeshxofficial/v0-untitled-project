import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Date range filter skeleton */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-6 shadow-sm">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-8 w-20 mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
