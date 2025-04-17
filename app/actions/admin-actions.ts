import { refreshSitemap } from "@/lib/sitemap-utils"
import { supabase } from "@/lib/supabase"

// Example function to update after content changes
export async function updateContentAndRefreshSitemap(data) {
  try {
    // Your existing update logic here

    // After successful update, refresh the sitemap
    await refreshSitemap()

    return { success: true }
  } catch (error) {
    console.error("Error updating content:", error)
    return { success: false, error }
  }
}

// Function to update app icon background color
export async function updateAppIconBgColor(appId: string, color: string, contentType: "app" | "game" = "app") {
  try {
    const { error } = await supabase
      .from(contentType === "app" ? "apps" : "games")
      .update({ icon_bg_color: color })
      .eq("id", appId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error(`Error updating ${contentType} icon background color:`, error)
    return { success: false, error }
  }
}
