"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  LinkIcon,
  ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = "Write something..." }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle external value changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!isMounted) {
    return (
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-[300px] bg-white dark:bg-gray-800">
        Loading editor...
      </div>
    )
  }

  const MenuBar = () => {
    if (!editor) {
      return null
    }

    const addImage = () => {
      const url = window.prompt("URL")
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }

    const setLink = () => {
      const previousUrl = editor.getAttributes("link").href
      const url = window.prompt("URL", previousUrl)

      if (url === null) {
        return
      }

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run()
        return
      }

      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }

    return (
      <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-t-lg border-b border-gray-300 dark:border-gray-600">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("underline") ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("heading", { level: 3 }) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600" />
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive({ textAlign: "justify" }) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
        <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600" />
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive("link") ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button onClick={addImage} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Image">
          <ImageIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="rich-text-editor border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      <MenuBar />
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-none p-4 min-h-[250px] bg-white dark:bg-gray-800"
      />
    </div>
  )
}
