-- BTTOTEK PHASE 2 — FILE 01
-- Admin Security + Roles + RLS foundation
-- Run this whole file once in Supabase SQL Editor.
--
-- Goal:
-- 1. Normal users can NEVER create/modify/delete admin roles.
-- 2. Only an existing admin can manage application roles.
-- 3. The admin role check is performed inside the database.
-- 4. Anonymous users get no role access.
--
-- IMPORTANT:
-- This file does not create an admin user automatically.
-- Your own authenticated user must be assigned the admin role separately.

BEGIN;

-- ------------------------------------------------------------
-- 1) Application role type
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END
$$;

-- ------------------------------------------------------------
-- 2) Application roles table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
REVOKE ALL ON public.user_roles FROM anon;

-- ------------------------------------------------------------
-- 3) Safe role checker
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role public.app_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL
         AND _user_id IS DISTINCT FROM auth.uid()
      THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
  END
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
TO authenticated, service_role;

-- Convenient current-user admin check for future RLS policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

REVOKE ALL ON FUNCTION public.is_admin()
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_admin()
TO authenticated, service_role;

-- ------------------------------------------------------------
-- 4) Remove permissive role-management policies
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users manage own roles" ON public.user_roles;

-- A signed-in user may read ONLY their own role.
CREATE POLICY "Users read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Admins may read all role assignments.
CREATE POLICY "Admins read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING ((select public.is_admin()));

-- ONLY admins may create/update/delete role assignments.
CREATE POLICY "Admins manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING ((select public.is_admin()))
WITH CHECK ((select public.is_admin()));

COMMIT;

-- ------------------------------------------------------------
-- 5) Verification
-- ------------------------------------------------------------
SELECT
  'admin_security_rls_ready' AS status,
  public.is_admin() AS current_user_is_admin;
