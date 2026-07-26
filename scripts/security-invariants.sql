-- Structural security invariants for the release gate.
--
-- Emits a single JSON document of violations on stdout. An empty `violations`
-- array means the database structure matches the policy in
-- `.security/release-gate.json`. The gate script (scripts/security-release-gate.mjs)
-- consumes this and decides pass/fail — this file only reports facts.
--
-- Run against a local stack started from the committed migrations:
--   psql "$DB_URL" -At -f scripts/security-invariants.sql

with definer_fns as (
  select
    p.oid,
    p.proname                                        as name,
    pg_get_function_identity_arguments(p.oid)        as args,
    coalesce(p.proconfig, '{}')                      as config
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef
),

-- 1. SECURITY DEFINER functions that unauthenticated visitors can execute.
anon_executable as (
  select
    'anon_executable_definer_function' as check_name,
    f.name || '(' || f.args || ')'     as subject,
    'anon holds EXECUTE on a SECURITY DEFINER function, which bypasses RLS' as detail
  from definer_fns f
  where has_function_privilege('anon', f.oid, 'EXECUTE')
),

-- 2. SECURITY DEFINER functions without a pinned search_path are vulnerable to
--    schema-shadowing attacks by any role that can create objects.
missing_search_path as (
  select
    'definer_function_missing_search_path' as check_name,
    f.name || '(' || f.args || ')'         as subject,
    'SECURITY DEFINER function does not SET search_path' as detail
  from definer_fns f
  where not exists (
    select 1 from unnest(f.config) c where c like 'search_path=%'
  )
),

-- 3. Any public table without RLS is fully exposed through the Data API.
rls_disabled as (
  select
    'table_rls_disabled' as check_name,
    c.relname::text      as subject,
    'public table does not have row level security enabled' as detail
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and not c.relrowsecurity
),

-- 4. RLS on but zero policies, while a client role still holds table grants:
--    every query silently returns nothing, which usually means a broken
--    feature rather than a deliberate lockdown. Flag it for review.
rls_no_policies as (
  select
    'table_rls_enabled_without_policies' as check_name,
    c.relname::text                      as subject,
    'RLS is enabled but no policies exist while anon/authenticated still hold grants' as detail
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relrowsecurity
    and not exists (select 1 from pg_policy p where p.polrelid = c.oid)
    and (
      has_table_privilege('anon', c.oid, 'SELECT')
      or has_table_privilege('authenticated', c.oid, 'SELECT')
    )
),

-- 5. Roles must never be writable by their own holder — the classic
--    privilege-escalation path.
user_roles_writable as (
  select
    'user_roles_client_writable' as check_name,
    'public.user_roles'          as subject,
    'a client role holds INSERT/UPDATE/DELETE on user_roles' as detail
  where exists (
    select 1
    from (values ('anon'), ('authenticated')) r(role)
    where has_table_privilege(r.role, 'public.user_roles', 'INSERT')
       or has_table_privilege(r.role, 'public.user_roles', 'UPDATE')
       or has_table_privilege(r.role, 'public.user_roles', 'DELETE')
  )
),

all_violations as (
  select * from anon_executable
  union all select * from missing_search_path
  union all select * from rls_disabled
  union all select * from rls_no_policies
  union all select * from user_roles_writable
)

select json_build_object(
  'generated_at', now(),
  'violations', coalesce(
    (select json_agg(json_build_object(
        'check', check_name,
        'subject', subject,
        'detail', detail
     ) order by check_name, subject)
     from all_violations),
    '[]'::json
  )
);
