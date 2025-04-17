// Global type declarations for the application

// Google Analytics
interface Window {
  gtag: (command: "config" | "event" | "js" | "set", targetId: string, config?: Record<string, any> | Date) => void
  dataLayer: any[]
}
