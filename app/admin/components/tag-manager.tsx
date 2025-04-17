"use client"

import { useState, useEffect } from "react"
import { supabase, createSlug } from "@/lib/supabase"
import { Plus, Check, Loader2 } from "lucide-react"

interface Tag {
  id: string
  name: string
  slug: string
}

interface TagManagerProps {
  selectedTags: string[]
  onChange: (tagIds: string[]) => void
}

export default function TagManager({ selectedTags, onChange }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("tags").select("*").order("name")
      if (error) throw error
      setTags(data || [])
    } catch (error) {
      console.error("Error fetching tags:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createTag = async () => {
    if (!newTagName.trim()) return

    setIsCreating(true)
    try {
      const slug = await createSlug(newTagName, "tags")
      const { data, error } = await supabase
        .from("tags")
        .insert([{ name: newTagName.trim(), slug }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setTags([...tags, data[0]])
        // Automatically select the new tag
        onChange([...selectedTags, data[0].id])
      }

      setNewTagName("")
    } catch (error) {
      console.error("Error creating tag:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTags, tagId])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading tags...
          </div>
        ) : tags.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No tags available. Create your first tag below.
          </div>
        ) : (
          tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag.id)
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-800"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {selectedTags.includes(tag.id) ? <Check className="w-3 h-3 mr-1" /> : null}
              {tag.name}
            </button>
          ))
        )}
      </div>

      <div className="flex items-center">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Add a new tag..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={createTag}
          disabled={isCreating || !newTagName.trim()}
          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
