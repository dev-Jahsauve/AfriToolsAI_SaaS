import { useState } from "react"

import { Outlet, Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

import Sidebar from "../components/Sidebar"

export default function DashboardLayout() {
  const { isAuthenticated, loading } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return null

  if (!isAuthenticated) return <Navigate to="/connexion" replace />

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex flex-col w-64 shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3"
          style={{
            backgroundColor: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="4" y1="8" x2="20" y2="8" />
              <line x1="4" y1="16" x2="20" y2="16" />
            </svg>
          </button>
          <span
            className="font-display font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            AfriTools <span className="gradient-text">AI</span>
          </span>
          <div className="w-8" />
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
