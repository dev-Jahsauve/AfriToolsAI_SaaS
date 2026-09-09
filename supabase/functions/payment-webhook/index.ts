import { handleCors, json } from "../_shared/cors.ts"
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"

/**
 * POST /payment-webhook — Réception des notifications de paiement (Mobile Money,
 * Stripe ou autre opérateur). Aucune clé publique : la signature est validée
 * via les secrets serveur. Le fournisseur de paiement est configurable
 * (app_settings -> payment_provider) sans exposer de clés au frontend.
 *
 * [STUB] : le fichier est prêt ; la signature et la requête exactes seront
 * implémentées une fois l'opérateur de paiement de production choisi.
 */
Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405)

  const expectedSecret = Deno.env.get("PAYMENTS_WEBHOOK_SECRET")
  if (expectedSecret) {
    const incoming = req.headers.get("x-webhook-signature") ?? req.headers.get("authorization")
    if (!incoming || incoming.replace("Bearer ", "") !== expectedSecret) {
      return json({ error: "UNAUTHORIZED" }, 401)
    }
  }

  let payload: { provider_ref?: string; user_email?: string; amount_fcfa?: number; status?: string; credits?: number }
  try {
    payload = await req.json()
  } catch {
    return json({ error: "INVALID_JSON" }, 400)
  }

  // Idempotence : un paiement déjà traité est ignoré
  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("provider_ref", payload.provider_ref ?? "")
    .maybeSingle()
  if (existing) return json({ ok: true, duplicate: true })

  const status = payload.status ?? "paid"
  const approved = status === "paid" || status === "succeeded" || status === "completed"

  const { data: payment, error: payErr } = await supabaseAdmin
    .from("payments")
    .insert({
      provider_ref: payload.provider_ref ?? crypto.randomUUID(),
      user_email: payload.user_email ?? null,
      amount_fcfa: payload.amount_fcfa ?? 0,
      provider: "pending-setup",
      status,
      credits_granted: approved ? (payload.credits ?? 0) : 0,
    })
    .select("id")
    .single()
  if (payErr) return json({ error: payErr.message }, 500)

  if (approved) {
    const { data: acc } = await supabaseAdmin
      .from("user_accounts")
      .select("user_id")
      .eq("email", payload.user_email as string)
      .maybeSingle()
    if (acc) {
      // Crédit alloué via l'engine (idempotent : ref unique = provider_ref)
      await supabaseAdmin.rpc("apply_credit", {
        p_user_id: acc.user_id,
        p_amount: payload.credits ?? 0,
        p_op_type: "purchase",
        p_source: "payment",
        p_note: `Achat de crédits via paiement ${payload.provider_ref}`,
        p_ref_id: `pay:${payload.provider_ref}`,
      }).then((r) => {
        if (r.error) console.error("apply_credit failed", r.error)
      })
    }
  }

  return json({ ok: true, paymentId: payment.id })
})