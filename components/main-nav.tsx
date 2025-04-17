import type React from "react"
// Link component removed in favor of standard <a> tags
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/apps", label: "Apps" },
    { href: "/games", label: "Games" },
    { href: "/category", label: "Categories" },
    { href: "/blogs", label: "Blogs" },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <a href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md overflow-hidden">
            <span className="text-white text-sm font-bold">I</span>
          </div>
          <div className="flex flex-col items-start">
            <h1 className="font-bold text-base leading-tight">
              <span className="text-green-500">Install</span>
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">MOD</span>
            </h1>
            <p className="text-[10px] text-gray-500 -mt-0.5">Admin Panel</p>
          </div>
        </div>
      </a>
    </nav>
  )
}
