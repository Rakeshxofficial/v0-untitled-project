"use server"

import { supabase } from "@/lib/supabase"

// This function only checks if buckets exist without trying to create them
export async function checkBuckets() {
  try {
    // Get existing buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return { success: false, error: bucketsError.message }
    }

    // Define required buckets
    const requiredBuckets = ["app-icons", "app-screenshots", "apk-files"]
    const existingBuckets = []
    const missingBuckets = []

    // Check which buckets exist and which are missing
    for (const bucket of requiredBuckets) {
      if (buckets.some((b) => b.name === bucket)) {
        existingBuckets.push(bucket)
      } else {
        missingBuckets.push(bucket)
      }
    }

    return {
      success: true,
      existingBuckets,
      missingBuckets,
      allExist: missingBuckets.length === 0,
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Function to check if a specific bucket exists
export async function checkBucketExists(bucketName: string) {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return { exists: false, error: error.message }
    }

    return {
      exists: buckets.some((b) => b.name === bucketName),
      error: null,
    }
  } catch (error: any) {
    return { exists: false, error: error.message }
  }
}
