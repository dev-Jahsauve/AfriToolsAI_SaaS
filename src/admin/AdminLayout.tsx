import React from "react"
import { Outlet, Navigate, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCredits } from "../context/CreditsContext"
import { canAdmin, ROLE_LABELS } from "./adminApi"
import { Spinner } from "./ui"

const tabs = [
  { path: "/admin", label: "Tableau de bord", end: true },
  { path: "/admin/utilisateurs", label: "Utilisateurs" },
  { path: "/admin/transactions", label: "Transactions" },
  { path: "/admin/catalogue", label: "Outils & Modèles" },
  { path: "/admin/abonnements", label: "Abonnements & Packs" },
  { path: "/admin/parametres", label: "Paramètres" },
]

export default function AdminLayout() {
  const { isAuthenticated, loading } = useAuth()
  const { summary } = useCredits()
  const location = useLocation()

  if (loading || !summary) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/connexion" replace />

  const role = summary.role
  if (!canAdmin(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--primary-subtle)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" />
              <path d="M10 12l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold mb-2" style={{ color: "var(--text-primary)" }}>Accès restreint</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Cette section est réservée à l'équipe de modération et d'administration.
          </p>
          <Link to="/dashboard" className="inline-block px-6 py-3 rounded-xl gradient-primary text-white text-sm font-bold">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header
        className="sticky top-0 z-40 px-4 md:px-8"
        style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-display font-bold" style={{ color: "var(--text-primary)" }}>
                  Administration <span className="gradient-text">AfriTools AI</span>
                </span>
              </Link>
              <BadgeRole role={role} />
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ border: "1px solid var(--border)" }}
            >
              ← Retour au site
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {tabs.map((t) => {
              const active = t.end
                ? location.pathname === t.path
                : location.pathname.startsWith(t.path)
              return (
                <Link
                  key={t.path}
                  to={t.path}
                  className="px-4 py-2.5 text-sm font-bold whitespace-nowrap rounded-t-xl transition-all"
                  style={{
                    color: active ? "var(--primary)" : "var(--text-secondary)",
                    borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                  }}
                >
                  {t.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}

function BadgeRole({ role }: { role: string }) {
  const tone = role === "super_admin" ? "violet" : role === "admin" ? "blue" : "amber"
  const _ = ROLE_LABELS
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{
        backgroundColor: tone === "violet" ? "#EDE9FE" : tone === "blue" ? "#DBEAFE" : "#FEF3C7",
        color: tone === "violet" ? "#6D28D9" : tone === "blue" ? "#1D4ED8" : "#B45309",
      }}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}