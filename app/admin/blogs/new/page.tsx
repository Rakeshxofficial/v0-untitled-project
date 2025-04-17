"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase, uploadFileOrUseUrl, type Category } from "@/lib/supabase"
import RichTextEditor from "@/app/admin/components/rich-text-editor"
// In the imports, add User icon if not already imported
import { ArrowLeft, Calendar, Clock, ImageIcon, User, X } from "lucide-react"
// Update the imports to include TagManager
import TagManager from "@/app/admin/components/tag-manager"
// In the imports, add the createBlogSlug function:
import { createBlogSlug } from "@/lib/utils"

export default function NewBlogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  const [publishDate, setPublishDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [publishTime, setPublishTime] = useState<string>(
    new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
  )
  // Add state for publishers
  const [publishers, setPublishers] = useState<any[]>([])
  // Add to the formData state
  const [formData, setFormData] = useState({
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
    tags: [] as string[],
    read_time: 5, // Default read time of 5 minutes
    publisher: "",
  })

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("categories").select("*").eq("type", "blog").order("name")
      if (error) {
        console.error("Error fetching categories:", error)
      } else {
        setCategories(data || [])
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: data[0].id }))
        }
      }

      // Fetch publishers
      const { data: publishersData, error: publishersError } = await supabase
        .from("publishers")
        .select("*")
        .order("name")

      if (publishersError) {
        console.error("Error fetching publishers:", publishersError)
      } else {
        setPublishers(publishersData || [])
      }
    }

    fetchCategories()
  }, [])

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
  }

  // Add the handleImageUrlSubmit function to handle the image URL input
  // Add this function after the removeFeaturedImage function (around line 80-90)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate slug from title
      const baseSlug = createBlogSlug(formData.title)

      // Check if the slug already exists
      const { data: existingBlog } = await supabase.from("blogs").select("id").eq("slug", baseSlug).single()

      // If slug exists, add a unique identifier
      const slug = existingBlog ? createBlogSlug(formData.title, crypto.randomUUID().slice(0, 8)) : baseSlug

      // Upload featured image if exists
      let featuredImageUrl = null
      if (featuredImage) {
        featuredImageUrl = await uploadFileOrUseUrl(featuredImage, "blog-images", "featured")
      } else if (featuredImagePreview) {
        // If we have a preview from URL but no file, use the URL directly
        featuredImageUrl = formData.featured_image || featuredImagePreview
      }

      // Determine if this is a scheduled post
      const isScheduled = formData.status === "scheduled"
      let scheduledAt = null

      if (isScheduled) {
        // Combine date and time for scheduled publishing
        scheduledAt = new Date(`${publishDate}T${publishTime}`).toISOString()
      }

      // Ensure category_id is valid
      if (!formData.category_id) {
        throw new Error("Please select a category")
      }

      // Create blog post
      const { data, error } = await supabase.from("blogs").insert([
        {
          title: formData.title,
          slug,
          content: formData.content,
          excerpt: formData.excerpt,
          category_id: formData.category_id,
          featured_image: featuredImageUrl,
          status: formData.status,
          scheduled_at: scheduledAt,
          author_id: "00000000-0000-0000-0000-000000000000", // Using a valid UUID
          meta_title: formData.meta_title || formData.title,
          meta_description: formData.meta_description || formData.excerpt,
          meta_keywords: formData.meta_keywords,
          og_title: formData.og_title || formData.title,
          og_description: formData.og_description || formData.excerpt,
          og_type: "article",
          og_image: formData.og_image || featuredImageUrl,
          twitter_title: formData.twitter_title || formData.title,
          twitter_description: formData.twitter_description || formData.excerpt,
          twitter_card: formData.twitter_card,
          twitter_image: formData.twitter_image || featuredImageUrl,
          view_count: 0,
          read_time: Number.parseInt(formData.read_time.toString()) || 5, // Add read time with default of 5 minutes
          publisher: formData.publisher,
        },
      ])

      if (error) {
        throw error
      }

      // Create initial version for version control
      if (data && data[0]) {
        await supabase.from("blog_versions").insert([
          {
            blog_id: data[0].id,
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            version_number: 1,
            created_by: "00000000-0000-0000-0000-000000000000", // Using a valid UUID
          },
        ])
      }

      // Create blog post associations with tags
      if (data && data[0] && formData.tags.length > 0) {
        const blogId = data[0].id
        const tagAssociations = formData.tags.map((tagId) => ({
          blog_id: blogId,
          tag_id: tagId,
        }))

        await supabase.from("blog_tags").insert(tagAssociations)
      }

      // Redirect to blog list
      router.push("/admin/blogs")
      router.refresh()
    } catch (error) {
      console.error("Error creating blog post:", error)
      alert(`Failed to create blog post: ${error instanceof Error ? error.message : "Please try again."}`)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Blog Post</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, status: "draft" }))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                value={formData.title}
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
                          onClick={handleImageUrlSubmit}
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
                value={formData.content}
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
                value={formData.excerpt}
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
                    value={formData.meta_title}
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
                    value={formData.meta_description}
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
                    value={formData.meta_keywords}
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
                    value={formData.status}
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
                      value={formData.read_time}
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
                  value={formData.category_id}
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
                    value={formData.og_title}
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
                    value={formData.og_description}
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
                    value={formData.twitter_card}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary with Large Image</option>
                  </select>
                </div>
              </div>
            </div>
            {/* In the JSX, add the TagManager component in the sidebar: */}
            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tags</h3>
              <TagManager selectedTags={formData.tags} onChange={handleTagsChange} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tags help users find related content. Add multiple tags to categorize your post.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
