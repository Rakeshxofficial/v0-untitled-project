import type { Metadata } from "next"
import { generateRobotsMetadata, type RobotsConfig } from "@/lib/robots-utils"

interface SeoMetadataProps {
  title: string
  description: string
  path?: string
  ogImage?: string
  noIndex?: boolean
  robots?: RobotsConfig
}

export function generateSeoMetadata({
  title,
  description,
  path = "",
  ogImage,
  noIndex = false,
  robots,
}: SeoMetadataProps): Metadata {
  // Base URL for the site
  const baseUrl = "https://installmod.com"

  // Canonical URL
  const url = `${baseUrl}${path}`

  // Generate robots metadata
  const robotsMetadata = robots
    ? generateRobotsMetadata(robots)
    : generateRobotsMetadata({ index: !noIndex, follow: true })

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "website",
      siteName: "installMOD",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      site: "@installMOD",
    },
    ...robotsMetadata,
    keywords: "mod apk, modified apps, games, android apps, installMOD",
  }
}

// Add a named export for SeoMetadata component if it's being imported as a component
export const SeoMetadata = {
  generate: generateSeoMetadata,
}

// Also add a default export for flexibility
export default {
  generate: generateSeoMetadata,
}
