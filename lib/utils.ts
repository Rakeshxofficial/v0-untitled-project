import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { supabase } from "./supabase"

/**
 * Gets the public URL for a file path or returns the original URL if it's already a full URL
 * @param url The file path or URL
 * @param bucket The storage bucket name (optional)
 * @returns The public URL
 */
export function getPublicUrl(url: string | null | undefined, bucket?: string): string {
  if (!url) return "/placeholder.svg"

  // Handle object with url property (for backward compatibility)
  if (typeof url === "object" && url !== null && "url" in url) {
    url = (url as any).url
  }

  // Ensure url is a string before calling startsWith
  if (typeof url !== "string") {
    console.warn("Invalid URL type provided to getPublicUrl:", url)
    return "/placeholder.svg"
  }

  // If the URL already starts with http(s), it's already a full URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // If it's a path in a bucket, get the public URL
  if (bucket) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(url)
    return data.publicUrl
  }

  // Default placeholder
  return "/placeholder.svg"
}

/**
 * Formats a file size string to a human-readable format
 * @param size The file size in bytes or a string like "123 MB"
 * @returns Formatted size string
 */
export function formatFileSize(size: number | string): string {
  if (typeof size === "string") {
    // If it's already a formatted string like "123 MB", return it
    if (size.includes(" ")) return size

    // Try to parse it as a number
    size = Number.parseInt(size, 10)
    if (isNaN(size)) return "Unknown size"
  }

  const units = ["B", "KB", "MB", "GB", "TB"]
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
}

/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
}

/**
 * Creates a slug specific for blog posts
 * @param title The blog post title
 * @param id Optional ID to append for uniqueness
 * @returns A URL-friendly slug
 */
export function createBlogSlug(title: string, id?: string): string {
  const baseSlug = createSlug(title)

  // If an ID is provided, append a short version to ensure uniqueness
  if (id) {
    // Ensure no consecutive hyphens when combining slug and ID
    return `${baseSlug}-${id}`.replace(/-+/g, "-")
  }

  return baseSlug
}

/**
 * Formats a date string to a human-readable format
 * @param dateString The date string to format
 * @returns A human-readable date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
