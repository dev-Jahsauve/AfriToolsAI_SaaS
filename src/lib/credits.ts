import { supabase } from "./supabaseClient"

export interface CreditSummary {
  ok: boolean
  balance: number
  role: string
  admin_bypass: boolean
  status: string
  today_consumed: number
  daily_free: {
    enabled: boolean
    quantity: number
    reset_interval_hours: number
    claimed_today: boolean
    next_at: string | null
  }
}

export interface CreditCharge {
  ok: boolean
  balance?: number
  charged?: number
  bypass?: boolean
  error?: string
  required?: number
  granted?: number
}

/** Solde & infos compte → source de vérité : le CREDIT ENGINE (RPCP server). */
export async function getCreditSummary(): Promise<CreditSummary | null> {
  const { data, error } = await supabase.rpc("get_credit_summary")
  if (error || !data) return null
  return data as unknown as CreditSummary
}

/** Claim des crédits gratuits quotidiens (quantité configurée côté admin). */
export async function claimDailyCredits(): Promise<CreditCharge> {
  const { data, error } = await supabase.rpc("claim_daily_free_credits")
  if (error) return { ok: false, error: error.message }
  return { ok: data?.ok === true, balance: data?.balance, error: data?.error, granted: data?.granted }
}

/** Débit autoritaire côté serveur (idempotent via ref_id). */
export async function consumeCredits(toolSlug: string, refId: string): Promise<CreditCharge> {
  const { data, error } = await supabase.rpc("consume_credits", {
    p_tool_slug: toolSlug,
    p_ref_id: refId,
  })
  if (error) return { ok: false, error: error.message }
  const res = data as unknown as {
    ok?: boolean
    balance?: number
    charged?: number
    bypass?: boolean
    error?: string
    required?: number
  }
  return {
    ok: res?.ok === true,
    balance: res?.balance,
    charged: res?.charged,
    bypass: res?.bypass,
    error: res?.error,
    required: res?.required,
  }
}

export function creditErrorMessage(charge: CreditCharge): string {
  switch (charge.error) {
    case "INSUFFICIENT_CREDITS":
      return `Crédits insuffisants. Il vous faut ${charge.required ?? ""} crédit(s). Gagnez des crédits gratuits quotidiens ou souscrivez à un plan.`
    case "TOOL_NOT_FOUND":
      return "Cet outil n'est pas disponible."
    case "TOOL_UNAVAILABLE":
      return "Cet outil est temporairement indisponible."
    case "DAILY_LIMIT":
      return "Vous avez atteint la limite d'utilisation quotidienne de cet outil."
    case "DUPLICATE":
      return "Cette génération a déjà été traitée."
    default:
      return "Une erreur est survenue lors du débit des crédits."
  }
}