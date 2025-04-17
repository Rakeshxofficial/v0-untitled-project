export default function FooterPageLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="h-8 w-48 bg-muted animate-pulse rounded-md mx-auto mb-8"></div>
      <div className="bg-card rounded-lg shadow-md p-6 md:p-8 space-y-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted animate-pulse rounded-md w-1/4"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-3/4"></div>
        </div>

        <div className="space-y-4">
          <div className="h-6 bg-muted animate-pulse rounded-md w-1/4"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-5/6"></div>
        </div>

        <div className="space-y-4">
          <div className="h-6 bg-muted animate-pulse rounded-md w-1/4"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-4/5"></div>
        </div>
      </div>
    </div>
  )
}
