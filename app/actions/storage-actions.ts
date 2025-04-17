"use server"

import { supabase } from "@/lib/supabase"

/**
 * Initializes Supabase Storage buckets if they don't exist.
 * Note: This may fail due to row-level security policies if the user doesn't have admin privileges.
 */
export async function initializeStorageBuckets() {
  try {
    // Get existing buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return { success: false, error: bucketsError.message }
    }

    // Define required buckets with their configurations
    const requiredBuckets = [
      { name: "app-icons", public: true },
      { name: "app-screenshots", public: true },
      { name: "apk-files", public: true },
    ]

    // Check which buckets exist and which are missing
    const existingBuckets = buckets.map((b) => b.name)
    const missingBuckets = requiredBuckets.filter((b) => !existingBuckets.includes(b.name)).map((b) => b.name)

    // Return the status without attempting to create buckets
    return {
      success: true,
      existingBuckets,
      missingBuckets,
      message: "Storage buckets checked successfully",
    }
  } catch (error: any) {
    console.error("Error checking storage buckets:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param folder Optional folder path within the bucket
 * @returns Object with success status, path, and URL if successful
 */
export async function uploadFile(file: File, bucket: string, folder = "") {
  try {
    // Check if the bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return { success: false, error: `Error checking buckets: ${bucketsError.message}` }
    }

    const bucketExists = buckets.some((b) => b.name === bucket)
    if (!bucketExists) {
      return {
        success: false,
        error: `Bucket "${bucket}" does not exist. Please use direct URLs instead or create the bucket in Supabase.`,
      }
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return { success: true, path: filePath, url: publicUrl }
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get public URL for a file in Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns The public URL for the file
 */
export async function getStoragePublicUrl(bucket: string, path: string): Promise<string> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
