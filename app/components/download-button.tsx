"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import { getPublicUrl } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import TaskPopup from "./task-popup"
import { cn } from "@/lib/utils"

interface DownloadButtonProps {
  downloadUrl: string
  size: string
  contentId: string
  contentType: "app" | "game"
  formAction: (formData: FormData) => Promise<void>
  className?: string
  style?: React.CSSProperties
}

interface TaskButton {
  id: string
  label: string
  url: string
  icon: string
  completed: boolean
}

interface TaskPopupConfig {
  enabled: boolean
  buttons: TaskButton[]
  target_apps: string[] | null
  remember_completion: boolean
}

export default function DownloadButton({
  downloadUrl,
  size,
  contentId,
  contentType,
  formAction,
  className,
  style,
}: DownloadButtonProps) {
  // Get the public URL for the download
  const publicDownloadUrl = getPublicUrl(downloadUrl, "apk-files")

  const [showTaskPopup, setShowTaskPopup] = useState(false)
  const [taskConfig, setTaskConfig] = useState<TaskPopupConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tasksCompleted, setTasksCompleted] = useState(false)

  useEffect(() => {
    async function fetchTaskConfig() {
      try {
        const { data, error } = await supabase
          .from("task_popup_config")
          .select("*")
          .eq("id", "task-popup-config")
          .single()

        if (error) throw error

        if (data) {
          // Add completed: false to each button
          const buttonsWithCompletion = data.buttons.map((button: any) => ({
            ...button,
            completed: false,
          }))

          setTaskConfig({
            ...data,
            buttons: buttonsWithCompletion,
          })

          // Check if tasks are already completed in localStorage
          if (data.remember_completion) {
            const savedTasks = localStorage.getItem(`tasks-${contentId}`)
            if (savedTasks) {
              const parsedTasks = JSON.parse(savedTasks)
              const allCompleted = parsedTasks.every((task: TaskButton) => task.completed)
              setTasksCompleted(allCompleted)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching task popup config:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskConfig()
  }, [contentId])

  const shouldShowPopup = () => {
    if (!taskConfig || !taskConfig.enabled) return false

    // Check if user has already completed all tasks
    if (taskConfig.remember_completion && tasksCompleted) {
      return false
    }

    // Check if this app is targeted
    if (taskConfig.target_apps) {
      return taskConfig.target_apps.includes(contentId)
    }

    // If no specific targeting, show for all
    return true
  }

  const handleDownloadClick = async () => {
    // If tasks are already completed or popup shouldn't show, proceed with download
    if (tasksCompleted || !shouldShowPopup()) {
      await proceedWithDownload()
    } else {
      // Otherwise show the task popup
      setShowTaskPopup(true)
    }
  }

  const handleTaskCompletion = async () => {
    setTasksCompleted(true)
    setShowTaskPopup(false)

    // Proceed with download after tasks are completed
    await proceedWithDownload()
  }

  const handlePopupClose = () => {
    // Just close the popup without changing task completion status or triggering download
    setShowTaskPopup(false)
  }

  const proceedWithDownload = async () => {
    try {
      // Create a form to submit for analytics
      const form = new FormData()
      form.append("contentId", contentId)
      form.append("contentType", contentType)

      // Submit the form to increment the counter
      await formAction(form)

      // Open download in a new tab
      window.open(publicDownloadUrl, "_blank")
    } catch (error) {
      console.error("Error processing download:", error)
    }
  }

  // Determine button style based on task completion status
  const buttonStyle = cn(
    "w-full font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative text-white",
    className || "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    tasksCompleted || !shouldShowPopup()
      ? ""
      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
  )

  return (
    <>
      <button onClick={handleDownloadClick} className={buttonStyle} style={style}>
        <Download className="w-5 h-5" />
        Download ({size})
        {tasksCompleted && (
          <span className="absolute top-0 right-0 h-3 w-3 bg-white rounded-full transform translate-x-1 -translate-y-1"></span>
        )}
      </button>

      {taskConfig && (
        <TaskPopup
          isOpen={showTaskPopup}
          onClose={handlePopupClose}
          onComplete={handleTaskCompletion}
          buttons={taskConfig.buttons}
          appId={contentId}
          rememberCompletion={taskConfig.remember_completion}
        />
      )}
    </>
  )
}
