import { supabase } from "../lib/supabaseClient"

export interface AdminStats {
  users: number
  generations: number
  credits_outstanding: number
  active_subscriptions: number
  revenue_fcfa: number
  generations_today: number
}

export interface AdminUser {
  id: string
  nom: string | null
  prenom: string | null
  email: string | null
  plan_id: string | null
  role: string | null
  admin_bypass: boolean
  status: string | null
  account_created_at: string | null
  balance: number | null
  tx_count: number | null
}

export interface LedgerEntry {
  id: string
  user_id: string
  op_type: string
  amount: number
  status: string
  source: string | null
  reason: string | null
  ref_id: string | null
  balance_after: number | null
  admin_id: string | null
  admin_action: string | null
  created_at: string
  tool_name: string | null
  model_label: string | null
}

export interface PlanRow {
  id: string
  slug: string
  name: string
  description: string | null
  price_fcfa: number
  interval_days: number
  credits_per_period: number
  renew_credits: boolean
  tools_allowed: string[]
  limits: Record<string, unknown>
  is_active: boolean
  sort: number
}

export interface PackRow {
  id: string
  slug: string
  name: string
  credit_amount: number
  price_fcfa: number
  valid_days: number | null
  is_active: boolean
  sort: number
}

export interface ToolRow {
  id: string
  slug: string
  name: string
  description: string | null
  credits_cost: number
  is_active: boolean
  is_published: boolean
  max_daily_uses: number | null
  config: Record<string, unknown>
}

export interface ModelRow {
  id: string
  slug: string
  provider: string
  model_name: string
  label: string | null
  description: string | null
  credits_cost: number
  cost_per_call_fcfa: number
  is_active: boolean
  alert_threshold_fcfa: number | null
  config: Record<string, unknown>
}

export const OP_TYPE_LABELS: Record<string, string> = {
  daily_grant: "Crédit gratuit",
  subscription_grant: "Abonnement",
  purchase: "Achat",
  bonus: "Bonus",
  refund: "Remboursement",
  consumption: "Consommation",
  reversal: "Annulation",
  admin_adjust: "Ajustement admin",
  system: "Système",
}

const rpc = async <T,>(fn: string, params?: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.rpc(fn, params ?? {})
  if (error) throw new Error(error.message)
  return data as T
}

export const readRows = async <T,>(table: string, order?: string, ascending = true): Promise<T[]> => {
  let q = supabase.from(table).select("*")
  if (order) q = q.order(order, { ascending })
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as T[]
}

export const adminGetStats = () => rpc<AdminStats>("admin_get_stats")

export const adminGetUsers = async (search: string, page: number, pageSize: number) => {
  const data = await rpc<{ ok: boolean; rows: AdminUser[]; total: number }>("admin_get_users", {
    p_search: search || null,
    p_limit: pageSize,
    p_offset: page * pageSize,
  })
  return { rows: data.rows ?? [], total: data.total ?? 0 }
}

export const adminGetLedger = async (userId: string | null, page: number, pageSize: number) => {
  const params: Record<string, unknown> = { p_limit: pageSize, p_offset: page * pageSize }
  if (userId) params.p_user_id = userId
  const data = await rpc<{ ok: boolean; rows: LedgerEntry[] }>("admin_get_ledger", params)
  return data.rows ?? []
}

export const adminGrantCredits = (userId: string, amount: number, reason: string) =>
  rpc<{ ok: boolean; error?: string; balance?: number }>("admin_grant_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_source: "admin",
    p_reason: reason,
    p_metadata: {},
  })

export const adminSetRole = (userId: string, role: string) =>
  rpc<{ ok: boolean; error?: string }>("admin_set_role", { p_user_id: userId, p_role: role })

export const adminSetBypass = (userId: string, bypass: boolean) =>
  rpc<{ ok: boolean; error?: string }>("admin_set_bypass", { p_user_id: userId, p_bypass: bypass })

export const adminSetStatus = (userId: string, status: string) =>
  rpc<{ ok: boolean; error?: string }>("admin_set_status", { p_user_id: userId, p_status: status })

export const adminUpsertPlan = (plan: Partial<PlanRow>) =>
  rpc<{ ok: boolean; error?: string; id: string }>("admin_upsert_plan", { p_plan: plan })

export const adminUpsertPack = (pack: Partial<PackRow>) =>
  rpc<{ ok: boolean; error?: string; id: string }>("admin_upsert_pack", { p_pack: pack })

export const adminUpsertTool = (tool: Partial<ToolRow>) =>
  rpc<{ ok: boolean; error?: string; id: string }>("admin_upsert_tool", { p_tool: tool })

export const adminUpsertModel = (model: Partial<ModelRow>) =>
  rpc<{ ok: boolean; error?: string; id: string }>("admin_upsert_model", { p_model: model })

export const adminSetSetting = (key: string, value: unknown) =>
  rpc<{ ok: boolean; error?: string }>("admin_set_setting", { p_key: key, p_value: value })

export const canAdmin = (role: string | null | undefined) =>
  role === "moderator" || role === "admin" || role === "super_admin"

export const ROLE_LABELS: Record<string, string> = {
  user: "Utilisateur",
  moderator: "Modérateur",
  admin: "Administrateur",
  super_admin: "Super Admin",
}