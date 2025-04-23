"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ErrorLogFilters({
  currentSeverity,
  currentStatus,
  currentPeriod,
}: {
  currentSeverity: string
  currentStatus: string
  currentPeriod: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)

    // Reset to page 1 when filters change
    params.set("page", "1")

    return params.toString()
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:w-1/3">
        <label className="block text-sm font-medium mb-1">Severity</label>
        <Select
          value={currentSeverity}
          onValueChange={(value) => {
            router.push(`${pathname}?${createQueryString("severity", value)}`)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-1/3">
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select
          value={currentStatus}
          onValueChange={(value) => {
            router.push(`${pathname}?${createQueryString("status", value)}`)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-1/3">
        <label className="block text-sm font-medium mb-1">Time Period</label>
        <Select
          value={currentPeriod}
          onValueChange={(value) => {
            router.push(`${pathname}?${createQueryString("period", value)}`)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
