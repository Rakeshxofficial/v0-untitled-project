import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/app/admin/providers/auth-provider"
import AdminSidebar from "@/app/admin/components/admin-sidebar"
import AdminHeader from "@/app/admin/components/admin-header"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InstallMOD Admin Panel",
  description: "Admin dashboard for managing InstallMOD content",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 min-h-screen`}>
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <AdminHeader />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
