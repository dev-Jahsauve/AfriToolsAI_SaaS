-- ============================================================================
-- AfriTools AI — Migration 0001 : CREDIT ENGINE + MODULE COMMERCIAL
-- ----------------------------------------------------------------------------
-- RÈGLES DE SÛRETÉ RESPECTÉES :
--   * 100% ADDITIF : aucune table / colonne / policy / fonction existante n'est
--     modifiée, renommée ou supprimée. La table `profiles` et l'auth Supabase
--     restent intactes.
--   * Toutes les mutations de crédits passent par des fonctions SECURITY
--     DEFINER + RLS. Le frontend ne peut NI écrire NI contourner le moteur.
--   * Idempotence anti double-déduction garantie par contrainte UNIQUE sur
--     `credit_ledger.ref_id`.
--   * Apply/rollback atomique si une migration échoue.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.credit_op_type as enum
    ('daily_grant','subscription_grant','purchase','bonus','refund','consumption','reversal','admin_adjust','system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.credit_status as enum ('pending','completed','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('active','trialing','canceled','expired','paused','past_due');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 2. TABLEAUX (tous ADDITIFS)
-- ---------------------------------------------------------------------------
create table if not exists public.app_roles (
  slug        text primary key,
  label       text not null,
  level       smallint not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.user_accounts (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'user' references public.app_roles (slug),
  admin_bypass boolean not null default false,
  status       text not null default 'active' check (status in ('active','suspended')),
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.plans (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  description      text,
  price_fcfa       numeric(12,2) not null default 0,
  interval_days    int not null default 30,
  credits_per_period numeric(12,2) not null default 0,
  renew_credits    boolean not null default true,
  tools_allowed    jsonb not null default '[]'::jsonb,
  limits           jsonb not null default '{}'::jsonb,
  is_active        boolean not null default true,
  sort             int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.credit_packs (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  credit_amount numeric(12,2) not null,
  price_fcfa    numeric(12,2) not null default 0,
  valid_days    int,
  is_active     boolean not null default true,
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.ai_tools (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  description    text,
  credits_cost   numeric(12,4) not null default 1,
  is_active      boolean not null default true,
  is_published   boolean not null default true,
  max_daily_uses int,
  config         jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.ai_models (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  provider           text not null,
  model_name         text not null,
  label              text,
  description        text,
  credits_cost       numeric(12,4) not null default 1,
  cost_per_call_fcfa numeric(12,4) not null default 0,
  is_active          boolean not null default false,
  alert_threshold_fcfa numeric(12,2),
  config             jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.credit_balances (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  balance    numeric(12,4) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  op_type        public.credit_op_type not null,
  amount         numeric(12,4) not null,
  status         public.credit_status not null default 'completed',
  source         text,
  reason         text,
  ref_id         text unique,
  tool_id        uuid references public.ai_tools (id),
  model_id       uuid references public.ai_models (id),
  balance_after  numeric(12,4),
  admin_id       uuid references auth.users (id) on delete set null,
  admin_action   text,
  external_ref   text,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);
create index if not exists credit_ledger_type_idx on public.credit_ledger (op_type);
create index if not exists credit_ledger_ref_idx on public.credit_ledger (ref_id);

create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  plan_id             uuid references public.plans (id),
  status              public.subscription_status not null default 'active',
  price_paid_fcfa     numeric(12,2) not null default 0,
  starts_at           timestamptz not null default now(),
  current_period_start timestamptz not null default now(),
  current_period_end  timestamptz,
  renewal_credits     numeric(12,2) not null default 0,
  provider            text,
  provider_sub_id     text,
  cancel_at_period_end boolean not null default false,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id, status);

create table if not exists public.generations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  tool_id        uuid references public.ai_tools (id),
  model_id       uuid references public.ai_models (id),
  input          jsonb not null default '{}'::jsonb,
  output         text,
  credits_charged numeric(12,4) not null default 0,
  ref_id         text unique,
  status         text not null default 'pending' check (status in ('pending','completed','failed')),
  error          text,
  created_at     timestamptz not null default now()
);
create index if not exists generations_user_idx on public.generations (user_id, created_at desc);

create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  kind          text not null check (kind in ('subscription','pack','credits')),
  amount_fcfa   numeric(12,2) not null,
  currency      text not null default 'FCFA',
  provider      text,
  provider_ref  text,
  status        text not null default 'pending' check (status in ('pending','succeeded','failed','refunded')),
  ref_id        text unique,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id             bigserial primary key,
  actor_user_id  uuid references auth.users (id) on delete set null,
  action         text not null,
  entity_type    text,
  entity_id      text,
  meta           jsonb not null default '{}'::jsonb,
  ip             text,
  created_at     timestamptz not null default now()
);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action);

create table if not exists public.ai_cost_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete set null,
  tool_id      uuid references public.ai_tools (id),
  model_id     uuid references public.ai_models (id),
  provider     text not null,
  model_name   text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cost_fcfa    numeric(12,4) not null default 0,
  status       text not null default 'ok',
  ref_id       text unique,
  created_at   timestamptz not null default now()
);
create index if not exists ai_cost_logs_model_idx on public.ai_cost_logs (model_id, created_at desc);

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,
  type        text not null default 'info',
  title       text not null,
  body        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, read, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------
alter table public.app_roles       enable row level security;
alter table public.user_accounts   enable row level security;
alter table public.plans           enable row level security;
alter table public.credit_packs    enable row level security;
alter table public.ai_tools        enable row level security;
alter table public.ai_models       enable row level security;
alter table public.credit_balances enable row level security;
alter table public.credit_ledger   enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.generations     enable row level security;
alter table public.payments        enable row level security;
alter table public.app_settings    enable row level security;
alter table public.audit_logs      enable row level security;
alter table public.ai_cost_logs    enable row level security;
alter table public.notifications   enable row level security;

-- Catalogues publics (lecture seule) : marketing tarifs / outils publiés
drop policy if exists "read_public_plans" on public.plans;
create policy "read_public_plans" on public.plans for select using (is_active = true);
drop policy if exists "read_public_packs" on public.credit_packs;
create policy "read_public_packs" on public.credit_packs for select using (is_active = true);
drop policy if exists "read_public_tools" on public.ai_tools;
create policy "read_public_tools" on public.ai_tools for select using (is_published = true);
drop policy if exists "read_active_models" on public.ai_models;
create policy "read_active_models" on public.ai_models for select using (is_active = true);

-- Lecture ADMIN élargie sur tout le catalogue (y compris lignes inactives)
-- pour permettre la gestion dans l'Admin Dashboard.
drop policy if exists "admin_read_plans" on public.plans;
create policy "admin_read_plans" on public.plans for select using (public.has_role('admin'));
drop policy if exists "admin_read_packs" on public.credit_packs;
create policy "admin_read_packs" on public.credit_packs for select using (public.has_role('admin'));
drop policy if exists "admin_read_tools" on public.ai_tools;
create policy "admin_read_tools" on public.ai_tools for select using (public.has_role('admin'));
drop policy if exists "admin_read_models" on public.ai_models;
create policy "admin_read_models" on public.ai_models for select using (public.has_role('admin'));

-- Comptes/rôles : chacun peut lire sa propre ligne ; écriture bloquée (admin/systeme uniquement)
drop policy if exists "owner_read_account" on public.user_accounts;
create policy "owner_read_account" on public.user_accounts for select using (user_id = auth.uid());
drop policy if exists "admin_read_accounts" on public.user_accounts;
create policy "admin_read_accounts" on public.user_accounts for select using (public.has_role('moderator'));

-- Soldes / ledger : propriétaire en lecture seule, ZÉRO écriture par le frontend
drop policy if exists "owner_read_balance" on public.credit_balances;
create policy "owner_read_balance" on public.credit_balances for select using (user_id = auth.uid());
drop policy if exists "owner_read_ledger" on public.credit_ledger;
create policy "owner_read_ledger" on public.credit_ledger for select using (user_id = auth.uid());
drop policy if exists "admin_read_ledger" on public.credit_ledger;
create policy "admin_read_ledger" on public.credit_ledger for select using (public.has_role('moderator'));

-- Abonnements / générations / paiements / notifications : propriétaire R/W limité
drop policy if exists "owner_read_subs" on public.subscriptions;
create policy "owner_read_subs" on public.subscriptions for select using (user_id = auth.uid());
drop policy if exists "admin_read_subs" on public.subscriptions;
create policy "admin_read_subs" on public.subscriptions for select using (public.has_role('moderator'));

drop policy if exists "owner_read_gen" on public.generations;
create policy "owner_read_gen" on public.generations for select using (user_id = auth.uid());
drop policy if exists "owner_insert_gen" on public.generations;
create policy "owner_insert_gen" on public.generations for insert with check (user_id = auth.uid());
drop policy if exists "admin_read_gen" on public.generations;
create policy "admin_read_gen" on public.generations for select using (public.has_role('moderator'));

drop policy if exists "owner_read_payments" on public.payments;
create policy "owner_read_payments" on public.payments for select using (user_id = auth.uid());
drop policy if exists "admin_read_payments" on public.payments;
create policy "admin_read_payments" on public.payments for select using (public.has_role('moderator'));

drop policy if exists "read_settings" on public.app_settings;
create policy "read_settings" on public.app_settings for select using (true);

drop policy if exists "admin_read_audit" on public.audit_logs;
create policy "admin_read_audit" on public.audit_logs for select using (public.has_role('moderator'));
drop policy if exists "admin_read_costlogs" on public.ai_cost_logs;
create policy "admin_read_costlogs" on public.ai_cost_logs for select using (public.has_role('moderator'));

drop policy if exists "owner_read_notif" on public.notifications;
create policy "owner_read_notif" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "owner_update_notif" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. FONCTIONS CREDIT ENGINE (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
create or replace function public.is_system()
returns boolean language sql stable set search_path = public, pg_temp as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role'
$$;

create or replace function public.has_role(p_role text)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((
    select r.level >= target.level
    from public.user_accounts ua
    join public.app_roles r on r.slug = ua.role
    cross join public.app_roles target
    where ua.user_id = auth.uid() and target.slug = p_role
  ), false)
$$;

create or replace function public.is_admin_or(p_role text)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select public.is_system() or public.has_role(p_role)
$$;

-- Enregistrement d'une opération d'audit (infra interne)
create or replace function public.log_audit(
  p_action text, p_entity_type text default null, p_entity_id text default null,
  p_meta jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, meta, ip)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_meta, '{}'::jsonb),
          current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for');
end $$;

-- Application atomique d'un mouvement de crédit (moteur interne).
-- Anti double-déduction : contrainte UNIQUE sur ref_id + verrou ligne utilisateur.
create or replace function public.apply_credit(
  p_user_id uuid,
  p_amount  numeric,
  p_op_type text,
  p_source  text,
  p_reason  text default null,
  p_ref_id  text default null,
  p_tool_id uuid default null,
  p_model_id uuid default null,
  p_admin_id uuid default null,
  p_admin_action text default null,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_bal numeric;
  v_new numeric;
  v_ledger_id uuid;
begin
  if p_ref_id is not null and exists(select 1 from public.credit_ledger where ref_id = p_ref_id) then
    return jsonb_build_object('applied', false, 'duplicate', true);
  end if;

  insert into public.credit_balances (user_id, balance) values (p_user_id, 0)
    on conflict (user_id) do nothing;

  select balance into v_bal from public.credit_balances where user_id = p_user_id for update;
  v_new := coalesce(v_bal, 0) + coalesce(p_amount, 0);

  begin
    insert into public.credit_ledger
      (user_id, op_type, amount, status, source, reason, ref_id, tool_id, model_id,
       balance_after, admin_id, admin_action, metadata)
    values
      (p_user_id, p_op_type::public.credit_op_type, p_amount, 'completed',
       p_source, p_reason, p_ref_id, p_tool_id, p_model_id,
       v_new, p_admin_id, p_admin_action, coalesce(p_metadata, '{}'::jsonb))
    returning id into v_ledger_id;
  exception when unique_violation then
    return jsonb_build_object('applied', false, 'duplicate', true);
  end;

  update public.credit_balances set balance = v_new, updated_at = now() where user_id = p_user_id;

  return jsonb_build_object('applied', true, 'duplicate', false, 'balance', v_new, 'ledger_id', v_ledger_id);
end $$;

-- DÉBIT ATOMIQUE d'une génération — implémentation interne.
-- Utilisée par `consume_credits` (client authentifié) et `system_consume_credits`
-- (Edge Functions avec service_role). Ne JAMAIS exposer directement via REST.
create or replace function public._consume_credits(
  p_uid       uuid,
  p_tool_slug text,
  p_ref_id    text,
  p_meta      jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_tool public.ai_tools%rowtype;
  v_bypass boolean;
  v_status text;
  v_bal numeric;
  v_cost numeric;
  v_res jsonb;
  v_today int;
begin
  if p_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;
  if p_ref_id is null or btrim(p_ref_id) = '' then
    return jsonb_build_object('ok', false, 'error', 'REF_REQUIRED');
  end if;

  select * into v_tool from public.ai_tools where slug = p_tool_slug limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'TOOL_NOT_FOUND');
  end if;
  if not (v_tool.is_active and v_tool.is_published) then
    return jsonb_build_object('ok', false, 'error', 'TOOL_UNAVAILABLE');
  end if;

  if exists(select 1 from public.credit_ledger where ref_id = p_ref_id) then
    return jsonb_build_object('ok', false, 'error', 'DUPLICATE');
  end if;

  select coalesce(admin_bypass, false), coalesce(status, 'active') into v_bypass, v_status
  from public.user_accounts where user_id = p_uid;

  if v_status = 'suspended' then
    return jsonb_build_object('ok', false, 'error', 'ACCOUNT_SUSPENDED');
  end if;

  if v_tool.max_daily_uses is not null then
    select count(*) into v_today
    from public.credit_ledger
    where user_id = p_uid and tool_id = v_tool.id and op_type = 'consumption'
      and created_at >= date_trunc('day', now());
    if v_today >= v_tool.max_daily_uses then
      return jsonb_build_object('ok', false, 'error', 'DAILY_LIMIT');
    end if;
  end if;

  v_cost := case when v_bypass then 0 else v_tool.credits_cost end;

  if not v_bypass and v_cost > 0 then
    select balance into v_bal from public.credit_balances where user_id = p_uid;
    if coalesce(v_bal, 0) < v_cost then
      return jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_CREDITS',
        'required', v_cost, 'balance', coalesce(v_bal, 0));
    end if;
  end if;

  v_res := public.apply_credit(
    p_uid, case when v_bypass then 0 else -v_cost end, 'consumption',
    v_tool.slug, 'Consommation « ' || v_tool.name || ' »', p_ref_id,
    v_tool.id, null, null, null, p_meta);

  if not (coalesce(v_res->>'applied', 'false') = 'true') then
    return jsonb_build_object('ok', false, 'error', 'DUPLICATE');
  end if;

  return jsonb_build_object('ok', true, 'charged', v_cost, 'balance',
    (v_res->>'balance')::numeric, 'bypass', coalesce(v_bypass, false), 'ledger_id', v_res->>'ledger_id');
end $$;

-- DÉBIT exposé au client authentifié (REST/RPC sécurisé)
create or replace function public.consume_credits(
  p_tool_slug text,
  p_ref_id    text,
  p_meta      jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;
  return public._consume_credits(auth.uid(), p_tool_slug, p_ref_id, p_meta);
end $$;

-- DÉBIT système (Edge Function `generate` avec service_role, uid vérifié)
create or replace function public.system_consume_credits(
  p_user_id   uuid,
  p_tool_slug text,
  p_ref_id    text,
  p_meta      jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_system() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  return public._consume_credits(p_user_id, p_tool_slug, p_ref_id, p_meta);
end $$;

-- CLAIM des crédits gratuits quotidiens (configurable dans app_settings)
create or replace function public.claim_daily_free_credits()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  v_cfg jsonb;
  v_qty numeric;
  v_enabled boolean;
  v_interval_hours int;
  v_tools jsonb;
  v_last timestamptz;
  v_ref text;
  v_res jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select value into v_cfg from public.app_settings where key = 'daily_free_credits';
  if v_cfg is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_CONFIGURED');
  end if;

  v_qty   := coalesce((v_cfg->>'quantity')::numeric, 0);
  v_enabled := coalesce((v_cfg->>'enabled')::boolean, false);
  v_interval_hours := coalesce((v_cfg->>'reset_interval_hours')::int, 24);
  v_tools := coalesce(v_cfg->'tools', '[]'::jsonb);

  if not v_enabled or v_qty <= 0 then
    return jsonb_build_object('ok', false, 'error', 'DISABLED');
  end if;

  select max(created_at) into v_last from public.credit_ledger
   where user_id = v_uid and op_type = 'daily_grant';

  if v_last is not null and v_last > now() - make_interval(hours => v_interval_hours) then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_CLAIMED', 'next_at',
      (v_last + make_interval(hours => v_interval_hours))::text);
  end if;

  v_ref := 'daily:' || v_uid || ':' || to_char(now(), 'YYYY-MM-DD');
  v_res := public.apply_credit(v_uid, v_qty, 'daily_grant', 'daily_free',
    'Crédits gratuits quotidiens', v_ref, null, null, null, null,
    jsonb_build_object('quantity', v_qty, 'tools', v_tools));

  if not (coalesce(v_res->>'applied', 'false') = 'true') then
    return jsonb_build_object('ok', false, 'error', 'DUPLICATE');
  end if;

  return jsonb_build_object('ok', true, 'granted', v_qty, 'balance', v_res->>'balance');
end $$;

-- Résumé crédits / compte / quota (pour le frontend)
create or replace function public.get_credit_summary()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  v_balance numeric;
  v_acc public.user_accounts%rowtype;
  v_cfg jsonb;
  v_daily_claimed boolean := false;
  v_daily_last timestamptz;
  v_interval_hours int;
  v_today_used numeric := 0;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select balance into v_balance from public.credit_balances where user_id = v_uid;
  select * into v_acc from public.user_accounts where user_id = v_uid;
  select value into v_cfg from public.app_settings where key = 'daily_free_credits';

  v_interval_hours := coalesce((v_cfg->>'reset_interval_hours')::int, 24);

  select max(created_at) into v_daily_last from public.credit_ledger
   where user_id = v_uid and op_type = 'daily_grant';
  v_daily_claimed := v_daily_last is not null
    and v_daily_last > now() - make_interval(hours => v_interval_hours);

  select coalesce(sum(amount), 0) into v_today_used from public.credit_ledger
   where user_id = v_uid and op_type = 'consumption' and status = 'completed'
     and created_at >= date_trunc('day', now());

  return jsonb_build_object(
    'ok', true,
    'balance', coalesce(v_balance, 0),
    'role', coalesce(v_acc.role, 'user'),
    'admin_bypass', coalesce(v_acc.admin_bypass, false),
    'status', coalesce(v_acc.status, 'active'),
    'daily_free', jsonb_build_object(
      'enabled', coalesce((v_cfg->>'enabled')::boolean, false),
      'quantity', coalesce((v_cfg->>'quantity')::numeric, 0),
      'reset_interval_hours', v_interval_hours,
      'claimed_today', v_daily_claimed,
      'next_at', case
        when v_daily_claimed and v_daily_last is not null then
          (v_daily_last + make_interval(hours => v_interval_hours))::text
        else null end
    ),
    'today_consumed', v_today_used
  );
end $$;

-- REMBOURSEMENT automatique (échec imputable au système)
create or replace function public.refund_credits(
  p_ref_id text,
  p_reason text default 'Remboursement suite à un echec systeme'
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  v_orig public.credit_ledger%rowtype;
  v_res jsonb;
begin
  if not (public.is_system() or public.has_role('moderator')) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  select * into v_orig from public.credit_ledger
   where ref_id = p_ref_id limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if v_orig.status <> 'completed' or (v_orig.metadata->>'refunded')::boolean = true or v_orig.amount >= 0 then
    return jsonb_build_object('ok', false, 'error', 'NOT_REFUNDABLE');
  end if;

  v_res := public.apply_credit(v_orig.user_id, -v_orig.amount, 'refund',
    'refund', p_reason, null, v_orig.tool_id, v_orig.model_id, v_uid, 'refund',
    jsonb_build_object('refund_of', p_ref_id));

  if not (coalesce(v_res->>'applied', 'false') = 'true') then
    return v_res;
  end if;

  update public.credit_ledger set metadata = metadata || '{"refunded": true}'::jsonb
   where ref_id = p_ref_id;

  return jsonb_build_object('ok', true, 'refunded', -v_orig.amount,
    'balance', v_res->>'balance', 'ledger_id', v_res->>'ledger_id');
end $$;

-- Fallback "refund" simple sans vérification de rôle pour usage interne systeme
create or replace function public.system_refund_credits(
  p_ref_id text, p_reason text default 'Remboursement systeme'
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_res jsonb;
begin
  if not public.is_system() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  select public.refund_credits(p_ref_id, p_reason) into v_res;
  return v_res;
end $$;

-- Renouvellement des abonnements arrivant à échéance (admin / job chronométré)
create or replace function public.renew_subscriptions()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_rec record;
  v_plan public.plans%rowtype;
  v_res jsonb;
  v_count int := 0;
begin
  if not public.is_system() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  for v_rec in
    select s.* from public.subscriptions s
    where s.status = 'active'
      and s.current_period_end is not null
      and s.current_period_end <= now()
      and s.cancel_at_period_end = false
  loop
    select p.* into v_plan from public.plans p where p.id = v_rec.plan_id;
    update public.subscriptions set
      current_period_start = v_rec.current_period_end,
      current_period_end = v_rec.current_period_end + make_interval(days => coalesce(v_plan.interval_days, 30)),
      updated_at = now()
    where id = v_rec.id;

    if v_rec.renewal_credits > 0 then
      v_res := public.apply_credit(v_rec.user_id, v_rec.renewal_credits,
        'subscription_grant', 'plan:' || v_plan.slug,
        'Renouvellement plan ' || v_plan.name || ' — ' || v_rec.renewal_credits || ' crédits',
        'renew:' || v_rec.id || ':' || to_char(v_rec.current_period_end, 'YYYY-MM-DD'));
      v_count := v_count + 1;
    end if;
  end loop;

  return jsonb_build_object('ok', true, 'renewed', v_count);
end $$;

-- Trigger : création automatique du compte parent à chaque nouvel utilisateur
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.user_accounts (user_id) values (new.id)
    on conflict (user_id) do nothing;
  insert into public.credit_balances (user_id, balance) values (new.id, 0)
    on conflict (user_id) do nothing;
  return new;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. FONCTIONS ADMINISTRATION (SECURITY DEFINER, rôle vérifié serveur)
-- ---------------------------------------------------------------------------
create or replace function public.admin_require()
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.has_role('admin') then
    raise exception 'FORBIDDEN';
  end if;
  return true;
end $$;

create or replace function public.admin_grant_credits(
  p_user_id uuid, p_amount numeric, p_source text, p_reason text,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  v_res jsonb;
begin
  if not public.has_role('moderator') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_AMOUNT');
  end if;
  v_res := public.apply_credit(p_user_id, p_amount, 'admin_adjust', coalesce(p_source, 'admin'),
    p_reason, 'admin:' || gen_random_uuid()::text, null, null, v_uid, 'grant', p_metadata);
  perform public.log_audit('admin.grant_credits', 'credit', p_user_id::text,
    jsonb_build_object('amount', p_amount, 'source', p_source, 'reason', p_reason));
  return jsonb_build_object('ok', true, 'balance', v_res->>'balance', 'ledger_id', v_res->>'ledger_id');
end $$;

create or replace function public.admin_set_role(p_user_id uuid, p_role text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.has_role('super_admin') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if not exists(select 1 from public.app_roles where slug = p_role) then
    return jsonb_build_object('ok', false, 'error', 'INVALID_ROLE');
  end if;
  insert into public.user_accounts (user_id, role) values (p_user_id, p_role)
    on conflict (user_id) do update set role = excluded.role, updated_at = now();
  perform public.log_audit('admin.set_role', 'user_role', p_user_id::text, jsonb_build_object('role', p_role));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.admin_set_bypass(p_user_id uuid, p_bypass boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.has_role('admin') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  insert into public.user_accounts (user_id, admin_bypass) values (p_user_id, coalesce(p_bypass, false))
    on conflict (user_id) do update set admin_bypass = excluded.admin_bypass, updated_at = now();
  perform public.log_audit('admin.set_bypass', 'user_account', p_user_id::text, jsonb_build_object('bypass', p_bypass));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.admin_set_status(p_user_id uuid, p_status text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.has_role('moderator') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  insert into public.user_accounts (user_id, status) values (p_user_id, p_status)
    on conflict (user_id) do update set status = excluded.status, updated_at = now();
  perform public.log_audit('admin.set_status', 'user_account', p_user_id::text, jsonb_build_object('status', p_status));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.admin_get_users(p_limit int default 100, p_offset int default 0, p_search text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_rows jsonb;
  v_total int;
begin
  if not public.has_role('moderator') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  select jsonb_agg(t) into v_rows from (
    select u.id, p.nom, p.prenom, p.email, p.plan_id,
           ua.role, ua.admin_bypass, ua.status, ua.created_at as account_created_at,
           cb.balance,
           (select count(*)::int from public.credit_ledger cl where cl.user_id = u.id) as tx_count
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.user_accounts ua on ua.user_id = u.id
    left join public.credit_balances cb on cb.user_id = u.id
    where (p_search is null or p_search = '' 
           or p.nom ilike '%'||p_search||'%' or p.prenom ilike '%'||p_search||'%' or p.email ilike '%'||p_search||'%')
    order by u.created_at desc
    limit greatest(p_limit, 1) offset greatest(p_offset, 0)
  ) t;

  select count(*) into v_total from auth.users u
    left join public.profiles p on p.id = u.id
    where (p_search is null or p_search = ''
           or p.nom ilike '%'||p_search||'%' or p.prenom ilike '%'||p_search||'%' or p.email ilike '%'||p_search||'%');

  return jsonb_build_object('ok', true, 'rows', coalesce(v_rows, '[]'::jsonb), 'total', v_total);
end $$;

create or replace function public.admin_get_ledger(p_user_id uuid default null, p_limit int default 100, p_offset int default 0)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_rows jsonb;
begin
  if not public.has_role('moderator') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  select jsonb_agg(t) into v_rows from (
    select cl.id, cl.user_id, cl.op_type, cl.amount, cl.status, cl.source, cl.reason,
           cl.ref_id, cl.balance_after, cl.admin_id, cl.admin_action, cl.created_at,
           t.name as tool_name, m.label as model_label
    from public.credit_ledger cl
    left join public.ai_tools t on t.id = cl.tool_id
    left join public.ai_models m on m.id = cl.model_id
    where (p_user_id is null or cl.user_id = p_user_id)
    order by cl.created_at desc
    limit greatest(p_limit,1) offset greatest(p_offset,0)
  ) t;
  return jsonb_build_object('ok', true, 'rows', coalesce(v_rows, '[]'::jsonb));
end $$;

create or replace function public.admin_upsert_plan(p_plan jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_id uuid;
begin
  if not public.has_role('admin') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if p_plan->>'id' is null or (p_plan->>'id')::text = '' then
    insert into public.plans (slug, name, description, price_fcfa, interval_days,
      credits_per_period, renew_credits, tools_allowed, limits, is_active, sort)
    values (p_plan->>'slug', p_plan->>'name', p_plan->>'description',
      coalesce((p_plan->>'price_fcfa')::numeric, 0),
      coalesce((p_plan->>'interval_days')::int, 30),
      coalesce((p_plan->>'credits_per_period')::numeric, 0),
      coalesce((p_plan->>'renew_credits')::boolean, true),
      coalesce(p_plan->'tools_allowed', '[]'::jsonb),
      coalesce(p_plan->'limits', '{}'::jsonb),
      coalesce((p_plan->>'is_active')::boolean, true),
      coalesce((p_plan->>'sort')::int, 0))
    returning id into v_id;
  else
    update public.plans set
      slug = coalesce(p_plan->>'slug', slug),
      name = coalesce(p_plan->>'name', name),
      description = coalesce(p_plan->>'description', description),
      price_fcfa = coalesce((p_plan->>'price_fcfa')::numeric, price_fcfa),
      interval_days = coalesce((p_plan->>'interval_days')::int, interval_days),
      credits_per_period = coalesce((p_plan->>'credits_per_period')::numeric, credits_per_period),
      renew_credits = coalesce((p_plan->>'renew_credits')::boolean, renew_credits),
      tools_allowed = coalesce(p_plan->'tools_allowed', tools_allowed),
      limits = coalesce(p_plan->'limits', limits),
      is_active = coalesce((p_plan->>'is_active')::boolean, is_active),
      sort = coalesce((p_plan->>'sort')::int, sort),
      updated_at = now()
    where id = (p_plan->>'id')::uuid
    returning id into v_id;
  end if;

  perform public.log_audit('admin.upsert_plan', 'plan', v_id::text, p_plan);
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

create or replace function public.admin_upsert_pack(p_pack jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.has_role('admin') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if p_pack->>'id' is null or (p_pack->>'id')::text = '' then
    insert into public.credit_packs (slug, name, credit_amount, price_fcfa, valid_days, is_active, sort)
    values (p_pack->>'slug', p_pack->>'name', (p_pack->>'credit_amount')::numeric,
      coalesce((p_pack->>'price_fcfa')::numeric, 0), (p_pack->>'valid_days')::int,
      coalesce((p_pack->>'is_active')::boolean, true), coalesce((p_pack->>'sort')::int, 0))
    returning id into v_id;
  else
    update public.credit_packs set
      slug = coalesce(p_pack->>'slug', slug),
      name = coalesce(p_pack->>'name', name),
      credit_amount = coalesce((p_pack->>'credit_amount')::numeric, credit_amount),
      price_fcfa = coalesce((p_pack->>'price_fcfa')::numeric, price_fcfa),
      valid_days = coalesce((p_pack->>'valid_days')::int, valid_days),
      is_active = coalesce((p_pack->>'is_active')::boolean, is_active),
      sort = coalesce((p_pack->>'sort')::int, sort),
      updated_at = now()
    where id = (p_pack->>'id')::uuid
    returning id into v_id;
  end if;
  perform public.log_audit('admin.upsert_pack', 'credit_pack', v_id::text, p_pack);
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

create or replace function public.admin_upsert_tool(p_tool jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.has_role('admin') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if p_tool->>'id' is null or (p_tool->>'id')::text = '' then
    insert into public.ai_tools (slug, name, description, credits_cost, is_active, is_published, max_daily_uses, config)
    values (p_tool->>'slug', p_tool->>'name', p_tool->>'description',
      coalesce((p_tool->>'credits_cost')::numeric, 1),
      coalesce((p_tool->>'is_active')::boolean, true),
      coalesce((p_tool->>'is_published')::boolean, true),
      (p_tool->>'max_daily_uses')::int, coalesce(p_tool->'config', '{}'::jsonb))
    returning id into v_id;
  else
    update public.ai_tools set
      slug = coalesce(p_tool->>'slug', slug),
      name = coalesce(p_tool->>'name', name),
      description = coalesce(p_tool->>'description', description),
      credits_cost = coalesce((p_tool->>'credits_cost')::numeric, credits_cost),
      is_active = coalesce((p_tool->>'is_active')::boolean, is_active),
      is_published = coalesce((p_tool->>'is_published')::boolean, is_published),
      max_daily_uses = coalesce((p_tool->>'max_daily_uses')::int, max_daily_uses),
      config = coalesce(p_tool->'config', config),
      updated_at = now()
    where id = (p_tool->>'id')::uuid
    returning id into v_id;
  end if;
  perform public.log_audit('admin.upsert_tool', 'ai_tool', v_id::text, p_tool);
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

create or replace function public.admin_upsert_model(p_model jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.has_role('admin') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if p_model->>'id' is null or (p_model->>'id')::text = '' then
    insert into public.ai_models (slug, provider, model_name, label, description,
      credits_cost, cost_per_call_fcfa, is_active, alert_threshold_fcfa, config)
    values (p_model->>'slug', p_model->>'provider', p_model->>'model_name', p_model->>'label',
      p_model->>'description', coalesce((p_model->>'credits_cost')::numeric, 1),
      coalesce((p_model->>'cost_per_call_fcfa')::numeric, 0),
      coalesce((p_model->>'is_active')::boolean, false),
      (p_model->>'alert_threshold_fcfa')::numeric, coalesce(p_model->'config', '{}'::jsonb))
    returning id into v_id;
  else
    update public.ai_models set
      slug = coalesce(p_model->>'slug', slug),
      provider = coalesce(p_model->>'provider', provider),
      model_name = coalesce(p_model->>'model_name', model_name),
      label = coalesce(p_model->>'label', label),
      description = coalesce(p_model->>'description', description),
      credits_cost = coalesce((p_model->>'credits_cost')::numeric, credits_cost),
      cost_per_call_fcfa = coalesce((p_model->>'cost_per_call_fcfa')::numeric, cost_per_call_fcfa),
      is_active = coalesce((p_model->>'is_active')::boolean, is_active),
      alert_threshold_fcfa = coalesce((p_model->>'alert_threshold_fcfa')::numeric, alert_threshold_fcfa),
      config = coalesce(p_model->'config', config),
      updated_at = now()
    where id = (p_model->>'id')::uuid
    returning id into v_id;
  end if;
  perform public.log_audit('admin.upsert_model', 'ai_model', v_id::text, p_model);
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

create or replace function public.admin_set_setting(p_key text, p_value jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.has_role('admin') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  insert into public.app_settings (key, value, updated_by)
  values (p_key, p_value, auth.uid())
  on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now();
  perform public.log_audit('admin.set_setting', 'app_settings', p_key, p_value);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.admin_get_stats()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_users int; v_gen int; v_cr numeric; v_sub int; v_rev numeric; v_daily int;
begin
  if not public.has_role('moderator') then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  select count(*) into v_users from auth.users;
  select count(*) into v_gen from public.generations where status = 'completed';
  select coalesce(sum(balance), 0) into v_cr from public.credit_balances;
  select count(*) into v_sub from public.subscriptions where status = 'active';
  select coalesce(sum(amount_fcfa), 0) into v_rev from public.payments where status = 'succeeded';
  select count(*) into v_daily from public.generations
   where status = 'completed' and created_at >= date_trunc('day', now());
  return jsonb_build_object('ok', true, 'users', v_users, 'generations', v_gen,
    'credits_outstanding', v_cr, 'active_subscriptions', v_sub, 'revenue_fcfa', v_rev,
    'generations_today', v_daily);
end $$;

-- ---------------------------------------------------------------------------
-- 6. DONNÉES INITIALES (configurables — AUCUNE valeur commerciale codée en dur
--    dans le frontend ; ces lignes ne sont que le seed de départ)
-- ---------------------------------------------------------------------------
insert into public.app_roles (slug, label, level) values
  ('user', 'Utilisateur', 0),
  ('moderator', 'Modérateur', 1),
  ('admin', 'Administrateur', 2),
  ('super_admin', 'Super Admin', 3)
on conflict (slug) do nothing;

insert into public.ai_tools (slug, name, description, credits_cost, is_active, is_published) values
  ('fiche-produit', 'Fiche produit', 'Fiches produits persuasives', 1, true, true),
  ('publicite', 'Publicité', 'Textes publicitaires multi-plateformes', 1, true, true),
  ('publication-sociale', 'Publication sociale', 'Posts optimisés par réseau', 1, true, true),
  ('messages-whatsapp', 'Messages WhatsApp', 'Messages commerciaux WhatsApp', 1, true, true),
  ('offre-commerciale', 'Offre commerciale', 'Offres promotionnelles', 1, true, true)
on conflict (slug) do nothing;

-- Modèles IA multicollectivités. Veo 3.1 = API officielle Google (Gemini API).
-- Identifiants officiels vérifiés : veo-3.1-generate-preview,
-- veo-3.1-fast-generate-preview, veo-3.1-lite-generate-preview (async, poll).
-- Désactivés par défaut : activation admin uniquement une fois la clé fournie.
insert into public.ai_models (slug, provider, model_name, label, description, credits_cost, cost_per_call_fcfa, is_active, config) values
  ('google-veo-3.1', 'google', 'veo-3.1-generate-preview', 'Google Veo 3.1', 'Génération vidéo Google (standard) — API Gemini, asynchrone', 20, 2000, false, '{"kind":"video","async":true,"auth_header":"x-goog-api-key","poll":true,"note":"Tarif indicatif ~$0.40/s (8s ≈ 2000 FCFA) — à re-vérifier avant activation"}'),
  ('google-veo-3.1-fast', 'google', 'veo-3.1-fast-generate-preview', 'Google Veo 3.1 Fast', 'Génération vidéo Google (rapide)', 12, 1200, false, '{"kind":"video","async":true,"auth_header":"x-goog-api-key","poll":true,"note":"Tarif indicatif ~$0.15/s — à re-vérifier avant activation"}'),
  ('google-veo-3.1-lite', 'google', 'veo-3.1-lite-generate-preview', 'Google Veo 3.1 Lite', 'Génération vidéo Google (léger)', 8, 600, false, '{"kind":"video","async":true,"auth_header":"x-goog-api-key","poll":true,"note":"720p max, tarif indicatif — à re-vérifier avant activation"}')
on conflict (slug) do nothing;

insert into public.plans (slug, name, description, price_fcfa, interval_days, credits_per_period, renew_credits, tools_allowed, is_active, sort) values
  ('free', 'Gratuit', '5 crédits offerts par renouvellement', 0, 30, 5, true, '["fiche-produit","publicite","publication-sociale","messages-whatsapp","offre-commerciale"]', true, 0),
  ('starter', 'Starter', 'Pour démarrer', 1500, 30, 100, true, '["fiche-produit","publicite","publication-sociale","messages-whatsapp","offre-commerciale"]', true, 1),
  ('pro', 'Pro', 'Pour les entrepreneurs actifs', 3500, 30, 500, true, '["fiche-produit","publicite","publication-sociale","messages-whatsapp","offre-commerciale"]', true, 2),
  ('business', 'Business', 'Usage intensif', 7500, 30, 2000, true, '["fiche-produit","publicite","publication-sociale","messages-whatsapp","offre-commerciale"]', true, 3)
on conflict (slug) do nothing;

insert into public.credit_packs (slug, name, credit_amount, price_fcfa, is_active, sort) values
  ('pack-500', 'Pack 500 crédits', 500, 2500, true, 0),
  ('pack-1000', 'Pack 1000 crédits', 1000, 4500, true, 1),
  ('pack-5000', 'Pack 5000 crédits', 5000, 20000, true, 2),
  ('pack-10000', 'Pack 10000 crédits', 10000, 35000, true, 3)
on conflict (slug) do nothing;

insert into public.app_settings (key, value) values
  ('daily_free_credits', '{"quantity": 5, "enabled": true, "reset_interval_hours": 24, "tools": ["fiche-produit","publicite","publication-sociale","messages-whatsapp","offre-commerciale"]}'::jsonb)
on conflict (key) do nothing;

-- Accorder des droits d'exécution REST (jamais de droits d'écriture directs)
grant execute on function public.consume_credits(text, text, jsonb) to authenticated;
grant execute on function public.claim_daily_free_credits() to authenticated;
grant execute on function public.get_credit_summary() to authenticated;
grant execute on function public.refund_credits(text, text) to authenticated;
grant execute on function public.admin_grant_credits(uuid, numeric, text, text, jsonb) to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_bypass(uuid, boolean) to authenticated;
grant execute on function public.admin_set_status(uuid, text) to authenticated;
grant execute on function public.admin_get_users(int, int, text) to authenticated;
grant execute on function public.admin_get_ledger(uuid, int, int) to authenticated;
grant execute on function public.admin_upsert_plan(jsonb) to authenticated;
grant execute on function public.admin_upsert_pack(jsonb) to authenticated;
grant execute on function public.admin_upsert_tool(jsonb) to authenticated;
grant execute on function public.admin_upsert_model(jsonb) to authenticated;
grant execute on function public.admin_set_setting(text, jsonb) to authenticated;
grant execute on function public.admin_get_stats() to authenticated;
grant execute on function public.renew_subscriptions() to service_role;
grant execute on function public.system_refund_credits(text, text) to service_role;
grant execute on function public.system_consume_credits(uuid, text, text, jsonb) to service_role;
-- apply_credit : réservé au service (webhook paiement, remboursements système,
-- allocation initiale). JAMAIS exposé au frontend.
grant execute on function public.apply_credit(uuid, numeric, text, text, text, text, uuid, uuid, uuid, text, jsonb) to service_role;

-- DURCISSEMENT : le frontend ne peut JAMAIS appeler directement les fonctions
-- internes (apply_credit, _consume_credits, system_*) ni les fonctions admin.
-- Seuls les wrappers publics + le service_role (Edge Functions) sont exposés.
revoke all on function public.apply_credit(uuid, numeric, text, text, text, text, uuid, uuid, uuid, text, jsonb) from public, anon;
revoke all on function public._consume_credits(uuid, text, text, jsonb) from public, anon;
revoke all on function public.system_consume_credits(uuid, text, text, jsonb) from public, anon;
revoke all on function public.system_refund_credits(text, text) from public, anon;
revoke all on function public.renew_subscriptions() from public, anon;
revoke all on function public.handle_new_user() from public, anon;
revoke all on function public.admin_require() from public, anon;
revoke all on function public.log_audit(text, text, text, jsonb) from public, anon;
revoke all on function public.refund_credits(text, text) from public, anon;
revoke all on function public.admin_grant_credits(uuid, numeric, text, text, jsonb) from public, anon;
revoke all on function public.admin_set_role(uuid, text) from public, anon;
revoke all on function public.admin_set_bypass(uuid, boolean) from public, anon;
revoke all on function public.admin_set_status(uuid, text) from public, anon;
revoke all on function public.admin_get_users(int, int, text) from public, anon;
revoke all on function public.admin_get_ledger(uuid, int, int) from public, anon;
revoke all on function public.admin_upsert_plan(jsonb) from public, anon;
revoke all on function public.admin_upsert_pack(jsonb) from public, anon;
revoke all on function public.admin_upsert_tool(jsonb) from public, anon;
revoke all on function public.admin_upsert_model(jsonb) from public, anon;
revoke all on function public.admin_set_setting(text, jsonb) from public, anon;
revoke all on function public.admin_get_stats() from public, anon;

-- ---------------------------------------------------------------------------
-- 7. COMPTE SUPER ADMINISTRATEUR + CONTRÔLE D'INSCRIPTION DES ADMINS
--    L'administrateur ne s'inscrit PAS comme les autres utilisateurs :
--      - il est créé ici (idempotent), une seule fois, avec des identifiants fixes ;
--      - il se connecte ensuite via /connexion normalement ;
--      - toute création d'un compte avec un email @afritools.ai est REFUSÉE côté
--        serveur (sauf si marquée is_super_admin, ce qui autorise le seed ci-dessous).
--
--    Super admin :
--      email        : superadmin@afritools.ai
--      mot de passe : Dev237!
--    (à changer, si besoin, par un UPDATE ciblé sur auth.users / user_accounts.)
-- ---------------------------------------------------------------------------

-- a) Blocage serveur : interdit la création d'un compte sur le domaine admin
create or replace function public.block_admin_domain_signup()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if lower(new.email) like '%@afritools.ai'
     and coalesce(new.raw_user_meta_data->>'is_super_admin', 'false') <> 'true'
  then
    raise exception 'ADMIN_SIGNUP_FORBIDDEN: utilisez la connexion pour acceder a votre compte administrateur.';
  end if;
  return new;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger
                 where tgname = 'on_auth_user_created_block_admin'
                   and tgrelid = 'auth.users'::regclass) then
    create trigger on_auth_user_created_block_admin
      after insert on auth.users
      for each row execute function public.block_admin_domain_signup();
  end if;
end $$;

-- b) Création du super admin (idempotente) + promotion super_admin à chaque exécution
do $$
declare
  v_admin uuid;
begin
  select id into v_admin from auth.users where lower(email) = 'superadmin@afritools.ai';

  if v_admin is null then
    insert into auth.users
      (instance_id, id, aud, role, email, encrypted_password,
       email_confirmed_at, confirmation_sent_at,
       confirmation_token, recovery_token, email_change_token_new,
       email_change_token_current, email_change,
       raw_app_meta_data, raw_user_meta_data,
       created_at, updated_at, is_super_admin)
    values
      ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),
       'authenticated', 'authenticated', 'superadmin@afritools.ai',
       crypt('Dev237!', gen_salt('bf', 10)),
       now(), now(),
       '', '', '',
       '', '',
       '{"provider":"email","providers":["email"]}',
       '{"prenom":"AfriTools","nom":"Admin","is_super_admin":true}',
       now(), now(), false)
    returning id into v_admin;

    insert into auth.identities
      (provider_id, user_id, identity_data, provider,
       last_sign_in_at, created_at, updated_at)
    values
      (v_admin::text, v_admin,
       jsonb_build_object('sub', v_admin::text, 'email', 'superadmin@afritools.ai',
                          'email_verified', true, 'phone_verified', false),
       'email', now(), now(), now())
    on conflict (provider_id, provider) do nothing;
  end if;

  insert into public.user_accounts (user_id, role, admin_bypass, status)
    values (v_admin, 'super_admin', true, 'active')
    on conflict (user_id) do update
      set role = 'super_admin', admin_bypass = true, status = 'active', updated_at = now();

  insert into public.credit_balances (user_id, balance) values (v_admin, 10000)
    on conflict (user_id) do nothing;

  insert into public.profiles (id, nom, prenom, email, plan_id, generations_used, generations_limit)
    values (v_admin, 'Admin', 'AfriTools', 'superadmin@afritools.ai', 'business', 0, 2000)
    on conflict (id) do update
      set email = excluded.email, plan_id = 'business';
end $$;

-- Copie autonome de ce script : supabase/scripts/seed_super_admin.sql
-- (récupérable à tout moment pour ré-pousser le compte administrateur).

commit;