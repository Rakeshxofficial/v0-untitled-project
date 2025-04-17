import type { Metadata } from "next"
import AppCategoriesClient from "./AppCategoriesClient"

export const metadata: Metadata = {
  title: "App Categories | installMOD",
  description: "Browse all app categories available on installMOD. Find and download modified apps by category.",
}

export default function AppCategoriesPage() {
  return <AppCategoriesClient />
}
