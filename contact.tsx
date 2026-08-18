import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://www.bttotek.in";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact BTTOTEK Solutions | Support, Feedback & Enquiries",
      },
      {
        name: "description",
        content:
          "Contact BTTOTEK Solutions for calculator feedback, technical website issues, content questions, general support and business enquiries.",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        property: "og:site_name",
        content: "BTTOTEK Solutions",
      },
      {
        property: "og:title",
        content: "Contact BTTOTEK Solutions",
      },
      {
        property: "og:description",
        content:
          "Send feedback or questions about BTTOTEK calculators, website content, technical issues and business enquiries.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: `${BASE_URL}/contact`,
      },
      {
        name: "twitter:card",
        content: "summary",
      },
      {
        name: "twitter:title",
        content: "Contact BTTOTEK Solutions",
      },
      {
        name: "twitter:description",
        content:
          "Send feedback or questions about BTTOTEK calculators, website content, technical issues and business enquiries.",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: `${BASE_URL}/contact`,
      },
    ],
  }),

  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Please check your details",
      );
      return;
    }

    setBusy(true);

    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });

    setBusy(false);

    if (error) {
      toast.error(
        "Could not send your message. Please try again.",
      );
      return;
    }

    setForm({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

    toast.success(
      "Thanks — your message has been received.",
    );
  }

  const set =
    (key: keyof typeof form) =>
    (value: string) => {
      setForm((current) => ({
        ...current,
        [key]: value,
      }));
    };

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <header>
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          <Mail className="size-3.5" />
          Contact & Support
        </span>

        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          Contact BTTOTEK Solutions
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          Have a question about a calculator, found an issue, or want to discuss a
          business enquiry? Send a clear message with the relevant calculator,
          page or problem so we can understand what needs attention.
        </p>
      </header>

      <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-raised)]">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary">
            <ShieldCheck className="size-5 text-primary" />
          </div>

          <div>
            <h2 className="font-semibold text-foreground">
              How we can help
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              You can contact us about calculator feedback, technical issues,
              content questions, general website support and business
              enquiries.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Calculator feedback",
            body: "Tell us the calculator name, input values and the result you expected.",
          },
          {
            title: "Technical issue",
            body: "Include the page URL, device or browser and a short description of the problem.",
          },
          {
            title: "Business enquiry",
            body: "Describe the service, collaboration or website-related enquiry clearly.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border p-4">
            <h2 className="font-semibold text-sm">{item.title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {item.body}
            </p>
          </div>
        ))}
      </section>

      <form
        onSubmit={submit}
        className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-raised)]"
      >
        <div>
          <h2 className="font-display text-xl font-bold">
            Send us a message
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Please provide accurate contact details and enough information for us to understand your request.
          </p>
        </div>

        <Field
          label="Name"
          value={form.name}
          onChange={set("name")}
          autoComplete="name"
          required
        />

        <Field
          label="Email"
          value={form.email}
          onChange={set("email")}
          type="email"
          autoComplete="email"
          required
        />

        <Field
          label="Phone (optional)"
          value={form.phone}
          onChange={set("phone")}
          type="tel"
          autoComplete="tel"
        />

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            How can we help?
          </span>

          <textarea
            value={form.message}
            onChange={(e) => set("message")(e.target.value)}
            rows={6}
            minLength={10}
            maxLength={1000}
            required
            placeholder="Tell us about your question or issue..."
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />

          <span className="mt-1 block text-xs text-muted-foreground">
            Maximum 1000 characters.
          </span>
        </label>

        <p className="text-xs leading-5 text-muted-foreground">
          Please avoid sending passwords, payment-card details, government
          identification numbers or other highly sensitive information through
          this form. Contact details and your message are used to respond to
          the enquiry.
        </p>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? "Sending..." : "Send message"}
        </button>
      </form>

      <section className="mt-8 rounded-xl border border-border p-6">
        <h2 className="font-display text-xl font-bold">
          Before contacting us
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Calculator results on BTTOTEK are intended for preliminary
          estimation and informational purposes. Important engineering,
          construction, property, legal, tax and financial decisions should
          be independently verified with the appropriate qualified
          professional or relevant authority.
        </p>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
      />
    </label>
  );
}
