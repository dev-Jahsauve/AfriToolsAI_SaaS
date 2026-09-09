import { supabase } from "./supabaseClient"
import { consumeCredits, type CreditCharge } from "./credits"

export type GenerationResult =
  | { ok: true; output: string; balance?: number; charged?: number; bypass?: boolean }
  | { ok: false; error: string; required?: number; balance?: number }

interface GenerationRow {
  id: string
  status: string
  output?: string
  error_message?: string
  model?: { cost_per_call_fcfa?: number }
}

/**
 * Pipeline de génération :
 *  1. Appel Edge Function `generate` (Auth + débit serveur + fournisseur IA réel).
 *  2. Si un fournisseur n'est pas encore configuré (PROVIDER_NOT_CONFIGURED) et
 *     que VITE_DEV_TEMPLATE_FALLBACK=true (dév uniquement), le débit est quand
 *     même effectué côté serveur (consume_credits RPC) puis une sortie de
 *     secours locale est générée. Le crédit reste autoritaire (jamais local).
 * Ne brise jamais le fonctionnement local de l'app.
 */
export async function runGeneration(
  toolSlug: string,
  input: Record<string, unknown>,
  templateGenerate: () => Promise<string>,
): Promise<GenerationResult> {
  const devFallback = import.meta.env.VITE_DEV_TEMPLATE_FALLBACK === "true"

  try {
    const { data, error } = await supabase.functions.invoke("generate", {
      body: { toolSlug, input },
    })
    if (error) throw error

    if (data?.status === "completed") {
      return { ok: true, output: data.output, balance: data.balance, charged: data.charged }
    }
    if (data?.status === "processing" && data.generationId) {
      const gen = await pollGeneration(data.generationId)
      if (gen.status === "completed") {
        return { ok: true, output: gen.output ?? "", balance: data.balance }
      }
      throw new Error("ASYNC_GENERATION_FAILED")
    }
    if (data?.error === "PROVIDER_NOT_CONFIGURED" && devFallback) {
      return templateFallback(toolSlug, input, templateGenerate)
    }
    return { ok: false, error: data?.error ?? "GENERATION_FAILED" }
  } catch {
    if (devFallback) return templateFallback(toolSlug, input, templateGenerate)
    return { ok: false, error: "GENERATION_FAILED" }
  }
}

/** Débit serveur puis sortie de secours locale (développement uniquement). */
async function templateFallback(
  toolSlug: string,
  input: Record<string, unknown>,
  templateGenerate: () => Promise<string>,
): Promise<GenerationResult> {
  const refId = crypto.randomUUID()
  const charge: CreditCharge = await consumeCredits(toolSlug, refId)
  if (!charge.ok) {
    return {
      ok: false,
      error: charge.error ?? "INSUFFICIENT_CREDITS",
      required: charge.required,
      balance: charge.balance,
    }
  }
  const output = await templateGenerate()
  if (output) {
    try {
      await supabase
        .from("generations")
        .insert({
          status: "completed",
          input,
          output,
          ref_id: refId,
          tool_id: null,
        })
    } catch {
      // échec non bloquant : la génération locale reste disponible
    }
  }
  return { ok: true, output, balance: charge.balance, charged: charge.charged, bypass: charge.bypass }
}

/** Poll d'une génération asynchrone (ex. vidéo Veo) via Edge Function. */
async function pollGeneration(generationId: string): Promise<GenerationRow> {
  const { data, error } = await supabase.functions.invoke("generation-status", {
    body: { generationId },
  })
  if (error) return { id: generationId, status: "failed", error_message: error.message }
  if (data?.status === "completed") {
    return { id: generationId, status: "completed", output: data.output }
  }
  if (data?.status === "failed") {
    return { id: generationId, status: "failed", error_message: data.error }
  }
  // Génération toujours en cours : nouvel appel après 5 s (jusqu'à 12 fois / 1 min)
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000))
    const { data: d2 } = await supabase.functions.invoke("generation-status", {
      body: { generationId },
    })
    if (d2?.status === "completed") return { id: generationId, status: "completed", output: d2.output }
    if (d2?.status === "failed") return { id: generationId, status: "failed", error_message: d2.error }
  }
  return { id: generationId, status: "failed", error_message: "TIMEOUT_ASYNC_GENERATION" }
}