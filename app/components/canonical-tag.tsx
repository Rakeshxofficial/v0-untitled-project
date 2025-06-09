"use client"

import { usePathname } from "next/navigation"

interface CanonicalTagProps {
  baseUrl?: string
}

export default function CanonicalTag({
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://getmodsapk.com",
}: CanonicalTagProps) {
  const pathname = usePathname()
  const canonicalUrl = `${baseUrl}${pathname}`

  return <link rel="canonical" href={canonicalUrl} />
}
