import type React from "react"
import Link from "next/link"
import {
  BarChart3,
  FileText,
  Gamepad2,
  Layers,
  MessageSquare,
  Package,
  Settings,
  Smartphone,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react"
import type { Metadata } from "next"
import { robotsPresets } from "@/lib/robots-utils"

// Set metadata for admin page - no indexing
export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for InstallMOD",
  ...robotsPresets.admin,
}

// Import the default exports
import DashboardCard from "./components/dashboard-card"
import StatsCard from "./components/stats-card"

// Define valid color types
type ValidColor = "green" | "blue" | "purple" | "orange" | "red" | "indigo" | "pink"

// Define props interface
interface QuickActionButtonProps {
  label: string
  icon: React.ReactNode
  href: string
  color?: ValidColor
}

function QuickActionButton({ label, icon, href, color = "green" }: QuickActionButtonProps) {
  // Determine color classes based on the color prop
  let colorClass = "bg-green-500 hover:bg-green-600"

  if (color === "blue") {
    colorClass = "bg-blue-500 hover:bg-blue-600"
  } else if (color === "purple") {
    colorClass = "bg-purple-500 hover:bg-purple-600"
  } else if (color === "orange") {
    colorClass = "bg-orange-500 hover:bg-orange-600"
  } else if (color === "red") {
    colorClass = "bg-red-500 hover:bg-red-600"
  } else if (color === "indigo") {
    colorClass = "bg-indigo-500 hover:bg-indigo-600"
  } else if (color === "pink") {
    colorClass = "bg-pink-500 hover:bg-pink-600"
  }

  return (
    <Link
      href={href}
      className={`${colorClass} text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  )
}

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Apps" count={124} icon={<Smartphone size={24} />} href="/admin/apps" color="blue" />
        <DashboardCard
          title="Total Games"
          count={87}
          icon={<Gamepad2 size={24} />}
          href="/admin/games"
          color="purple"
        />
        <DashboardCard title="Blog Posts" count={36} icon={<FileText size={24} />} href="/admin/blogs" color="orange" />
        <DashboardCard
          title="Comments"
          count={284}
          icon={<MessageSquare size={24} />}
          href="/admin/comments"
          color="green"
        />
      </div>

      <h2 className="text-xl font-bold mt-8">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton label="Add New App" icon={<Smartphone size={18} />} href="/admin/apps/new" color="blue" />
        <QuickActionButton label="Add New Game" icon={<Gamepad2 size={18} />} href="/admin/games/new" color="purple" />
        <QuickActionButton label="New Blog Post" icon={<FileText size={18} />} href="/admin/blogs/new" color="orange" />
        <QuickActionButton
          label="Manage Categories"
          icon={<Tag size={18} />}
          href="/admin/categories/apps-games"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Content Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionButton
              label="Latest Apps Section"
              icon={<Smartphone size={18} />}
              href="/admin/homepage/latest-apps"
              color="blue"
            />
            <QuickActionButton
              label="Trending Apps Section"
              icon={<TrendingUp size={18} />}
              href="/admin/homepage/trending-apps"
              color="pink"
            />
            <QuickActionButton label="Publishers" icon={<Users size={18} />} href="/admin/publishers" color="indigo" />
            <QuickActionButton label="Storage" icon={<Package size={18} />} href="/admin/storage" color="red" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Analytics Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatsCard
              title="Downloads Today"
              value="1,284"
              description="+12.5% from yesterday"
              icon={<BarChart3 size={24} />}
              color="green"
            />
            <StatsCard
              title="Active Users"
              value="8,521"
              description="+5.2% from last week"
              icon={<Users size={24} />}
              color="blue"
            />
            <StatsCard
              title="New Comments"
              value="32"
              description="Last 24 hours"
              icon={<MessageSquare size={24} />}
              color="orange"
            />
            <StatsCard
              title="Server Status"
              value="Healthy"
              description="All systems operational"
              icon={<Layers size={24} />}
              color="green"
            />
          </div>
          <div className="mt-4 text-right">
            <Link
              href="/admin/analytics"
              className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center justify-end gap-1"
            >
              View detailed analytics
              <Settings size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
