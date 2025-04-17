"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarNavItemProps {
  title: string
  href?: string
  icon?: React.ReactNode
  group?: string
}

export function SidebarNavItem({ title, href, icon, group }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = href ? pathname === href : false

  if (!href) {
    return (
      <div className="px-3 py-2">
        <h3 className="mb-1 text-xs font-semibold tracking-tight text-gray-500">{title}</h3>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive
          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
      )}
    >
      {icon && (
        <span className={cn("mr-2", isActive ? "text-green-500" : "text-gray-500 dark:text-gray-400")}>{icon}</span>
      )}
      <span className="text-sm font-medium">{title}</span>
    </Link>
  )
}
