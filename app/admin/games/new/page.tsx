"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, X, Upload, Plus, Trash2, Info } from "lucide-react"
import { supabase, fetchCategories, createSlug, type Category } from "@/lib/supabase"
import { uploadFile } from "@/app/actions/storage-actions"

export default function AddNewGame() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "og" | "twitter">("basic")

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
    icon_bg_color: "#3E3E3E", // Add this line with a default color
  })

  const [modFeatures, setModFeatures] = useState([""])

  // Media states
  const [gameIcon, setGameIcon] = useState<File | null>(null)
  const [gameIconUrl, setGameIconUrl] = useState<string>("")
  const [gameIconPreview, setGameIconPreview] = useState<string | null>(null)
  const [useIconUrl, setUseIconUrl] = useState<boolean>(false)

  const [gameScreenshots, setGameScreenshots] = useState<File[]>([])
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([])
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const [useScreenshotUrls, setUseScreenshotUrls] = useState<boolean>(false)

  const [apkFile, setApkFile] = useState<File | null>(null)
  const [apkFileUrl, setApkFileUrl] = useState<string>("")
  const [useApkUrl, setUseApkUrl] = useState<boolean>(false)

  // SEO Image states
  const [ogImage, setOgImage] = useState<File | null>(null)
  const [ogImageUrl, setOgImageUrl] = useState<string>("")
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null)
  const [useOgImageUrl, setUseOgImageUrl] = useState<boolean>(true)

  const [twitterImage, setTwitterImage] = useState<File | null>(null)
  const [twitterImageUrl, setTwitterImageUrl] = useState<string>("")
  const [twitterImagePreview, setTwitterImagePreview] = useState<string | null>(null)
  const [useTwitterImageUrl, setUseTwitterImageUrl] = useState<boolean>(true)

  // Favicon state
  const [favicon, setFavicon] = useState<File | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string>("")
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [useFaviconUrl, setUseFaviconUrl] = useState<boolean>(false)

  // Fetch categories on component mount
  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      try {
        const categoriesData = await fetchCategories("game")
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    getCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-fill meta fields if they're empty
    if (name === "title") {
      if (!formData.meta_title) {
        setFormData((prev) => ({ ...prev, meta_title: value }))
      }
      if (!formData.meta_description) {
        setFormData((prev) => ({
          ...prev,
          meta_description: `Download ${value} MOD APK for Android - Free, Premium features unlocked`,
        }))
      }
      if (!formData.og_title) {
        setFormData((prev) => ({ ...prev, og_title: `${value} MOD APK - Download Now` }))
      }
      if (!formData.twitter_title) {
        setFormData((prev) => ({ ...prev, twitter_title: `${value} MOD APK - Download Now` }))
      }
    }

    if (name === "meta_description") {
      if (!formData.og_description) {
        setFormData((prev) => ({ ...prev, og_description: value }))
      }
      if (!formData.twitter_description) {
        setFormData((prev) => ({ ...prev, twitter_description: value }))
      }
    }
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
      setGameIcon(file)
      setGameIconPreview(URL.createObjectURL(file))
    }
  }

  const handleIconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setGameIconUrl(url)
    setGameIconPreview(url)
  }

  // Screenshot handlers
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setGameScreenshots((prev) => [...prev, ...files])

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

  const removeScreenshot = (index: number) => {
    if (useScreenshotUrls) {
      const newUrls = [...screenshotUrls]
      newUrls.splice(index, 1)
      setScreenshotUrls(newUrls)

      const newPreviews = [...screenshotPreviews]
      newPreviews.splice(index, 1)
      setScreenshotPreviews(newPreviews)
    } else {
      const newScreenshots = [...gameScreenshots]
      newScreenshots.splice(index, 1)
      setGameScreenshots(newScreenshots)

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
    }
  }

  const handleApkUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApkFileUrl(e.target.value)
  }

  // OG Image handlers
  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setOgImage(file)
      setOgImagePreview(URL.createObjectURL(file))
    }
  }

  const handleOgImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setOgImageUrl(url)
    setOgImagePreview(url)
  }

  // Twitter Image handlers
  const handleTwitterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setTwitterImage(file)
      setTwitterImagePreview(URL.createObjectURL(file))
    }
  }

  const handleTwitterImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setTwitterImageUrl(url)
    setTwitterImagePreview(url)
  }

  // Favicon handlers
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFavicon(file)
      setFaviconPreview(URL.createObjectURL(file))
    }
  }

  const handleFaviconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFaviconUrl(url)
    setFaviconPreview(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.version || !formData.category_id) {
      alert("Please fill in all required fields")
      return
    }

    setSubmitting(true)

    try {
      // Generate slug
      const slug = await createSlug(formData.title, "games")

      // Handle game icon (file or URL)
      let iconUrl = null
      if (useIconUrl) {
        iconUrl = gameIconUrl
      } else if (gameIcon) {
        const result = await uploadFile(gameIcon, "app-icons", slug)
        if (!result.success) throw new Error("Failed to upload game icon")
        iconUrl = result.path // Store the path, not the full URL
      }

      // Handle APK file (file or URL)
      let downloadUrl = null
      if (useApkUrl) {
        downloadUrl = apkFileUrl
      } else if (apkFile) {
        const result = await uploadFile(apkFile, "apk-files", slug)
        if (!result.success) throw new Error("Failed to upload APK file")
        downloadUrl = result.path // Store the path, not the full URL
      }

      if (!downloadUrl) {
        throw new Error("Please provide an APK file or URL")
      }

      // Handle OG Image (file or URL)
      let ogImagePath = null
      if (useOgImageUrl) {
        ogImagePath = ogImageUrl
      } else if (ogImage) {
        const result = await uploadFile(ogImage, "seo-images", `og-${slug}`)
        if (!result.success) throw new Error("Failed to upload OG image")
        ogImagePath = result.path
      }

      // Handle Twitter Image (file or URL)
      let twitterImagePath = null
      if (useTwitterImageUrl) {
        twitterImagePath = twitterImageUrl
      } else if (twitterImage) {
        const result = await uploadFile(twitterImage, "seo-images", `twitter-${slug}`)
        if (!result.success) throw new Error("Failed to upload Twitter image")
        twitterImagePath = result.path
      }

      // Handle Favicon (file or URL)
      let faviconPath = null
      if (useFaviconUrl) {
        faviconPath = faviconUrl
      } else if (favicon) {
        const result = await uploadFile(favicon, "app-icons", `favicon-${slug}`)
        if (!result.success) throw new Error("Failed to upload favicon")
        faviconPath = result.path
      }

      // Insert game data
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .insert([
          {
            ...formData,
            slug,
            icon_url: iconUrl,
            download_url: downloadUrl,
            download_count: 0,
            og_image: ogImagePath,
            twitter_image: twitterImagePath,
            favicon_url: faviconPath,
            icon_bg_color: formData.icon_bg_color,
          },
        ])
        .select()

      if (gameError) throw gameError

      const gameId = gameData[0].id

      // Insert mod features
      if (modFeatures.length > 0 && modFeatures[0] !== "") {
        const featurePromises = modFeatures.map((feature) =>
          supabase.from("mod_features").insert([
            {
              content_id: gameId,
              content_type: "game",
              feature,
            },
          ]),
        )

        await Promise.all(featurePromises)
      }

      // Upload screenshots or use URLs
      if (useScreenshotUrls && screenshotUrls.length > 0) {
        const screenshotPromises = screenshotUrls
          .filter((url) => url.trim() !== "")
          .map((url) =>
            supabase.from("screenshots").insert([
              {
                content_id: gameId,
                content_type: "game",
                url,
              },
            ]),
          )

        await Promise.all(screenshotPromises)
      } else if (gameScreenshots.length > 0) {
        const screenshotPromises = gameScreenshots.map(async (file, index) => {
          const result = await uploadFile(file, "app-screenshots", `${slug}-${index}`)

          if (result.success) {
            return supabase.from("screenshots").insert([
              {
                content_id: gameId,
                content_type: "game",
                url: result.path, // Store the path, not the full URL
              },
            ])
          }
        })

        await Promise.all(screenshotPromises)
      }

      alert("Game added successfully!")
      router.push("/admin/games")
    } catch (error: any) {
      console.error("Error adding game:", error)
      alert("Failed to add game: " + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/games"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Game</h1>
            <p className="text-gray-500 dark:text-gray-400">Create a new game entry</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/games"
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
            {submitting ? "Saving..." : "Save Game"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Game Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. PUBG Mobile"
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
                placeholder="e.g. 2.7.0"
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
                placeholder="e.g. Tencent Games (Modded by InstallMOD)"
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
                placeholder="e.g. Android 6.0+"
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
                placeholder="e.g. 2.1 GB"
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
                placeholder="e.g. Unlimited UC, Aimbot, Anti-Ban"
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
                placeholder="e.g. https://play.google.com/store/apps/details?id=com.tencent.ig"
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Game Description</h2>

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
              placeholder="Enter detailed game description with HTML formatting..."
            ></textarea>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              You can use HTML tags for formatting. Use h2 tags for sections like Introduction, Game Features, etc.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">SEO Information</h2>

          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              <li className="mr-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className={`inline-block p-4 rounded-t-lg ${
                    activeTab === "basic"
                      ? "text-green-600 border-b-2 border-green-600 dark:text-green-500 dark:border-green-500"
                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                >
                  Basic Meta Tags
                </button>
              </li>
              <li className="mr-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("og")}
                  className={`inline-block p-4 rounded-t-lg ${
                    activeTab === "og"
                      ? "text-green-600 border-b-2 border-green-600 dark:text-green-500 dark:border-green-500"
                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                >
                  Open Graph
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab("twitter")}
                  className={`inline-block p-4 rounded-t-lg ${
                    activeTab === "twitter"
                      ? "text-green-600 border-b-2 border-green-600 dark:text-green-500 dark:border-green-500"
                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                >
                  Twitter Card
                </button>
              </li>
            </ul>
          </div>

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
              </div>
            </div>
          )}

          {activeTab === "og" && (
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <Info className="w-5 h-5 text-blue-500" />
                <p>
                  Open Graph tags help control how your content appears when shared on social media platforms like
                  Facebook, LinkedIn, etc.
                </p>
              </div>

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
                  placeholder="Title for social media sharing"
                />
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
                  placeholder="Description for social media sharing"
                ></textarea>
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
                  placeholder="Canonical URL for this content"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave blank to use the automatically generated URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OG Image</label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setUseOgImageUrl(false)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      !useOgImageUrl
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseOgImageUrl(true)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      useOgImageUrl
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Use URL
                  </button>
                </div>

                {useOgImageUrl ? (
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={ogImageUrl}
                        onChange={handleOgImageUrlChange}
                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder="Enter direct URL to image"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recommended size: 1200x630 pixels</p>
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
                      <label className="block w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors">
                        <div className="flex items-center justify-center">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-gray-500 dark:text-gray-400">Click to upload image</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleOgImageChange} />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Recommended size: 1200x630 pixels. PNG or JPG format.
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
                )}
              </div>
            </div>
          )}

          {activeTab === "twitter" && (
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <Info className="w-5 h-5 text-blue-500" />
                <p>Twitter Card tags control how your content appears when shared on Twitter.</p>
              </div>

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
                  placeholder="Title for Twitter sharing"
                />
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
                  placeholder="Description for Twitter sharing"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter Image</label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setUseTwitterImageUrl(false)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      !useTwitterImageUrl
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseTwitterImageUrl(true)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      useTwitterImageUrl
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Use URL
                  </button>
                </div>

                {useTwitterImageUrl ? (
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={twitterImageUrl}
                        onChange={handleTwitterImageUrlChange}
                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder="Enter direct URL to image"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recommended size: 1200x600 pixels</p>
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
                      <label className="block w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors">
                        <div className="flex items-center justify-center">
                          <Upload className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-gray-500 dark:text-gray-400">Click to upload image</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleTwitterImageChange} />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Recommended size: 1200x600 pixels. PNG or JPG format.
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
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Media</h2>

          {/* Game Icon Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Game Icon*</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseIconUrl(false)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    !useIconUrl
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUseIconUrl(true)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    useIconUrl
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Use URL
                </button>
              </div>
            </div>

            {useIconUrl ? (
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={gameIconUrl}
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

                {gameIconPreview && (
                  <div className="relative">
                    <img
                      src={gameIconPreview || "/placeholder.svg"}
                      alt="Game icon preview"
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGameIconUrl("")
                        setGameIconPreview(null)
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
                  <label className="block w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors">
                    <div className="flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-500 dark:text-gray-400">Click to upload icon</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleIconChange} />
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recommended size: 512x512px. PNG or JPG format.
                  </p>
                </div>

                {gameIconPreview && (
                  <div className="relative">
                    <img
                      src={gameIconPreview || "/placeholder.svg"}
                      alt="Game icon preview"
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGameIcon(null)
                        setGameIconPreview(null)
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
              Choose a background color that complements the game icon
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
                  onClick={() => setUseFaviconUrl(false)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    !useFaviconUrl
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUseFaviconUrl(true)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    useFaviconUrl
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Use URL
                </button>
              </div>
            </div>

            {useFaviconUrl ? (
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
                  <label className="block w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors">
                    <div className="flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-500 dark:text-gray-400">Click to upload favicon</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                      onChange={handleFaviconChange}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recommended sizes: 16x16, 32x32, 64x64. PNG or ICO format.
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
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              A custom favicon will be used when users visit this game's subdomain. If not provided, the default site
              favicon will be used.
            </p>
          </div>

          {/* Screenshots Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Game Screenshots</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseScreenshotUrls(false)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    !useScreenshotUrls
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
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
                      onClick={() => removeScreenshot(index)}
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
                  {gameScreenshots.map((_, index) => (
                    <div key={index} className="relative">
                      <img
                        src={screenshotPreviews[index] || "/placeholder.svg"}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-28 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {gameScreenshots.length < 5 && (
                    <label className="w-full h-28 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Add</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleScreenshotsChange}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload up to 5 screenshots. Recommended size: 1080x1920px.
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
                  onClick={() => setUseApkUrl(false)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    !useApkUrl
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUseApkUrl(true)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    useApkUrl
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Use URL
                </button>
              </div>
            </div>

            {useApkUrl ? (
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
                <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                        <span>Upload APK file</span>
                        <input type="file" className="sr-only" accept=".apk" onChange={handleApkChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">APK file only. Max size: 2GB</p>
                    {apkFile && (
                      <p className="text-sm text-green-500 font-medium">
                        {apkFile.name} ({(apkFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/games"
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
            {submitting ? "Saving..." : "Save Game"}
          </button>
        </div>
      </form>
    </div>
  )
}
