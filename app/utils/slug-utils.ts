/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
}

/**
 * Creates a full app slug with category and app name
 * @param title The app/game title
 * @param category The app/game category
 * @returns A URL-friendly slug including category
 */
export function createAppSlug(title: string, category: string): string {
  const categorySlug = createSlug(category)
  const titleSlug = createSlug(title)

  // Combine slugs and ensure no consecutive hyphens
  return `${titleSlug}-${categorySlug}-mod-apk`.replace(/-+/g, "-")
}

/**
 * Creates a slug specific for blog posts
 * @param title The blog post title
 * @param id Optional ID to append for uniqueness
 * @returns A URL-friendly slug
 */
export function createBlogSlug(title: string, id?: string): string {
  const baseSlug = createSlug(title)

  // If an ID is provided, append a short version to ensure uniqueness
  if (id) {
    const shortId = id.slice(0, 8)
    // Ensure no consecutive hyphens when combining slug and ID
    return `${baseSlug}-${shortId}`.replace(/-+/g, "-")
  }

  return baseSlug
}

/**
 * Validates if a given string is a valid slug
 * @param slug The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug)
}
