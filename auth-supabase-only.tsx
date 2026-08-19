import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — BTTOTEK Solutions" },
      {
        name: "description",
        content:
          "Sign in to save construction estimates, rebar schedules and property analytics to your BTTOTEK workspace.",
      },
      { property: "og:title", content: "Sign in — BTTOTEK Solutions" },
      {
        property: "og:description",
        content: "Access your saved estimates and project workspace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  fullName: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setError(null);
    setNotice(null);

    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setBusy(true);

    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              full_name: parsed.data.fullName || null,
            },
          },
        });

        if (err) throw err;

        if (!data.session) {
          setNotice(
            "Account created. Check your email to confirm your account, then sign in.",
          );
          return;
        }

        await navigate({ to: "/dashboard", replace: true });
        return;
      }

      const { error: err } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (err) throw err;

      await navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (busy) return;

    setError(null);
    setNotice(null);
    setBusy(true);

    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (err) throw err;
      // Browser navigation is handled by Supabase.
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-raised)]">
        <h1 className="font-display text-2xl font-bold">
          {mode === "signin" ? "Sign in" : "Create your workspace"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Save estimates, rebar schedules and property analytics across devices.
        </p>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <Field
              label="Full name"
              value={fullName}
              onChange={setFullName}
              type="text"
              autoComplete="name"
            />
          )}

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
          />

          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-accent">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60",
            )}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground disabled:opacity-60"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>

      <Link
        to="/"
        className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Back to calculators
      </Link>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}
