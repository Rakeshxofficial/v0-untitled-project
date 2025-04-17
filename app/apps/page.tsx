import type { Metadata } from "next"
import AppsPageClient from "./AppsPageClient"

// Add this metadata export before the AppsPage component
export const metadata: Metadata = {
  title: "Apps - Download Modded Android Applications - InstallMOD",
  description:
    "Browse and download the latest modded apps for Android. Free MOD APKs with premium features unlocked, no ads, and enhanced functionality.",
  openGraph: {
    title: "Modded Android Apps - InstallMOD",
    description:
      "Download popular Android applications with premium features unlocked. Updated regularly with the latest versions.",
    type: "website",
  },
}

export default function AppsPage() {
  return <AppsPageClient />
}
