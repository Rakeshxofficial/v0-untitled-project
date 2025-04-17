"use server"

import { supabase } from "@/lib/supabase"

export async function incrementDownloadCount(formData: FormData) {
  const contentId = formData.get("contentId") as string
  const contentType = formData.get("contentType") as "app" | "game"

  if (!contentId || !contentType) return

  const table = contentType === "app" ? "apps" : "games"

  try {
    await supabase
      .from(table)
      .update({
        download_count: supabase.rpc("increment_counter", {
          row_id: contentId,
          counter_column: "download_count",
        }),
      })
      .eq("id", contentId)

    return { success: true }
  } catch (error) {
    console.error(`Error incrementing download count:`, error)
    return { success: false, error }
  }
}
