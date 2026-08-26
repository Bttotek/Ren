-- BTTOTEK: Admin Content Data Access
-- Purpose:
-- 1) Allow the authenticated admin/editor to read/write existing blog_posts.
-- 2) Allow the authenticated admin/editor to read/write site_settings.
-- 3) Do NOT open either table to anonymous users.
-- Run once in Supabase SQL Editor.

BEGIN;

-- ------------------------------------------------------------
-- BLOG POSTS
-- ------------------------------------------------------------
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage blog posts" ON public.blog_posts;

CREATE POLICY "Admins manage blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.is_admin_or_editor())
WITH CHECK (public.is_admin_or_editor());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;

-- ------------------------------------------------------------
-- SITE SETTINGS
-- The Admin Console stores tool_cfg_<slug> and admin_custom_tools here.
-- Keep this table private to admin/editor users.
-- ------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;

CREATE POLICY "Admins manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (public.is_admin_or_editor())
WITH CHECK (public.is_admin_or_editor());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;

COMMIT;
