"use client"

import { useState, useEffect } from "react"
import { X, Check } from "lucide-react"

export interface TaskButton {
  id: string
  label: string
  url: string
  icon: string // 'telegram' | 'instagram' | 'youtube' | 'twitter' | 'facebook' | 'tiktok'
  completed: boolean
}

interface TaskPopupProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  buttons: TaskButton[]
  appId: string
  rememberCompletion: boolean
}

export default function TaskPopup({ isOpen, onClose, onComplete, buttons, appId, rememberCompletion }: TaskPopupProps) {
  const [tasks, setTasks] = useState<TaskButton[]>(buttons)
  const [completedCount, setCompletedCount] = useState(0)
  const [allTasksCompleted, setAllTasksCompleted] = useState(false)

  useEffect(() => {
    if (rememberCompletion) {
      // Load completed tasks from localStorage
      const savedTasks = localStorage.getItem(`tasks-${appId}`)
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        // Merge saved completion status with current buttons
        const mergedTasks = buttons.map((button) => {
          const savedTask = parsedTasks.find((task: TaskButton) => task.id === button.id)
          return savedTask ? { ...button, completed: savedTask.completed } : button
        })
        setTasks(mergedTasks)
        const newCompletedCount = mergedTasks.filter((task) => task.completed).length
        setCompletedCount(newCompletedCount)
        setAllTasksCompleted(newCompletedCount === mergedTasks.length)
      } else {
        setTasks(buttons)
        setCompletedCount(buttons.filter((task) => task.completed).length)
        setAllTasksCompleted(buttons.filter((task) => task.completed).length === buttons.length)
      }
    } else {
      setTasks(buttons)
      setCompletedCount(buttons.filter((task) => task.completed).length)
      setAllTasksCompleted(buttons.filter((task) => task.completed).length === buttons.length)
    }
  }, [buttons, appId, rememberCompletion])

  const handleTaskClick = (id: string) => {
    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, completed: true } : task))
    setTasks(updatedTasks)

    const newCompletedCount = updatedTasks.filter((task) => task.completed).length
    setCompletedCount(newCompletedCount)

    // Check if all tasks are completed
    const areAllCompleted = newCompletedCount === tasks.length
    setAllTasksCompleted(areAllCompleted)

    if (rememberCompletion) {
      localStorage.setItem(`tasks-${appId}`, JSON.stringify(updatedTasks))
    }
  }

  const getButtonStyle = (icon: string) => {
    switch (icon) {
      case "telegram":
        return "bg-[#29b6f6] hover:bg-[#0086c3] text-white"
      case "instagram":
        return "bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:from-[#6a2e91] hover:via-[#d41919] hover:to-[#d99b3b] text-white"
      case "youtube":
        return "bg-[#ff0000] hover:bg-[#cc0000] text-white"
      case "twitter":
        return "bg-[#1da1f2] hover:bg-[#0c85d0] text-white"
      case "facebook":
        return "bg-[#1877f2] hover:bg-[#0d65d9] text-white"
      case "tiktok":
        return "bg-black hover:bg-gray-800 text-white"
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white"
    }
  }

  const getIcon = (icon: string) => {
    switch (icon) {
      case "telegram":
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.296c-.146.658-.537.818-1.084.51l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.534-.197 1.001.13.832.924z" />
          </svg>
        )
      case "instagram":
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
          </svg>
        )
      case "youtube":
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (!isOpen) return null

  const progressPercentage = (completedCount / tasks.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 mx-4 bg-white rounded-2xl shadow-xl">
        {/* Close button - always visible */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Party popper icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 flex items-center justify-center bg-green-50 rounded-full">
            <span className="text-4xl">🎉</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-2">Almost Done!</h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6">Complete these quick tasks to unlock your download</p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Progress text */}
        <p className="text-center text-gray-500 mb-6">
          {completedCount} of {tasks.length} tasks completed
        </p>

        {/* Task buttons */}
        <div className="space-y-3 mb-6">
          {tasks.map((task) => (
            <a
              key={task.id}
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!task.completed) {
                  handleTaskClick(task.id)
                }
              }}
              className={`flex items-center justify-between w-full px-6 py-4 rounded-lg transition-all ${getButtonStyle(
                task.icon,
              )}`}
            >
              <div className="flex items-center">
                {getIcon(task.icon)}
                <span className="ml-3 font-medium">{task.label}</span>
              </div>
              {task.completed && <Check className="w-5 h-5" />}
            </a>
          ))}
        </div>

        {/* Download button */}
        <button
          onClick={allTasksCompleted ? onComplete : undefined}
          disabled={!allTasksCompleted}
          className={`w-full py-4 px-6 font-medium rounded-lg transition-all ${
            allTasksCompleted
              ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-disabled={!allTasksCompleted}
        >
          Download Now
        </button>
      </div>
    </div>
  )
}
