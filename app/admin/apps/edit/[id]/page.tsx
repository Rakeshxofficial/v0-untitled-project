"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, X, Upload, Plus, Trash2, Loader2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"
import { supabase, fetchCategories, type Category } from "@/lib/supabase"
import { getPublicUrl } from "@/lib/utils"
import { checkBuckets, checkBucketExists } from "@/app/actions/check-buckets"

// Custom upload function that checks if bucket exists first
async function uploadFileIfBucketExists(file: File, bucket: string, folder = "") {
  try {
    // Check if bucket exists first
    const { exists, error: checkError } = await checkBucketExists(bucket)

    if (checkError) {
      console.error(`Error checking bucket ${bucket}:`, checkError)
      return { success: false, error: new Error(`Error checking bucket: ${checkError}`) }
    }

    if (!exists) {
      return {
        success: false,
        error: new Error(`Bucket "${bucket}" does not exist. Please create it in the Supabase dashboard.`),
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
      throw error
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return { success: true, path: filePath, url: publicUrl }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error }
  }
}

export default function EditApp({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [appNotFound, setAppNotFound] = useState(false)
  const [checkingBuckets, setCheckingBuckets] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "og" | "twitter">("basic")

  // Storage bucket states
  const [bucketStatus, setBucketStatus] = useState<{
    checked: boolean
    existingBuckets: string[]
    missingBuckets: string[]
    lastChecked: string | null
  }>({
    checked: false,
    existingBuckets: [],
    missingBuckets: [],
    lastChecked: null,
  })

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    version: "",
    category_id: "",
    publisher: "",
    requirements: "",
    size: "",
    mod_info: "",
    description: "",
    google_play_link: "",
    status: "draft",
    // Basic SEO fields
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    // Open Graph fields
    og_title: "",
    og_description: "",
    og_type: "article",
    og_url: "",
    // Twitter Card fields
    twitter_title: "",
    twitter_description: "",
    twitter_card: "summary_large_image",
    icon_bg_color: "",
  })

  const [modFeatures, setModFeatures] = useState<string[]>([])

  // Media states
  const [appIcon, setAppIcon] = useState<File | null>(null)
  const [appIconUrl, setAppIconUrl] = useState<string>("")
  const [appIconPreview, setAppIconPreview] = useState<string | null>(null)
  const [useIconUrl, setUseIconUrl] = useState<boolean>(false)
  const [existingIconPath, setExistingIconPath] = useState<string | null>(null)
  const [replaceIcon, setReplaceIcon] = useState<boolean>(false)

  // SEO Image states
  // OG Image
  const [ogImage, setOgImage] = useState<File | null>(null)
  const [ogImageUrl, setOgImageUrl] = useState<string>("")
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null)
  const [useOgImageUrl, setUseOgImageUrl] = useState<boolean>(false)
  const [existingOgImagePath, setExistingOgImagePath] = useState<string | null>(null)
  const [replaceOgImage, setReplaceOgImage] = useState<boolean>(false)

  // Twitter Image
  const [twitterImage, setTwitterImage] = useState<File | null>(null)
  const [twitterImageUrl, setTwitterImageUrl] = useState<string>("")
  const [twitterImagePreview, setTwitterImagePreview] = useState<string | null>(null)
  const [useTwitterImageUrl, setUseTwitterImageUrl] = useState<boolean>(false)
  const [existingTwitterImagePath, setExistingTwitterImagePath] = useState<string | null>(null)
  const [replaceTwitterImage, setReplaceTwitterImage] = useState<boolean>(false)

  // Favicon state
  const [favicon, setFavicon] = useState<File | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string>("")
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [useFaviconUrl, setUseFaviconUrl] = useState<boolean>(false)
  const [existingFaviconPath, setExistingFaviconPath] = useState<string | null>(null)
  const [replaceFavicon, setReplaceFavicon] = useState<boolean>(false)

  const [appScreenshots, setAppScreenshots] = useState<File[]>([])
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([])
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const [useScreenshotUrls, setUseScreenshotUrls] = useState<boolean>(false)
  const [existingScreenshots, setExistingScreenshots] = useState<any[]>([])

  const [apkFile, setApkFile] = useState<File | null>(null)
  const [apkFileUrl, setApkFileUrl] = useState<string>("")
  const [useApkUrl, setUseApkUrl] = useState<boolean>(false)
  const [existingApkPath, setExistingApkPath] = useState<string | null>(null)
  const [replaceApk, setReplaceApk] = useState<boolean>(false)

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Check buckets on component mount
  useEffect(() => {
    verifyBuckets()
  }, [])

  const verifyBuckets = async () => {
    setCheckingBuckets(true)
    try {
      const result = await checkBuckets()

      if (result.success) {
        setBucketStatus({
          checked: true,
          existingBuckets: result.existingBuckets || [],
          missingBuckets: result.missingBuckets || [],
          lastChecked: new Date().toLocaleString(),
        })

        // Only default to using URLs if specific buckets are missing
        if (result.missingBuckets && result.missingBuckets.includes("app-icons")) {
          setUseIconUrl(true)
        }

        if (result.missingBuckets && result.missingBuckets.includes("app-screenshots")) {
          setUseScreenshotUrls(true)
        }

        if (result.missingBuckets && result.missingBuckets.includes("apk-files")) {
          setUseApkUrl(true)
        }

        if (result.missingBuckets && result.missingBuckets.includes("seo-images")) {
          setUseOgImageUrl(true)
          setUseTwitterImageUrl(true)
        }
      } else {
        console.error("Error checking buckets:", result.error)
        setBucketStatus({
          checked: true,
          existingBuckets: [],
          missingBuckets: ["app-icons", "app-screenshots", "apk-files", "seo-images"],
          lastChecked: new Date().toLocaleString(),
        })

        // Default to using URLs if we can't check buckets
        setUseIconUrl(true)
        setUseScreenshotUrls(true)
        setUseApkUrl(true)
        setUseOgImageUrl(true)
        setUseTwitterImageUrl(true)
      }
    } catch (error) {
      console.error("Error verifying buckets:", error)
    } finally {
      setCheckingBuckets(false)
    }
  }

  // Fetch app data and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch app data
        const { data: appData, error: appError } = await supabase.from("apps").select("*").eq("id", id).single()

        if (appError) {
          console.error("Error fetching app:", appError)
          setAppNotFound(true)
          return
        }

        // Fetch categories
        const categoriesData = await fetchCategories("app")
        setCategories(categoriesData)

        // Fetch mod features
        const { data: modFeaturesData, error: modFeaturesError } = await supabase
          .from("mod_features")
          .select("*")
          .eq("content_id", id)
          .eq("content_type", "app")
          .order("created_at")

        if (modFeaturesError) {
          console.error("Error fetching mod features:", modFeaturesError)
        }

        // Fetch screenshots
        const { data: screenshotsData, error: screenshotsError } = await supabase
          .from("screenshots")
          .select("*")
          .eq("content_id", id)
          .eq("content_type", "app")
          .order("created_at")

        if (screenshotsError) {
          console.error("Error fetching screenshots:", screenshotsError)
        }

        // Set form data
        setFormData({
          title: appData.title || "",
          version: appData.version || "",
          category_id: appData.category_id || "",
          publisher: appData.publisher || "",
          requirements: appData.requirements || "",
          size: appData.size || "",
          mod_info: appData.mod_info || "",
          description: appData.description || "",
          google_play_link: appData.google_play_link || "",
          status: appData.status || "draft",
          // Basic SEO fields
          meta_title: appData.meta_title || "",
          meta_description: appData.meta_description || "",
          meta_keywords: appData.meta_keywords || "",
          // Open Graph fields
          og_title: appData.og_title || "",
          og_description: appData.og_description || "",
          og_type: appData.og_type || "article",
          og_url: appData.og_url || "",
          // Twitter Card fields
          twitter_title: appData.twitter_title || "",
          twitter_description: appData.twitter_description || "",
          twitter_card: appData.twitter_card || "summary_large_image",
          icon_bg_color: appData.icon_bg_color || "#3E3E3E",
        })

        // Set mod features
        if (modFeaturesData && modFeaturesData.length > 0) {
          setModFeatures(modFeaturesData.map((feature) => feature.feature))
        } else {
          setModFeatures([""])
        }

        // Set existing icon
        if (appData.icon_url) {
          setExistingIconPath(appData.icon_url)
          setAppIconPreview(getPublicUrl(appData.icon_url, "app-icons"))
        }

        // Set existing OG image
        if (appData.og_image) {
          setExistingOgImagePath(appData.og_image)
          setOgImagePreview(getPublicUrl(appData.og_image, "seo-images"))
        }

        // Set existing Twitter image
        if (appData.twitter_image) {
          setExistingTwitterImagePath(appData.twitter_image)
          setTwitterImagePreview(getPublicUrl(appData.twitter_image, "seo-images"))
        }

        // Set existing favicon
        if (appData.favicon_url) {
          setExistingFaviconPath(appData.favicon_url)
          setFaviconPreview(getPublicUrl(appData.favicon_url, "app-icons"))
        }

        // Set existing APK
        if (appData.download_url) {
          setExistingApkPath(appData.download_url)
        }

        // Set existing screenshots
        if (screenshotsData && screenshotsData.length > 0) {
          setExistingScreenshots(screenshotsData)

          // Create preview URLs for existing screenshots
          const previews = screenshotsData.map((screenshot) => getPublicUrl(screenshot.url, "app-screenshots"))
          setScreenshotPreviews(previews)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleModFeatureChange = (index: number, value: string) => {
    const newFeatures = [...modFeatures]
    newFeatures[index] = value
    setModFeatures(newFeatures)
  }

  const addModFeature = () => {
    setModFeatures([...modFeatures, ""])
  }

  const removeModFeature = (index: number) => {
    const newFeatures = [...modFeatures]
    newFeatures.splice(index, 1)
    setModFeatures(newFeatures)
  }

  // Icon handlers
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAppIcon(file)
      setAppIconPreview(URL.createObjectURL(file))
      setReplaceIcon(true)
    }
  }

  const handleIconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setAppIconUrl(url)
    setAppIconPreview(url)
    setReplaceIcon(true)
  }

  // OG Image handlers
  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setOgImage(file)
      setOgImagePreview(URL.createObjectURL(file))
      setReplaceOgImage(true)
    }
  }

  const handleOgImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setOgImageUrl(url)
    setOgImagePreview(url)
    setReplaceOgImage(true)
  }

  // Twitter Image handlers
  const handleTwitterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setTwitterImage(file)
      setTwitterImagePreview(URL.createObjectURL(file))
      setReplaceTwitterImage(true)
    }
  }

  const handleTwitterImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setTwitterImageUrl(url)
    setTwitterImagePreview(url)
    setReplaceTwitterImage(true)
  }

  // Favicon handlers
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFavicon(file)
      setFaviconPreview(URL.createObjectURL(file))
      setReplaceFavicon(true)
    }
  }

  const handleFaviconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFaviconUrl(url)
    setFaviconPreview(url)
    setReplaceFavicon(true)
  }

  // Screenshot handlers
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setAppScreenshots((prev) => [...prev, ...files])

      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setScreenshotPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const handleScreenshotUrlChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const url = e.target.value
    const newUrls = [...screenshotUrls]
    newUrls[index] = url
    setScreenshotUrls(newUrls)

    // Update previews
    const newPreviews = [...screenshotPreviews]
    newPreviews[index] = url
    setScreenshotPreviews(newPreviews)
  }

  const addScreenshotUrl = () => {
    setScreenshotUrls([...screenshotUrls, ""])
    setScreenshotPreviews([...screenshotPreviews, ""])
  }

  const removeScreenshot = (index: number, isExisting = false) => {
    if (isExisting) {
      // Mark existing screenshot for deletion
      const updatedExistingScreenshots = [...existingScreenshots]
      updatedExistingScreenshots[index].toDelete = true
      setExistingScreenshots(updatedExistingScreenshots)

      // Remove from previews
      const newPreviews = [...screenshotPreviews]
      newPreviews.splice(index, 1)
      setScreenshotPreviews(newPreviews)
    } else if (useScreenshotUrls) {
      const newUrls = [...screenshotUrls]
      newUrls.splice(index - existingScreenshots.length, 1)
      setScreenshotUrls(newUrls)

      const newPreviews = [...screenshotPreviews]
      newPreviews.splice(index, 1)
      setScreenshotPreviews(newPreviews)
    } else {
      const newScreenshots = [...appScreenshots]
      newScreenshots.splice(index - existingScreenshots.length, 1)
      setAppScreenshots(newScreenshots)

      const newPreviews = [...screenshotPreviews]
      URL.revokeObjectURL(newPreviews[index])
      newPreviews.splice(index, 1)
      setScreenshotPreviews(newPreviews)
    }
  }

  // APK file handlers
  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApkFile(e.target.files[0])
      setReplaceApk(true)
    }
  }

  const handleApkUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApkFileUrl(e.target.value)
    setReplaceApk(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!formData.title || !formData.version || !formData.category_id) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    setSubmitting(true)

    try {
      // Handle app icon (file or URL)
      let iconUrl = existingIconPath
      if (replaceIcon) {
        if (useIconUrl) {
          iconUrl = appIconUrl
        } else if (appIcon) {
          // Only try to upload if the bucket exists
          if (bucketStatus.existingBuckets.includes("app-icons")) {
            const result = await uploadFileIfBucketExists(
              appIcon,
              "app-icons",
              formData.title.toLowerCase().replace(/\s+/g, "-"),
            )

            if (!result.success) {
              throw new Error(result.error?.message || "Failed to upload app icon")
            }

            iconUrl = result.path // Store the path, not the full URL
          } else {
            throw new Error(
              "Cannot upload app icon: Storage bucket 'app-icons' does not exist. Please use a direct URL instead.",
            )
          }
        }
      }

      // Handle OG Image (file or URL)
      let ogImagePath = existingOgImagePath
      if (replaceOgImage) {
        if (useOgImageUrl) {
          // Use the URL from the input field instead of the existing path
          ogImagePath = ogImageUrl
        } else if (ogImage) {
          // Only try to upload if the bucket exists
          if (bucketStatus.existingBuckets.includes("seo-images")) {
            const result = await uploadFileIfBucketExists(
              ogImage,
              "seo-images",
              `og-${formData.title.toLowerCase().replace(/\s+/g, "-")}`,
            )

            if (!result.success) {
              throw new Error(result.error?.message || "Failed to upload OG image")
            }

            ogImagePath = result.path // Store the path, not the full URL
          } else {
            throw new Error(
              "Cannot upload OG image: Storage bucket 'seo-images' does not exist. Please use a direct URL instead.",
            )
          }
        }
      }

      // Handle Twitter Image (file or URL)
      let twitterImagePath = existingTwitterImagePath
      if (replaceTwitterImage) {
        if (useTwitterImageUrl) {
          // Use the URL from the input field instead of the existing path
          twitterImagePath = twitterImageUrl
        } else if (twitterImage) {
          // Only try to upload if the bucket exists
          if (bucketStatus.existingBuckets.includes("seo-images")) {
            const result = await uploadFileIfBucketExists(
              twitterImage,
              "seo-images",
              `twitter-${formData.title.toLowerCase().replace(/\s+/g, "-")}`,
            )

            if (!result.success) {
              throw new Error(result.error?.message || "Failed to upload Twitter image")
            }

            twitterImagePath = result.path // Store the path, not the full URL
          } else {
            throw new Error(
              "Cannot upload Twitter image: Storage bucket 'seo-images' does not exist. Please use a direct URL instead.",
            )
          }
        }
      }

      // Handle Favicon (file or URL)
      let faviconPath = existingFaviconPath
      if (replaceFavicon) {
        if (useFaviconUrl) {
          faviconPath = faviconUrl
        } else if (favicon) {
          // Only try to upload if the bucket exists
          if (bucketStatus.existingBuckets.includes("app-icons")) {
            const result = await uploadFileIfBucketExists(
              favicon,
              "app-icons",
              `favicon-${formData.title.toLowerCase().replace(/\s+/g, "-")}`,
            )

            if (!result.success) {
              throw new Error(result.error?.message || "Failed to upload favicon")
            }

            faviconPath = result.path // Store the path, not the full URL
          } else {
            throw new Error(
              "Cannot upload favicon: Storage bucket 'app-icons' does not exist. Please use a direct URL instead.",
            )
          }
        }
      }

      // Handle APK file (file or URL)
      let downloadUrl = existingApkPath
      if (replaceApk) {
        if (useApkUrl) {
          downloadUrl = apkFileUrl
        } else if (apkFile) {
          // Only try to upload if the bucket exists
          if (bucketStatus.existingBuckets.includes("apk-files")) {
            const result = await uploadFileIfBucketExists(
              apkFile,
              "apk-files",
              formData.title.toLowerCase().replace(/\s+/g, "-"),
            )

            if (!result.success) {
              throw new Error(result.error?.message || "Failed to upload APK file")
            }

            downloadUrl = result.path // Store the path, not the full URL
          } else {
            throw new Error(
              "Cannot upload APK file: Storage bucket 'apk-files' does not exist. Please use a direct URL instead.",
            )
          }
        }
      }

      // Update app data
      const { error: appError } = await supabase
        .from("apps")
        .update({
          ...formData,
          icon_url: iconUrl,
          download_url: downloadUrl,
          og_image: ogImagePath,
          twitter_image: twitterImagePath,
          favicon_url: faviconPath,
          icon_bg_color: formData.icon_bg_color,
        })
        .eq("id", id)

      if (appError) throw appError

      // Update mod features
      // First delete existing features
      await supabase.from("mod_features").delete().eq("content_id", id).eq("content_type", "app")

      // Then insert new features
      if (modFeatures.length > 0 && modFeatures[0] !== "") {
        const featurePromises = modFeatures.map((feature) =>
          supabase.from("mod_features").insert([
            {
              content_id: id,
              content_type: "app",
              feature,
            },
          ]),
        )

        await Promise.all(featurePromises)
      }

      // Handle screenshots
      // Delete screenshots marked for deletion
      const screenshotsToDelete = existingScreenshots
        .filter((screenshot) => screenshot.toDelete)
        .map((screenshot) => screenshot.id)

      if (screenshotsToDelete.length > 0) {
        await supabase.from("screenshots").delete().in("id", screenshotsToDelete)
      }

      // Upload new screenshots
      if (useScreenshotUrls && screenshotUrls.length > 0) {
        const screenshotPromises = screenshotUrls
          .filter((url) => url.trim() !== "")
          .map((url) =>
            supabase.from("screenshots").insert([
              {
                content_id: id,
                content_type: "app",
                url,
              },
            ]),
          )

        await Promise.all(screenshotPromises)
      } else if (appScreenshots.length > 0) {
        // Only try to upload if the bucket exists
        if (bucketStatus.existingBuckets.includes("app-screenshots")) {
          const screenshotPromises = appScreenshots.map(async (file, index) => {
            const result = await uploadFileIfBucketExists(
              file,
              "app-screenshots",
              `${formData.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${index}`,
            )

            if (result.success) {
              return supabase.from("screenshots").insert([
                {
                  content_id: id,
                  content_type: "app",
                  url: result.path, // Store the path, not the full URL
                },
              ])
            } else {
              throw new Error(result.error?.message || "Failed to upload screenshot")
            }
          })

          await Promise.all(screenshotPromises)
        } else {
          throw new Error(
            "Cannot upload screenshots: Storage bucket 'app-screenshots' does not exist. Please use direct URLs instead.",
          )
        }
      }

      alert("App updated successfully!")
      router.push("/admin/apps")
    } catch (error: any) {
      console.error("Error updating app:", error)
      setErrorMessage(error.message || "Failed to update app")
    } finally {
      setSubmitting(false)
    }
  }

  // Check if a specific bucket is missing
  const isBucketMissing = (bucketName: string) => {
    return bucketStatus.checked && bucketStatus.missingBuckets.includes(bucketName)
  }

  if (appNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">App Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The app you are looking for does not exist or has been deleted.
        </p>
        <Link
          href="/admin/apps"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Apps
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading app data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/apps"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit App</h1>
            <p className="text-gray-500 dark:text-gray-400">Update app details and media</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={verifyBuckets}
            disabled={checkingBuckets}
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${checkingBuckets ? "animate-spin" : ""}`} />
            {checkingBuckets ? "Checking..." : "Refresh Bucket Status"}
          </button>
          <Link
            href="/admin/apps"
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Bucket status information */}
      {bucketStatus.checked && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Bucket status last checked: {bucketStatus.lastChecked}
        </div>
      )}

      {bucketStatus.checked && bucketStatus.missingBuckets.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-amber-600 dark:text-amber-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Storage Buckets Not Available</p>
            <p>The following storage buckets are missing: {bucketStatus.missingBuckets.join(", ")}</p>
            <p className="mt-1">
              Please create these buckets in the Supabase dashboard. File upload options have been disabled for missing
              buckets.
            </p>
            <div className="mt-2">
              <Link
                href="/admin/storage"
                className="inline-flex items-center text-amber-700 dark:text-amber-300 hover:underline"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Go to Storage Management
              </Link>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                App Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. YouTube Premium"
              />
            </div>

            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Version*
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. 18.32.39"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category*
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Publisher*
              </label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. Google LLC (Modded by InstallMOD)"
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Requirements*
              </label>
              <input
                type="text"
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. Android 8.0+"
              />
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Size*
              </label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. 134 MB"
              />
            </div>

            <div>
              <label htmlFor="mod_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                MOD Info*
              </label>
              <input
                type="text"
                id="mod_info"
                name="mod_info"
                value={formData.mod_info}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. No Ads, Background Play"
              />
            </div>

            <div>
              <label
                htmlFor="google_play_link"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Google Play Link
              </label>
              <input
                type="url"
                id="google_play_link"
                name="google_play_link"
                value={formData.google_play_link}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. https://play.google.com/store/apps/details?id=com.google.android.youtube"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status*
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* MOD Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">MOD Features</h2>

          <div className="space-y-3">
            {modFeatures.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleModFeatureChange(index, e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder={`Feature ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeModFeature(index)}
                  className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  disabled={modFeatures.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addModFeature}
              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </button>
          </div>
        </div>

        {/* App Description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">App Description</h2>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={10}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
              placeholder="Enter detailed app description with HTML formatting..."
            ></textarea>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              You can use HTML tags for formatting. Use h2 tags for sections like Introduction, App Features, etc.
            </p>
          </div>
        </div>

        {/* SEO Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">SEO Information</h2>

          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "basic"
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Basic Meta Tags
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("og")}
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "og"
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Open Graph
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("twitter")}
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "twitter"
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Twitter Card
              </button>
            </div>
          </div>

          {/* Basic Meta Tags */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="SEO title for search engines"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  If left empty, the app title and version will be used.
                </p>
              </div>

              <div>
                <label
                  htmlFor="meta_description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Meta Description
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={2}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Brief description for search engine results"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recommended length: 150-160 characters.</p>
              </div>

              <div>
                <label
                  htmlFor="meta_keywords"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Meta Keywords
                </label>
                <input
                  type="text"
                  id="meta_keywords"
                  name="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Comma-separated keywords"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Example: app name, mod apk, premium, unlocked
                </p>
              </div>
            </div>
          )}

          {/* Open Graph Settings */}
          {activeTab === "og" && (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="og_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OG Title
                </label>
                <input
                  type="text"
                  id="og_title"
                  name="og_title"
                  value={formData.og_title}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Title for social media shares"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  If left empty, the meta title or app title will be used.
                </p>
              </div>

              <div>
                <label
                  htmlFor="og_description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  OG Description
                </label>
                <textarea
                  id="og_description"
                  name="og_description"
                  value={formData.og_description}
                  onChange={handleChange}
                  rows={2}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Description for social media shares"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recommended length: 2-4 sentences.</p>
              </div>

              <div>
                <label htmlFor="og_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OG Type
                </label>
                <select
                  id="og_type"
                  name="og_type"
                  value={formData.og_type}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                >
                  <option value="article">Article</option>
                  <option value="website">Website</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div>
                <label htmlFor="og_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OG URL (Optional)
                </label>
                <input
                  type="url"
                  id="og_url"
                  name="og_url"
                  value={formData.og_url}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Custom URL for social media shares"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  If left empty, the app's URL will be used.
                </p>
              </div>

              {/* OG Image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">OG Image</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUseOgImageUrl(false)
                        setReplaceOgImage(true)
                      }}
                      disabled={isBucketMissing("seo-images")}
                      className={`px-3 py-1 text-xs rounded-full ${
                        !useOgImageUrl && replaceOgImage
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${isBucketMissing("seo-images") ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUseOgImageUrl(true)
                        setReplaceOgImage(true)
                      }}
                      className={`px-3 py-1 text-xs rounded-full ${
                        useOgImageUrl && replaceOgImage
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Use URL
                    </button>
                    {replaceOgImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceOgImage(false)
                          setOgImage(null)
                          setOgImageUrl("")
                          setOgImagePreview(
                            existingOgImagePath ? getPublicUrl(existingOgImagePath, "seo-images") : null,
                          )
                        }}
                        className="px-3 py-1 text-xs rounded-full bg-red-500 text-white"
                      >
                        Keep Existing
                      </button>
                    )}
                  </div>
                </div>

                {replaceOgImage ? (
                  useOgImageUrl ? (
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <input
                              type="url"
                              value={ogImageUrl}
                              onChange={handleOgImageUrlChange}
                              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="Enter direct URL to OG image"
                            />
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Recommended size: 1200x630 pixels. PNG, JPG, or WEBP format.
                        </p>
                      </div>

                      {ogImagePreview && (
                        <div className="relative">
                          <img
                            src={ogImagePreview || "/placeholder.svg"}
                            alt="OG image preview"
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOgImageUrl("")
                              setOgImagePreview(null)
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <label
                          className={`block w-full px-4 py-2 border border-dashed ${isBucketMissing("seo-images") ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"} rounded-lg ${isBucketMissing("seo-images") ? "cursor-not-allowed" : "cursor-pointer hover:border-green-500 dark:hover:border-green-500"} transition-colors`}
                        >
                          <div className="flex items-center justify-center">
                            <Upload
                              className={`w-5 h-5 mr-2 ${isBucketMissing("seo-images") ? "text-red-400" : "text-gray-400"}`}
                            />
                            <span
                              className={
                                isBucketMissing("seo-images")
                                  ? "text-red-500 dark:text-red-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }
                            >
                              {isBucketMissing("seo-images")
                                ? "Upload unavailable - bucket missing"
                                : "Click to upload OG image"}
                            </span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleOgImageChange}
                            disabled={isBucketMissing("seo-images")}
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {isBucketMissing("seo-images")
                            ? "Please use direct URL option instead."
                            : "Recommended size: 1200x630 pixels. PNG, JPG, or WEBP format."}
                        </p>
                      </div>

                      {ogImagePreview && (
                        <div className="relative">
                          <img
                            src={ogImagePreview || "/placeholder.svg"}
                            alt="OG image preview"
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOgImage(null)
                              setOgImagePreview(null)
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {existingOgImagePath
                          ? "Using existing OG image. Click 'Upload Image' or 'Use URL' to replace it."
                          : "No OG image set. Click 'Upload Image' or 'Use URL' to add one."}
                      </div>
                    </div>
                    {ogImagePreview && (
                      <div className="relative">
                        <img
                          src={ogImagePreview || "/placeholder.svg"}
                          alt="OG image preview"
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Twitter Card Settings */}
          {activeTab === "twitter" && (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="twitter_card"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Twitter Card Type
                </label>
                <select
                  id="twitter_card"
                  name="twitter_card"
                  value={formData.twitter_card}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="twitter_title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Twitter Title
                </label>
                <input
                  type="text"
                  id="twitter_title"
                  name="twitter_title"
                  value={formData.twitter_title}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Title for Twitter shares"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  If left empty, the OG title or app title will be used.
                </p>
              </div>

              <div>
                <label
                  htmlFor="twitter_description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Twitter Description
                </label>
                <textarea
                  id="twitter_description"
                  name="twitter_description"
                  value={formData.twitter_description}
                  onChange={handleChange}
                  rows={2}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Description for Twitter shares"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Keep it concise. Twitter has a character limit.
                </p>
              </div>

              {/* Twitter Image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Twitter Image</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUseTwitterImageUrl(false)
                        setReplaceTwitterImage(true)
                      }}
                      disabled={isBucketMissing("seo-images")}
                      className={`px-3 py-1 text-xs rounded-full ${
                        !useTwitterImageUrl && replaceTwitterImage
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${isBucketMissing("seo-images") ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUseTwitterImageUrl(true)
                        setReplaceTwitterImage(true)
                      }}
                      className={`px-3 py-1 text-xs rounded-full ${
                        useTwitterImageUrl && replaceTwitterImage
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Use URL
                    </button>
                    {replaceTwitterImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceTwitterImage(false)
                          setTwitterImage(null)
                          setTwitterImageUrl("")
                          setTwitterImagePreview(
                            existingTwitterImagePath ? getPublicUrl(existingTwitterImagePath, "seo-images") : null,
                          )
                        }}
                        className="px-3 py-1 text-xs rounded-full bg-red-500 text-white"
                      >
                        Keep Existing
                      </button>
                    )}
                  </div>
                </div>

                {replaceTwitterImage ? (
                  useTwitterImageUrl ? (
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <input
                              type="url"
                              value={twitterImageUrl}
                              onChange={handleTwitterImageUrlChange}
                              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="Enter direct URL to Twitter image"
                            />
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Recommended size: 1200x600 pixels. PNG, JPG, or WEBP format.
                        </p>
                      </div>

                      {twitterImagePreview && (
                        <div className="relative">
                          <img
                            src={twitterImagePreview || "/placeholder.svg"}
                            alt="Twitter image preview"
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setTwitterImageUrl("")
                              setTwitterImagePreview(null)
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <label
                          className={`block w-full px-4 py-2 border border-dashed ${isBucketMissing("seo-images") ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"} rounded-lg ${isBucketMissing("seo-images") ? "cursor-not-allowed" : "cursor-pointer hover:border-green-500 dark:hover:border-green-500"} transition-colors`}
                        >
                          <div className="flex items-center justify-center">
                            <Upload
                              className={`w-5 h-5 mr-2 ${isBucketMissing("seo-images") ? "text-red-400" : "text-gray-400"}`}
                            />
                            <span
                              className={
                                isBucketMissing("seo-images")
                                  ? "text-red-500 dark:text-red-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }
                            >
                              {isBucketMissing("seo-images")
                                ? "Upload unavailable - bucket missing"
                                : "Click to upload Twitter image"}
                            </span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleTwitterImageChange}
                            disabled={isBucketMissing("seo-images")}
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {isBucketMissing("seo-images")
                            ? "Please use direct URL option instead."
                            : "Recommended size: 1200x600 pixels. PNG, JPG, or WEBP format."}
                        </p>
                      </div>

                      {twitterImagePreview && (
                        <div className="relative">
                          <img
                            src={twitterImagePreview || "/placeholder.svg"}
                            alt="Twitter image preview"
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setTwitterImage(null)
                              setTwitterImagePreview(null)
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {existingTwitterImagePath
                          ? "Using existing Twitter image. Click 'Upload Image' or 'Use URL' to replace it."
                          : "No Twitter image set. Click 'Upload Image' or 'Use URL' to add one."}
                      </div>
                    </div>
                    {twitterImagePreview && (
                      <div className="relative">
                        <img
                          src={twitterImagePreview || "/placeholder.svg"}
                          alt="Twitter image preview"
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Media */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Media</h2>

          {/* App Icon Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">App Icon*</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseIconUrl(false)
                    setReplaceIcon(true)
                  }}
                  disabled={isBucketMissing("app-icons")}
                  className={`px-3 py-1 text-xs rounded-full ${
                    !useIconUrl && replaceIcon
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  } ${isBucketMissing("app-icons") ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Replace Icon
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseIconUrl(true)
                    setReplaceIcon(true)
                  }}
                  className={`px-3 py-1 text-xs rounded-full ${
                    useIconUrl && replaceIcon
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Use URL
                </button>
                {replaceIcon && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceIcon(false)
                      setAppIcon(null)
                      setAppIconUrl("")
                      setAppIconPreview(existingIconPath ? getPublicUrl(existingIconPath, "app-icons") : null)
                    }}
                    className="px-3 py-1 text-xs rounded-full bg-red-500 text-white"
                  >
                    Keep Existing
                  </button>
                )}
              </div>
            </div>

            {replaceIcon ? (
              useIconUrl ? (
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <input
                          type="url"
                          value={appIconUrl}
                          onChange={handleIconUrlChange}
                          className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                          placeholder="Enter direct URL to icon image"
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter a direct URL to an image (PNG, JPG, WEBP)
                    </p>
                  </div>

                  {appIconPreview && (
                    <div className="relative">
                      <img
                        src={appIconPreview || "/placeholder.svg"}
                        alt="App icon preview"
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAppIconUrl("")
                          setAppIconPreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label
                      className={`block w-full px-4 py-2 border border-dashed ${isBucketMissing("app-icons") ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"} rounded-lg ${isBucketMissing("app-icons") ? "cursor-not-allowed" : "cursor-pointer hover:border-green-500 dark:hover:border-green-500"} transition-colors`}
                    >
                      <div className="flex items-center justify-center">
                        <Upload
                          className={`w-5 h-5 mr-2 ${isBucketMissing("app-icons") ? "text-red-400" : "text-gray-400"}`}
                        />
                        <span
                          className={
                            isBucketMissing("app-icons")
                              ? "text-red-500 dark:text-red-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {isBucketMissing("app-icons")
                            ? "Upload unavailable - bucket missing"
                            : "Click to upload new icon"}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleIconChange}
                        disabled={isBucketMissing("app-icons")}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {isBucketMissing("app-icons")
                        ? "Please use direct URL option instead."
                        : "Recommended size: 512x512px. PNG or JPG format."}
                    </p>
                  </div>

                  {appIconPreview && (
                    <div className="relative">
                      <img
                        src={appIconPreview || "/placeholder.svg"}
                        alt="App icon preview"
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAppIcon(null)
                          setAppIconPreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Using existing icon. Click "Replace Icon" to upload a new one.
                  </div>
                </div>
                {appIconPreview && (
                  <div className="relative">
                    <img
                      src={appIconPreview || "/placeholder.svg"}
                      alt="App icon preview"
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icon Background Color */}
          <div className="mb-4">
            <label htmlFor="icon_bg_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="icon_bg_color"
                name="icon_bg_color"
                value={formData.icon_bg_color}
                onChange={handleChange}
                className="h-10 w-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={formData.icon_bg_color}
                onChange={handleChange}
                name="icon_bg_color"
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="#3E3E3E"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose a background color that complements the app icon
            </p>
          </div>

          {/* Favicon Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Favicon
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseFaviconUrl(false)
                    setReplaceFavicon(true)
                  }}
                  disabled={isBucketMissing("app-icons")}
                  className={`px-3 py-1 text-xs rounded-full ${
                    !useFaviconUrl && replaceFavicon
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  } ${isBucketMissing("app-icons") ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Upload Favicon
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseFaviconUrl(true)
                    setReplaceFavicon(true)
                  }}
                  className={`px-3 py-1 text-xs rounded-full ${
                    useFaviconUrl && replaceFavicon
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Use URL
                </button>
                {replaceFavicon && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceFavicon(false)
                      setFavicon(null)
                      setFaviconUrl("")
                      setFaviconPreview(existingFaviconPath ? getPublicUrl(existingFaviconPath, "app-icons") : null)
                    }}
                    className="px-3 py-1 text-xs rounded-full bg-red-500 text-white"
                  >
                    Keep Existing
                  </button>
                )}
              </div>
            </div>

            {replaceFavicon ? (
              useFaviconUrl ? (
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <input
                          type="url"
                          value={faviconUrl}
                          onChange={handleFaviconUrlChange}
                          className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                          placeholder="Enter direct URL to favicon image"
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter a direct URL to a favicon image (PNG, ICO). Recommended sizes: 16x16, 32x32, 64x64
                    </p>
                  </div>

                  {faviconPreview && (
                    <div className="relative">
                      <img
                        src={faviconPreview || "/placeholder.svg"}
                        alt="Favicon preview"
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFaviconUrl("")
                          setFaviconPreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label
                      className={`block w-full px-4 py-2 border border-dashed ${isBucketMissing("app-icons") ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"} rounded-lg ${isBucketMissing("app-icons") ? "cursor-not-allowed" : "cursor-pointer hover:border-green-500 dark:hover:border-green-500"} transition-colors`}
                    >
                      <div className="flex items-center justify-center">
                        <Upload
                          className={`w-5 h-5 mr-2 ${isBucketMissing("app-icons") ? "text-red-400" : "text-gray-400"}`}
                        />
                        <span
                          className={
                            isBucketMissing("app-icons")
                              ? "text-red-500 dark:text-red-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {isBucketMissing("app-icons")
                            ? "Upload unavailable - bucket missing"
                            : "Click to upload favicon"}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                        onChange={handleFaviconChange}
                        disabled={isBucketMissing("app-icons")}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {isBucketMissing("app-icons")
                        ? "Please use direct URL option instead."
                        : "Recommended sizes: 16x16, 32x32, 64x64. PNG or ICO format."}
                    </p>
                  </div>

                  {faviconPreview && (
                    <div className="relative">
                      <img
                        src={faviconPreview || "/placeholder.svg"}
                        alt="Favicon preview"
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFavicon(null)
                          setFaviconPreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {existingFaviconPath
                      ? "Using existing favicon. Click 'Upload Favicon' or 'Use URL' to replace it."
                      : "No custom favicon set. The default site favicon will be used. Click 'Upload Favicon' or 'Use URL' to add one."}
                  </div>
                </div>
                {faviconPreview && (
                  <div className="relative">
                    <img
                      src={faviconPreview || "/placeholder.svg"}
                      alt="Favicon preview"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  </div>
                )}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              A custom favicon will be used when users visit this app's subdomain. If not provided, the default site
              favicon will be used.
            </p>
          </div>

          {/* Screenshots Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">App Screenshots</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseScreenshotUrls(false)}
                  disabled={isBucketMissing("app-screenshots")}
                  className={`px-3 py-1 text-xs rounded-full ${
                    !useScreenshotUrls
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  } ${isBucketMissing("app-screenshots") ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  onClick={() => setUseScreenshotUrls(true)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    useScreenshotUrls
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Use URLs
                </button>
              </div>
            </div>

            {/* Existing Screenshots */}
            {existingScreenshots.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Existing Screenshots</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                  {existingScreenshots.map(
                    (screenshot, index) =>
                      !screenshot.toDelete && (
                        <div key={screenshot.id} className="relative">
                          <img
                            src={getPublicUrl(screenshot.url, "app-screenshots") || "/placeholder.svg"}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-28 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index, true)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {/* New Screenshots */}
            {useScreenshotUrls ? (
              <div className="space-y-3">
                {screenshotUrls.map((url, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleScreenshotUrlChange(e, index)}
                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder="Enter direct URL to screenshot image"
                      />
                    </div>

                    {url && (
                      <div className="relative w-16 h-28">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeScreenshot(index + existingScreenshots.length)}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addScreenshotUrl}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Screenshot URL
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
                  {appScreenshots.map((_, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={
                          screenshotPreviews[index + existingScreenshots.filter((s) => !s.toDelete).length] ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={`New Screenshot ${index + 1}`}
                        className="w-full h-28 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index + existingScreenshots.length)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <label
                    className={`w-full h-28 flex flex-col items-center justify-center border-2 border-dashed ${isBucketMissing("app-screenshots") ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"} rounded-lg ${isBucketMissing("app-screenshots") ? "cursor-not-allowed" : "cursor-pointer hover:border-green-500 dark:hover:border-green-500"} transition-colors`}
                  >
                    <Upload
                      className={`w-6 h-6 ${isBucketMissing("app-screenshots") ? "text-red-400" : "text-gray-400"}`}
                    />
                    <span
                      className={`mt-2 text-xs ${isBucketMissing("app-screenshots") ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {isBucketMissing("app-screenshots") ? "Unavailable" : "Add"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotsChange}
                      disabled={isBucketMissing("app-screenshots")}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isBucketMissing("app-screenshots")
                    ? "Screenshot upload is unavailable. Please use direct URLs instead."
                    : "Upload additional screenshots. Recommended size: 1080x1920px."}
                </p>
              </div>
            )}
          </div>

          {/* APK File Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">APK File*</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseApkUrl(false)
                    setReplaceApk(true)
                  }}
                  disabled={isBucketMissing("apk-files")}
                  className={`px-3 py-1 text-xs rounded-full ${
                    !useApkUrl && replaceApk
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  } ${isBucketMissing("apk-files") ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Replace File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseApkUrl(true)
                    setReplaceApk(true)
                  }}
                  className={`px-3 py-1 text-xs rounded-full ${
                    useApkUrl && replaceApk
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Use URL
                </button>
                {replaceApk && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceApk(false)
                      setApkFile(null)
                      setApkFileUrl("")
                    }}
                    className="px-3 py-1 text-xs rounded-full bg-red-500 text-white"
                  >
                    Keep Existing
                  </button>
                )}
              </div>
            </div>

            {replaceApk ? (
              useApkUrl ? (
                <div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={apkFileUrl}
                        onChange={handleApkUrlChange}
                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder="Enter direct download URL for APK file"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter a direct download URL for the APK file
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed ${isBucketMissing("apk-files") ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600"} rounded-lg ${isBucketMissing("apk-files") ? "cursor-not-allowed" : "cursor-pointer hover:border-green-500 dark:hover:border-green-500"} transition-colors`}
                  >
                    <div className="space-y-1 text-center">
                      <Upload
                        className={`mx-auto h-12 w-12 ${isBucketMissing("apk-files") ? "text-red-400" : "text-gray-400"}`}
                      />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          className={`relative ${isBucketMissing("apk-files") ? "cursor-not-allowed" : "cursor-pointer"} bg-white dark:bg-gray-800 rounded-md font-medium ${isBucketMissing("apk-files") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"} focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500`}
                        >
                          <span>{isBucketMissing("apk-files") ? "Upload unavailable" : "Upload new APK file"}</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".apk"
                            onChange={handleApkChange}
                            disabled={isBucketMissing("apk-files")}
                          />
                        </label>
                        {!isBucketMissing("apk-files") && <p className="pl-1">or drag and drop</p>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isBucketMissing("apk-files")
                          ? "APK upload is unavailable. Please use direct URL instead."
                          : "APK file only. Max size: 2GB"}
                      </p>
                      {apkFile && (
                        <p className="text-sm text-green-500 font-medium">
                          {apkFile.name} ({(apkFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              )
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Using existing APK file. Click "Replace File" to upload a new one.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/apps"
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
