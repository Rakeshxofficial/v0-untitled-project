import type { Heading } from "@/app/components/explore-article"

/**
 * Extracts headings (h1-h6) from HTML content using regex
 * @param htmlContent The HTML content to extract headings from
 * @returns Array of heading objects with id, text, and level
 */
export function extractHeadingsFromHtml(htmlContent: string): Heading[] {
  const headings: Heading[] = []

  // Regex to match heading tags and their content
  const headingRegex = /<h([1-6])(?:[^>]*)>(.*?)<\/h\1>/gi

  // Find all matches
  let match
  let index = 0

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = Number.parseInt(match[1], 10)
    const text = stripHtmlTags(match[2]).trim()
    const id = `heading-${index}`

    headings.push({
      id,
      text,
      level,
    })

    index++
  }

  return headings
}

/**
 * Strips HTML tags from a string
 * @param html String containing HTML
 * @returns Plain text without HTML tags
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, "")
}

/**
 * Adds IDs to heading tags in HTML content
 * @param htmlContent Original HTML content
 * @param headings Array of heading objects with IDs
 * @returns HTML content with IDs added to heading tags
 */
export function addIdsToHeadings(htmlContent: string, headings: Heading[]): string {
  let modifiedContent = htmlContent
  let index = 0

  // Regex to match heading tags
  const headingRegex = /<h([1-6])(?:[^>]*)>(.*?)<\/h\1>/gi

  // Replace each heading with a version that includes an ID
  modifiedContent = modifiedContent.replace(headingRegex, (match, level, content) => {
    if (index < headings.length) {
      const result = `<h${level} id="${headings[index].id}">${content}</h${level}>`
      index++
      return result
    }
    return match
  })

  return modifiedContent
}
