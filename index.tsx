import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, Gauge, ShieldCheck } from "lucide-react";
import { ToolSearch } from "@/components/site-chrome";
import { AdSlot } from "@/components/ad-slot";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BTTOTEK Solutions — Construction, Engineering & Property Calculators" },
      {
        name: "description",
        content:
          "Free online calculators for construction estimating, civil and structural quantity checks, masonry, finishing, infrastructure, land and property calculations.",
      },
      { property: "og:title", content: "BTTOTEK Solutions — Construction, Engineering & Property Calculators" },
      {
        property: "og:description",
        content:
          "Practical calculators for construction quantities, civil and structural planning, land conversion, property estimates and finance calculations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      <section className="hero-gradient relative overflow-hidden">
        <div className="iso-grid-light absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            <Gauge className="size-3.5" /> {TOOLS.length} practical calculators
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
            Free Online Tools &amp; Calculators —{" "}
            <span className="bg-[image:var(--gradient-accent)] bg-clip-text text-transparent">
              BTTOTEK Solutions
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/75">
            BTTOTEK Solutions brings practical construction, civil, structural and property calculators
            into one workspace — from reinforcement and concrete quantities to land, valuation,
            rental yield and home-loan estimates.
          </p>
          <div className="relative z-50 mx-auto mt-8 max-w-xl">
            <ToolSearch large />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-md bg-[image:var(--gradient-accent)] px-5 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              Browse all tools <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "bar-bending-schedule" }}
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Open BBS Pro
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        <AdSlot slotKey="adSlotHome" format="leaderboard" />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16">

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Calculator,
              title: "Clear calculation methods",
              body: "Each calculator shows its inputs, units, assumptions and calculation guidance so you can review the result.",
            },
            {
              icon: Gauge,
              title: "Fast and practical",
              body: "Enter project values and compare scenarios without repeatedly doing the same arithmetic by hand.",
            },
            {
              icon: ShieldCheck,
              title: "Built for verification",
              body: "Use results as preliminary estimates and independent checks, then verify consequential decisions against the relevant source.",
            },
          ].map((f) => (
            <div key={f.title} className="surface-panel p-6">
              <f.icon className="size-6 text-accent" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat} className="mt-14">
            <h2 className="font-display text-2xl font-bold">{cat}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {TOOLS.filter((t) => t.category === cat).map((t) => (
                <Link
                  key={t.slug}
                  to="/tools/$slug"
                  params={{ slug: t.slug }}
                  className="surface-panel group p-5 transition-all hover:-translate-y-0.5 hover:border-accent/60"
                >
                  <h3 className="font-display font-semibold group-hover:text-accent">{t.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.short}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Open calculator <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="surface-panel p-6">
            <h2 className="font-display text-2xl font-bold">Construction and engineering calculation tools</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              BTTOTEK provides practical tools for repetitive calculation tasks such as
              reinforcement quantity checks, concrete and masonry estimates, plastering,
              excavation, structural quantity take-offs and other construction planning work.
              Enter measurements from the latest project documents, keep the displayed units
              consistent, and review the assumptions before using a result.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              These calculators are intended to make arithmetic faster and easier to check.
              They do not replace approved drawings, specifications, site measurements,
              geotechnical information, structural design or professional judgement.
            </p>
          </article>

          <article className="surface-panel p-6">
            <h2 className="font-display text-2xl font-bold">Property and financial estimates</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Property-related tools can help with early comparisons involving land area,
              valuation, rental yield, stamp duty and home-loan payments. Rates, taxes,
              government charges and lender terms can vary by location and date, so treat
              these outputs as estimates and confirm current information with the relevant
              authority, lender or qualified professional.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              For every calculator, keep a record of the values, units, assumptions and
              calculation date when the result will be used later.
            </p>
          </article>
        </div>

        <div className="mt-8 rounded-lg border border-border p-6">
          <h2 className="font-display text-xl font-semibold">How to get a reliable result</h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
            <li><strong className="text-foreground">1. Use current source data.</strong> Take dimensions, rates and technical values from the latest available documents.</li>
            <li><strong className="text-foreground">2. Check the units.</strong> Confirm mm, m, sq ft, sq m, kg, tonnes, litres and other units before calculating.</li>
            <li><strong className="text-foreground">3. Review assumptions.</strong> Read the method and project-specific assumptions shown on the calculator page.</li>
            <li><strong className="text-foreground">4. Independently verify.</strong> Recheck important arithmetic and confirm applicable standards, rules or professional requirements.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
