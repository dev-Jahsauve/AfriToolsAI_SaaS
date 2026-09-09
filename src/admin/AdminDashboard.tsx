import { useEffect, useState } from "react"
import { adminGetStats, type AdminStats } from "./adminApi"
import { Card, CardHeader, Money, Spinner, Badge, fmtDateTime } from "./ui"

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <Card>
        <p className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>Impossible de charger les statistiques : {error}</p>
      </Card>
    )
  }
  if (!stats) return <Spinner />

  const cards = [
    { label: "Utilisateurs", value: stats.users.toLocaleString("fr-FR"), icon: UsersIcon, tone: "#4F46E5" },
    { label: "Générations complétées", value: stats.generations.toLocaleString("fr-FR"), icon: SparkIcon, tone: "#7C3AED" },
    { label: "Générations aujourd'hui", value: stats.generations_today.toLocaleString("fr-FR"), icon: BoltIcon, tone: "#F59E0B" },
    { label: "Crédits en circulation", value: stats.credits_outstanding.toLocaleString("fr-FR"), icon: CoinsIcon, tone: "#10B981" },
    { label: "Abonnements actifs", value: stats.active_subscriptions.toLocaleString("fr-FR"), icon: StarIcon, tone: "#3B82F6" },
    { label: "Revenus (FCFA)", value: <Money value={stats.revenue_fcfa} />, icon: MoneyIcon, tone: "#059669" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Tableau de bord</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Vue d'ensemble de la plateforme AfriTools AI</p>
        </div>
        <Badge tone="blue">Mise à jour {fmtDateTime(new Date().toISOString())}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label} className="card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>{c.label}</p>
                  <p className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.tone}18` }}>
                  <Icon color={c.tone} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader
          title="Bonnes pratiques"
          subtitle="Actions recommandées avant de lancer la production"
        />
        <ul className="space-y-3 text-sm">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold gradient-primary text-white">
                {i + 1}
              </span>
              <span style={{ color: "var(--text-secondary)" }}>{s}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

const steps = [
  "Définissez le premier Super Admin : insérez dans la table user_accounts votre user_id avec le rôle super_admin (ou via l'onglet Utilisateurs d'un admin existant).",
  "Activez un modèle IA (Gemini / Veo) dans « Outils & Modèles » pour brancher les générations réelles.",
  "Configurez les crédits gratuits quotidiens et les tarifs dans « Paramètres » et « Abonnements & Packs ».",
  "Mettez en place le fournisseur de paiement (les webhooks sont déjà préparés côté serveur).",
]

function UsersIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
function SparkIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.8 5.4L19 9.2l-5.2 1.8L12 16l-1.8-5L5 9.2l5.2-1.8L12 2zM19 15l.9 2.7L22 18.6l-2.1.9L19 22l-.9-2.5L16 18.6l2.1-.9L19 15z" />
    </svg>
  )
}
function BoltIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}
function CoinsIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1110.34 18" /><path d="M7 6h1v4" /><path d="M16.71 13.88l.7.71-2.82 2.82" />
    </svg>
  )
}
function StarIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}
function MoneyIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}