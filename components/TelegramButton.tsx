import Link from "next/link"
import { MessageCircle } from "lucide-react"

export default function TelegramButton() {
  return (
    <Link
      href="https://t.me/getmodsapk"
      className="fixed bottom-6 right-6 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-50"
      aria-label="Join our Telegram channel"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </Link>
  )
}
