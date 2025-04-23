"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Gamepad2,
  FileText,
  Tag,
  MessageSquare,
  BarChart3,
  Settings,
  Database,
  Bell,
  Users,
  Link2,
  Menu,
  X,
  FileTextIcon as FileText2,
  AlertTriangle,
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 lg:w-72`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-6 px-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">InstallMOD Admin</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your content</p>
          </div>
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/admin"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin") && !isActive("/admin/apps") && !isActive("/admin/games")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>

            <li className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Content Management
              </h3>
            </li>
            <li>
              <Link
                href="/admin/apps"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/apps")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Package className="w-5 h-5 mr-3" />
                <span>Apps</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/games"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/games")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Gamepad2 className="w-5 h-5 mr-3" />
                <span>Games</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/blogs"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/blogs")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <FileText className="w-5 h-5 mr-3" />
                <span>Blogs</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/publishers"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/publishers")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Users className="w-5 h-5 mr-3" />
                <span>Publishers</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/related-content"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/related-content")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Link2 className="w-5 h-5 mr-3" />
                <span>Related Content</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories/apps-games"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/categories/apps-games")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Tag className="w-5 h-5 mr-3" />
                <span>App/Game Categories</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories/blogs"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/categories/blogs")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Tag className="w-5 h-5 mr-3" />
                <span>Blog Categories</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/comments"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/comments")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                <span>Comments</span>
              </Link>
            </li>

            <li className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Homepage Management
              </h3>
            </li>
            <li>
              <Link
                href="/admin/homepage/latest-apps"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/homepage/latest-apps")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Package className="w-5 h-5 mr-3" />
                <span>Latest Apps</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/homepage/trending-apps"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/homepage/trending-apps")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Package className="w-5 h-5 mr-3" />
                <span>Trending Apps</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/task-popup"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/task-popup")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Bell className="w-5 h-5 mr-3" />
                <span>Task Popup</span>
              </Link>
            </li>

            <li className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                System
              </h3>
            </li>
            <li>
              <Link
                href="/admin/analytics"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/analytics")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                <span>Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/sitemap"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/sitemap")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <FileText2 className="w-5 h-5 mr-3" />
                <span>Sitemap</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/storage"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/storage")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Database className="w-5 h-5 mr-3" />
                <span>Storage</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/settings")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/error-logs"
                className={`flex items-center p-2 rounded-lg ${
                  isActive("/admin/error-logs")
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <AlertTriangle className="w-5 h-5 mr-3" />
                <span>Error Logs</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}
