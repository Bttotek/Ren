import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "All Calculators — Civil, Structural & Property | BTTOTEK" },
      {
        name: "description",
        content:
          "Browse every BTTOTEK calculator: bar bending schedule, concrete and mortar, brickwork, plastering, excavation, structural members, land units, stamp duty, EMI and more.",
      },
      { property: "og:title", content: "All Calculators — BTTOTEK Solutions" },
      {
        property: "og:description",
        content: "Civil engineering, structural and real-estate calculators in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ToolsIndex,
});

function ToolsIndex() {
  const [active, setActive] = useState<string>("All");
  const list = active === "All" ? TOOLS : TOOLS.filter((t) => t.category === active);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header>
        <p className="text-sm font-medium text-muted-foreground">BTTOTEK Solutions</p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          Construction, Engineering & Property Calculators
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Explore {TOOLS.length} practical calculators for construction estimating,
          civil and structural work, quantity planning, finishing, infrastructure,
          and property-related calculations. Enter your project values, check the
          units, and use the result as a preliminary calculation or independent
          arithmetic check.
        </p>
      </header>

      <section className="mt-8 max-w-4xl">
        <h2 className="font-display text-xl font-semibold">How to use these calculators</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Select a calculator that matches the task you are working on, read the
          input labels and units, and enter values taken from your latest drawings,
          measurements, specifications, quotations, or other reliable sources.
          Review the assumptions before using the result. For engineering,
          structural, statutory, tax, property, and financial decisions, verify
          the output against the applicable standard, authority requirements,
          project documents, and professional advice.
        </p>
      </section>

      <section className="mt-8" aria-labelledby="calculator-categories">
        <h2 id="calculator-categories" className="sr-only">
          Calculator categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={active === c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active === c
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="calculator-list">
        <h2 id="calculator-list" className="sr-only">
          Available calculators
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <Link
              key={t.slug}
              to="/tools/$slug"
              params={{ slug: t.slug }}
              className="surface-panel p-5 transition-all hover:-translate-y-0.5 hover:border-accent/60"
            >
              <span className="text-xs text-muted-foreground">{t.category}</span>
              <h3 className="mt-1 font-display font-semibold">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.short}</p>
              <span className="mt-4 inline-block text-sm font-medium text-accent">
                Open calculator →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-4xl">
        <h2 className="font-display text-xl font-semibold">What you can calculate</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="surface-panel p-5">
            <h3 className="font-semibold">Construction & quantity estimation</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Estimate common quantities and material requirements for concrete,
              masonry, plastering, excavation, reinforcement and other
              construction tasks.
            </p>
          </div>
          <div className="surface-panel p-5">
            <h3 className="font-semibold">Civil & structural planning</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use selected civil and structural tools for preliminary checks and
              calculation support. Detailed design must follow the applicable
              drawings, standards, loads, site conditions and professional review.
            </p>
          </div>
          <div className="surface-panel p-5">
            <h3 className="font-semibold">Finishing & infrastructure</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Work through practical calculations related to finishing materials,
              roads, drainage, water and other infrastructure tasks included in
              the BTTOTEK tool collection.
            </p>
          </div>
          <div className="surface-panel p-5">
            <h3 className="font-semibold">Property & financial estimates</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Explore land, property, loan, tax and related estimates. Rates,
              rules and charges can vary by location and date, so confirm current
              requirements with the relevant authority or provider.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 max-w-4xl">
        <h2 className="font-display text-xl font-semibold">Important verification note</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          BTTOTEK calculators are intended to make repetitive calculations faster
          and easier to check. Results depend on the information entered and the
          assumptions used by each calculator. They are not a substitute for
          approved drawings, site measurements, engineering certification, legal
          advice, tax advice, or financial advice. Always verify important results
          before execution, submission, purchase, or other consequential use.
        </p>
      </section>
    </div>
  );
}
