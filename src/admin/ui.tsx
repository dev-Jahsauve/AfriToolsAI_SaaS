import React, { useEffect, useState } from "react"

export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-12">
      <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
        <path d="M12 2a10 10 0 0110 10" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="text-base font-display font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

const tones: Record<string, { bg: string; fg: string }> = {
  green: { bg: "#DCFCE7", fg: "#15803D" },
  red: { bg: "#FEE2E2", fg: "#B91C1C" },
  amber: { bg: "#FEF3C7", fg: "#B45309" },
  blue: { bg: "#DBEAFE", fg: "#1D4ED8" },
  violet: { bg: "#EDE9FE", fg: "#6D28D9" },
  slate: { bg: "#F1F5F9", fg: "#475569" },
}

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  const t = tones[tone] ?? tones.slate
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ active }: { active: boolean }) {
  return active ? <Badge tone="green">Actif</Badge> : <Badge tone="slate">Inactif</Badge>
}

export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`w-10 h-5.5 rounded-full transition-colors disabled:opacity-50 ${checked ? "gradient-primary" : ""}`}
      style={checked ? undefined : { backgroundColor: "var(--border)" }}
      aria-pressed={checked}
    >
      <span
        className="block w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(21px)" : "translateX(3px)" }}
      />
    </button>
  )
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>{label}</span>
      {children}
      {hint && <span className="block text-xs mt-1" style={{ color: "var(--text-muted)" }}>{hint}</span>}
    </label>
  )
}

export const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all"

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-2xl p-6 animate-fade-in`}
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-hover)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-display font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[--primary-subtle]" style={{ color: "var(--text-muted)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toast({ msg, onClose }: { msg: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [msg, onClose])
  if (!msg) return null
  return (
    <div className="fixed bottom-5 right-5 z-[80] px-4 py-3 rounded-xl text-sm font-bold text-white gradient-primary shadow-lg animate-fade-in">
      {msg}
    </div>
  )
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  return { msg, setMsg, Toast: <Toast msg={msg} onClose={() => setMsg(null)} /> }
}

export function Money({ value }: { value: number }) {
  return <span className="font-bold tabular-nums">{value.toLocaleString("fr-FR")}</span>
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${className}`} style={{ color: "var(--text-muted)" }}>
      {children}
    </th>
  )
}

export function Td({ children, className = "", style }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <td className={`px-4 py-3 text-sm align-middle ${className}`} style={{ color: "var(--text-primary)", ...style }}>
      {children}
    </td>
  )
}

export function Pagination({
  page,
  total,
  pageSize,
  onPage,
}: {
  page: number
  total: number
  pageSize: number
  onPage: (p: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        {total} résultat{total > 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
          style={{ border: "1px solid var(--border)" }}
        >
          Précédent
        </button>
        <span className="px-3 py-1.5 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
          {page + 1} / {pages}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages - 1}
          className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
          style={{ border: "1px solid var(--border)" }}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}