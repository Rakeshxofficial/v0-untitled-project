import { notFound } from "next/navigation"
import { Suspense } from "react"
import ErrorBoundary from "@/components/error-boundary"
import { safeFetch } from "@/lib/safe-fetch"
import { supabase } from "@/lib/supabase"
import AppDetailsContentComponent from "@/app/components/app-details-content"
import AppDetailsSkeleton from "@/app/components/app-details-skeleton"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params

  try {
    const { data: app } = await safeFetch(
      () => supabase.from("apps").select("*").eq("slug", slug).eq("status", "published").single(),
      { componentName: "AppDetailsMetadata" },
    )

    if (!app) {
      return {
        title: "App Not Found - InstallMOD",
        description: "The requested app could not be found.",
      }
    }

    return {
      title: app.meta_title || `${app.title} - Download Mod APK`,
      description: app.meta_description || `Download ${app.title} mod APK with premium features unlocked.`,
      openGraph: {
        title: app.og_title || app.title,
        description: app.og_description || `Download ${app.title} mod APK with premium features unlocked.`,
        images: [{ url: app.og_image || app.icon_url }],
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "App Details - InstallMOD",
      description: "Download modded APKs for Android apps and games.",
    }
  }
}

export default async function AppDetailsPage({ params }: { params: { slug: string } }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AppDetailsSkeleton />}>
        <AppDetailsContent slug={params.slug} />
      </Suspense>
    </ErrorBoundary>
  )
}

// Create a separate component for the content to use with Suspense
async function AppDetailsContent({ slug }: { slug: string }) {
  const { data: app, isError } = await safeFetch(
    () =>
      supabase
        .from("apps")
        .select(`
        *,
        category:categories(*)
      `)
        .eq("slug", slug)
        .eq("status", "published")
        .single(),
    { componentName: "AppDetailsContent" },
  )

  if (isError || !app) {
    notFound()
  }

  // Increment view count
  try {
    await supabase.rpc("increment_app_views", { app_id: app.id })
  } catch (error) {
    // Non-critical error, just log it
    console.error("Failed to increment view count:", error)
  }

  return <AppDetailsContentComponent app={app} />
}
