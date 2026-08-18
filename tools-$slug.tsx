import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { findTool, TOOLS } from "@/lib/tools";
import { TOOL_CONTENT } from "@/lib/tool-content";
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
          { title: "Calculator unavailable — BTTOTEK" },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }

    const { tool } = loaderData;
    const content = TOOL_CONTENT[tool.slug as keyof typeof TOOL_CONTENT];

    const title =
      tool.seoTitle || `${tool.name} — Free Online Calculator | BTTOTEK`;

    const description =
      tool.seoDescription ||
      (tool.short.length > 155
        ? `${tool.short.slice(0, 152).trim()}...`
        : tool.short);

    const keywords =
      tool.seoKeywords?.join(", ") ||
      tool.keywords?.join(", ") ||
      "online calculator, BTTOTEK";

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

    const faqItems = [
      {
        question: `What does the ${tool.name} calculate?`,
        answer:
          content?.intro ||
          `The ${tool.name} calculates a result from the inputs and assumptions shown on this page.`,
      },
      {
        question: "How should I check the result?",
        answer:
          content?.method ||
          "Check the entered values, units, assumptions and the applicable project requirements before relying on the result.",
      },
      {
        question: "Are BTTOTEK calculators free to use?",
        answer:
          "Yes. BTTOTEK provides these online calculators for free use.",
      },
      {
        question: "Can I use the result for a project estimate?",
        answer:
          "The result can be used as a preliminary estimating aid. Verify important quantities, rates, specifications, site conditions and applicable requirements before procurement, tendering or final decisions.",
      },
    ];

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        {
          name: "robots",
          content: "index, follow, max-image-preview:large",
        },
        { name: "author", content: "BTTOTEK Solutions" },
        { property: "og:site_name", content: "BTTOTEK Solutions" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "en_IN" },
        { property: "og:url", content: canonicalUrl },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:url", content: canonicalUrl },
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
  const content = TOOL_CONTENT[tool.slug as keyof typeof TOOL_CONTENT];

  const Calculator = getCalculator(tool.slug);

  const related = TOOLS.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug,
  ).slice(0, 4);

  const sheet = sheetFor(tool.slug);
  const currentUrl = `${BASE_URL}/tools/${tool.slug}`;

  const fallbackFaqs = [
    {
      q: `What does the ${tool.name} calculate?`,
      a:
        content?.intro ||
        `This calculator uses the inputs shown above to calculate a ${tool.name.toLowerCase()} result.`,
    },
    {
      q: "How accurate is the result?",
      a:
        "The result depends on the values, units and assumptions entered. Use it as an estimate or calculation aid and independently verify important results.",
    },
    {
      q: "What should I check before using the result?",
      a:
        "Check the input units, project drawings or source data, calculation assumptions and any applicable standards, specifications, local rules or professional requirements.",
    },
    {
      q: "Can I use the result for a BOQ or estimate?",
      a:
        "It can be used as a preliminary estimating aid. Before procurement, tendering or final decisions, verify quantities, wastage, rates, site conditions and project specifications.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
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

          <li className="text-foreground">{tool.name}</li>
        </ol>
      </nav>

      <Link
        to="/tools"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All tools
      </Link>

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
          {content?.intro ||
            `Use this free online ${tool.name.toLowerCase()} to calculate project values from the inputs you provide. Check the units and assumptions before using the result.`}
        </p>
      </header>

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
                    Please return to the calculators page and select another
                    tool.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <AdSlot slotKey="adSlotTool" format="leaderboard" />
            </div>

            <div className="mt-6">
              <CalculateNow />
            </div>

            {sheet === "bbs" ? <BBSProSheet toolName={tool.name} /> : null}

            {sheet === "measurement" ? <MeasurementSheet /> : null}

            <EstimateActions
              toolSlug={tool.slug}
              toolName={tool.name}
            />
          </EstimateProvider>
        </SheetProvider>
      </CalcTriggerProvider>

      <EngagementBar type="tool" slug={tool.slug} title={tool.name} />

      <ToolReviews toolSlug={tool.slug} toolName={tool.name} />

      <section className="surface-panel mt-10 p-6">
        <div
          className="prose prose-sm max-w-none text-muted-foreground prose-headings:font-display prose-headings:text-foreground prose-p:leading-7"
          dangerouslySetInnerHTML={{
            __html:
              tool.longDescription ||
              `<h2>About the ${tool.name}</h2><p>${tool.short}</p>`,
          }}
        />

        {content ? (
          <>
            <h2 className="mt-10 font-display text-xl font-bold">
              Key project checks
            </h2>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {content.keyChecks.map((item) => (
                <li key={item} className="list-disc ml-5">
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-8 font-display text-xl font-bold">
              Calculation method
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {content.method}
            </p>

            <h2 className="mt-8 font-display text-xl font-bold">
              Best for
            </h2>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {content.bestFor.map((item) => (
                <li key={item} className="list-disc ml-5">
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-8 font-display text-xl font-bold">
              Limitations
            </h2>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {content.limitations.map((item) => (
                <li key={item} className="list-disc ml-5">
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h2 className="mt-10 font-display text-xl font-bold">
              Calculation method
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {tool.formula ||
                "The calculation uses the inputs displayed above and the calculation method implemented in this BTTOTEK tool. Always check units and assumptions before relying on the result."}
            </p>
          </>
        )}

        <h2 className="mt-10 font-display text-xl font-bold">
          Frequently asked questions
        </h2>

        <Accordion type="single" collapsible className="mt-2">
          {fallbackFaqs.map((faq, index) => (
            <AccordionItem key={faq.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-sm">
                {faq.q}
              </AccordionTrigger>

              <AccordionContent className="text-sm leading-6 text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">
            Related calculators
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Explore other {tool.category.toLowerCase()} calculators that may
            help with your project.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((t) => (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="surface-panel p-4 transition-colors hover:border-accent/60"
              >
                <div className="font-medium">{t.name}</div>

                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t.short}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="font-display text-lg font-semibold">
          BTTOTEK calculator methodology
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          BTTOTEK calculators are intended to provide quick calculation
          assistance using the inputs and methods implemented in each
          individual tool. Where applicable, users should compare the
          calculation with relevant Indian standards, project specifications,
          drawings and current local practices.
        </p>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Calculator URL: {currentUrl}
        </p>
      </section>
    </div>
  );
}
