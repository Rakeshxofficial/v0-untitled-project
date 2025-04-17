import type { Metadata } from "next"
import GameCategoriesClient from "./GameCategoriesClient"

export const metadata: Metadata = {
  title: "Game Categories | installMOD",
  description: "Browse all game categories available on installMOD. Find and download modified games by category.",
}

export default function GameCategoriesPage() {
  return <GameCategoriesClient />
}
