/**
 * Registre des fournisseurs IA (multicollectivités).
 * Toutes les clés proviennent de l'environnement serveur (Edge Functions),
 * JAMAIS du frontend.
 *
 * Fournisseurs implémentés :
 *  - google : Gemini API (texte : generateContent ; vidéo Veo : predictLongRunning)
 *    Authentification officielle : en-tête `x-goog-api-key` (GEMINI_API_KEY).
 */

export interface ModelRow {
  id: string
  slug: string
  provider: string
  model_name: string
  label: string | null
  credits_cost: number
  cost_per_call_fcfa: number
  is_active: boolean
  config: Record<string, unknown>
}

export interface ProviderResult {
  ok: boolean
  output?: string
  operation?: string
  status?: "completed" | "processing"
  inputTokens?: number
  outputTokens?: number
  costFcfa?: number
  error?: string
}

function geminiKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY")
  if (!key) throw new Error("GEMINI_API_KEY_NOT_SET")
  return key
}

/** Texte : Google Gemini generateContent (synchrone). */
async function googleText(model: string, prompt: string): Promise<ProviderResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": geminiKey(), "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
      }),
    },
  )
  const data = await res.json()
  if (!res.ok) {
    return { ok: false, error: `GOOGLE_TEXT_ERROR:${res.status}` }
  }
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("\n")
  const usage = data?.usageMetadata
  return {
    ok: !!text,
    output: text,
    inputTokens: usage?.promptTokenCount ?? 0,
    outputTokens: usage?.candidatesTokenCount ?? 0,
  }
}

/** Vidéo : Google Veo via predictLongRunning (asynchrone). */
async function googleVideo(model: string, prompt: string): Promise<ProviderResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning`,
    {
      method: "POST",
      headers: { "x-goog-api-key": geminiKey(), "Content-Type": "application/json" },
      body: JSON.stringify({ instances: [{ prompt }] }),
    },
  )
  const data = await res.json()
  if (!res.ok) return { ok: false, error: `GOOGLE_VIDEO_ERROR:${res.status}` }
  return { ok: true, operation: data.name, status: "processing" }
}

/** Poll d'une opération vidéo Google (statut de génération). */
async function googleVideoPoll(operationName: string): Promise<ProviderResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
    { headers: { "x-goog-api-key": geminiKey() } },
  )
  const data = await res.json()
  if (!res.ok) return { ok: false, error: `GOOGLE_VIDEO_POLL_ERROR:${res.status}` }
  if (data.done) {
    const video = data?.response?.generatedVideos?.[0]
    return {
      ok: true,
      output: video?.videoUri ?? video?.content,
      status: "completed",
      costFcfa: undefined,
    }
  }
  return { ok: true, status: "processing", error: undefined }
}

/** Construit le prompt applicatif à partir de l'entrée du formulaire. */
export function buildPrompt(toolName: string, input: Record<string, unknown>): string {
  const parts = Object.entries(input)
    .filter(([k, v]) => k !== "toolSlug" && v != null && String(v).trim() !== "")
    .map(([k, v]) => `- ${k}: ${v}`)
  return [
    `Tu es un assistant marketing pour les entrepreneurs africains (AfriTools AI).`,
    `Outil : ${toolName}.`,
    `Génère un contenu professionnel, persuasif et prêt à publier.`,
    "",
    ...parts,
  ].join("\n")
}

/** Point d'entrée unique : exécute le bon fournisseur selon le type de modèle. */
export async function runProvider(model: ModelRow, toolName: string, input: Record<string, unknown>): Promise<ProviderResult> {
  const prompt = buildPrompt(toolName, input)
  const kind = String(model.config?.kind ?? "text")

  switch (model.provider) {
    case "google":
      if (kind === "video") return googleVideo(model.model_name, prompt)
      return googleText(model.model_name, prompt)
    default:
      return { ok: false, error: `UNSUPPORTED_PROVIDER:${model.provider}` }
  }
}

export async function pollProviderOperation(model: ModelRow, operation: string): Promise<ProviderResult> {
  if (model.provider === "google") return googleVideoPoll(operation)
  return { ok: false, error: `UNSUPPORTED_POLL_PROVIDER:${model.provider}` }
}