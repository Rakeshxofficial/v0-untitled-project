import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Add comprehensive null checks
  if (!params || !params.slug || typeof params.slug !== "string") {
    return {
      title: "App Not Found - InstallMOD",
      description: "The requested app could not be found.",
    }
  }

  const { slug } = params

  return {
    title: `App Details for ${slug} - InstallMOD`,
    description: `Details and information about the app ${slug} on InstallMOD.`,
  }
}

export default async function AppDetailsPage({ params }: { params: { slug: string } }) {
  // Add comprehensive null checks
  if (!params || !params.slug || typeof params.slug !== "string") {
    notFound()
  }

  const { slug } = params

  return (
    <div>
      <h1>App Details Page</h1>
      <p>Slug: {slug}</p>
    </div>
  )
}
