"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium text-gray-800 dark:text-white">{question}</h3>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`px-6 pb-4 ${isOpen ? "block" : "hidden"}`}>
        <p className="text-gray-600 dark:text-gray-300">{answer}</p>
      </div>
    </div>
  )
}
