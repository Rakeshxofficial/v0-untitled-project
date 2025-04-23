import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { errors } = await request.json()

    if (!Array.isArray(errors) || errors.length === 0) {
      return NextResponse.json({ success: false, message: "No errors provided" }, { status: 400 })
    }

    // Insert errors into Supabase
    const { data, error } = await supabase.from("error_logs").insert(
      errors.map((err) => ({
        message: err.message,
        stack: err.stack,
        component_name: err.componentName,
        url: err.url,
        user_id: err.userId,
        timestamp: err.timestamp,
        severity: err.severity,
        additional_data: err.additionalData,
      })),
    )

    if (error) {
      console.error("Error storing logs in Supabase:", error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: errors.length })
  } catch (error) {
    console.error("Error processing error logs:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
