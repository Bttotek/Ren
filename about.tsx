import { createFileRoute, Link } from "@tanstack/react-router";
import { TOOLS } from "@/lib/tools";

const BASE_URL = "https://www.bttotek.in";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About BTTOTEK Solutions | Construction & Property Calculators",
      },
      {
        name: "description",
        content:
          "Learn about BTTOTEK Solutions, a practical online platform for construction estimating, civil and structural quantity calculations, property estimates and related calculation tools.",
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
        content:
          "About BTTOTEK Solutions | Construction & Property Calculators",
      },
      {
        property: "og:description",
        content:
          "Practical calculators for construction estimating, civil and structural quantity checks, property estimates and financial calculations.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: `${BASE_URL}/about`,
      },
      {
        name: "twitter:card",
        content: "summary",
      },
      {
        name: "twitter:title",
        content:
          "About BTTOTEK Solutions | Construction & Property Calculators",
      },
      {
        name: "twitter:description",
        content:
          "Practical construction, civil, structural and property calculators from BTTOTEK Solutions.",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: `${BASE_URL}/about`,
      },
    ],
  }),

  component: About,
});

function About() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <article>
        <header>
          <p className="text-sm font-medium text-primary">
            BTTOTEK Solutions
          </p>

          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            About BTTOTEK Solutions
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            BTTOTEK Solutions is an independent online calculation platform
            focused on making repetitive construction, civil, structural and
            property-related calculations easier to perform and review.
          </p>
        </header>

        <section className="mt-10 space-y-5">
          <h2 className="font-display text-2xl font-bold">
            What BTTOTEK does
          </h2>

          <p className="leading-7 text-muted-foreground">
            Construction and property work often requires repeated
            calculations for concrete, steel, masonry, plaster, excavation,
            land area, property costs and loan estimates. BTTOTEK brings these
            common calculations together in one easy-to-use website.
          </p>

          <p className="leading-7 text-muted-foreground">
            Our calculators are designed for site engineers, contractors,
            quantity surveyors, estimators, students, property owners and
            other users who need quick preliminary estimates.
          </p>
        </section>

        <section className="mt-10 space-y-5">
          <h2 className="font-display text-2xl font-bold">
            What you will find on BTTOTEK
          </h2>

          <p className="leading-7 text-muted-foreground">
            Each calculator is intended to explain a specific calculation task,
            collect the inputs needed for that task and present a result that
            can be reviewed by the user. Where a calculation depends on
            assumptions, units, local rates or project conditions, those
            factors should be checked before the result is used.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-5">
              <h3 className="font-semibold">Calculation tools</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Construction quantity, reinforcement, concrete, masonry,
                finishing, land, property and finance calculators for common
                estimating tasks.
              </p>
            </div>

            <div className="rounded-lg border border-border p-5">
              <h3 className="font-semibold">Explanatory content</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Guidance about inputs, units, calculation methods, assumptions,
                verification and practical limitations.
              </p>
            </div>

            <div className="rounded-lg border border-border p-5">
              <h3 className="font-semibold">Independent checking</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Tools can be used to repeat arithmetic, compare scenarios and
                identify possible input or quantity errors.
              </p>
            </div>

            <div className="rounded-lg border border-border p-5">
              <h3 className="font-semibold">Transparent limitations</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Results are estimates and may not account for every site,
                design, legal, tax, market or professional requirement.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 surface-panel p-6">
          <h2 className="font-display text-2xl font-bold">
            Our calculator categories
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Civil & Construction",
              "Structural",
              "Masonry",
              "Finishing",
              "Infrastructure",
              "Quality Control",
              "BOQ",
              "Real Estate & Finance",
            ].map((category) => (
              <div
                key={category}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="font-medium">{category}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 space-y-5">
          <h2 className="font-display text-2xl font-bold">
            How our calculators are intended to be used
          </h2>

          <p className="leading-7 text-muted-foreground">
            BTTOTEK calculators are intended to provide quick preliminary
            estimates. Users enter project-specific dimensions, quantities,
            rates or other assumptions and the calculator produces an
            estimated result based on the applicable calculation method.
          </p>

          <p className="leading-7 text-muted-foreground">
            We aim to make assumptions visible and understandable rather than
            hiding important inputs. This helps users review the calculation
            and adjust it for their own project requirements.
          </p>
        </section>

        <section className="mt-10 space-y-5">
          <h2 className="font-display text-2xl font-bold">
            Accuracy and verification
          </h2>

          <p className="leading-7 text-muted-foreground">
            We work to keep our formulas, units and conversion factors
            consistent with commonly used engineering and trade practices.
            However, calculator results can vary depending on project
            conditions, material specifications, local rates, applicable
            standards and the assumptions entered by the user.
          </p>

          <p className="leading-7 text-muted-foreground">
            Important construction, structural, legal, tax, property or
            financial decisions should always be independently verified with
            the appropriate qualified professional or relevant authority.
          </p>
        </section>

        <section className="mt-10 space-y-5">
          <h2 className="font-display text-2xl font-bold">
            Independent and transparent information
          </h2>

          <p className="leading-7 text-muted-foreground">
            BTTOTEK aims to provide useful information in a clear and
            straightforward format. Where calculations depend on local
            conditions or changing rates, users should verify the current
            applicable values before making a final decision.
          </p>

          <p className="leading-7 text-muted-foreground">
            We do not claim that an online estimate replaces professional
            engineering, architectural, surveying, legal, tax or financial
            advice.
          </p>
        </section>

        <section className="mt-10 space-y-5">
          <h2 className="font-display text-2xl font-bold">
            A simple verification workflow
          </h2>

          <ol className="grid gap-3 sm:grid-cols-2">
            {[
              "Use measurements, rates or technical values from the latest reliable source.",
              "Check the unit shown beside every input before calculating.",
              "Read the method and assumptions shown on the calculator page.",
              "Recheck important results against drawings, specifications, current rules or professional advice.",
            ].map((item, index) => (
              <li
                key={item}
                className="rounded-lg border border-border p-4 text-sm leading-6 text-muted-foreground"
              >
                <span className="font-semibold text-foreground">
                  {index + 1}.{" "}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            Explore our calculators
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {TOOLS.slice(0, 12).map((tool) => (
              <Link
                key={tool.slug}
                to="/tools/$slug"
                params={{ slug: tool.slug }}
                className="surface-panel p-4 transition-colors hover:border-accent/60"
              >
                <div className="font-medium">{tool.name}</div>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {tool.short}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-5">
            <Link
              to="/tools"
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              View all calculators
            </Link>
          </div>
        </section>

        <section className="mt-10 surface-panel p-6">
          <h2 className="font-display text-xl font-bold">
            Have a question?
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If you have a question about BTTOTEK, our calculators or the
            information published on this website, you can contact us through
            our Contact page.
          </p>

          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Contact BTTOTEK
          </Link>
        </section>
      </article>
    </main>
  );
}
