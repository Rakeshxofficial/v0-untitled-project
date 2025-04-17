import Link from "next/link"
import { MessageCircle } from "lucide-react"

export default function TelegramButton() {
  return (
    <Link
      href="https://telegram.me/installMODbot"
      className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 z-50 group"
      aria-label="Chat with our Telegram bot"
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <span className="sr-only">Chat with InstallMOD Telegram Bot</span>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity -z-10"></div>
    </Link>
  )
}
