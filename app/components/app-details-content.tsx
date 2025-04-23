"use client"

import { useState } from "react"
import AppInfoGrid from "@/app/components/app-info-grid"
import AppScreenshots from "@/app/components/app-screenshots"
import ModInfoCollapsible from "@/app/components/mod-info-collapsible"
import AppFAQ from "@/app/components/app-faq"

interface AppDetailsContentProps {
  app: {
    id: string
    title: string
    version: string
    mod_info: string
    icon_url: string
    icon_bg_color?: string
    updated_at: string
    size: string
    category: {
      name: string
      slug: string
    }
    rating?: number
    total_ratings?: number
    download_url: string
    description: string
    requirements: string
    publisher?: string
    google_play_link?: string
    slug: string
  }
}

export default function AppDetailsContentComponent({ app }: AppDetailsContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Sample FAQ data
  const faqs = [
    {
      question: `What is ${app.title}?`,
      answer: `${app.title} is a popular application.`,
    },
    {
      question: `Is ${app.title} safe to use?`,
      answer: `Yes, we thoroughly test all MOD APKs before publishing them.`,
    },
  ]

  const breadcrumbs = [
    { name: "Home", url: "https://installmod.com" },
    { name: "Apps", url: "https://installmod.com/apps" },
    { name: app.title, url: `https://installmod.com/app/${app.slug}` },
  ]

  return (
    <div className="space-y-6">
      <AppInfoGrid
        appData={{
          name: app.title,
          version: app.version,
          category: app.category?.name || "App",
          categorySlug: app.category?.slug || "app",
          publisher: app.publisher,
          requirements: app.requirements,
          size: app.size,
          lastUpdated: new Date(app.updated_at).toLocaleDateString(),
          googlePlayLink: app.google_play_link,
          rating: app.rating || 4.5,
          totalRatings: app.total_ratings || 100,
        }}
      />

      <ModInfoCollapsible features={["Feature 1", "Feature 2"]} iconBgColor={app.icon_bg_color} />

      <AppScreenshots
        screenshots={["screenshot1.jpg", "screenshot2.jpg"]}
        title={app.title}
        iconBgColor={app.icon_bg_color}
      />

      <AppFAQ
        name={app.title}
        version={app.version}
        requirements={app.requirements}
        size={app.size}
        appFeatures={["Feature 1", "Feature 2"]}
        iconBgColor={app.icon_bg_color}
      />
    </div>
  )
}
