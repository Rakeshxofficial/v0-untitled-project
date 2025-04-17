export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
      <p className="mt-4 text-gray-500 dark:text-gray-400">Loading game data...</p>
    </div>
  )
}
