import type React from "react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  color?: "green" | "blue" | "purple" | "orange" | "red" | "indigo" | "pink"
}

export function StatsCard({ title, value, description, icon, color = "blue" }: StatsCardProps) {
  // Determine color classes based on the color prop
  let colorClasses = "text-blue-500 bg-blue-100"

  if (color === "green") {
    colorClasses = "text-green-500 bg-green-100"
  } else if (color === "purple") {
    colorClasses = "text-purple-500 bg-purple-100"
  } else if (color === "orange") {
    colorClasses = "text-orange-500 bg-orange-100"
  } else if (color === "red") {
    colorClasses = "text-red-500 bg-red-100"
  } else if (color === "indigo") {
    colorClasses = "text-indigo-500 bg-indigo-100"
  } else if (color === "pink") {
    colorClasses = "text-pink-500 bg-pink-100"
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <div className={`${colorClasses} p-3 rounded-full`}>{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold">{value}</p>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  )
}

// Add default export to fix the deployment error
export default StatsCard
