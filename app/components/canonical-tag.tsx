"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Head from "next/head"
import { getCanonicalUrl } from "@/lib/canonical-url"

export default function CanonicalTag() {
  const pathname = usePathname()
  const [canonicalUrl, setCanonicalUrl] = useState("")

  useEffect(() => {
    if (pathname) {
      // Use the getCanonicalUrl function which now handles special cases
      // and supports subdomain URLs for apps/games
      setCanonicalUrl(getCanonicalUrl(pathname))
    }
  }, [pathname])

  if (!canonicalUrl) return null

  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  )
}

// Also add a named export for flexibility
export { CanonicalTag }
