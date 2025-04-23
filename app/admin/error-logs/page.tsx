import { supabase } from "@/lib/supabase"
import ErrorLogFilters from "./components/error-log-filters"
import ErrorLogTable from "./components/error-log-table"
import ErrorLogStats from "./components/error-log-stats"

export default async function ErrorLogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse search params
  const severity = (searchParams.severity as string) || "all"
  const status = (searchParams.status as string) || "unresolved"
  const period = (searchParams.period as string) || "7d"
  const page = Number.parseInt((searchParams.page as string) || "1")
  const pageSize = 20

  // Build query
  let query = supabase.from("error_logs").select("*", { count: "exact" })

  // Apply filters
  if (severity !== "all") {
    query = query.eq("severity", severity)
  }

  if (status === "unresolved") {
    query = query.eq("is_resolved", false)
  } else if (status === "resolved") {
    query = query.eq("is_resolved", true)
  }

  // Apply time period filter
  if (period === "24h") {
    query = query.gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  } else if (period === "7d") {
    query = query.gte("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  } else if (period === "30d") {
    query = query.gte("timestamp", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  }

  // Apply pagination
  query = query.order("timestamp", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)

  // Execute query
  const { data: logs, error, count } = await query

  if (error) {
    console.error("Error fetching error logs:", error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Error Logs</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load error logs. Please try again later.
        </div>
      </div>
    )
  }

  // Get error stats
  const { data: stats } = await supabase.rpc("get_error_stats")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Error Logs</h1>

      <ErrorLogStats stats={stats || []} />

      <div className="mb-6">
        <ErrorLogFilters currentSeverity={severity} currentStatus={status} currentPeriod={period} />
      </div>

      <ErrorLogTable logs={logs || []} totalCount={count || 0} currentPage={page} pageSize={pageSize} />
    </div>
  )
}
