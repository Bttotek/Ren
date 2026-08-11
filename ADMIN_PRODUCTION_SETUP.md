# BTTOTEK Production Admin Authentication Setup

This project uses Supabase Auth for `/admin`. The application does **not** contain a default password and does not store passwords in source code or localStorage.

## 1. Production environment variables

Configure these variables in the production hosting provider (for example Vercel):

- `VITE_SUPABASE_URL=https://iusgefqxqerzhrngahbe.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY=<the Supabase publishable key>`
- `SUPABASE_URL=https://iusgefqxqerzhrngahbe.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY=<the Supabase publishable key>`

Use only a **publishable/anon** key in `VITE_*`. Never put a Supabase secret/service-role key in browser environment variables.

## 2. Supabase Auth URL configuration

In Supabase Dashboard → Authentication → URL Configuration, set:

- Site URL: `https://www.bttotek.in`
- Redirect URL: `https://www.bttotek.in/admin`
- Redirect URL: `https://www.bttotek.in/reset-password`
- Preview redirect URL (only if still needed): `https://bttotekapp.lovable.app/admin`
- Preview reset URL (only if still needed): `https://bttotekapp.lovable.app/reset-password`

If the production custom domain is not present in the allowed redirect URLs, password recovery and OAuth callbacks can fail even when the frontend code is correct.

## 3. Administrator role

The signed-in Supabase user must have an `admin` row in `public.user_roles`.

Run this in the Supabase SQL Editor after replacing the email with the real administrator email:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com')
on conflict (user_id, role) do nothing;
```

Verify:

```sql
select u.email, r.role
from auth.users u
join public.user_roles r on r.user_id = u.id
where lower(u.email) = lower('YOUR_ADMIN_EMAIL@example.com');
```

Do not add a password to SQL, JavaScript, `.env`, or GitHub.

## 4. If the page says `Failed to fetch`

That message means the browser could not complete the request to the authentication API. It is normally a production configuration/network/CORS/Auth URL problem, not a bad password.

Check:

1. `https://www.bttotek.in/admin` is using the current production deployment.
2. Production environment variables are present.
3. The Supabase project URL is correct.
4. The publishable key belongs to the same Supabase project.
5. Supabase Auth URL Configuration contains `https://www.bttotek.in`.
6. The browser is not blocking the request with an extension/network filter.
7. The administrator user exists and has the `admin` role.

## 5. Password reset

From `/admin`, use **Forgot password?**. The email link must return to:

`https://www.bttotek.in/reset-password`

After the password is changed, return to `/admin` and sign in normally.

## 6. Security rules

- No hard-coded administrator password.
- No service-role key in frontend code.
- No password in localStorage.
- Admin access is denied unless the authenticated user has the `admin` role.
- Existing calculator logic is independent of authentication.
