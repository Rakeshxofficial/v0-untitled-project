import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading app data...</p>
    </div>
  )
}
