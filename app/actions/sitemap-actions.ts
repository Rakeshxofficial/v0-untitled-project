"use server"

import { supabase } from "@/lib/supabase"
import { refreshSitemap } from "@/lib/sitemap-utils"
import { revalidatePath } from "next/cache"

// Types for sitemap entries
export type SitemapEntry = {
  id?: number
  url: string
  priority: number
  change_frequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  last_modified: string
  include_in_sitemap: boolean
  notes?: string
}

export type SitemapExclusion = {
  id?: number
  url_pattern: string
  reason?: string
}

// Add a custom sitemap entry
export async function addCustomSitemapEntry(entry: Omit<SitemapEntry, "id">) {
  try {
    const { data, error } = await supabase.from("custom_sitemap_entries").insert([entry]).select()

    if (error) throw error

    // Refresh the sitemap after adding a new entry
    await refreshSitemap()
    revalidatePath("/admin/sitemap")

    return { success: true, data }
  } catch (error) {
    console.error("Error adding custom sitemap entry:", error)
    return { success: false, error }
  }
}

// Update a custom sitemap entry
export async function updateCustomSitemapEntry(id: number, entry: Partial<SitemapEntry>) {
  try {
    const { data, error } = await supabase.from("custom_sitemap_entries").update(entry).eq("id", id).select()

    if (error) throw error

    // Refresh the sitemap after updating an entry
    await refreshSitemap()
    revalidatePath("/admin/sitemap")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating custom sitemap entry:", error)
    return { success: false, error }
  }
}

// Delete a custom sitemap entry
export async function deleteCustomSitemapEntry(id: number) {
  try {
    const { error } = await supabase.from("custom_sitemap_entries").delete().eq("id", id)

    if (error) throw error

    // Refresh the sitemap after deleting an entry
    await refreshSitemap()
    revalidatePath("/admin/sitemap")

    return { success: true }
  } catch (error) {
    console.error("Error deleting custom sitemap entry:", error)
    return { success: false, error }
  }
}

// Add a sitemap exclusion
export async function addSitemapExclusion(exclusion: Omit<SitemapExclusion, "id">) {
  try {
    const { data, error } = await supabase.from("sitemap_exclusions").insert([exclusion]).select()

    if (error) throw error

    // Refresh the sitemap after adding a new exclusion
    await refreshSitemap()
    revalidatePath("/admin/sitemap")

    return { success: true, data }
  } catch (error) {
    console.error("Error adding sitemap exclusion:", error)
    return { success: false, error }
  }
}

// Delete a sitemap exclusion
export async function deleteSitemapExclusion(id: number) {
  try {
    const { error } = await supabase.from("sitemap_exclusions").delete().eq("id", id)

    if (error) throw error

    // Refresh the sitemap after deleting an exclusion
    await refreshSitemap()
    revalidatePath("/admin/sitemap")

    return { success: true }
  } catch (error) {
    console.error("Error deleting sitemap exclusion:", error)
    return { success: false, error }
  }
}

// Get all custom sitemap entries
export async function getCustomSitemapEntries() {
  try {
    const { data, error } = await supabase.from("custom_sitemap_entries").select("*").order("url", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error getting custom sitemap entries:", error)
    return { success: false, error, data: [] }
  }
}

// Get all sitemap exclusions
export async function getSitemapExclusions() {
  try {
    const { data, error } = await supabase
      .from("sitemap_exclusions")
      .select("*")
      .order("url_pattern", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error getting sitemap exclusions:", error)
    return { success: false, error, data: [] }
  }
}

// Manually trigger sitemap refresh
export async function triggerSitemapRefresh() {
  try {
    await refreshSitemap()
    revalidatePath("/admin/sitemap")
    return { success: true }
  } catch (error) {
    console.error("Error refreshing sitemap:", error)
    return { success: false, error }
  }
}
