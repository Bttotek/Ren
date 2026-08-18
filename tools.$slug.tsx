import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { findTool, TOOLS } from "@/lib/tools";
import { getCalculator } from "@/components/calculators/registry";
import { EstimateProvider } from "@/lib/estimate-context";
import { SheetProvider } from "@/lib/sheet-context";
import { CalcTriggerProvider } from "@/lib/calc-trigger";
import { CalculateNow } from "@/components/calc-kit";
import { MeasurementSheet } from "@/components/sheets";
import { BBSProSheet } from "@/components/bbs-pro";
import { AdSlot } from "@/components/ad-slot";
import { EstimateActions } from "@/components/estimate-actions";
import { EngagementBar, ToolReviews } from "@/components/engagement";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BASE_URL = "https://www.bttotek.in";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = findTool(params.slug);

    if (!tool) {
      throw notFound();
    }

    return { tool };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          {
            title: "Calculator unavailable — BTTOTEK",
          },
          {
            name: "robots",
            content: "noindex, nofollow",
          },
        ],
      };
    }

    const { tool } = loaderData;

    const title =
      tool.seoTitle || `${tool.name} — Free Online Calculator | BTTOTEK`;

    const description =
      tool.seoDescription ||
      (tool.short.length > 155
        ? `${tool.short.slice(0, 152).trim()}...`
        : tool.short);

    const keywords = tool.seoKeywords?.join(", ") || tool.keywords?.join(", ") || "online calculator, BTTOTEK";

    const canonicalUrl = `${BASE_URL}/tools/${tool.slug}`;

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Calculators",
          item: `${BASE_URL}/tools`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: tool.name,
          item: canonicalUrl,
        },
      ],
    };

    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      url: canonicalUrl,
      applicationCategory: "CalculatorApplication",
      operatingSystem: "Any",
      description,
      isAccessibleForFree: true,
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      publisher: {
        "@type": "Organization",
        name: "BTTOTEK Solutions",
        url: BASE_URL,
      },
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How accurate are the results?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "The result depends on the values and assumptions entered by the user. The calculator is intended for estimation and planning. Important construction, structural, financial or statutory decisions should be verified against applicable standards, drawings, local rules and professional advice.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use this calculator on mobile?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. The calculator is designed to work in a modern mobile or desktop web browser.",
          },
        },
        {
          "@type": "Question",
          name: "Are the calculators free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. BTTOTEK provides these online calculators for free use.",
          },
        },
        {
          "@type": "Question",
          name: "Can the result be used for a BOQ or estimate?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "The result can be used as an estimating aid. Before procurement, tendering or final project decisions, verify quantities, rates, wastage, site conditions and applicable specifications.",
          },
        },
      ],
    };

    return {
      meta: [
        {
          title,
        },

        {
          name: "description",
          content: description,
        },

        {
          name: "keywords",
          content: keywords,
        },

        {
          name: "robots",
          content: "index, follow, max-image-preview:large",
        },

        {
          name: "author",
          content: "BTTOTEK Solutions",
        },

        {
          property: "og:site_name",
          content: "BTTOTEK Solutions",
        },

        {
          property: "og:title",
          content: title,
        },

        {
          property: "og:description",
          content: description,
        },

        {
          property: "og:type",
          content: "website",
        },

        {
          property: "og:locale",
          content: "en_IN",
        },

        {
          property: "og:url",
          content: canonicalUrl,
        },

        {
          name: "twitter:card",
          content: "summary",
        },

        {
          name: "twitter:title",
          content: title,
        },

        {
          name: "twitter:description",
          content: description,
        },

        {
          name: "twitter:url",
          content: canonicalUrl,
        },
      ],

      links: [
        {
          rel: "canonical",
          href: canonicalUrl,
        },
      ],

      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(softwareSchema),
        },

        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },

        {
          type: "application/ld+json",
          children: JSON.stringify(faqSchema),
        },
      ],
    };
  },

  component: ToolPage,

  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">
        Calculator not found
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        The calculator you are looking for may have been moved or removed.
      </p>

      <Link
        to="/tools"
        className="mt-5 inline-block text-sm text-primary underline"
      >
        Browse all calculators
      </Link>
    </div>
  ),
});

const FAQS = [
  {
    q: "How accurate are the results?",
    a: "The result depends on the values and assumptions entered by the user. BTTOTEK calculators are intended for estimation and planning. Important construction, structural, financial or statutory decisions should be verified against applicable standards, drawings, local rules and professional advice.",
  },

  {
    q: "Can I use this calculator on mobile?",
    a: "Yes. The calculator is designed to work in modern mobile and desktop web browsers. Enter the required values, check the units and review the result before using it for an estimate.",
  },

  {
    q: "Are BTTOTEK calculators free to use?",
    a: "Yes. BTTOTEK provides these online calculators for free use.",
  },

  {
    q: "Can I use the result for a BOQ or estimate?",
    a: "The result can be used as an estimating aid. Before procurement or final tendering, verify quantities, wastage, rates, site conditions, drawings and applicable project specifications.",
  },

  {
    q: "What units should I enter?",
    a: "Use the units displayed beside each input field. Keeping dimensions and quantities in the expected units helps avoid calculation errors and incorrect conversions.",
  },

  {
    q: "Why should I verify the calculator result?",
    a: "Calculator results are dependent on user inputs, assumptions and applicable standards. Site conditions, project specifications, local regulations and professional judgment may require adjustments.",
  },
];

const NO_SHEET = new Set([
  "land-area-converter",
  "stamp-duty",
  "rental-yield",
  "area-valuation",
  "home-loan-emi",
  "construction-cost",
]);

function sheetFor(slug: string) {
  if (
    slug.includes("bar-bending") ||
    slug.includes("steel") ||
    slug.includes("rebar")
  ) {
    return "bbs" as const;
  }

  if (NO_SHEET.has(slug)) {
    return "none" as const;
  }

  return "measurement" as const;
}

function ToolPage() {
  const { tool } = Route.useLoaderData();

  const Calculator = getCalculator(tool.slug);

  const related = TOOLS.filter(
    (t) =>
      t.category === tool.category &&
      t.slug !== tool.slug,
  ).slice(0, 4);

  const sheet = sheetFor(tool.slug);

  const currentUrl = `${BASE_URL}/tools/${tool.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-5 text-sm text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              to="/"
              className="hover:text-foreground hover:underline"
            >
              Home
            </Link>
          </li>

          <li aria-hidden="true">/</li>

          <li>
            <Link
              to="/tools"
              className="hover:text-foreground hover:underline"
            >
              Calculators
            </Link>
          </li>

          <li aria-hidden="true">/</li>

          <li className="text-foreground">
            {tool.name}
          </li>
        </ol>
      </nav>

      <Link
        to="/tools"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All tools
      </Link>

      {/* Page introduction */}
      <header className="mt-4">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {tool.category}
        </span>

        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          {tool.name}
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
          {tool.short}
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Use this free online {tool.name.toLowerCase()} to calculate
          project values quickly from the inputs you provide. Check the
          units carefully and review the result before using it for
          construction, estimating, costing or property-related decisions.
        </p>
      </header>

      {/* Main calculator */}
      <CalcTriggerProvider>
        <SheetProvider>
          <EstimateProvider>
            <div className="mt-8">
              {Calculator ? (
                <Calculator />
              ) : (
                <div className="surface-panel p-6 text-center">
                  <h2 className="font-semibold">
                    Calculator temporarily unavailable
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Please return to the calculators page and select
                    another tool.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <AdSlot
                slotKey="adSlotTool"
                format="leaderboard"
              />
            </div>

            <div className="mt-6">
              <CalculateNow />
            </div>

            {sheet === "bbs" ? (
              <BBSProSheet toolName={tool.name} />
            ) : null}

            {sheet === "measurement" ? (
              <MeasurementSheet />
            ) : null}

            <EstimateActions
              toolSlug={tool.slug}
              toolName={tool.name}
            />
          </EstimateProvider>
        </SheetProvider>
      </CalcTriggerProvider>

      <EngagementBar
        type="tool"
        slug={tool.slug}
        title={tool.name}
      />

      <ToolReviews
        toolSlug={tool.slug}
        toolName={tool.name}
      />

      {/* SEO / helpful content */}
      <section className="surface-panel mt-10 p-6">
        <div
          className="prose prose-sm max-w-none text-muted-foreground prose-headings:font-display prose-headings:text-foreground prose-p:leading-7"
          dangerouslySetInnerHTML={{ __html: tool.longDescription || `<h2>About the ${tool.name}</h2><p>${tool.short}</p>` }}
        />

        <h2 className="mt-10 font-display text-xl font-bold">Calculation method</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {tool.formula || "The calculation uses the inputs displayed above and the calculation method implemented in this BTTOTEK tool. Always check units and assumptions before relying on the result."}
        </p>

        <h2 className="mt-8 font-display text-xl font-bold">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-2">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Related calculators */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">
            Related calculators
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Explore other {tool.category.toLowerCase()} calculators
            that may help with your project.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((t) => (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="surface-panel p-4 transition-colors hover:border-accent/60"
              >
                <div className="font-medium">
                  {t.name}
                </div>

                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t.short}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Simple source / methodology signal */}
      <section className="mt-10 border-t border-border pt-6">
        <h2 className="font-display text-lg font-semibold">
          BTTOTEK calculator methodology
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          BTTOTEK calculators are intended to provide quick calculation
          assistance using the inputs and methods implemented in each
          individual tool. Where applicable, users should compare the
          calculation with relevant Indian standards, project
          specifications, drawings and current local practices.
        </p>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Calculator URL: {currentUrl}
        </p>
      </section>
    </div>
  );
}
