import { notFound } from "next/navigation"
import Footer from "@/app/components/footer"
import TelegramButton from "@/app/components/telegram-button"
import AppDetailsHeader from "@/app/components/app-details-header"
import ModInfoCollapsible from "@/app/components/mod-info-collapsible"
import ExploreArticle from "@/app/components/explore-article"
import CommentSection from "@/app/components/comment-section"
import RelatedApps from "@/app/components/related-apps"
import AppScreenshots from "@/app/components/app-screenshots"
import AppFAQ from "@/app/components/app-faq"
import { supabase, fetchManualRelatedContent } from "@/lib/supabase"
import { getPublicUrl } from "@/lib/utils"
import { getCanonicalUrl } from "@/lib/canonical-url"
import { extractHeadingsFromHtml, addIdsToHeadings } from "@/app/utils/html-utils"
import type { Metadata } from "next"
import { AppSchemaMarkup } from "@/app/components/schema-markup"
import AppInfoGrid from "@/app/components/app-info-grid"

// Modify the generateMetadata function to include favicon handling
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params

  // Generate the canonical URL for this app - now without the /app/ prefix
  const canonicalUrl = getCanonicalUrl(`/${slug}`)

  // Special case for goa-game-mod-apk
  const canonicalUrlOld =
    slug === "goa-game-mod-apk" ? "https://installmod.com/goa-game-mod-apk" : getCanonicalUrl(`/app/${slug}`)

  // First try to find the app
  const { data: appData } = await supabase
    .from("apps")
    .select(`
      title, description, mod_info, version, publisher, category:categories(name),
      meta_title, meta_description, meta_keywords,
      og_title, og_description, og_type, og_url, og_image,
      twitter_title, twitter_description, twitter_card, twitter_image,
      favicon_url
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  // If not found, try to find the game
  if (!appData) {
    const { data: gameData } = await supabase
      .from("games")
      .select(`
        title, description, mod_info, version, publisher, category:categories(name),
        meta_title, meta_description, meta_keywords,
        og_title, og_description, og_type, og_url, og_image,
        twitter_title, twitter_description, twitter_card, twitter_image,
        favicon_url
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    if (gameData) {
      // Process image URLs if they exist
      const ogImageUrl = gameData.og_image ? getPublicUrl(gameData.og_image, "seo-images") : null
      const twitterImageUrl = gameData.twitter_image ? getPublicUrl(gameData.twitter_image, "seo-images") : null

      // Process favicon URL if it exists
      const faviconUrl = gameData.favicon_url ? getPublicUrl(gameData.favicon_url, "app-icons") : null

      // Create icons array with custom favicon or default
      const icons = faviconUrl
        ? {
            icon: [
              {
                url: faviconUrl,
                sizes: "32x32",
                type: "image/png",
              },
            ],
            shortcut: faviconUrl,
            apple: {
              url: faviconUrl,
              sizes: "180x180",
              type: "image/png",
            },
          }
        : {
            icon: [
              {
                url: "https://locationlive.in/installMOD/favicons/favicon_16x16.png",
                sizes: "16x16",
                type: "image/png",
              },
              {
                url: "https://locationlive.in/installMOD/favicons/favicon_32x32.png",
                sizes: "32x32",
                type: "image/png",
              },
              {
                url: "https://locationlive.in/installMOD/favicons/favicon_96x96.png",
                sizes: "96x96",
                type: "image/png",
              },
            ],
            shortcut: "https://locationlive.in/installMOD/favicons/favicon_32x32.png",
            apple: {
              url: "https://locationlive.in/installMOD/favicons/favicon_180x180.png",
              sizes: "180x180",
              type: "image/png",
            },
          }

      return {
        // Use custom meta title/description if available, otherwise generate them
        title: gameData.meta_title || `${gameData.title} ${gameData.version} MOD APK (${gameData.mod_info})`,
        description:
          gameData.meta_description ||
          `Download ${gameData.title} ${gameData.version} MOD APK with ${gameData.mod_info}. Latest version of this popular ${gameData.category?.name} game modified by InstallMOD.`,
        keywords: gameData.meta_keywords || `${gameData.title}, mod apk, game, android, download, ${gameData.mod_info}`,

        // Add custom favicon or default
        icons,

        // Add canonical URL to metadata
        alternates: {
          canonical: `https://${slug}.installmod.com`,
        },

        // Open Graph metadata
        openGraph: {
          title: gameData.og_title || `${gameData.title} MOD APK (${gameData.mod_info})`,
          description:
            gameData.og_description ||
            `Download ${gameData.title} ${gameData.version} MOD APK with ${gameData.mod_info}. Latest version with premium features unlocked.`,
          type: (gameData.og_type as "website" | "article" | "product" | undefined) || "article",
          url: gameData.og_url || canonicalUrl,
          images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
        },

        // Twitter metadata
        twitter: {
          card:
            (gameData.twitter_card as "summary" | "summary_large_image" | "app" | undefined) || "summary_large_image",
          title: gameData.twitter_title || `${gameData.title} MOD APK - Download Now`,
          description:
            gameData.twitter_description ||
            `Get ${gameData.title} ${gameData.version} with ${gameData.mod_info}. Free download!`,
          images: twitterImageUrl ? [twitterImageUrl] : undefined,
        },
      }
    }
  }

  // Return metadata for app if found
  if (appData) {
    // Process image URLs if they exist
    const ogImageUrl = appData.og_image ? getPublicUrl(appData.og_image, "seo-images") : null
    const twitterImageUrl = appData.twitter_image ? getPublicUrl(appData.twitter_image, "seo-images") : null

    // Process favicon URL if it exists
    const faviconUrl = appData.favicon_url ? getPublicUrl(appData.favicon_url, "app-icons") : null

    // Create icons array with custom favicon or default
    const icons = faviconUrl
      ? {
          icon: [
            {
              url: faviconUrl,
              sizes: "32x32",
              type: "image/png",
            },
          ],
          shortcut: faviconUrl,
          apple: {
            url: faviconUrl,
            sizes: "180x180",
            type: "image/png",
          },
        }
      : {
          icon: [
            {
              url: "https://locationlive.in/installMOD/favicons/favicon_16x16.png",
              sizes: "16x16",
              type: "image/png",
            },
            {
              url: "https://locationlive.in/installMOD/favicons/favicon_32x32.png",
              sizes: "32x32",
              type: "image/png",
            },
            {
              url: "https://locationlive.in/installMOD/favicons/favicon_96x96.png",
              sizes: "96x96",
              type: "image/png",
            },
          ],
          shortcut: "https://locationlive.in/installMOD/favicons/favicon_32x32.png",
          apple: {
            url: "https://locationlive.in/installMOD/favicons/favicon_180x180.png",
            sizes: "180x180",
            type: "image/png",
          },
        }

    return {
      // Use custom meta title/description if available, otherwise generate them
      title: appData.meta_title || `${appData.title} ${appData.version} MOD APK (${appData.mod_info})`,
      description:
        appData.meta_description ||
        `Download ${appData.title} ${appData.version} MOD APK with ${appData.mod_info}. Latest version of this popular ${appData.category?.name} app modified by InstallMOD.`,
      keywords: appData.meta_keywords || `${appData.title}, mod apk, app, android, download, ${appData.mod_info}`,

      // Add custom favicon or default
      icons,

      // Add canonical URL to metadata
      alternates: {
        canonical: `https://${slug}.installmod.com`,
      },

      // Open Graph metadata
      openGraph: {
        title: appData.og_title || `${appData.title} MOD APK (${appData.mod_info})`,
        description:
          appData.og_description ||
          `Download ${appData.title} ${appData.version} MOD APK with ${appData.mod_info}. Latest version with premium features unlocked.`,
        type: (appData.og_type as "website" | "article" | "product" | undefined) || "article",
        url: appData.og_url || canonicalUrl,
        images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
      },

      // Twitter metadata
      twitter: {
        card: (appData.twitter_card as "summary" | "summary_large_image" | "app" | undefined) || "summary_large_image",
        title: appData.twitter_title || `${appData.title} MOD APK - Download Now`,
        description:
          appData.twitter_description ||
          `Get ${appData.title} ${appData.version} with ${appData.mod_info}. Free download!`,
        images: twitterImageUrl ? [twitterImageUrl] : undefined,
      },
    }
  }

  // Fallback metadata
  return {
    title: "App Details - InstallMOD",
    description: "Download the latest modded APK for Android games and apps",
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: [
        {
          url: "https://locationlive.in/installMOD/favicons/favicon_16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: "https://locationlive.in/installMOD/favicons/favicon_32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "https://locationlive.in/installMOD/favicons/favicon_96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
      ],
      shortcut: "https://locationlive.in/installMOD/favicons/favicon_32x32.png",
      apple: {
        url: "https://locationlive.in/installMOD/favicons/favicon_180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    },
  }
}

// Rest of the component remains the same
export default async function AppDetailsPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // First try to find the app
  const { data: appData, error: appError } = await supabase
    .from("apps")
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  // If not found, try to find the game
  let gameData = null
  let gameError = null

  if (!appData) {
    const gameResult = await supabase
      .from("games")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    gameData = gameResult.data
    gameError = gameResult.error
  }

  // If neither found, return 404
  if ((!appData && !gameData) || (appError && gameError)) {
    notFound()
  }

  // Use either app or game data
  const contentData = appData || gameData
  const contentType = appData ? "app" : "game"

  // Fetch mod features
  const { data: modFeatures } = await supabase
    .from("mod_features")
    .select("*")
    .eq("content_id", contentData.id)
    .eq("content_type", contentType)

  // Fetch screenshots
  const { data: screenshots } = await supabase
    .from("screenshots")
    .select("*")
    .eq("content_id", contentData.id)
    .eq("content_type", contentType)
    .order("created_at")

  // Process screenshots to get public URLs
  const processedScreenshots =
    screenshots?.map((screenshot) => ({
      ...screenshot,
      url: screenshot.url, // Store just the path, getPublicUrl will handle the bucket
    })) || []

  // Fetch manually selected related content
  const manualRelatedContent = await fetchManualRelatedContent(contentData.id, contentType)

  let relatedItems = []

  // If manual related content exists, fetch the details for each item
  if (manualRelatedContent && manualRelatedContent.length > 0) {
    // Fetch details for each related item
    const relatedDetails = await Promise.all(
      manualRelatedContent.map(async (relation) => {
        const { data, error } = await supabase
          .from(relation.related_type === "app" ? "apps" : "games")
          .select(`
            *,
            category:categories(name)
          `)
          .eq("id", relation.related_id)
          .eq("status", "published")
          .single()

        if (error || !data) {
          console.error(`Error fetching related ${relation.related_type}:`, error)
          return null
        }

        return {
          ...data,
          content_type: relation.related_type,
        }
      }),
    )

    // Filter out any null values and sort by position
    relatedItems = relatedDetails.filter((item) => item !== null)
  } else {
    // Fallback to automatic related content (same category)
    const { data: autoRelatedItems } = await supabase
      .from(contentType === "app" ? "apps" : "games")
      .select(`
        *,
        category:categories(name)
      `)
      .eq("category_id", contentData.category_id)
      .eq("status", "published")
      .neq("id", contentData.id)
      .order("created_at", { ascending: false })
      .limit(4)

    relatedItems =
      autoRelatedItems?.map((item) => ({
        ...item,
        content_type: contentType,
      })) || []
  }

  // Process related items to get public URLs
  const processedRelatedItems = relatedItems.map((item) => ({
    ...item,
    icon_url: item.icon_url, // Store just the path, getPublicUrl will handle the bucket
  }))

  // Format mod features
  const modFeaturesList = modFeatures?.map((item) => item.feature) || []

  // Extract headings from the article content using the revised utility
  const articleHeadings = extractHeadingsFromHtml(contentData.description)

  // Add IDs to the article content for scroll functionality
  const enhancedDescription = addIdsToHeadings(contentData.description, articleHeadings)

  // Add this after processing screenshots and before the return statement
  const faqData = [
    {
      question: `How to install ${contentData.title} MOD APK?`,
      answer: `Download the ${contentData.title} MOD APK from InstallMOD, enable installation from unknown sources in your device settings, then open the APK file to install.`,
    },
    {
      question: `Is ${contentData.title} MOD APK safe?`,
      answer: `Yes, all MOD APKs on InstallMOD are scanned for viruses and malware before being published. We ensure all apps are safe to download and use.`,
    },
    {
      question: `What features are included in ${contentData.title} MOD APK?`,
      answer: `${contentData.title} MOD APK includes: ${modFeaturesList.join(", ")}.`,
    },
    {
      question: `What are the requirements for ${contentData.title} MOD APK?`,
      answer: `${contentData.title} MOD APK requires Android ${contentData.requirements || "5.0+"} and approximately ${contentData.size || "50MB"} of free storage space.`,
    },
    {
      question: `Is ${contentData.title} MOD APK free?`,
      answer: `Yes, ${contentData.title} MOD APK is completely free to download and use from InstallMOD.`,
    },
  ]

  // Prepare breadcrumb data
  const breadcrumbData = [
    { name: "Home", url: "https://installmod.com" },
    {
      name: contentData.category?.name || "Category",
      url: `https://installmod.com/category/${contentData.category?.slug || ""}`,
    },
    { name: contentData.title, url: `https://${contentData.slug}.installmod.com` },
  ]

  // In the return statement, add the schema markup component right after the opening div
  // Add this right after the first div in the return statement
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Schema Markup */}
      <AppSchemaMarkup app={contentData} faqs={faqData} breadcrumbs={breadcrumbData} />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* New App Details Header */}
            <AppDetailsHeader
              app={{
                id: contentData.id,
                title: contentData.title,
                version: contentData.version,
                mod_info: contentData.mod_info,
                icon_url: contentData.icon_url,
                icon_bg_color: contentData.icon_bg_color || "#3E3E3E",
                updated_at: contentData.updated_at,
                size: contentData.size,
                category: {
                  name: contentData.category?.name || "App",
                  slug: contentData.category?.slug || "",
                },
                rating: 4.5, // Default rating if not available
                total_ratings: 100, // Default count if not available
                download_url: contentData.download_url,
              }}
              contentType={contentType}
            />

            {/* App Basic Info Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">App Information</h2>
              <AppInfoGrid
                appData={{
                  name: contentData.title,
                  version: contentData.version,
                  lastUpdated: new Date(contentData.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  publisher: contentData.publisher,
                  requirements: contentData.requirements || "Android 5.0+",
                  category: contentData.category?.name,
                  categorySlug: contentData.category?.slug,
                  size: contentData.size,
                  googlePlayLink: contentData.google_play_url || "#",
                  rating: contentData.rating || 4.5,
                  totalRatings: contentData.total_ratings || 100,
                }}
              />
            </div>

            {/* MOD Info Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <ModInfoCollapsible features={modFeaturesList} />
            </div>

            {/* Screenshots Section */}
            {processedScreenshots && processedScreenshots.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Screenshots</h2>
                <AppScreenshots screenshots={processedScreenshots} title={contentData.title} />
              </div>
            )}

            {/* Explore This Article */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Explore This Article</h2>
              <ExploreArticle headings={articleHeadings} />
            </div>

            {/* Article Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div
                className="prose prose-red dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: enhancedDescription }}
              />
            </div>

            {/* FAQ Section */}
            <AppFAQ
              name={contentData.title}
              version={contentData.version}
              requirements={contentData.requirements || "5.0+"}
              size={contentData.size || "50 MB"}
              appFeatures={modFeaturesList}
            />

            {/* Related Posts Section */}
            {processedRelatedItems && processedRelatedItems.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Related {contentType === "app" ? "Apps" : "Games"}
                </h2>
                <RelatedApps
                  apps={processedRelatedItems}
                  contentType={contentType}
                  iconBgColor={contentData.icon_bg_color || "#3E3E3E"}
                />
              </div>
            )}

            {/* Comment Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <CommentSection contentId={contentData.id} contentType={contentType} />
            </div>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="lg:col-span-1">{/* Sidebar content can go here */}</div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Telegram Button */}
      <TelegramButton />
    </div>
  )
}
