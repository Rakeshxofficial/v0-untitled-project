"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Database, Folder, File, Upload, Trash2, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { checkBuckets } from "@/app/actions/check-buckets"
import { formatFileSize } from "@/lib/utils"

export default function StorageManagement() {
  const [buckets, setBuckets] = useState<any[]>([])
  const [currentBucket, setCurrentBucket] = useState<string | null>(null)
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  // Required buckets for the application
  const requiredBuckets = ["app-icons", "app-screenshots", "apk-files"]

  // Fetch buckets on component mount
  useEffect(() => {
    fetchBuckets()
  }, [])

  // Fetch files when bucket changes
  useEffect(() => {
    if (currentBucket) {
      fetchFiles(currentBucket)
    }
  }, [currentBucket])

  const fetchBuckets = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.storage.listBuckets()

      if (error) throw error

      setBuckets(data)
      setLastChecked(new Date().toLocaleString())

      // Set first bucket as current if none selected
      if (data.length > 0 && !currentBucket) {
        setCurrentBucket(data[0].name)
      }
    } catch (error: any) {
      console.error("Error fetching buckets:", error)
      setError(`Error fetching buckets: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchFiles = async (bucket: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.from(bucket).list()

      if (error) throw error

      setFiles(data || [])
    } catch (error: any) {
      console.error(`Error fetching files from bucket ${bucket}:`, error)
      setError(`Error fetching files: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentBucket || !e.target.files || e.target.files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const file = e.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`

      const { error } = await supabase.storage.from(currentBucket).upload(fileName, file)

      if (error) throw error

      // Refresh file list
      fetchFiles(currentBucket)
    } catch (error: any) {
      console.error("Error uploading file:", error)
      setError(`Error uploading file: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (path: string) => {
    if (!currentBucket || !confirm("Are you sure you want to delete this file?")) return

    setError(null)
    try {
      const { error } = await supabase.storage.from(currentBucket).remove([path])

      if (error) throw error

      // Refresh file list
      fetchFiles(currentBucket)
    } catch (error: any) {
      console.error("Error deleting file:", error)
      setError(`Error deleting file: ${error.message}`)
    }
  }

  const handleCheckBuckets = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const result = await checkBuckets()

      if (!result.success) {
        throw new Error(result.error || "Failed to check buckets")
      }

      // Refresh the bucket list to show any changes
      fetchBuckets()
    } catch (error: any) {
      console.error("Error checking buckets:", error)
      setError(`Error checking buckets: ${error.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  const getFileUrl = (path: string) => {
    if (!currentBucket) return ""

    const { data } = supabase.storage.from(currentBucket).getPublicUrl(path)
    return data.publicUrl
  }

  // Check if a required bucket is missing
  const getMissingBuckets = () => {
    return requiredBuckets.filter((bucket) => !buckets.some((b) => b.name === bucket))
  }

  const missingBuckets = getMissingBuckets()
  const hasMissingBuckets = missingBuckets.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Storage Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage Supabase Storage buckets and files</p>
          </div>
        </div>
        <button
          onClick={handleCheckBuckets}
          disabled={refreshing}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Checking..." : "Refresh Bucket Status"}
        </button>
      </div>

      {/* Status information */}
      {lastChecked && <div className="text-sm text-gray-500 dark:text-gray-400">Last checked: {lastChecked}</div>}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Missing buckets warning */}
      {hasMissingBuckets && (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-amber-600 dark:text-amber-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Missing Required Buckets</p>
            <p>The following storage buckets are required but missing: {missingBuckets.join(", ")}</p>
            <p className="mt-1">
              You need to create these buckets manually in the Supabase dashboard due to permission restrictions.
            </p>
            <div className="mt-2">
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-amber-700 dark:text-amber-300 hover:underline"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Go to Supabase Dashboard
              </a>
            </div>
            <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <p className="font-medium mb-1">How to create buckets in Supabase:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Log in to your Supabase project</li>
                <li>Navigate to Storage in the left sidebar</li>
                <li>Click "New Bucket"</li>
                <li>Enter the bucket name (e.g., "app-icons")</li>
                <li>Enable "Public bucket" for file access</li>
                <li>Click "Create bucket"</li>
                <li>Repeat for all missing buckets</li>
                <li>Return here and click "Refresh Bucket Status"</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Buckets and Files */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Buckets List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            Storage Buckets
          </h2>

          {loading && buckets.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : buckets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No buckets found. Create them in the Supabase dashboard.
            </div>
          ) : (
            <ul className="space-y-2">
              {buckets.map((bucket) => (
                <li key={bucket.id}>
                  <button
                    onClick={() => setCurrentBucket(bucket.name)}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      currentBucket === bucket.name
                        ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Folder
                      className={`w-5 h-5 mr-2 ${
                        currentBucket === bucket.name ? "text-green-500" : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="font-medium">{bucket.name}</span>
                    {requiredBuckets.includes(bucket.name) && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Files List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <File className="w-5 h-5 text-green-500" />
              {currentBucket ? `Files in ${currentBucket}` : "Select a bucket"}
            </h2>

            {currentBucket && (
              <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload File"}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {!currentBucket ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Select a bucket to view files</div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No files in this bucket</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      File Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Size
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <File className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.metadata?.size || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {file.metadata?.mimetype || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <a
                            href={getFileUrl(file.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDeleteFile(file.name)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
