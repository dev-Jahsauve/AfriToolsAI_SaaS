import { createClient } from "jsr:@supabase/supabase-js@2"

/**
 * Client ADMIN Supabase : N'EXISTE QUE CÔTÉ SERVEUR (Edge Functions).
 * La clé service ne doit JAMAIS apparaître dans le bundle frontend.
 */
export const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
)

/** Authentifie l'appelant via son token (header Authorization). */
export async function getUserFromRequest(req: Request) {
  const auth = req.headers.get("Authorization")?.replace("Bearer ", "")
  if (!auth) return { userId: null, error: "MISSING_TOKEN" }
  const { data, error } = await supabaseAdmin.auth.getUser(auth)
  if (error) return { userId: null, error: "INVALID_TOKEN" }
  return { userId: data.user.id }
}