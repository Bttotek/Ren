import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminConsole } from "@/components/admin-console";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();

    // Not signed in: allow the admin login screen to render.
    if (error || !data.user) return;

    // IMPORTANT: this check is enforced by Supabase RLS too.
    // A normal user is redirected before AdminConsole is rendered.
    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !role) {
      throw redirect({ to: "/dashboard", replace: true });
    }

    return { user: data.user };
  },
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
  const navigate = useNavigate();

  // Route beforeLoad has already blocked authenticated non-admin users.
  const [checking] = useState(false);

  if (checking) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  return <AdminArea navigate={navigate} />;
}

function AdminArea({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Read the current user only for display/login state.
  // The actual admin authorization happened in beforeLoad and RLS.
  useState(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoaded(true);
    });
  });

  if (!loaded) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!email) return <AdminSignIn />;

  return (
    <div>
      <AdminSessionBar
        email={email}
        onSignOut={async () => {
          await supabase.auth.signOut();
          await navigate({ to: "/admin", replace: true });
        }}
      />
      <AdminConsole />
    </div>
  );
}

function AdminSessionBar({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => Promise<void>;
}) {
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

        <button
          onClick={async () => {
            setBusy(true);
            try {
              await onSignOut();
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          Sign out
        </button>
      </div>
    </div>
  );
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

      if (err) throw err;

      if (!data.session || !data.user) {
        throw new Error("Login completed without a valid session. Please try again.");
      }

      // The route's beforeLoad will perform the admin-role check.
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in.";
      setError(
        message.toLowerCase().includes("invalid login credentials")
          ? "Email or password is incorrect."
          : message,
      );
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

      if (err) throw err;
      setNotice("If that address is registered, a password reset link is on its way.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20">
      <div className="surface-panel p-7">
        <div className="flex items-center gap-2 text-accent">
          <Lock className="size-5" />
          <span className="text-xs font-semibold tracking-widest uppercase">
            Restricted area
          </span>
        </div>

        <h1 className="mt-3 font-display text-2xl font-bold">Admin sign-in</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Sign in with an administrator account to open the control panel.
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
            {busy && <Loader2 className="size-4 animate-spin" />}
            Sign in
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
