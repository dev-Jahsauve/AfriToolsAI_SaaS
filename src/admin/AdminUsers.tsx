import { useCallback, useEffect, useState } from "react"
import {
  adminGetUsers,
  adminSetRole,
  adminSetBypass,
  adminSetStatus,
  adminGrantCredits,
  ROLE_LABELS,
  type AdminUser,
} from "./adminApi"
import { Badge, Card, Field, inputCls, Modal, Pagination, Spinner, StatusBadge, Td, Th, Toast } from "./ui"

export default function AdminUsers() {
  const [rows, setRows] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [grant, setGrant] = useState<AdminUser | null>(null)
  const [grantAmount, setGrantAmount] = useState("10")
  const [grantReason, setGrantReason] = useState("Ajustement manuel")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const pageSize = 20

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400)
    return () => clearTimeout(t)
  }, [search])
  useEffect(() => setPage(0), [debounced])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminGetUsers(debounced, page, pageSize)
      setRows(res.rows)
      setTotal(res.total)
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [debounced, page])

  useEffect(() => {
    load()
  }, [load])

  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(true)
    try {
      await fn()
      setMsg(okMsg)
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Utilisateurs</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Recherche, rôles, accès et crédits</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher (nom, prénom, email)..."
          className={`${inputCls} max-w-xs`}
        />
      </div>

      {busy && <Spinner size={18} />}

      <Card>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <Th>Utilisateur</Th>
                <Th>Plan</Th>
                <Th>Crédits</Th>
                <Th>Rôle</Th>
                <Th>Statut</Th>
                <Th>Bypass</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <Spinner size={20} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <UserRow
                    key={u.id}
                    u={u}
                    onSetRole={(role) => run(() => adminSetRole(u.id, role), "Rôle mis à jour")}
                    onBypass={(v) => run(() => adminSetBypass(u.id, v), "Bypass mis à jour")}
                    onStatus={(s) => run(() => adminSetStatus(u.id, s), s === "suspended" ? "Utilisateur suspendu" : "Utilisateur réactivé")}
                    onGrant={() => {
                      setGrantAmount("10")
                      setGrantReason("Ajustement manuel")
                      setGrant(u)
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
          {!loading && rows.length > 0 && (
            <Pagination page={page} total={total} pageSize={pageSize} onPage={setPage} />
          )}
        </div>
      </Card>

      <Modal open={!!grant} onClose={() => setGrant(null)} title={`Allouer des crédits — ${grant?.prenom ?? ""} ${grant?.nom ?? ""}`}>
        <Field label="Montant (crédits)">
          <input type="number" min={1} value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Motif">
          <input value={grantReason} onChange={(e) => setGrantReason(e.target.value)} className={inputCls} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setGrant(null)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ border: "1px solid var(--border)" }}
          >
            Annuler
          </button>
          <button
            onClick={async () => {
              if (!grant) return
              try {
                await adminGrantCredits(grant.id, Number(grantAmount), grantReason || "Ajustement manuel")
                setGrant(null)
                setMsg("Crédits alloués")
                await load()
              } catch (e) {
                setMsg((e as Error).message)
              }
            }}
            className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold"
          >
            Allouer
          </button>
        </div>
      </Modal>

      <Toast msg={msg} onClose={() => setMsg(null)} />
    </div>
  )
}

function UserRow({
  u,
  onSetRole,
  onBypass,
  onStatus,
  onGrant,
}: {
  u: AdminUser
  onSetRole: (role: string) => void
  onBypass: (v: boolean) => void
  onStatus: (s: string) => void
  onGrant: () => void
}) {
  const suspended = u.status === "suspended"
  return (
    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <Td>
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {(u.prenom?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">{u.prenom} {u.nom}</p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{u.email}</p>
          </div>
        </div>
      </Td>
      <Td><Badge tone="violet">{u.plan_id ?? "gratuit"}</Badge></Td>
      <Td>{u.balance?.toLocaleString("fr-FR") ?? 0}</Td>
      <Td>
        <select
          value={u.role ?? "user"}
          onChange={(e) => onSetRole(e.target.value)}
          className="px-2 py-1.5 rounded-lg text-xs font-bold bg-transparent"
          style={{ border: "1px solid var(--border)" }}
        >
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Td>
      <Td>
        {suspended ? (
          <Badge tone="red">Suspendu</Badge>
        ) : (
          <StatusBadge active />
        )}
      </Td>
      <Td>
        <button
          onClick={() => onBypass(!u.admin_bypass)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${u.admin_bypass ? "gradient-primary text-white" : ""}`}
          style={u.admin_bypass ? undefined : { border: "1px solid var(--border)" }}
        >
          {u.admin_bypass ? "Actif" : "Désactivé"}
        </button>
      </Td>
      <Td className="text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {!suspended && (
            <button
              onClick={() => onStatus("suspended")}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
              style={{ border: "1px solid #FECACA", color: "#B91C1C" }}
            >
              Suspendre
            </button>
          )}
          {suspended && (
            <button
              onClick={() => onStatus("active")}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
              style={{ border: "1px solid #BBF7D0", color: "#15803D" }}
            >
              Réactiver
            </button>
          )}
          <button
            onClick={onGrant}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold gradient-primary text-white"
          >
            + Crédits
          </button>
        </div>
      </Td>
    </tr>
  )
}