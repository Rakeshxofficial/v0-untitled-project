import { getCanonicalUrl } from "@/lib/canonical-url"

// Helper function to generate JSON-LD script
export function generateSchemaMarkup(schema: object | object[]): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

// SoftwareApplication schema for app/game pages
export function generateSoftwareApplicationSchema({
  name,
  description,
  image,
  url,
  applicationCategory,
  operatingSystem = "Android",
  offers = null,
  aggregateRating = null,
  version,
  datePublished,
  publisher,
}: {
  name: string
  description: string
  image: string
  url: string
  applicationCategory: string
  operatingSystem?: string
  offers?: {
    price: string
    priceCurrency: string
    availability: string
  } | null
  aggregateRating?: {
    ratingValue: string
    ratingCount: string
  } | null
  version: string
  datePublished: string
  publisher: string
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    image,
    url,
    applicationCategory,
    operatingSystem,
    version,
    datePublished,
    publisher: {
      "@type": "Organization",
      name: publisher,
    },
  }

  if (offers) {
    schema.offers = {
      "@type": "Offer",
      ...offers,
    }
  } else {
    // Default offer for free apps
    schema.offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    }
  }

  if (aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ...aggregateRating,
    }
  }

  return schema
}

// FAQPage schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

// BlogPosting schema
export function generateBlogPostingSchema({
  headline,
  description,
  image,
  url,
  datePublished,
  dateModified,
  author,
  publisher,
}: {
  headline: string
  description: string
  image: string
  url: string
  datePublished: string
  dateModified: string
  author: string
  publisher: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    image,
    url,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: publisher,
      logo: {
        "@type": "ImageObject",
        url: "https://installmod.com/logo.png", // Update with actual logo URL
      },
    },
  }
}

// WebSite schema
export function generateWebsiteSchema({
  name,
  url,
  description,
  searchUrl = "https://installmod.com/search?q={search_term_string}",
}: {
  name: string
  url: string
  description: string
  searchUrl?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchUrl,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

// Organization schema
export function generateOrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs = [],
}: {
  name: string
  url: string
  logo: string
  description: string
  sameAs?: string[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs,
  }
}

// BreadcrumbList schema
export function generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  }
}

// Schema component for app/game details page
export function AppSchemaMarkup({
  app,
  faqs,
  breadcrumbs,
}: {
  app: {
    title: string
    description: string
    icon_url: string
    slug: string
    category: { name: string }
    version: string
    updated_at: string
    publisher: string
    requirements?: string
    size?: string
  }
  faqs: { question: string; answer: string }[]
  breadcrumbs: { name: string; url: string }[]
}) {
  const canonicalUrl = getCanonicalUrl(`/${app.slug}`)
  const iconUrl = app.icon_url || "/placeholder.svg"

  // Generate SoftwareApplication schema
  const softwareAppSchema = generateSoftwareApplicationSchema({
    name: app.title,
    description: app.description.replace(/<[^>]*>/g, "").substring(0, 500) + "...",
    image: iconUrl,
    url: canonicalUrl,
    applicationCategory: app.category?.name || "Application",
    version: app.version,
    datePublished: new Date(app.updated_at).toISOString(),
    publisher: app.publisher || "InstallMOD",
    aggregateRating: {
      ratingValue: "4.5", // Default rating
      ratingCount: "100", // Default count
    },
  })

  // Generate FAQPage schema
  const faqSchema = generateFAQSchema(faqs)

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  // Combine all schemas
  const schemas = [softwareAppSchema, faqSchema, breadcrumbSchema]

  // Use a script tag directly instead of a div with dangerouslySetInnerHTML
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

// Schema component for blog page
export function BlogSchemaMarkup({
  blog,
  breadcrumbs,
}: {
  blog: {
    title: string
    excerpt: string
    featured_image: string
    slug: string
    created_at: string
    updated_at: string
    publisher: string
  }
  breadcrumbs: { name: string; url: string }[]
}) {
  const canonicalUrl = getCanonicalUrl(`/${blog.slug}`)
  const imageUrl = blog.featured_image || "/placeholder.svg"

  // Generate BlogPosting schema
  const blogPostingSchema = generateBlogPostingSchema({
    headline: blog.title,
    description: blog.excerpt,
    image: imageUrl,
    url: canonicalUrl,
    datePublished: new Date(blog.created_at).toISOString(),
    dateModified: new Date(blog.updated_at).toISOString(),
    author: blog.publisher || "InstallMOD",
    publisher: "InstallMOD",
  })

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  // Combine all schemas
  const schemas = [blogPostingSchema, breadcrumbSchema]

  // Use script tags directly instead of a div with dangerouslySetInnerHTML
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

// Schema component for homepage
export function HomeSchemaMarkup() {
  const websiteSchema = generateWebsiteSchema({
    name: "InstallMOD",
    url: "https://installmod.com",
    description:
      "Download the latest modded APKs for Android games and apps with premium features unlocked, no ads, and enhanced functionality.",
  })

  const organizationSchema = generateOrganizationSchema({
    name: "InstallMOD",
    url: "https://installmod.com",
    logo: "https://installmod.com/logo.png", // Update with actual logo URL
    description: "InstallMOD provides modded APKs for Android games and apps with premium features unlocked.",
    sameAs: ["https://twitter.com/installmod", "https://facebook.com/installmod", "https://t.me/installmod"], // Update with actual social media URLs
  })

  // Combine all schemas
  const schemas = [websiteSchema, organizationSchema]

  // Use script tags directly instead of a div with dangerouslySetInnerHTML
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

// Create a component for injecting schema markup in the head
export function SchemaMarkupScript({ schemas }: { schemas: object[] }) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
