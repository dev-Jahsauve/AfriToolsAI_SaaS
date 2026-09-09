import { useCallback, useEffect, useState } from "react"
import {
  adminUpsertModel,
  adminUpsertTool,
  readRows,
  type ModelRow,
  type ToolRow,
} from "./adminApi"
import {
  Badge,
  Card,
  Field,
  inputCls,
  Modal,
  Spinner,
  StatusBadge,
  Toast,
  Toggle,
} from "./ui"

type TabKey = "tools" | "models"

export default function AdminCatalog() {
  const [tab, setTab] = useState<TabKey>("tools")
  const [tools, setTools] = useState<ToolRow[]>([])
  const [models, setModels] = useState<ModelRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [adding, setAdding] = useState<TabKey | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, m] = await Promise.all([
        readRows<ToolRow>("ai_tools", "name"),
        readRows<ModelRow>("ai_models", "label"),
      ])
      setTools(t)
      setModels(m)
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveTool = async (tool: ToolRow) => {
    setBusyId(tool.id)
    try {
      await adminUpsertTool(tool)
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const saveModel = async (model: ModelRow) => {
    setBusyId(model.id)
    try {
      await adminUpsertModel(model)
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Outils & Modèles IA</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Coûts en crédits, publication, activation des modèles fournisseurs
          </p>
        </div>
        <button
          onClick={() => setAdding(tab)}
          className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold"
        >
          + Ajouter un {tab === "tools" ? "outil" : "modèle"}
        </button>
      </div>

      <div className="flex gap-1">
        {(["tools", "models"] as TabKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all"
            style={{
              color: tab === k ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: tab === k ? "2px solid var(--primary)" : "2px solid transparent",
            }}
          >
            {k === "tools" ? `Outils (${tools.length})` : `Modèles IA (${models.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : tab === "tools" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tools.map((t) => (
            <Card key={t.id} className="card-hover">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-display font-bold">{t.name}</h3>
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{t.slug}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge active={t.is_active} />
                  {t.is_published && <Badge tone="blue">Publié</Badge>}
                  {busyId === t.id && <Badge tone="amber">…</Badge>}
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{t.description}</p>
              <div className="flex items-end gap-4">
                <Field label="Coût (crédits)">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    defaultValue={t.credits_cost}
                    onBlur={(e) => {
                      const v = Number(e.target.value)
                      if (v !== t.credits_cost) saveTool({ ...t, credits_cost: v || 0 })
                    }}
                    className={`${inputCls} !w-28`}
                  />
                </Field>
                <Field label="Limite quotidienne (par utilisateur)">
                  <input
                    type="number"
                    min={0}
                    defaultValue={t.max_daily_uses ?? ""}
                    onBlur={(e) => {
                      const v = e.target.value === "" ? null : Number(e.target.value)
                      if (v !== t.max_daily_uses) saveTool({ ...t, max_daily_uses: v })
                    }}
                    placeholder="Illimitée"
                    className={`${inputCls} !w-32`}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-6 pt-3 mt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <SwitchRow label="Actif" checked={t.is_active} onChange={(v) => saveTool({ ...t, is_active: v })} />
                <SwitchRow label="Publié" checked={t.is_published} onChange={(v) => saveTool({ ...t, is_published: v })} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {models.map((m) => {
            const kind = String(m.config?.kind ?? "text")
            return (
              <Card key={m.id} className="card-hover">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-display font-bold">{m.label ?? m.model_name}</h3>
                    <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{m.model_name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={m.provider === "google" ? "violet" : "blue"}>{m.provider === "google" ? "Google" : m.provider}</Badge>
                    <Badge tone={kind === "video" ? "amber" : "slate"}>{kind === "video" ? "Vidéo" : "Texte"}</Badge>
                    <StatusBadge active={m.is_active} />
                    {busyId === m.id && <Badge tone="amber">…</Badge>}
                  </div>
                </div>
                {m.description && <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{m.description}</p>}
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <Field label="Coût (crédits)">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      defaultValue={m.credits_cost}
                      onBlur={(e) => {
                        const v = Number(e.target.value)
                        if (v !== m.credits_cost) saveModel({ ...m, credits_cost: v || 0 })
                      }}
                      className={`${inputCls} !w-full`}
                    />
                  </Field>
                  <Field label="Coût réel FCFA / appel">
                    <input
                      type="number"
                      min={0}
                      defaultValue={m.cost_per_call_fcfa}
                      onBlur={(e) => {
                        const v = Number(e.target.value)
                        if (v !== m.cost_per_call_fcfa) saveModel({ ...m, cost_per_call_fcfa: v || 0 })
                      }}
                      className={`${inputCls} !w-full`}
                    />
                  </Field>
                </div>
                <Field label="Seuil d'alerte FCFA">
                  <input
                    type="number"
                    min={0}
                    defaultValue={m.alert_threshold_fcfa ?? ""}
                    onBlur={(e) => {
                      const v = e.target.value === "" ? null : Number(e.target.value)
                      if (v !== m.alert_threshold_fcfa) saveModel({ ...m, alert_threshold_fcfa: v })
                    }}
                    placeholder="Non défini"
                    className={inputCls}
                  />
                </Field>
                <div className="flex items-center justify-between pt-3 mt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <SwitchRow label="Actif (utilisable par l'IA)" checked={m.is_active} onChange={(v) => saveModel({ ...m, is_active: v })} />
                  {typeof m.config?.note === "string" && (
                    <p className="text-[11px] max-w-[45%] text-right" style={{ color: "var(--text-muted)" }}>{m.config.note}</p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {adding && (
        <AddItemModal
          kind={adding}
          toolsCount={tools.length}
          modelsCount={models.length}
          onClose={() => setAdding(null)}
          onCreated={async () => {
            setAdding(null)
            setMsg("Élément créé. Rafraîchissez si besoin.")
            await load()
          }}
        />
      )}

      <Toast msg={msg} onClose={() => setMsg(null)} />
    </div>
  )
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Toggle checked={checked} onChange={onChange} />
      <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{label}</span>
    </div>
  )
}

function AddItemModal({
  kind,
  toolsCount,
  modelsCount,
  onClose,
  onCreated,
}: {
  kind: "tools" | "models"
  toolsCount: number
  modelsCount: number
  onClose: () => void
  onCreated: () => Promise<void>
}) {
  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [cost, setCost] = useState("1")
  const [realCost, setRealCost] = useState("0")
  const [provider, setProvider] = useState("google")
  const [modelName, setModelName] = useState("")
  const [label, setLabel] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!slug || !name) return
    setBusy(true)
    try {
      if (kind === "tools") {
        await adminUpsertTool({ slug, name, description: desc, credits_cost: Number(cost) || 1 })
      } else {
        await adminUpsertModel({
          slug,
          label,
          provider,
          model_name: modelName,
          description: desc,
          credits_cost: Number(cost) || 1,
          cost_per_call_fcfa: Number(realCost) || 0,
        })
      }
      await onCreated()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={kind === "tools" ? "Nouvel outil" : "Nouveau modèle IA"}>
      <Field label="Identifiant (slug)">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={kind === "tools" ? "ex: generateur-logo" : "ex: google-gemini-2.5-pro"} className={inputCls} />
      </Field>
      <Field label="Nom">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Générateur de logo" className={inputCls} />
      </Field>
      {kind === "models" && (
        <>
          <Field label="Modèle fournisseur (identifiant API exact)">
            <input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="ex: gemini-2.5-pro" className={inputCls} />
          </Field>
          <Field label="Fournisseur">
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className={inputCls}>
              <option value="google">Google (Gemini / Veo)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </Field>
        </>
      )}
      <Field label="Coût en crédits">
        <input value={cost} onChange={(e) => setCost(e.target.value)} className={inputCls} />
      </Field>
      {kind === "models" && (
        <Field label="Coût réel FCFA / appel">
          <input value={realCost} onChange={(e) => setRealCost(e.target.value)} className={inputCls} />
        </Field>
      )}
      <Field label="Description">
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className={inputCls} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold" style={{ border: "1px solid var(--border)" }}>
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold disabled:opacity-50"
        >
          {busy ? "Création..." : "Créer"}
        </button>
      </div>
      <p className="text-[11px] mt-3" style={{ color: "var(--text-muted)" }}>
        {kind === "tools" ? toolsCount : modelsCount} élément(s) existant(s). Les nouveaux éléments sont créés inactifs si nécessaire.
      </p>
    </Modal>
  )
}