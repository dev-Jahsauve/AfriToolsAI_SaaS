-- ===========================================================================
-- ACTIVATION DES MODÈLES IA (production) — AfriTools AI
-- Les modèles sont désactivés par défaut (is_active = false) pour éviter tout
-- coût tant que la clé API n'est pas fournie. Ce script les active tous.
-- À exécuter : Dashboard Supabase → SQL Editor (rôle postgres).
-- ===========================================================================

update public.ai_models
set is_active = true,
    updated_at = now()
where is_active = false;

update public.ai_tools
set is_active = true,
    is_published = true,
    updated_at = now()
where slug in
      ('fiche-produit', 'publicite', 'publication-sociale',
       'messages-whatsapp', 'offre-commerciale')
  and (not is_active or not is_published);

update public.plans
set is_active = true, updated_at = now()
where is_active = false;

update public.credit_packs
set is_active = true, updated_at = now()
where is_active = false;

select slug, provider, model_name, is_active
from public.ai_models
order by slug;