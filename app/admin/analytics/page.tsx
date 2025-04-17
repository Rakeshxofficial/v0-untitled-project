"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Download, Eye, Smartphone, Gamepad2, FileText, Users } from "lucide-react"
import { supabase, type Analytics } from "@/lib/supabase"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week")

  // Fetch analytics data on component mount and when time range changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)

      try {
        // Get date range based on selected time range
        const now = new Date()
        const startDate = new Date()

        if (timeRange === "week") {
          startDate.setDate(now.getDate() - 7)
        } else if (timeRange === "month") {
          startDate.setMonth(now.getMonth() - 1)
        } else if (timeRange === "year") {
          startDate.setFullYear(now.getFullYear() - 1)
        }

        const { data, error } = await supabase
          .from("analytics")
          .select("*")
          .gte("date", startDate.toISOString().split("T")[0])
          .order("date")

        if (error) throw error

        setAnalytics(data as Analytics[])
      } catch (error: any) {
        console.error("Error fetching analytics:", error)
        setError(error.message || "Failed to fetch analytics data")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  // Calculate totals
  const getTotals = () => {
    if (analytics.length === 0)
      return {
        appCount: 0,
        gameCount: 0,
        blogCount: 0,
        downloadCount: 0,
        viewCount: 0,
        activeUsers: 0,
      }

    const latest = analytics[analytics.length - 1]

    return {
      appCount: latest.app_count,
      gameCount: latest.game_count,
      blogCount: latest.blog_count,
      downloadCount: latest.download_count,
      viewCount: latest.view_count,
      activeUsers: latest.active_users,
    }
  }

  const totals = getTotals()

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    if (timeRange === "week") {
      return date.toLocaleDateString(undefined, { weekday: "short" })
    } else if (timeRange === "month") {
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    } else {
      return date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
    }
  }

  // Prepare chart data
  const prepareChartData = () => {
    return analytics.map((item) => ({
      date: formatDate(item.date),
      downloads: item.download_count,
      views: item.view_count,
      activeUsers: item.active_users,
      apps: item.app_count,
      games: item.game_count,
      blogs: item.blog_count,
    }))
  }

  const chartData = prepareChartData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">View website statistics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "week"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "month"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "year"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Last Year
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl">{error}</div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Apps"
              value={totals.appCount}
              icon={<Smartphone className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Total Games"
              value={totals.gameCount}
              icon={<Gamepad2 className="w-5 h-5" />}
              color="purple"
            />
            <StatCard
              title="Total Blogs"
              value={totals.blogCount}
              icon={<FileText className="w-5 h-5" />}
              color="orange"
            />
            <StatCard
              title="Total Downloads"
              value={totals.downloadCount.toLocaleString()}
              icon={<Download className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Total Views"
              value={totals.viewCount.toLocaleString()}
              icon={<Eye className="w-5 h-5" />}
              color="indigo"
            />
            <StatCard
              title="Active Users"
              value={totals.activeUsers.toLocaleString()}
              icon={<Users className="w-5 h-5" />}
              color="red"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Downloads and Views Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Downloads & Views</h2>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: "#6B7280" }} />
                    <YAxis stroke="#6B7280" tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                        color: "#F9FAFB",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="downloads"
                      name="Downloads"
                      stroke="#10B981"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="views" name="Views" stroke="#6366F1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Content Count Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Content Growth</h2>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: "#6B7280" }} />
                    <YAxis stroke="#6B7280" tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                        color: "#F9FAFB",
                      }}
                    />
                    <Bar dataKey="apps" name="Apps" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="games" name="Games" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="blogs" name="Blogs" fill="#F97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Active Users Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Active Users</h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: "#6B7280" }} />
                  <YAxis stroke="#6B7280" tick={{ fill: "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      borderColor: "#374151",
                      color: "#F9FAFB",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    name="Active Users"
                    stroke="#EF4444"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: "green" | "blue" | "purple" | "orange" | "red" | "indigo"
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-500",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-500",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-500",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      text: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500",
    },
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg ${colorClasses[color].iconBg} flex items-center justify-center text-white`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  )
}
