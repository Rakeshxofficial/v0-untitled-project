"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AlertTriangle, AlertCircle, AlertOctagon, Info, Check } from "lucide-react"

type ErrorLog = {
  id: string
  message: string
  component_name: string
  url: string
  timestamp: string
  severity: "low" | "medium" | "high" | "critical"
  is_resolved: boolean
}

export default function ErrorLogTable({
  logs,
  totalCount,
  currentPage,
  pageSize,
}: {
  logs: ErrorLog[]
  totalCount: number
  currentPage: number
  pageSize: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const totalPages = Math.ceil(totalCount / pageSize)

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertOctagon className="h-5 w-5 text-red-500" />
      case "high":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "low":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const handleResolve = async (id: string) => {
    setResolvingId(id)

    try {
      const { error } = await supabase
        .from("error_logs")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: "admin", // Replace with actual user ID if available
          resolution_notes: "Marked as resolved from admin dashboard",
        })
        .eq("id", id)

      if (error) {
        throw error
      }

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error("Error resolving log:", error)
      alert("Failed to resolve error log. Please try again.")
    } finally {
      setResolvingId(null)
    }
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Severity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Error Message
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Component
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No error logs found matching the current filters.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    expandedLogId === log.id ? "bg-gray-50 dark:bg-gray-800" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getSeverityIcon(log.severity)}
                      <span className="ml-2 text-sm capitalize">{log.severity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <button
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        className="text-left hover:underline focus:outline-none"
                      >
                        {log.message.length > 100 ? `${log.message.substring(0, 100)}...` : log.message}
                      </button>
                    </div>
                    {expandedLogId === log.id && (
                      <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm whitespace-pre-wrap">
                        {log.message}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.component_name || "Unknown"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.is_resolved
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {log.is_resolved ? "Resolved" : "Unresolved"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {!log.is_resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(log.id)}
                        disabled={resolvingId === log.id}
                      >
                        {resolvingId === log.id ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Resolve
                          </span>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
                router.push(`${pathname}?${createQueryString("page", (currentPage - 1).toString())}`)
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => {
                router.push(`${pathname}?${createQueryString("page", (currentPage + 1).toString())}`)
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
