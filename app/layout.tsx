import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import { ThemeProvider } from "@/components/theme-provider"
// Removed CanonicalTag import
import { ToastProvider } from "@/components/ui/use-toast"
import Script from "next/script"
import { generateWebsiteSchema, generateOrganizationSchema, SchemaMarkupScript } from "@/app/components/schema-markup"

const inter = Inter({ subsets: ["latin"] })

const GA_TRACKING_ID = "G-E8RZ8Z3S1Y"

export const metadata: Metadata = {
  metadataBase: new URL("https://installmod.com"), // Ensures relative canonicals resolve correctly
  title: {
    default: "InstallMOD - Download & Enjoy Modded APKs",
    template: "%s",
  },
  description:
    "Download the latest modded APKs for Android games and apps with premium features unlocked, no ads, and enhanced functionality.",
  alternates: {
    canonical: "/", // Sets the canonical URL for the homepage to https://installmod.com/
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
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseSchema = [
    generateWebsiteSchema({
      name: "InstallMOD",
      url: "https://installmod.com",
      description:
        "Download the latest modded APKs for Android games and apps with premium features unlocked, no ads, and enhanced functionality.",
    }),
    generateOrganizationSchema({
      name: "InstallMOD",
      url: "https://installmod.com",
      logo: "https://installmod.com/logo.png",
      description: "InstallMOD provides modded APKs for Android games and apps with premium features unlocked.",
      sameAs: ["https://twitter.com/installmod", "https://facebook.com/installmod", "https://t.me/installmod"],
    }),
  ]

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* CanonicalTag component removed, handled by metadata object */}
        <SchemaMarkupScript schemas={baseSchema} />
        <link rel="icon" type="image/x-icon" href="https://locationlive.in/installMOD/favicons/favicon_32x32.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (!window.location.pathname.startsWith('/admin')) {
                  const adsenseScript = document.createElement('script');
                  adsenseScript.async = true;
                  adsenseScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4858972826245644";
                  adsenseScript.crossOrigin = "anonymous";
                  document.head.appendChild(adsenseScript);
                }
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
        // Disable Next.js client-side navigation
        window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
        window.__NEXT_DATA__.props = window.__NEXT_DATA__.props || {};
        window.__NEXT_DATA__.props.pageProps = window.__NEXT_DATA__.props.pageProps || {};
        window.__NEXT_DATA__.props.pageProps.__N_SSG = false;
        
        // Override Next.js router to force full page loads
        if (window.next && window.next.router) {
          window.next.router.push = function(url) { window.location.href = url; };
          window.next.router.replace = function(url) { window.location.href = url; };
        }
        
        // Disable prefetching
        document.addEventListener('DOMContentLoaded', function() {
          const links = document.querySelectorAll('a[href^="/"]');
          links.forEach(link => {
            link.setAttribute('data-no-prefetch', 'true');
          });
        });
        `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
        // Force full page reloads for all internal links
        document.addEventListener('click', function(e) {
          let target = e.target;
          while (target && target.tagName !== 'A') {
            target = target.parentNode;
            if (!target) return;
          }
          
          if (target.href && target.href.startsWith(window.location.origin)) {
            e.preventDefault();
            window.location.href = target.href;
          }
        }, true);
        `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
