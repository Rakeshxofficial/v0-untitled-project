import type React from "react"
import Link from "next/link"

interface DashboardCardProps {
  title: string
  count: number
  icon: React.ReactNode
  href: string
  color?: "green" | "blue" | "purple" | "orange" | "red" | "indigo" | "pink"
}

export function DashboardCard({ title, count, icon, href, color = "blue" }: DashboardCardProps) {
  // Determine color classes based on the color prop
  let colorClasses = "bg-blue-500 hover:bg-blue-600"

  if (color === "green") {
    colorClasses = "bg-green-500 hover:bg-green-600"
  } else if (color === "purple") {
    colorClasses = "bg-purple-500 hover:bg-purple-600"
  } else if (color === "orange") {
    colorClasses = "bg-orange-500 hover:bg-orange-600"
  } else if (color === "red") {
    colorClasses = "bg-red-500 hover:bg-red-600"
  } else if (color === "indigo") {
    colorClasses = "bg-indigo-500 hover:bg-indigo-600"
  } else if (color === "pink") {
    colorClasses = "bg-pink-500 hover:bg-pink-600"
  }

  return (
    <Link href={href}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
        <div className={`${colorClasses} p-4 text-white`}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="text-white">{icon}</div>
          </div>
          <p className="text-3xl font-bold mt-2">{count}</p>
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-500">View details →</div>
        </div>
      </div>
    </Link>
  )
}

// Add default export to fix the deployment error
export default DashboardCard
