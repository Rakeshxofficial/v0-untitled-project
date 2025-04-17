/**
 * Gets the canonical URL for a given path
 * @param path The current path
 * @returns The canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = "https://installmod.com"

  // Special cases for specific URLs
  if (path === "/goa-game-mod-apk" || path === "/app/goa-game-mod-apk") {
    return `https://goa-game-mod-apk.installmod.com`
  }

  if (
    path === "/jalwa-game-app-colour-prediction-start-your-earnings-journey-today" ||
    path === "/blog/jalwa-game-app-colour-prediction-start-your-earnings-journey-today"
  ) {
    return `${baseUrl}/jalwa-game-app-colour-prediction-start-your-earnings-journey-today`
  }

  // Handle app/game paths for subdomain canonical URLs
  if (path.startsWith("/app/")) {
    const slug = path.replace("/app/", "")
    return `https://${slug}.installmod.com`
  }

  // For other paths, keep the existing logic
  let cleanPath = path
  if (path.startsWith("/blog/")) {
    cleanPath = path.replace("/blog/", "/")
  }

  // Ensure the path starts with a slash
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`
  }

  return `${baseUrl}${cleanPath}`
}
