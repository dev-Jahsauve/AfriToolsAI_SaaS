import { handleCors, json } from "../_shared/cors.ts"
import { getUserFromRequest, supabaseAdmin } from "../_shared/supabaseAdmin.ts"
import { isAdmin, isModerator } from "../_shared/credit.ts"

/**
 * /admin — API d'administration (rôle ADMIN/SUPER_ADMIN).
 * Actions : list_users, set_role, set_bypass, set_status, grant_credits, ledger.
 * Toute action sensible est journalisée dans audit_logs.
 */
Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405)

  const { userId } = await getUserFromRequest(req)
  if (!userId) return json({ error: "UNAUTHORIZED" }, 401)
  const admin = await isAdmin(userId)
  if (!admin) return json({ error: "FORBIDDEN" }, 403)

  let body: {
    action?: string
    targetUserId?: string
    role?: string
    bypass?: boolean
    status?: string
    amount?: number
    reason?: string
    refId?: string
    page?: number
    limit?: number
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: "INVALID_JSON" }, 400)
  }

  const audit = async (message: string, meta: Record<string, unknown> = {}) => {
    await supabaseAdmin.from("audit_logs").insert({
      user_id: userId,
      action: `admin.${body.action}`,
      resource_type: "user",
      resource_id: body.targetUserId ?? null,
      description: message,
      metadata: meta,
    })
  }

  switch (body.action) {
    case "list_users": {
      const { data, error } = await supabaseAdmin
        .from("user_accounts")
        .select("*, profile:profiles(nom, prenom, email)")
        .order("created_at", { ascending: false })
        .range((body.page ?? 0) * (body.limit ?? 50), (body.page ?? 0) * (body.limit ?? 50) + (body.limit ?? 50) - 1)
      if (error) return json({ error: error.message }, 500)
      return json({ users: data })
    }

    case "set_role": {
      if (!body.targetUserId || !body.role) return json({ error: "MISSING_ARGS" }, 400)
      const { error } = await supabaseAdmin
        .from("user_accounts")
        .update({ role: body.role })
        .eq("user_id", body.targetUserId)
      if (error) return json({ error: error.message }, 500)
      await audit(`Rôle mis à jour : ${body.role}`)
      return json({ ok: true })
    }

    case "set_bypass": {
      if (!body.targetUserId || typeof body.bypass !== "boolean") return json({ error: "MISSING_ARGS" }, 400)
      const { error } = await supabaseAdmin
        .from("user_accounts")
        .update({ admin_bypass: body.bypass })
        .eq("user_id", body.targetUserId)
      if (error) return json({ error: error.message }, 500)
      await audit(`Bypass commercial ${body.bypass ? "activé" : "désactivé"}`)
      return json({ ok: true })
    }

    case "set_status": {
      if (!body.targetUserId || !body.status) return json({ error: "MISSING_ARGS" }, 400)
      const suspended = body.status === "suspended"
      if (suspended) {
        await supabaseAdmin.auth.admin.updateUserById(body.targetUserId, { ban_duration: "8760h" })
      } else {
        await supabaseAdmin.auth.admin.updateUserById(body.targetUserId, { ban_duration: "none" })
      }
      const { error } = await supabaseAdmin
        .from("user_accounts")
        .update({ status: body.status })
        .eq("user_id", body.targetUserId)
      if (error) return json({ error: error.message }, 500)
      await audit(`Statut : ${body.status}`)
      return json({ ok: true })
    }

    case "grant_credits": {
      if (!body.targetUserId || !body.amount) return json({ error: "MISSING_ARGS" }, 400)
      // apply_credit est réservé au service (ULO : pas de auth.uid() en contexte service_role)
      const { data, error } = await supabaseAdmin.rpc("apply_credit", {
        p_user_id: body.targetUserId,
        p_amount: body.amount,
        p_op_type: "admin_adjust",
        p_source: "admin",
        p_reason: body.reason ?? "Ajustement manuel admin",
        p_admin_id: userId,
        p_admin_action: "grant",
        p_metadata: { admin: userId },
      })
      if (error || data?.applied === false) {
        return json({ error: "GRANT_FAILED", detail: error?.message ?? "duplicate" }, 400)
      }
      await audit(`Allocation de ${body.amount} crédit(s)`)
      return json({ ok: true, balance: data.balance })
    }

    case "ledger": {
      const { data, error } = await supabaseAdmin
        .from("credit_ledger")
        .select("*")
        .order("created_at", { ascending: false })
        .range((body.page ?? 0) * 50, (body.page ?? 0) * 50 + 49)
      if (error) return json({ error: error.message }, 500)
      return json({ entries: data })
    }

    default:
      return json({ error: "UNKNOWN_ACTION" }, 400)
  }
})