import { supabaseAdmin } from "./supabaseAdmin.ts"

/**
 * Couche d'accès au CREDIT ENGINE côté serveur.
 * Toute mutation passe par les RPC SECURITY DEFINER (service_role).
 * Le service_role ne peut PAS appeler les wrappers "auth.uid()", il utilise
 * les variantes `system_*` qui exigent le rôle service.
 */

export async function systemConsumeCredits(
  userId: string,
  toolSlug: string,
  refId: string,
  meta: Record<string, unknown> = {},
) {
  const { data, error } = await supabaseAdmin.rpc("system_consume_credits", {
    p_user_id: userId,
    p_tool_slug: toolSlug,
    p_ref_id: refId,
    p_meta: meta,
  })
  if (error) return { ok: false, error: error.message }
  return data as Record<string, unknown>
}

export async function systemRefund(refId: string, reason: string) {
  const { data, error } = await supabaseAdmin.rpc("system_refund_credits", {
    p_ref_id: refId,
    p_reason: reason,
  })
  if (error) return { ok: false, error: error.message }
  return data as Record<string, unknown>
}

export async function systemGetCreditSummary(userId: string) {
  const { data: acc } = await supabaseAdmin
    .from("user_accounts")
    .select("role, admin_bypass, status")
    .eq("user_id", userId)
    .maybeSingle()
  const { data: bal } = await supabaseAdmin
    .from("credit_balances")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle()
  return {
    balance: bal?.balance ?? 0,
    role: acc?.role ?? "user",
    admin_bypass: acc?.admin_bypass ?? false,
    status: acc?.status ?? "active",
  }
}

/** Vérifie qu'un utilisateur est admin+ (devant être doublé par RLS/RLS côté DB). */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data: acc } = await supabaseAdmin
    .from("user_accounts")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle()
  const role = acc?.role ?? "user"
  const levels: Record<string, number> = {
    user: 0,
    moderator: 1,
    admin: 2,
    super_admin: 3,
  }
  return (levels[role] ?? 0) >= 2
}

export async function isModerator(userId: string): Promise<boolean> {
  const { data: acc } = await supabaseAdmin
    .from("user_accounts")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle()
  const role = acc?.role ?? "user"
  const levels: Record<string, number> = {
    user: 0,
    moderator: 1,
    admin: 2,
    super_admin: 3,
  }
  return (levels[role] ?? 0) >= 1
}