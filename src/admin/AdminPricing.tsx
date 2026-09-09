import { useCallback, useEffect, useState } from "react"
import { adminUpsertPack, adminUpsertPlan, readRows, type PackRow, type PlanRow } from "./adminApi"
import {
  Badge,
  Card,
  Field,
  inputCls,
  Modal,
  Money,
  Spinner,
  StatusBadge,
  Td,
  Th,
  Toast,
  Toggle,
} from "./ui"

export default function AdminPricing() {
  const [tab, setTab] = useState<"plans" | "packs">("plans")
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [packs, setPacks] = useState<PackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<"plan" | "pack" | null>(null)
  const [editId, setEditId] = useState<string>("")
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        readRows<PlanRow>("plans", "sort"),
        readRows<PackRow>("credit_packs", "sort"),
      ])
      setPlans(p)
      setPacks(c)
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const togglePlan = async (plan: PlanRow, is_active: boolean) => {
    try {
      await adminUpsertPlan({ ...plan, is_active })
      setMsg(is_active ? "Plan activé" : "Plan désactivé")
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }
  const togglePack = async (pack: PackRow, is_active: boolean) => {
    try {
      await adminUpsertPack({ ...pack, is_active })
      setMsg(is_active ? "Pack activé" : "Pack désactivé")
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }

  const openNew = (kind: "plan" | "pack") => {
    setEditing(kind)
    setEditId("")
  }
  const editPlan = (p: PlanRow) => {
    setEditing("plan")
    setEditId(p.id)
  }
  const editPack = (p: PackRow) => {
    setEditing("pack")
    setEditId(p.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Abonnements & Packs</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Tarifs, crédits par période, renouvellement — aucune valeur codée en dur dans le code
          </p>
        </div>
        <button
          onClick={() => openNew(tab === "plans" ? "plan" : "pack")}
          className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold"
        >
          + Nouveau {tab === "plans" ? "plan" : "pack"}
        </button>
      </div>

      <div className="flex gap-1">
        {(["plans", "packs"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all"
            style={{
              color: tab === k ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: tab === k ? "2px solid var(--primary)" : "2px solid transparent",
            }}
          >
            {k === "plans" ? "Abonnements" : "Packs de crédits"}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : tab === "plans" ? (
        <Card>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <Th>Plan</Th>
                  <Th className="text-right">Prix</Th>
                  <Th className="text-right">Cycle (jours)</Th>
                  <Th className="text-right">Crédits / cycle</Th>
                  <Th className="text-center">Renouvellement</Th>
                  <Th>Statut</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <Td>
                      <div>
                        <p className="font-bold">{p.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.slug} · {p.tools_allowed.length} outil(s)</p>
                      </div>
                    </Td>
                    <Td className="text-right"><Money value={p.price_fcfa} /> FCFA</Td>
                    <Td className="text-right">{p.interval_days}</Td>
                    <Td className="text-right">{p.credits_per_period.toLocaleString("fr-FR")}</Td>
                    <Td className="text-center">{p.renew_credits ? "Oui" : "Non"}</Td>
                    <Td><StatusBadge active={p.is_active} /></Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Toggle checked={p.is_active} onChange={(v) => togglePlan(p, v)} />
                        <button onClick={() => editPlan(p)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{ border: "1px solid var(--border)" }}>
                          Modifier
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <Th>Pack</Th>
                  <Th className="text-right">Crédits</Th>
                  <Th className="text-right">Prix</Th>
                  <Th className="text-right">Validité (jours)</Th>
                  <Th>Statut</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {packs.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <Td>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.slug}</p>
                    </Td>
                    <Td className="text-right">{p.credit_amount.toLocaleString("fr-FR")}</Td>
                    <Td className="text-right"><Money value={p.price_fcfa} /> FCFA</Td>
                    <Td className="text-right">{p.valid_days ?? "—"}</Td>
                    <Td><StatusBadge active={p.is_active} /></Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Toggle checked={p.is_active} onChange={(v) => togglePack(p, v)} />
                        <button onClick={() => editPack(p)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{ border: "1px solid var(--border)" }}>
                          Modifier
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editing === "plan" && (
        <PlanModal
          plan={plans.find((p) => p.id === editId) ?? null}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            setMsg("Plan enregistré")
            await load()
          }}
        />
      )}
      {editing === "pack" && (
        <PackModal
          pack={packs.find((p) => p.id === editId) ?? null}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            setMsg("Pack enregistré")
            await load()
          }}
        />
      )}

      <Toast msg={msg} onClose={() => setMsg(null)} />
    </div>
  )
}

function PlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: PlanRow | null
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [form, setForm] = useState({
    slug: plan?.slug ?? "",
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    price_fcfa: plan?.price_fcfa ?? 0,
    interval_days: plan?.interval_days ?? 30,
    credits_per_period: plan?.credits_per_period ?? 0,
    renew_credits: plan?.renew_credits ?? true,
    tools_allowed: JSON.stringify(plan?.tools_allowed ?? [], null, 2),
  })
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    try {
      let tools_allowed: string[]
      try {
        tools_allowed = JSON.parse(form.tools_allowed)
      } catch {
        tools_allowed = []
      }
      await adminUpsertPlan({
        id: plan?.id ?? undefined,
        slug: form.slug,
        name: form.name,
        description: form.description,
        price_fcfa: form.price_fcfa,
        interval_days: form.interval_days,
        credits_per_period: form.credits_per_period,
        renew_credits: form.renew_credits,
        tools_allowed,
      })
      await onSaved()
    } finally {
      setBusy(false)
    }
  }

  const set = (k: keyof typeof form, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Modal open onClose={onClose} title={plan ? `Modifier ${plan.name}` : "Nouvel abonnement"} wide>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Slug"><input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} /></Field>
        <Field label="Nom"><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></Field>
      </div>
      <Field label="Description"><input value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} /></Field>
      <div className="grid grid-cols-3 gap-x-4">
        <Field label="Prix (FCFA)"><input type="number" value={form.price_fcfa} onChange={(e) => set("price_fcfa", Number(e.target.value))} className={inputCls} /></Field>
        <Field label="Cycle (jours)"><input type="number" value={form.interval_days} onChange={(e) => set("interval_days", Number(e.target.value))} className={inputCls} /></Field>
        <Field label="Crédits / cycle"><input type="number" value={form.credits_per_period} onChange={(e) => set("credits_per_period", Number(e.target.value))} className={inputCls} /></Field>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Toggle checked={form.renew_credits} onChange={(v) => set("renew_credits", v)} />
        <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>Renouveler les crédits à chaque cycle</span>
      </div>
      <Field label="Outils autorisés (JSON, slug des ai_tools)">
        <textarea value={form.tools_allowed} onChange={(e) => set("tools_allowed", e.target.value)} rows={5} className={inputCls + " font-mono text-xs"} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold" style={{ border: "1px solid var(--border)" }}>Annuler</button>
        <button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold disabled:opacity-50">
          {busy ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </Modal>
  )
}

function PackModal({
  pack,
  onClose,
  onSaved,
}: {
  pack: PackRow | null
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [form, setForm] = useState({
    slug: pack?.slug ?? "",
    name: pack?.name ?? "",
    credit_amount: pack?.credit_amount ?? 500,
    price_fcfa: pack?.price_fcfa ?? 0,
    valid_days: pack?.valid_days ?? null,
  })
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form, v: string | number | null) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setBusy(true)
    try {
      await adminUpsertPack({
        id: pack?.id ?? undefined,
        slug: form.slug,
        name: form.name,
        credit_amount: Number(form.credit_amount) || 0,
        price_fcfa: Number(form.price_fcfa) || 0,
        valid_days: form.valid_days === null ? null : Number(form.valid_days) || null,
      })
      await onSaved()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={pack ? `Modifier ${pack.name}` : "Nouveau pack de crédits"}>
      <Field label="Slug"><input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} /></Field>
      <Field label="Nom"><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></Field>
      <div className="grid grid-cols-3 gap-x-4">
        <Field label="Crédits"><input type="number" value={form.credit_amount} onChange={(e) => set("credit_amount", Number(e.target.value))} className={inputCls} /></Field>
        <Field label="Prix (FCFA)"><input type="number" value={form.price_fcfa} onChange={(e) => set("price_fcfa", Number(e.target.value))} className={inputCls} /></Field>
        <Field label="Validité (jours)">
          <input type="number" value={form.valid_days ?? ""} onChange={(e) => set("valid_days", e.target.value === "" ? null : Number(e.target.value))} placeholder="Illimitée" className={inputCls} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold" style={{ border: "1px solid var(--border)" }}>Annuler</button>
        <button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold disabled:opacity-50">
          {busy ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </Modal>
  )
}