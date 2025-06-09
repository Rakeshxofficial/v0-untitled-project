import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Add comprehensive null checks
  if (!params || !params.slug || typeof params.slug !== "string") {
    return {
      title: "Blog Post Not Found - InstallMOD",
      description: "The requested blog post could not be found.",
    }
  }

  const { slug } = params

  return {
    title: `Blog Post: ${slug} - InstallMOD`,
    description: `Details about the blog post with slug ${slug}`,
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  // Add comprehensive null checks
  if (!params || !params.slug || typeof params.slug !== "string") {
    notFound()
  }

  const { slug } = params

  return (
    <div>
      <h1>Blog Post: {slug}</h1>
      <p>This is the content of the blog post with slug: {slug}</p>
    </div>
  )
}
