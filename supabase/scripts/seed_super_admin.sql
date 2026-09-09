-- ===========================================================================
-- SEED SUPER ADMINISTRATEUR — AfriTools AI
-- Idempotent : peut être ré-exécuté sans risque (promote role au besoin).
-- À exécuter en : SQL Editor (Dashboard Supabase) avec le rôle postgres.
--
--   email        : superadmin@afritools.ai
--   mot de passe : Dev237!
--
-- Effets :
--   1. Crée auth.users + auth.identities si l'email est absent ;
--   2. Force count user_accounts.role = 'super_admin' (admin_bypass ON) ;
--   3. Garantit un solde initial de 10 000 crédits ;
--   4. Remplit public.profiles (plan business).
-- NB : le trigger block_admin_domain_signup (via la migration) empêche toute
--     inscription normale sur @afritools.ai ; ce seed passe car il marque le
--     compte raw_user_meta_data.is_super_admin = true.
-- ===========================================================================

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