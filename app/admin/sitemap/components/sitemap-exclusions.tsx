"use client"

import type React from "react"

import { useState } from "react"
import { addSitemapExclusion, deleteSitemapExclusion, type SitemapExclusion } from "@/app/actions/sitemap-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

interface SitemapExclusionsProps {
  exclusions: SitemapExclusion[]
  onExclusionChange: () => void
}

export default function SitemapExclusions({ exclusions, onExclusionChange }: SitemapExclusionsProps) {
  const [urlPattern, setUrlPattern] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!urlPattern.trim()) {
      toast({
        title: "Error",
        description: "URL pattern is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await addSitemapExclusion({
        url_pattern: urlPattern,
        reason,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "URL pattern added to exclusions",
        })
        setUrlPattern("")
        setReason("")
        onExclusionChange()
      } else {
        toast({
          title: "Error",
          description: "Failed to add URL exclusion",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding URL exclusion:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteSitemapExclusion(id)

      if (result.success) {
        toast({
          title: "Success",
          description: "URL exclusion removed",
        })
        onExclusionChange()
      } else {
        toast({
          title: "Error",
          description: "Failed to remove URL exclusion",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing URL exclusion:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>URL Exclusions</CardTitle>
        <CardDescription>
          Add URL patterns to exclude from the sitemap. You can use wildcards like * for pattern matching.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url-pattern" className="text-sm font-medium">
              URL Pattern
            </label>
            <Input
              id="url-pattern"
              placeholder="e.g., /admin/* or https://example.com/temp-*"
              value={urlPattern}
              onChange={(e) => setUrlPattern(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason (Optional)
            </label>
            <Textarea
              id="reason"
              placeholder="Why should this URL pattern be excluded?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Exclusion"}
          </Button>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Current Exclusions</h3>
          {exclusions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No URL exclusions configured</p>
          ) : (
            <div className="space-y-2">
              {exclusions.map((exclusion) => (
                <div key={exclusion.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">{exclusion.url_pattern}</p>
                    {exclusion.reason && <p className="text-xs text-muted-foreground">{exclusion.reason}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exclusion.id!)}
                    aria-label="Remove exclusion"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
