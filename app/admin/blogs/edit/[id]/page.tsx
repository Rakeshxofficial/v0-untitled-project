"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase, uploadFileOrUseUrl, type Category, type Blog } from "@/lib/supabase"
import RichTextEditor from "@/app/admin/components/rich-text-editor"
import { ArrowLeft, Calendar, Clock, ImageIcon, User, X } from "lucide-react"
// Update the imports to include TagManager
import TagManager from "@/app/admin/components/tag-manager"
// Import the createBlogSlug function from the correct location
import { createBlogSlug } from "@/lib/utils"

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  const [publishDate, setPublishDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [publishTime, setPublishTime] = useState<string>(
    new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
  )
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: "",
    excerpt: "",
    content: "",
    category_id: "",
    status: "draft",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_title: "",
    twitter_description: "",
    twitter_card: "summary_large_image",
    twitter_image: "",
    publisher: "",
    read_time: 5,
  })
  const [versions, setVersions] = useState<any[]>([])
  const [currentVersion, setCurrentVersion] = useState<number>(0)
  const [originalTitle, setOriginalTitle] = useState<string>("")

  // Add state for publishers
  const [publishers, setPublishers] = useState<any[]>([])

  useEffect(() => {
    async function fetchBlogAndCategories() {
      setLoading(true)
      try {
        // Fetch blog post
        const { data: blog, error: blogError } = await supabase.from("blogs").select("*").eq("id", params.id).single()

        if (blogError) throw blogError

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "blog")
          .order("name")

        if (categoriesError) throw categoriesError

        // Fetch publishers
        const { data: publishersData, error: publishersError } = await supabase
          .from("publishers")
          .select("*")
          .order("name")

        if (publishersError) throw publishersError

        // Fetch versions
        const { data: versionsData, error: versionsError } = await supabase
          .from("blog_versions")
          .select("*")
          .eq("blog_id", params.id)
          .order("version_number", { ascending: false })

        if (versionsError) throw versionsError

        // Fetch blog tags
        const { data: blogTags, error: blogTagsError } = await supabase
          .from("blog_tags")
          .select("tag_id")
          .eq("blog_id", params.id)

        if (!blogTagsError && blogTags) {
          const tagIds = blogTags.map((tag) => tag.tag_id)
          setFormData((prev) => ({ ...prev, tags: tagIds }))
        }

        // Set data
        setCategories(categoriesData || [])
        setPublishers(publishersData || [])
        setVersions(versionsData || [])
        setCurrentVersion(versionsData && versionsData.length > 0 ? versionsData[0].version_number : 0)

        if (blog) {
          setFormData(blog)
          setFeaturedImagePreview(blog.featured_image || null)
          setOriginalTitle(blog.title)

          // Set scheduled date and time if available
          if (blog.scheduled_at) {
            const scheduledDate = new Date(blog.scheduled_at)
            setPublishDate(scheduledDate.toISOString().split("T")[0])
            setPublishTime(
              scheduledDate.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
            )
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        alert("Failed to load blog post. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogAndCategories()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
  }

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFeaturedImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setFeaturedImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFeaturedImage = () => {
    setFeaturedImage(null)
    setFeaturedImagePreview(null)
    setFormData((prev) => ({ ...prev, featured_image: null }))
  }

  const handleImageUrlSubmit = () => {
    const imageUrl = (document.getElementById("imageUrl") as HTMLInputElement).value
    if (imageUrl && imageUrl.trim() !== "") {
      // Validate URL
      try {
        new URL(imageUrl)
        setFeaturedImagePreview(imageUrl)
        setFormData((prev) => ({ ...prev, featured_image: imageUrl }))
      } catch (e) {
        alert("Please enter a valid URL")
      }
    } else {
      alert("Please enter an image URL")
    }
  }

  // Add a handler for tag changes
  const handleTagsChange = (tagIds: string[]) => {
    setFormData((prev) => ({ ...prev, tags: tagIds }))
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Upload featured image if exists
      let featuredImageUrl = formData.featured_image
      if (featuredImage) {
        featuredImageUrl = await uploadFileOrUseUrl(featuredImage, "blog-images", "featured")
      }

      // Determine if this is a scheduled post
      const isScheduled = formData.status === "scheduled"
      let scheduledAt = null

      if (isScheduled) {
        // Combine date and time for scheduled publishing
        scheduledAt = new Date(`${publishDate}T${publishTime}`).toISOString()
      }

      // In the handleSubmit function, check if the title has changed and update the slug if needed
      if (formData.title !== originalTitle) {
        // Title has changed, generate a new slug
        const baseSlug = createBlogSlug(formData.title || "")

        // Check if the slug already exists on a different post
        const { data: existingBlog } = await supabase
          .from("blogs")
          .select("id")
          .eq("slug", baseSlug)
          .neq("id", params.id) // Not this post
          .single()

        // If slug exists on another post, add a unique identifier
        const newSlug = existingBlog ? createBlogSlug(formData.title || "", crypto.randomUUID().slice(0, 8)) : baseSlug

        // Update the formData with the new slug
        formData.slug = newSlug
      }

      // Update blog post
      const { data, error } = await supabase
        .from("blogs")
        .update({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category_id: formData.category_id,
          featured_image: featuredImageUrl,
          status: saveAsDraft ? "draft" : formData.status,
          scheduled_at: scheduledAt,
          meta_title: formData.meta_title || formData.title,
          meta_description: formData.meta_description || formData.excerpt,
          meta_keywords: formData.meta_keywords,
          og_title: formData.og_title || formData.title,
          og_description: formData.og_description || formData.excerpt,
          og_image: formData.og_image || featuredImageUrl,
          twitter_title: formData.twitter_title || formData.title,
          twitter_description: formData.twitter_description || formData.excerpt,
          twitter_card: formData.twitter_card,
          twitter_image: formData.twitter_image || featuredImageUrl,
          updated_at: new Date().toISOString(),
          slug: formData.slug,
          publisher: formData.publisher,
          read_time: formData.read_time || 5,
        })
        .eq("id", params.id)

      if (error) {
        throw error
      }

      // Create new version for version control
      const latestVersion = versions.length > 0 ? versions[0].version_number : 0
      await supabase.from("blog_versions").insert([
        {
          blog_id: params.id,
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          version_number: latestVersion + 1,
          created_by: "system", // Replace with actual user ID when auth is implemented
        },
      ])

      // In the handleSubmit function, after updating the blog post:
      // Update blog tags
      if (formData.tags) {
        // First delete existing associations
        await supabase.from("blog_tags").delete().eq("blog_id", params.id)

        // Then insert new ones
        if (formData.tags.length > 0) {
          const tagAssociations = formData.tags.map((tagId) => ({
            blog_id: params.id,
            tag_id: tagId,
          }))

          await supabase.from("blog_tags").insert(tagAssociations)
        }
      }

      // Redirect to blog list
      router.push("/admin/blogs")
      router.refresh()
    } catch (error) {
      console.error("Error updating blog post:", error)
      alert("Failed to update blog post. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const restoreVersion = async (versionNumber: number) => {
    if (!confirm(`Are you sure you want to restore version ${versionNumber}?`)) {
      return
    }

    try {
      // Find the version to restore
      const versionToRestore = versions.find((v) => v.version_number === versionNumber)
      if (!versionToRestore) {
        throw new Error("Version not found")
      }

      // Update form data with version content
      setFormData((prev) => ({
        ...prev,
        title: versionToRestore.title,
        content: versionToRestore.content,
        excerpt: versionToRestore.excerpt,
      }))

      alert(`Version ${versionNumber} has been restored. Click Save to apply changes.`)
    } catch (error) {
      console.error("Error restoring version:", error)
      alert("Failed to restore version. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading blog post...</p>
        </div>
      </div>
    )
  }

  const handleImageUrlSubmitOld = () => {
    const imageUrl = (document.getElementById("imageUrl") as HTMLInputElement).value
    setFeaturedImage(null)
    setFeaturedImagePreview(imageUrl)
    setFormData((prev) => ({ ...prev, featured_image: imageUrl }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/blogs"
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Blog Post</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={saving}
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blog Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Enter blog title"
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Featured Image</label>

              {/* Image Preview */}
              {featuredImagePreview ? (
                <div className="relative">
                  <Image
                    src={featuredImagePreview || "/placeholder.svg"}
                    alt="Featured image preview"
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeFeaturedImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Upload Option */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Drag and drop an image, or click to select</p>
                    <label className="cursor-pointer">
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Select Image
                      </span>
                      <input type="file" accept="image/*" onChange={handleFeaturedImageChange} className="hidden" />
                    </label>
                  </div>

                  {/* Image URL Option */}
                  <div className="mt-4">
                    <div className="flex items-center">
                      <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
                      <span className="px-2 text-sm text-gray-500 dark:text-gray-400">OR</span>
                      <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="imageUrl"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Image URL
                      </label>
                      <div className="flex">
                        <input
                          type="url"
                          id="imageUrl"
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          type="button"
                          onClick={handleImageUrlSubmitOld}
                          className="px-4 py-2 bg-green-500 text-white rounded-r-lg hover:bg-green-600 transition-colors"
                        >
                          Use URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Recommended size: 1200x630px. Max size: 2MB
              </p>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
              <RichTextEditor
                value={formData.content || ""}
                onChange={handleContentChange}
                placeholder="Write your blog post content here..."
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Write a short excerpt for your blog post"
              ></textarea>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                A short summary of your post. Used in blog listings and social media shares.
              </p>
            </div>

            {/* SEO Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">SEO Settings</h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="meta_title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter meta title (defaults to post title)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="meta_description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description || ""}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter meta description (defaults to excerpt)"
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="meta_keywords"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    id="meta_keywords"
                    name="meta_keywords"
                    value={formData.meta_keywords || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter keywords separated by commas"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Publish Settings</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || "draft"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {formData.status === "scheduled" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="publishDate"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Publish Date
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="date"
                          id="publishDate"
                          value={publishDate}
                          onChange={(e) => setPublishDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="publishTime"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Publish Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="time"
                          id="publishTime"
                          value={publishTime}
                          onChange={(e) => setPublishTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Read Time field */}
                <div>
                  <label
                    htmlFor="read_time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Read Time (minutes)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      id="read_time"
                      name="read_time"
                      min="1"
                      max="60"
                      value={formData.read_time || 5}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Estimated time to read this article in minutes.
                  </p>
                </div>

                {/* Add Publisher field */}
                <div>
                  <label
                    htmlFor="publisher"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Publisher
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      id="publisher"
                      name="publisher"
                      value={formData.publisher || ""}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a publisher</option>
                      {publishers.map((publisher) => (
                        <option key={publisher.id} value={publisher.name}>
                          {publisher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-2">
                    <Link href="/admin/publishers" className="text-green-500 hover:text-green-600 text-sm font-medium">
                      + Manage Publishers
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Category</h3>

              <div>
                <label
                  htmlFor="category_id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Select Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {categories.length === 0 && <option value="">No categories available</option>}
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <div className="mt-4">
                  <Link
                    href="/admin/categories/blogs"
                    className="text-green-500 hover:text-green-600 text-sm font-medium"
                  >
                    + Add New Category
                  </Link>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tags</h3>
              <TagManager selectedTags={formData.tags || []} onChange={handleTagsChange} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tags help users find related content. Add multiple tags to categorize your post.
              </p>
            </div>

            {/* Version History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Version History</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {versions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No previous versions available</p>
                ) : (
                  versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-3 border ${
                        version.version_number === currentVersion
                          ? "border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      } rounded-lg`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Version {version.version_number}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(version.created_at).toLocaleString()}
                          </p>
                        </div>
                        {version.version_number !== currentVersion && (
                          <button
                            type="button"
                            onClick={() => restoreVersion(version.version_number)}
                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Social Media Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Social Media Preview</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="og_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Open Graph Title
                  </label>
                  <input
                    type="text"
                    id="og_title"
                    name="og_title"
                    value={formData.og_title || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter Open Graph title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="og_description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Open Graph Description
                  </label>
                  <textarea
                    id="og_description"
                    name="og_description"
                    value={formData.og_description || ""}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter Open Graph description"
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="twitter_card"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Twitter Card Type
                  </label>
                  <select
                    id="twitter_card"
                    name="twitter_card"
                    value={formData.twitter_card || "summary_large_image"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary with Large Image</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
