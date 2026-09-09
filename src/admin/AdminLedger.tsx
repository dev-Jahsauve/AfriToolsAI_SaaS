import { useCallback, useEffect, useState } from "react"
import { adminGetLedger, OP_TYPE_LABELS, type LedgerEntry } from "./adminApi"
import { Badge, Card, Pagination, Spinner, Td, Th, Toast, fmtDateTime } from "./ui"

const typeTone: Record<string, "green" | "red" | "blue" | "amber" | "violet" | "slate"> = {
  consumption: "red",
  purchase: "green",
  daily_grant: "blue",
  subscription_grant: "blue",
  bonus: "green",
  refund: "amber",
  reversal: "amber",
  admin_adjust: "violet",
  system: "slate",
}

export default function AdminLedger() {
  const [rows, setRows] = useState<LedgerEntry[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [userId, setUserId] = useState("")
  const pageSize = 30

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await adminGetLedger(userId.trim() || null, page, pageSize))
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [userId, page])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Comptabilité des crédits — historique complet et traçable
          </p>
        </div>
        <input
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value)
            setPage(0)
          }}
          placeholder="Filtrer par ID utilisateur (uuid)..."
          className="px-3.5 py-2.5 rounded-xl border text-sm font-semibold max-w-xs"
        />
      </div>

      <Card>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Utilisateur</Th>
                <Th>Détail</Th>
                <Th className="text-right">Montant</Th>
                <Th className="text-right">Solde après</Th>
                <Th>Statut</Th>
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
                    Aucune transaction.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <Td className="whitespace-nowrap">{fmtDateTime(r.created_at)}</Td>
                    <Td><Badge tone={typeTone[r.op_type] ?? "slate"}>{OP_TYPE_LABELS[r.op_type] ?? r.op_type}</Badge></Td>
                    <Td className="whitespace-nowrap">{(r.user_id ?? "").slice(0, 8)}…</Td>
                    <Td>
                      <p className="font-semibold max-w-[220px] truncate">{r.reason ?? r.source ?? "—"}</p>
                      {r.tool_name && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.tool_name}{r.model_label ? ` · ${r.model_label}` : ""}</p>}
                    </Td>
                    <Td className="text-right font-bold" style={{ color: r.amount < 0 ? "#DC2626" : "#059669" }}>
                      {r.amount > 0 ? "+" : ""}{r.amount.toLocaleString("fr-FR")}
                    </Td>
                    <Td className="text-right tabular-nums">{r.balance_after?.toLocaleString("fr-FR") ?? "—"}</Td>
                    <Td>
                      {r.status === "completed" ? (
                        <Badge tone="green">OK</Badge>
                      ) : r.status === "refunded" ? (
                        <Badge tone="amber">Remboursé</Badge>
                      ) : r.status === "failed" ? (
                        <Badge tone="red">Échec</Badge>
                      ) : (
                        <Badge>{r.status}</Badge>
                      )}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && rows.length > 0 && (
            <Pagination page={page} total={rows.length >= pageSize ? (page + 2) * pageSize : (page + 1) * pageSize} pageSize={pageSize} onPage={setPage} />
          )}
        </div>
      </Card>

      <Toast msg={msg} onClose={() => setMsg(null)} />
    </div>
  )
}