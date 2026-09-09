import { useEffect, useState } from "react"
import { adminSetSetting, readRows } from "./adminApi"
import { Card, CardHeader, Field, inputCls, Spinner, Toast, Toggle, fmtDateTime } from "./ui"

interface SettingRow {
  key: string
  value: Record<string, unknown>
  updated_by: string | null
  updated_at: string
}

const KNOWN_KEYS = ["daily_free_credits", "payment_provider", "ai_default_model"] as const

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setSettings(await readRows<SettingRow>("app_settings"))
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const get = (key: string): SettingRow | undefined => settings.find((s) => s.key === key)

  const daily = get("daily_free_credits")?.value as
    | { enabled?: boolean; quantity?: number; reset_interval_hours?: number; tools?: string[] }
    | undefined

  const save = async (key: string, value: unknown) => {
    setBusy(true)
    try {
      await adminSetSetting(key, value)
      setMsg("Réglage enregistré")
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Paramètres</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Configuration commerciale centralisée côté serveur (pas de valeur codée en dur)
        </p>
      </div>
      {busy && (
        <p className="text-xs font-bold" style={{ color: "var(--primary)" }}>Enregistrement en cours...</p>
      )}

      <Card>
        <CardHeader
          title="Crédits gratuits quotidiens"
          subtitle="Offre automatique pour les utilisateurs, configurable à tout moment"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Quantité par récupération">
            <input
              type="number"
              min={0}
              defaultValue={daily?.quantity ?? 5}
              onBlur={(e) => save("daily_free_credits", { ...daily, quantity: Number(e.target.value) || 0 })}
              className={inputCls}
            />
          </Field>
          <Field label="Intervalle de renouvellement (heures)">
            <input
              type="number"
              min={1}
              defaultValue={daily?.reset_interval_hours ?? 24}
              onBlur={(e) => save("daily_free_credits", { ...daily, reset_interval_hours: Number(e.target.value) || 24 })}
              className={inputCls}
            />
          </Field>
          <div className="flex items-center gap-2 pt-7">
            <Toggle checked={daily?.enabled ?? false} onChange={(v) => save("daily_free_credits", { ...daily, enabled: v })} />
            <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>Offre activée</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Paiements"
          subtitle="Intégration en préparation — clés et validation restent côté serveur (webhook)"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
            Fournisseur de paiement :
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold" style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary)" }}>
            {String(get("payment_provider")?.value?.name ?? "non configuré")}
          </span>
          <p className="text-xs w-full" style={{ color: "var(--text-muted)" }}>
            Le webhook <code>/functions/v1/payment-webhook</code> est prêt. Une fois l'opérateur choisi (Mobile Money, carte...),
            les clés de signature seront définies via <code>supabase secrets set</code>.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Réglages connus" subtitle={`${settings.length} paramètre(s) actuellement en base`} />
        <div className="space-y-3">
          {settings.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
              <div className="min-w-0">
                <p className="text-sm font-bold">{s.key}</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Modifié {fmtDateTime(s.updated_at)} {KNOWN_KEYS.includes(s.key as (typeof KNOWN_KEYS)[number]) ? "" : "· clé personnalisée"}
                </p>
              </div>
              <pre className="text-[11px] max-w-[55%] truncate overflow-x-auto">
                {JSON.stringify(s.value)}
              </pre>
            </div>
          ))}
          {settings.length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Aucun paramètre — la migration n'a pas encore été appliquée au projet Supabase.
            </p>
          )}
        </div>
      </Card>

      <Toast msg={msg} onClose={() => setMsg(null)} />
    </div>
  )
}