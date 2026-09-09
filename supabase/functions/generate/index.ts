import { handleCors, json } from "../_shared/cors.ts"
import { getUserFromRequest, supabaseAdmin } from "../_shared/supabaseAdmin.ts"
import { systemConsumeCredits, systemRefund } from "../_shared/credit.ts"
import { runProvider, type ModelRow } from "../_shared/providers.ts"

/**
 * POST /generate — Pipeline : Auth → RESOLUTION MODÈLE → DEBIT CRÉDITS →
 * APPEL FOURNISSEUR → (échec) REMBOURSEMENT AUTO → enregistrement.
 * Aucune clé API serveur ne sort d'ici. ref_id = idempotence anti double-débit.
 */
Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405)
  const { userId } = await getUserFromRequest(req)
  if (!userId) return json({ error: "UNAUTHORIZED" }, 401)

  let body: { toolSlug?: string; input?: Record<string, unknown>; modelSlug?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: "INVALID_JSON" }, 400)
  }
  const toolSlug = body.toolSlug
  const input = body.input ?? {}
  if (!toolSlug) return json({ error: "TOOL_REQUIRED" }, 400)

  const refId = crypto.randomUUID()

  // 1. Outil doit exister, être actif et publié
  const { data: tool, error: toolErr } = await supabaseAdmin
    .from("ai_tools")
    .select("*")
    .eq("slug", toolSlug)
    .eq("is_active", true)
    .eq("is_published", true)
    .maybeSingle()
  if (toolErr || !tool) return json({ error: "TOOL_NOT_FOUND" }, 404)
  const toolConfig = (tool.config ?? {}) as { default_model_slug?: string }

  // 2. Résolution du modèle IA (jamais de simulation ; pas d'appel si aucun modèle)
  let model: ModelRow | null = null
  if (body.modelSlug) {
    const { data: m } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("slug", body.modelSlug)
      .eq("is_active", true)
      .maybeSingle()
    model = m as ModelRow | null
  } else if (toolConfig.default_model_slug) {
    const { data: m } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("slug", toolConfig.default_model_slug)
      .eq("is_active", true)
      .maybeSingle()
    model = m as ModelRow | null
  }
  if (!model) {
    const { data: m } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle()
    model = m as ModelRow | null
  }
  if (!model) {
    return json({ error: "PROVIDER_NOT_CONFIGURED" }, 400)
  }

  // 3. Débit (d'abord, avant tout coût fournisseur)
  const charge = await systemConsumeCredits(userId, toolSlug, refId, {
    model: model.slug,
    tool: toolSlug,
  })
  if (!charge?.ok) {
    const code = String(charge?.error ?? "DEBIT_FAILED")
    const status = code === "INSUFFICIENT_CREDITS" ? 402 : 400
    return json({ error: code, required: charge?.required, balance: charge?.balance }, status)
  }

  // 4. Appel fournisseur
  const result = await runProvider(model, tool.name, input)

  if (!result.ok) {
    await systemRefund(refId, "Echec du fournisseur IA")
    await supabaseAdmin.from("generations").insert({
      user_id: userId,
      tool_id: tool.id,
      model_id: model.id,
      status: "failed",
      ref_id: refId,
      input: input,
      error_message: result.error,
    })
    return json({ error: "PROVIDER_ERROR", detail: result.error }, 502)
  }

  // 5a. Modèle asynchrone (vidéo Veo) → statut pending + polling
  if (result.status === "processing" && result.operation) {
    const { data: gen, error: genErr } = await supabaseAdmin
      .from("generations")
      .insert({
        user_id: userId,
        tool_id: tool.id,
        model_id: model.id,
        status: "pending",
        ref_id: refId,
        input: input,
        external_ref: result.operation,
      })
      .select("id")
      .single()
    if (genErr) {
      await systemRefund(refId, "Enregistrement génération échoué")
      return json({ error: "DB_ERROR", detail: genErr.message }, 500)
    }
    return json(
      { status: "processing", generationId: gen.id, balance: charge.balance, operation: result.operation },
      202,
    )
  }

  // 5b. Résultat synchrone → enregistre + log coûts
  const { data: gen, error: genErr } = await supabaseAdmin
    .from("generations")
    .insert({
      user_id: userId,
      tool_id: tool.id,
      model_id: model.id,
      status: "completed",
      ref_id: refId,
      input: input,
      output: result.output,
      input_tokens: result.inputTokens ?? null,
      output_tokens: result.outputTokens ?? null,
      cost_fcfa: result.costFcfa ?? model.cost_per_call_fcfa,
    })
    .select("id")
    .single()
  if (genErr) {
    await systemRefund(refId, "Enregistrement génération échoué")
    return json({ error: "DB_ERROR", detail: genErr.message }, 500)
  }

  await supabaseAdmin.from("ai_cost_logs").insert({
    user_id: userId,
    tool_id: tool.id,
    model_id: model.id,
    provider: model.provider,
    model_name: model.model_name,
    input_tokens: result.inputTokens ?? null,
    output_tokens: result.outputTokens ?? null,
    cost_fcfa: result.costFcfa ?? model.cost_per_call_fcfa,
    period: new Date().toISOString().slice(0, 7),
  })

  return json(
    {
      status: "completed",
      generationId: gen.id,
      output: result.output,
      balance: charge.balance,
      cost_fcfa: result.costFcfa ?? model.cost_per_call_fcfa,
    },
    200,
  )
})