"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"

export interface Heading {
  id: string
  text: string
  level: number
}

interface ExploreArticleProps {
  headings: Heading[]
  iconBgColor?: string // Add this prop
}

export default function ExploreArticle({ headings = [], iconBgColor = "#3E3E3E" }: ExploreArticleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  // Track scroll position to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      // Find the section that is currently in view
      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(heading.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [headings])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      })
    }
  }

  // Don't render if no headings are available
  if (headings.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-white transition-colors"
        style={{
          background: `linear-gradient(to right, ${iconBgColor}, ${iconBgColor}dd)`,
        }}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <span className="font-medium">Explore this article</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-2">
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li key={heading.id} style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}>
                <button
                  onClick={() => scrollToSection(heading.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === heading.id
                      ? "text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  style={{
                    backgroundColor: activeSection === heading.id ? `${iconBgColor}33` : "transparent",
                    color: activeSection === heading.id ? iconBgColor : undefined,
                  }}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
