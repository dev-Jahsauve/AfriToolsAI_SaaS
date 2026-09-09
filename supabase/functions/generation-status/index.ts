import { handleCors, json } from "../_shared/cors.ts"
import { getUserFromRequest, supabaseAdmin } from "../_shared/supabaseAdmin.ts"
import { systemRefund } from "../_shared/credit.ts"
import { pollProviderOperation } from "../_shared/providers.ts"

/**
 * POST /generation-status — Poll d'une génération asynchrone (ex. vidéo Veo).
 * Body : { generationId, operation? }. Quand l'opération est terminée :
 * complète la génération + log coûts. Sur échec : REMBOURSEMENT AUTO.
 */
Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405)

  const { userId } = await getUserFromRequest(req)
  if (!userId) return json({ error: "UNAUTHORIZED" }, 401)

  let body: { generationId?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: "INVALID_JSON" }, 400)
  }
  if (!body.generationId) return json({ error: "GENERATION_REQUIRED" }, 400)

  const { data: gen, error: genErr } = await supabaseAdmin
    .from("generations")
    .select("*, tool:ai_tools(name), model:ai_models(*)")
    .eq("id", body.generationId)
    .eq("user_id", userId)
    .single()
  if (genErr || !gen) return json({ error: "GENERATION_NOT_FOUND" }, 404)
  if (gen.status !== "pending") {
    return json({ status: gen.status, output: gen.output, error: gen.error_message })
  }

  const model = gen.model
  const operation = gen.external_ref ?? ""
  if (!operation) {
    await systemRefund(gen.ref_id, "Opération asynchrone manquante")
    await supabaseAdmin.from("generations").update({ status: "failed" }).eq("id", gen.id)
    return json({ error: "OPERATION_MISSING", status: "failed" }, 410)
  }

  const result = await pollProviderOperation(model, operation)

  if (result.status === "processing") {
    return json({ status: "processing" }, 202)
  }

  if (!result.ok) {
    await systemRefund(gen.ref_id, "Echec du fournisseur IA (asynchrone)")
    await supabaseAdmin
      .from("generations")
      .update({ status: "failed", error_message: result.error })
      .eq("id", gen.id)
    return json({ error: "PROVIDER_ERROR", detail: result.error, status: "failed" }, 502)
  }

  await supabaseAdmin
    .from("generations")
    .update({
      status: "completed",
      output: result.output,
      cost_fcfa: result.costFcfa ?? model.cost_per_call_fcfa,
    })
    .eq("id", gen.id)

  await supabaseAdmin.from("ai_cost_logs").insert({
    user_id: userId,
    tool_id: gen.tool_id,
    model_id: model.id,
    provider: model.provider,
    model_name: model.model_name,
    cost_fcfa: result.costFcfa ?? model.cost_per_call_fcfa,
    period: new Date().toISOString().slice(0, 7),
  })

  return json({ status: "completed", output: result.output, cost_fcfa: result.costFcfa ?? model.cost_per_call_fcfa })
})