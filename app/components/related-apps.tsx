"use client"

import Link from "next/link"
import Image from "next/image"
import { getPublicUrl } from "@/lib/utils"

interface RelatedAppsProps {
  apps: any[]
  contentType: "app" | "game"
  iconBgColor?: string
}

export default function RelatedApps({ apps, contentType, iconBgColor = "#3E3E3E" }: RelatedAppsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">{/* Title removed as requested */}</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`https://${app.slug}.installmod.com`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                style={{ backgroundColor: app.icon_bg_color || iconBgColor }}
              >
                <Image
                  src={getPublicUrl(app.icon_url, "app-icons") || "/placeholder.svg"}
                  alt={app.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="font-medium text-gray-800 dark:text-white truncate">{app.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">v{app.version}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
