"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Send, MessageSquare, User } from "lucide-react"
import { supabase, type Comment } from "@/lib/supabase"

interface CommentSectionProps {
  contentId: string
  contentType: "app" | "game" | "blog"
  iconBgColor?: string // Add this prop
}

export default function CommentSection({ contentId, contentType, iconBgColor = "#3E3E3E" }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    message: "",
  })

  // Fetch comments for this content
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("content_id", contentId)
          .eq("content_type", contentType)
          .eq("status", "approved")
          .order("created_at", { ascending: false })

        if (error) throw error

        setComments(data as Comment[])
      } catch (err) {
        console.error("Error fetching comments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [contentId, contentType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewComment((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!newComment.name || !newComment.email || !newComment.message) {
      alert("Please fill in all fields")
      return
    }

    try {
      setSubmitting(true)

      // Add new comment
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            content_id: contentId,
            content_type: contentType,
            name: newComment.name,
            email: newComment.email,
            message: newComment.message,
            status: "pending", // Comments start as pending until approved
          },
        ])
        .select()

      if (error) throw error

      // Reset form
      setNewComment({
        name: "",
        email: "",
        message: "",
      })

      alert("Your comment has been submitted and is awaiting approval.")
    } catch (err) {
      console.error("Error submitting comment:", err)
      alert("Failed to submit comment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg relative"
          style={{ background: `linear-gradient(to bottom right, ${iconBgColor}, ${iconBgColor}99)` }}
        >
          <MessageSquare className="w-5 h-5 text-white" />
          {/* Add glow effect */}
          <div
            className="absolute inset-0 rounded-full blur-md opacity-30 -z-10"
            style={{ backgroundColor: iconBgColor }}
          ></div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Join the discussion</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newComment.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-white"
              style={
                {
                  "--tw-ring-color": iconBgColor,
                  "--tw-ring-opacity": 1,
                } as React.CSSProperties
              }
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={newComment.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-white"
              style={
                {
                  "--tw-ring-color": iconBgColor,
                  "--tw-ring-opacity": 1,
                } as React.CSSProperties
              }
              placeholder="Your email (won't be published)"
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comment
          </label>
          <textarea
            id="message"
            name="message"
            value={newComment.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-white"
            style={
              {
                "--tw-ring-color": iconBgColor,
                "--tw-ring-opacity": 1,
              } as React.CSSProperties
            }
            placeholder="Share your thoughts..."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, ${iconBgColor}, ${iconBgColor}dd)`,
          }}
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting..." : "Post Comment"}
        </button>
      </form>

      <div>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Comments ({comments.length})</h3>
          <div className="h-px flex-grow bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: iconBgColor }}></div>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(to bottom right, ${iconBgColor}66, ${iconBgColor}33)` }}
                  >
                    <User className="w-4 h-4" style={{ color: iconBgColor }} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{comment.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm pl-11">{comment.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No comments yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
