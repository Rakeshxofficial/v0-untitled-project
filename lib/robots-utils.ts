import type { Metadata } from "next"

export type RobotsConfig = {
  index?: boolean
  follow?: boolean
  noarchive?: boolean
  nocache?: boolean
  nosnippet?: boolean
  notranslate?: boolean
  noimageindex?: boolean
  maxSnippet?: number
  maxImagePreview?: "none" | "standard" | "large"
  maxVideoPreview?: number
}

/**
 * Generates robots metadata for Next.js pages
 * @param config Configuration for robots meta tag
 * @returns Metadata object with robots configuration
 */
export function generateRobotsMetadata(config: RobotsConfig = {}): Pick<Metadata, "robots"> {
  const {
    index = true,
    follow = true,
    noarchive = false,
    nocache = false,
    nosnippet = false,
    notranslate = false,
    noimageindex = false,
    maxSnippet = -1,
    maxImagePreview = "large",
    maxVideoPreview = -1,
  } = config

  return {
    robots: {
      index,
      follow,
      noarchive,
      nocache,
      nosnippet,
      notranslate,
      noimageindex,
      googleBot: {
        index,
        follow,
        noimageindex,
        "max-snippet": maxSnippet,
        "max-image-preview": maxImagePreview,
        "max-video-preview": maxVideoPreview,
      },
    },
  }
}

/**
 * Predefined robots configurations for common use cases
 */
export const robotsPresets = {
  // Default: Index and follow
  default: generateRobotsMetadata(),

  // No index but follow links
  noIndex: generateRobotsMetadata({ index: false, follow: true }),

  // No index and no follow
  none: generateRobotsMetadata({ index: false, follow: false }),

  // Admin pages: No index, no follow, no cache
  admin: generateRobotsMetadata({
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  }),

  // Archive pages: Index but with limited snippet
  archive: generateRobotsMetadata({
    maxSnippet: 150,
    maxImagePreview: "standard",
  }),
}
