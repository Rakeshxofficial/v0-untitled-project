"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, Flag, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface BlogCommentsProps {
  blogId: string
}

interface Comment {
  id: string
  name: string
  message: string
  created_at: string
  likes?: number
}

export default function BlogComments({ blogId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load name and email from localStorage if available
    const savedName = localStorage.getItem("commenter_name")
    const savedEmail = localStorage.getItem("commenter_email")
    if (savedName) {
      setName(savedName)
    }
    if (savedEmail) {
      setEmail(savedEmail)
    }

    // Fetch comments
    fetchComments()
  }, [blogId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("content_id", blogId)
        .eq("content_type", "blog")
        .eq("status", "approved")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching comments:", error)
        return
      }

      setComments(data || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !message.trim() || !email.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your name, email, and a comment.",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Save name to localStorage
      localStorage.setItem("commenter_name", name)
      localStorage.setItem("commenter_email", email)

      const { error } = await supabase.from("comments").insert({
        content_id: blogId,
        content_type: "blog",
        name,
        email,
        message,
        status: "pending", // Comments require approval
      })

      if (error) {
        throw error
      }

      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted and is awaiting approval.",
      })

      setMessage("")
      // Don't clear the name as we want to remember it

      // Optionally refresh comments if you want to show pending comments
      // fetchComments()
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: "Error",
        description: "There was a problem submitting your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (commentId: string) => {
    // In a real implementation, you would track which comments a user has liked
    // For now, we'll just increment the like count
    setComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, likes: (comment.likes || 0) + 1 } : comment)),
    )

    toast({
      title: "Comment liked",
      description: "You liked this comment.",
    })
  }

  const handleReport = (commentId: string) => {
    toast({
      title: "Comment reported",
      description: "Thank you for reporting this comment. We will review it shortly.",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Comments</h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
            placeholder="Your email (will not be displayed)"
            required
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comment
          </label>
          <Textarea
            id="comment"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            placeholder="Share your thoughts..."
            required
          />
        </div>

        <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
          <Send className="w-4 h-4" />
          {isSubmitting ? "Submitting..." : "Post Comment"}
        </Button>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">{comment.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
                  </div>

                  <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.message}</p>

                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReport(comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
