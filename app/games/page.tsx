import GamesPageClient from "./GamesPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Games - Download Modded Android Games - InstallMOD",
  description:
    "Browse and download the latest modded games for Android. Free MOD APKs with unlimited coins, gems, lives, unlocked levels, and removed ads.",
  openGraph: {
    title: "Modded Android Games - InstallMOD",
    description:
      "Download popular Android games with premium features unlocked. Updated regularly with the latest versions.",
    type: "website",
  },
}

export default function GamesPage() {
  return <GamesPageClient />
}
