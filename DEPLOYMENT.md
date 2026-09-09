# ============================================================================
# HINTS DE DÉPLOIEMENT — AfriTools AI
# Frontend : React + Vite (Tailwind v4). Backend : Supabase (Postgres + Edge).
# ============================================================================

## 1) Environnement requis
- Node.js 22 (voir `.mise.toml`) — activable via `mise use` ou nvm.
- pnpm 10+ (`corepack enable` sur Node 22).
- CLI Supabase (`supabase login`, version récente), ou accès au Dashboard :
  https://supabase.com/dashboard/project/ydwchygempuskavxpuoo

## 2) Configurer les variables frontend (`.env`)
| Variable                        | Où la trouver                          |
|----------------------------------|----------------------------------------|
| `VITE_SUPABASE_URL`              | Project Settings → API → Project URL   |
| `VITE_SUPABASE_PUBLISHABLE_KEY`  | Project Settings → API → anon public   |
| `VITE_DEV_TEMPLATE_FALLBACK`     | `true` seulement en local (templates)  |

## 3) Base de données + sécurité (2 méthodes au choix)

### A. via la CLI Supabase (recommandé, reproductible)
```
supabase link --project-ref ydwchygempuskavxpuoo
supabase db push
```

### B. via le Dashboard (SQL Editor)
1. Ouvrir le SQL Editor du projet.
2. Coller puis exécuter `supabase/migrations/0001_credit_engine.sql`
   (il est idempotent : tables, RLS, fonctions, RPC, seed, super admin,
   déclencheur anti-inscription `@afritools.ai`).
3. Puis exécuter `supabase/scripts/activate_production_models.sql`
   (active les modèles IA désactivés par défaut).

> `supabase/scripts/seed_super_admin.sql` est la copie autonome du seed du
> super admin : la ré-exécuter force le statut `super_admin` même si le compte
> a été dégradé entre-temps.

## 4) Edge Functions (déployer chacune + ses secrets)
```
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role du projet>
supabase secrets set GEMINI_API_KEY=<clé Google Gemini>
supabase functions deploy generate
supabase functions deploy generation-status
supabase functions deploy admin
supabase functions deploy payment-webhook
```
Les fonctions `generate` / `generation-status` / `admin` / `payment-webhook`
sont exécutées via la clé `anon` du frontend et vérifient l'utilisateur côté
serveur (service role). `payment-webhook` doit être exposé en HTTP.

## 5) Chemin de génération (garde-fou anti-coût)
1. Frontend → `consume_credits(tool, tool_payload, options)` (RPC verrouillée).
2. `generate` vérifie `user_accounts.admin_bypass` + le solde, appelle le
   provider, écrit `generation_jobs` + `credits_ledger`.
3. `generation-status` (polling) complète les jobs asynchrones (Veo 3.1).
4. `payment-webhook` crédite les packs / désactive le paiement simulé.

## 6) Super administrateur (créé par la migration, ne pas s'inscrire)
- Email : `superadmin@afritools.ai`
- Mot de passe : `Dev237!`
- Toute inscription avec un email `@afritools.ai` est refusée côté serveur
  (trigger `block_admin_domain_signup`) : les admins utilisent `/connexion`.

## 7) Frontend — build + prévisualisation + publication
```
pnpm install
pnpm build          # = tsc --noEmit + vite build
pnpm preview        # serveur local de production (défaut port 4173)
.\deploy.ps1 -CommitMessage "vX.Y.Z - description"
```
Ou, côté GitHub direct :
```
git add -A && git commit -m "vX.Y.Z - description"
git push origin HEAD
```

## 8) Notes importantes
- Jamais de clé service role / clé API dans le frontend : uniquement l'anon key.
- Les coûts IA sont plafonnés via `consume_credits` (solde, quotients) :
  aucune génération sans crédits suffisants.
- Chercher les secrets avant toute publication : `git grep -i "service_key"`.