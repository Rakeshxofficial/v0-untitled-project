import { notFound } from "next/navigation"
import type { Metadata } from "next"

// Define the available footer pages
const footerPages = {
  "privacy-policy": {
    title: "Privacy Policy",
    description: "Our privacy policy outlines how we collect, use, and protect your personal information.",
    component: () => import("../components/privacy-policy").then((mod) => mod.PrivacyPolicy),
  },
  "about-us": {
    title: "About Us",
    description: "Learn more about our mission, vision, and the team behind InstallMOD.",
    component: () => import("../components/about-us").then((mod) => mod.AboutUs),
  },
  "contact-us": {
    title: "Contact Us",
    description: "Get in touch with our team for support, feedback, or business inquiries.",
    component: () => import("../components/contact-us").then((mod) => mod.ContactUs),
  },
  "dmca-disclaimer": {
    title: "DMCA Disclaimer",
    description: "Our DMCA policy and procedures for reporting copyright infringement.",
    component: () => import("../components/dmca-disclaimer").then((mod) => mod.DmcaDisclaimer),
  },
  "terms-of-service": {
    title: "Terms of Service",
    description: "The terms and conditions governing your use of our services and website.",
    component: () => import("../components/terms-of-service").then((mod) => mod.TermsOfService),
  },
}

// Generate metadata for each page
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const page = footerPages[params.slug as keyof typeof footerPages]

  if (!page) {
    return {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist.",
    }
  }

  return {
    title: `${page.title} | InstallMOD`,
    description: page.description,
  }
}

// Generate static params for all footer pages
export function generateStaticParams() {
  return Object.keys(footerPages).map((slug) => ({ slug }))
}

export default async function FooterPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const page = footerPages[slug as keyof typeof footerPages]

  if (!page) {
    notFound()
  }

  const PageComponent = await page.component()

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">{page.title}</h1>
      <div className="bg-card rounded-lg shadow-md p-6 md:p-8">
        <PageComponent />
      </div>
    </main>
  )
}
