"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info } from "lucide-react"

interface ModInfoCollapsibleProps {
  features: string[]
  iconBgColor?: string // Add this prop
}

export default function ModInfoCollapsible({ features, iconBgColor = "#3E3E3E" }: ModInfoCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5" style={{ color: iconBgColor }} />
          <span className="font-medium text-gray-800 dark:text-white">MOD Info?</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-800">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: iconBgColor }}></div>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
