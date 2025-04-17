import type { Metadata } from "next"

// Set metadata for 404 page - no indexing
export const metadata: Metadata = {
  title: "Page Not Found | installMOD",
  description: "The page you're looking for doesn't exist.",
  robots: {
    index: false,
    follow: true,
  },
}
