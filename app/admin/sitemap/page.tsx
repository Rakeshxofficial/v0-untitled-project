import { Suspense } from "react"
import type { Metadata } from "next"
import { getCustomSitemapEntries, getSitemapExclusions, triggerSitemapRefresh } from "@/app/actions/sitemap-actions"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import AddSitemapEntryForm from "./components/add-sitemap-entry-form"
import SitemapEntriesTable from "./components/sitemap-entries-table"
import SitemapExclusions from "./components/sitemap-exclusions"
import { robotsPresets } from "@/lib/robots-utils"

export const metadata: Metadata = {
  title: "Sitemap Management",
  description: "Manage your website sitemap",
  ...robotsPresets.admin,
}

async function SitemapManagementContent() {
  const { data: entries = [] } = await getCustomSitemapEntries()
  const { data: exclusions = [] } = await getSitemapExclusions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sitemap Management</h1>
          <p className="text-muted-foreground">Manage your website's sitemap entries and control what gets included</p>
        </div>
        <form action={triggerSitemapRefresh}>
          <Button type="submit" variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Sitemap
          </Button>
        </form>
      </div>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries">Custom Entries</TabsTrigger>
          <TabsTrigger value="exclusions">URL Exclusions</TabsTrigger>
          <TabsTrigger value="add">Add New Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Sitemap Entries</CardTitle>
              <CardDescription>Manage URLs that have been manually added to your sitemap</CardDescription>
            </CardHeader>
            <CardContent>
              <SitemapEntriesTable
                entries={entries}
                onEntryChange={async () => {
                  "use server"
                  // This is a server action that will be called when an entry is changed
                  // It's used to refresh the data on the page
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exclusions">
          <SitemapExclusions
            exclusions={exclusions}
            onExclusionChange={async () => {
              "use server"
              // This is a server action that will be called when an exclusion is changed
              // It's used to refresh the data on the page
            }}
          />
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Sitemap Entry</CardTitle>
              <CardDescription>Manually add a new URL to your sitemap</CardDescription>
            </CardHeader>
            <CardContent>
              <AddSitemapEntryForm
                onSuccess={async () => {
                  "use server"
                  // This is a server action that will be called when a new entry is added
                  // It's used to refresh the data on the page
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Sitemap Information</CardTitle>
          <CardDescription>Details about your sitemap configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Sitemap URL</h3>
              <p className="text-sm mt-1">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://installmod.com"}/sitemap.xml
                </a>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Custom Entries</h3>
              <p className="text-sm mt-1">{entries.length} custom URLs in sitemap</p>
            </div>

            <div>
              <h3 className="text-sm font-medium">URL Exclusions</h3>
              <p className="text-sm mt-1">{exclusions.length} URL patterns excluded from sitemap</p>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>The sitemap is automatically generated and includes:</p>
              <ul className="list-disc list-inside mt-1 ml-2">
                <li>All published apps and games</li>
                <li>All published blog posts</li>
                <li>All categories and tags</li>
                <li>Static pages like About Us, Contact, etc.</li>
                <li>Any custom URLs added through this interface</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SitemapManagementPage() {
  return (
    <Suspense fallback={<div>Loading sitemap management...</div>}>
      <SitemapManagementContent />
    </Suspense>
  )
}
