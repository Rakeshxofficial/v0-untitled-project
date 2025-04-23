"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, AlertOctagon, Info } from "lucide-react"

type ErrorStat = {
  severity: string
  count: number
  percentage: number
}

export default function ErrorLogStats({ stats }: { stats: ErrorStat[] }) {
  // Find stats for each severity
  const criticalStat = stats.find((s) => s.severity === "critical") || { count: 0, percentage: 0 }
  const highStat = stats.find((s) => s.severity === "high") || { count: 0, percentage: 0 }
  const mediumStat = stats.find((s) => s.severity === "medium") || { count: 0, percentage: 0 }
  const lowStat = stats.find((s) => s.severity === "low") || { count: 0, percentage: 0 }

  // Calculate total errors
  const totalErrors = stats.reduce((sum, stat) => sum + stat.count, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
          <AlertOctagon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{criticalStat.count}</div>
          <p className="text-xs text-muted-foreground">{criticalStat.percentage.toFixed(1)}% of all errors</p>
          {criticalStat.count > 0 && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${criticalStat.percentage}%` }}></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">High Severity</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{highStat.count}</div>
          <p className="text-xs text-muted-foreground">{highStat.percentage.toFixed(1)}% of all errors</p>
          {highStat.count > 0 && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${highStat.percentage}%` }}></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mediumStat.count}</div>
          <p className="text-xs text-muted-foreground">{mediumStat.percentage.toFixed(1)}% of all errors</p>
          {mediumStat.count > 0 && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${mediumStat.percentage}%` }}></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Low Severity</CardTitle>
          <Info className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStat.count}</div>
          <p className="text-xs text-muted-foreground">{lowStat.percentage.toFixed(1)}% of all errors</p>
          {lowStat.count > 0 && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${lowStat.percentage}%` }}></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
