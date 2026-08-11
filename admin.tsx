import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useSession } from "@/hooks/use-session";
import { AdminConsole } from "@/components/admin-console";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — BTTOTEK Solutions" },
      { name: "description", content: "Restricted content management area." },
      { property: "og:title", content: "Admin — BTTOTEK Solutions" },
      { property: "og:description", content: "Restricted content management area." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminGate,
});

function AdminGate() {
  const { user, loading } = useSession();
  const { isAdmin, checking } = useIsAdmin(user?.id);

  if (loading || (user && checking)) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return <AdminSignIn />;
  if (!isAdmin) return <NoAccess email={user.email ?? ""} />;

  return (
    <div>
      <AdminSessionBar email={user.email ?? ""} />
      <AdminConsole />
    </div>
  );
}

function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/admin", replace: true });
  };
}

function AdminSessionBar({ email }: { email: string }) {
  const signOut = useSignOut();
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10">
      <div className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 text-accent" />
          <span className="font-medium">Signed in as {email}</span>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold tracking-wide text-accent uppercase">
            Admin
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (!email) return;
              setBusy(true);
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              setBusy(false);
              if (error) toast.error(error.message);
              else toast.success("Password reset link sent to your inbox");
            }}
            disabled={busy}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
          >
            Change password
          </button>
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function NoAccess({ email }: { email: string }) {
  const signOut = useSignOut();
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="surface-panel p-7">
        <div className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="size-5" />
          <span className="text-xs font-semibold tracking-widest uppercase">Access denied</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold">Administrator access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The account <span className="font-medium text-foreground">{email}</span> does not have the
          administrator role. Sign in with an administrator account.
        </p>
        <button
          onClick={() => void signOut()}
          className="mt-5 w-full rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}


function formatAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  if (normalized.includes("failed to fetch") || normalized.includes("networkerror") || normalized.includes("network error")) {
    return "Authentication server could not be reached. Check the production Supabase URL, publishable key, and Supabase Auth URL/Redirect URL settings for www.bttotek.in.";
  }
  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm the administrator email address before signing in.";
  }
  if (normalized.includes("too many requests")) {
    return "Too many login attempts. Please wait a few minutes and try again.";
  }
  return message || "Unable to sign in. Please try again.";
}

function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (err) {
        setError(formatAuthError(err));
        return;
      }

      if (!data.session || !data.user) {
        setError("Login completed without a valid session. Please try again.");
        return;
      }

      toast.success("Signed in");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    const target = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(target)) {
      setError("Enter your admin email address first");
      return;
    }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) setError(formatAuthError(err));
      else setNotice("If that address is registered, a password reset link is on its way.");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <div className="surface-panel p-7">
        <div className="flex items-center gap-2 text-accent">
          <Lock className="size-5" />
          <span className="text-xs font-semibold tracking-widest uppercase">Restricted area</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold">Admin sign-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in with your administrator account to open the control panel.
        </p>

        <form className="mt-6 space-y-3" onSubmit={submit}>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-bold tracking-wide text-accent-foreground uppercase disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />} Sign in
          </button>
        </form>

        <button
          onClick={() => void forgot()}
          disabled={busy}
          className="mt-4 text-sm text-muted-foreground underline hover:text-foreground disabled:opacity-60"
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
}
