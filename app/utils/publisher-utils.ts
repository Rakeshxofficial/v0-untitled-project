/**
 * Creates a URL-friendly slug from a publisher name
 */
export function createPublisherSlug(name: string): string {
  if (!name) return ""

  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}
