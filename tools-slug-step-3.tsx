"src/routes/tools/$slug.tsx"

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { findTool, TOOLS } from "@/lib/tools";
import { getCmsToolOverride } from "@/lib/admin-cms";
import { getCalculator } from "@/components/calculators/registry";

import { EstimateProvider } from "@/lib/estimate-context";
import { SheetProvider } from "@/lib/sheet-context";
import { CalcTriggerProvider } from "@/lib/calc-trigger";
import { CalculatorExportProvider } from "@/lib/calculator-export-context";

import { BBSProSheet } from "@/components/bbs-pro";
import { AdSlot } from "@/components/ad-slot";
import { EstimateActions } from "@/components/estimate-actions";
import {
  EngagementBar,
  ToolReviews,
} from "@/components/engagement";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BASE_URL = "https://www.bttotek.in";

/*
 * ============================================================
 * BBS IS LOCKED
 * ============================================================
 *
 * BBS continues to use BBSProSheet.
 *
 * Do NOT replace BBS with DedicatedToolSheet.
 */
const BBS_SLUG = "bar-bending-schedule";

export const Route = createFileRoute("/tools/$slug")({
  loader: async ({ params }) => {
    const baseTool = findTool(params.slug);

    if (!baseTool) {
      throw notFound();
    }

    let cmsOverride: Awaited<
      ReturnType<typeof getCmsToolOverride>
    > = null;

    try {
      cmsOverride = await getCmsToolOverride(params.slug);
    } catch (error) {
      // Public pages must remain available if the CMS is temporarily
      // unavailable. The built-in calculator registry remains the fallback.
      console.warn(
        "BTTOTEK CMS override could not be loaded:",
        error,
      );
    }

    // enabled=false is the Admin CMS hard-disable switch.
    if (cmsOverride?.enabled === false) {
      throw notFound();
    }

    const overrideData =
      cmsOverride?.override_data &&
      typeof cmsOverride.override_data === "object" &&
      !Array.isArray(cmsOverride.override_data)
        ? (cmsOverride.override_data as Record<string, unknown>)
        : {};

    const seoData =
      cmsOverride?.seo &&
      typeof cmsOverride.seo === "object" &&
      !Array.isArray(cmsOverride.seo)
        ? (cmsOverride.seo as Record<string, unknown>)
        : {};

    const tool = {
      ...baseTool,

      name:
        typeof overrideData.name === "string" &&
        overrideData.name.trim()
          ? overrideData.name.trim()
          : baseTool.name,

      short:
        typeof overrideData.description === "string" &&
        overrideData.description.trim()
          ? overrideData.description.trim()
          : baseTool.short,

      category:
        typeof overrideData.category === "string" &&
        overrideData.category.trim()
          ? (overrideData.category.trim() as typeof baseTool.category)
          : baseTool.category,

      longDescription:
        typeof overrideData.longDescription === "string" &&
        overrideData.longDescription.trim()
          ? overrideData.longDescription
          : baseTool.longDescription,

      formula:
        typeof overrideData.formula === "string" &&
        overrideData.formula.trim()
          ? overrideData.formula
          : baseTool.formula,

      seoTitle:
        typeof seoData.title === "string" &&
        seoData.title.trim()
          ? seoData.title.trim()
          : typeof seoData.seoTitle === "string" &&
              seoData.seoTitle.trim()
            ? seoData.seoTitle.trim()
            : baseTool.seoTitle,

      seoDescription:
        typeof seoData.description === "string" &&
        seoData.description.trim()
          ? seoData.description.trim()
          : typeof seoData.seoDescription === "string" &&
              seoData.seoDescription.trim()
            ? seoData.seoDescription.trim()
            : baseTool.seoDescription,

      seoKeywords:
        Array.isArray(seoData.keywords)
          ? seoData.keywords.filter(
              (item): item is string =>
                typeof item === "string" && item.trim().length > 0,
            )
          : Array.isArray(seoData.seoKeywords)
            ? seoData.seoKeywords.filter(
                (item): item is string =>
                  typeof item === "string" && item.trim().length > 0,
              )
            : baseTool.seoKeywords,
    };

    return {
      tool,
      cmsOverride,
    };
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
      tool.seoTitle ||
      `${tool.name} — Free Online Calculator | BTTOTEK`;

    const description =
      tool.seoDescription ||
      (tool.short.length > 155
        ? `${tool.short.slice(0, 152).trim()}...`
        : tool.short);

    const keywords =
      tool.seoKeywords?.join(", ") ||
      tool.keywords?.join(", ") ||
      "online calculator, BTTOTEK";

    const canonicalUrl =
      `${BASE_URL}/tools/${tool.slug}`;

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
          name: `How accurate is the ${tool.name} result?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              `The ${tool.name} result depends on the values, units and assumptions entered by the user. It is intended as a calculation and planning aid. Important decisions should be independently checked against applicable project documents, standards, rules and professional advice.`,
          },
        },
        {
          "@type": "Question",
          name: "Can I use this calculator on mobile?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. The calculator is designed to work in modern mobile and desktop web browsers.",
          },
        },
        {
          "@type": "Question",
          name: "Are the calculators free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "BTTOTEK provides online calculators for free use, subject to any service access rules configured by the website administrator.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use the result for a BOQ or estimate?",
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
          content:
            "index, follow, max-image-preview:large",
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
          children:
            JSON.stringify(
              softwareSchema,
            ),
        },
        {
          type: "application/ld+json",
          children:
            JSON.stringify(
              breadcrumbSchema,
            ),
        },
        {
          type: "application/ld+json",
          children:
            JSON.stringify(
              faqSchema,
            ),
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
        The calculator you are looking for may have
        been moved or removed.
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
    q: "How accurate is this calculator?",
    a:
      "The result depends on the values, units and assumptions entered. BTTOTEK provides calculation assistance for estimating and planning; important results should be independently checked against project documents, applicable standards, current rules and professional advice.",
  },
  {
    q: "Which units should I enter?",
    a:
      "Use the unit displayed beside each input field. Check dimensions, areas, volumes, weights, rates and percentages carefully before calculating because a unit conversion error can materially change the result.",
  },
  {
    q: "Can I use the result for an estimate or BOQ?",
    a:
      "The result can be used as a preliminary estimating aid. Before procurement, tendering or final measurement, verify the quantity against the latest drawings, specifications, measurements, wastage allowances, rates and project requirements.",
  },
  {
    q: "What if my project uses different assumptions?",
    a:
      "Use project-specific values wherever the calculator provides an input. If an important site condition, design requirement or rule is not represented by the calculator, treat the output as preliminary and complete the detailed calculation separately.",
  },
  {
    q: "Can I use the calculator on a phone?",
    a:
      "Yes. The calculator is designed for modern mobile and desktop browsers. On a smaller screen, review the complete form and result carefully before relying on the output.",
  },
  {
    q: "Should I verify the result before execution?",
    a:
      "Yes. Construction, structural, statutory, property and financial calculations can depend on drawings, site conditions, standards, local rules, rates and professional judgement. Verify consequential decisions with the appropriate source or qualified professional.",
  },
];

function ToolPage() {
  const { tool } = Route.useLoaderData();

  /*
   * BBS stays completely separate.
   */
  const isBBS =
    tool.slug === BBS_SLUG;

  /*
   * All other calculators resolve through registry.ts.
   */
  const Calculator =
    isBBS
      ? null
      : getCalculator(tool.slug);

  const related = TOOLS
    .filter(
      (t) =>
        t.category ===
          tool.category &&
        t.slug !== tool.slug,
    )
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

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

          <li aria-hidden="true">
            /
          </li>

          <li>
            <Link
              to="/tools"
              className="hover:text-foreground hover:underline"
            >
              Calculators
            </Link>
          </li>

          <li aria-hidden="true">
            /
          </li>

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

      {/* =====================================================
          INTRO
      ===================================================== */}

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
          Use this free online{" "}
          {tool.name.toLowerCase()}{" "}
          to work through the calculation from
          your own project inputs. Enter values
          from the latest drawing, measurement,
          specification, quotation or other
          reliable source, then check the units
          and assumptions before using the result.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">

          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold">
              1. Enter inputs
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Use the units shown beside each field
              and verify the source of every value.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold">
              2. Calculate
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Review selected options, quantities,
              rates and assumptions before calculating.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold">
              3. Verify
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Check the result, unit and order of
              magnitude before consequential use.
            </p>
          </div>

        </div>

      </header>

      {/* =====================================================
          CALCULATOR SYSTEM
          =====================================================

          CalculatorExportProvider is intentionally placed
          around the calculator AND EstimateActions.

          DedicatedToolSheet writes live data into this
          context.

          EstimateActions reads that same data.
      ===================================================== */}

      <CalcTriggerProvider>
        <SheetProvider>
          <EstimateProvider>
            <CalculatorExportProvider>

              {/* =================================================
                  BBS
                  ================================================= */}

              {isBBS ? (

                <BBSProSheet
                  toolName={tool.name}
                />

              ) : Calculator ? (

                /*
                 * Dedicated / registered calculators.
                 *
                 * Their own component is responsible for
                 * publishing live export data.
                 */
                <div className="mt-8">
                  <Calculator />
                </div>

              ) : (

                <div className="mt-8 surface-panel p-6 text-center">

                  <h2 className="font-semibold">
                    Calculator temporarily unavailable
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    This calculator does not have
                    a registered calculator component yet.
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Add the calculator to
                    components/calculators/registry.ts
                    before displaying it.
                  </p>

                </div>

              )}

              {/* =================================================
                  ADVERTISEMENT
              ================================================= */}

              <div className="mt-8">
                <AdSlot
                  slotKey="adSlotTool"
                  format="leaderboard"
                />
              </div>

              {/* =================================================
                  SAVE / PDF / EXCEL
                  =================================================

                  For Dedicated calculators:
                  CalculatorExportProvider -> EstimateActions

                  For BBS / old calculators:
                  existing EstimateContext / SheetContext
                  continues to work.
              ================================================= */}

              <EstimateActions
                toolSlug={tool.slug}
                toolName={tool.name}
              />

            </CalculatorExportProvider>
          </EstimateProvider>
        </SheetProvider>
      </CalcTriggerProvider>

      {/* =====================================================
          ENGAGEMENT
      ===================================================== */}

      <EngagementBar
        type="tool"
        slug={tool.slug}
        title={tool.name}
      />

      <ToolReviews
        toolSlug={tool.slug}
        toolName={tool.name}
      />

      {/* =====================================================
          SEO / HELPFUL CONTENT
      ===================================================== */}

      <section className="surface-panel mt-10 p-6">

        <div
          className="prose prose-sm max-w-none text-muted-foreground prose-headings:font-display prose-headings:text-foreground prose-p:leading-7"
          dangerouslySetInnerHTML={{
            __html:
              tool.longDescription ||
              `<h2>About the ${tool.name}</h2>
               <p>${tool.short}</p>
               <h2>How to use this calculator</h2>
               <p>Enter the project values requested by the form, keep the displayed units, review the assumptions and check the result before using it for estimating or planning.</p>
               <h2>Verification</h2>
               <p>For important construction, structural, statutory, property or financial decisions, verify the result against applicable drawings, specifications, standards, current rates or professional advice.</p>`,
          }}
        />

        <h2 className="mt-10 font-display text-xl font-bold">
          Calculation method
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {tool.formula ||
            "The calculation uses the inputs displayed above and the calculation method implemented in this BTTOTEK tool. Always check units and assumptions before relying on the result."}
        </p>

        <h2 className="mt-8 font-display text-xl font-bold">
          Frequently asked questions
        </h2>

        <Accordion
          type="single"
          collapsible
          className="mt-2"
        >

          {FAQS.map(
            (faq, index) => (

              <AccordionItem
                key={faq.q}
                value={`faq-${index}`}
              >

                <AccordionTrigger className="text-left text-sm">
                  {faq.q}
                </AccordionTrigger>

                <AccordionContent className="text-sm leading-6 text-muted-foreground">
                  {faq.a}
                </AccordionContent>

              </AccordionItem>

            ),
          )}

        </Accordion>

      </section>

      {/* =====================================================
          RELATED CALCULATORS
      ===================================================== */}

      {related.length > 0 && (

        <section className="mt-10">

          <h2 className="font-display text-xl font-bold">
            Related calculators
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Explore other{" "}
            {tool.category.toLowerCase()}{" "}
            calculators that may help with related
            project calculations.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            {related.map(
              (t) => (

                <Link
                  key={t.slug}
                  to="/tools/$slug"
                  params={{
                    slug: t.slug,
                  }}
                  className="surface-panel p-4 transition-colors hover:border-accent/60"
                >

                  <div className="font-medium">
                    {t.name}
                  </div>

                  <div className="mt-1 text-sm leading-6 text-muted-foreground">
                    {t.short}
                  </div>

                </Link>

              ),
            )}

          </div>

        </section>

      )}

      {/* =====================================================
          METHODOLOGY
      ===================================================== */}

      <section className="mt-10 border-t border-border pt-6">

        <h2 className="font-display text-lg font-semibold">
          BTTOTEK calculator methodology
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          BTTOTEK calculators are intended to provide
          quick calculation assistance using the inputs
          and methods implemented in each individual tool.
          Where applicable, users should compare the
          calculation with relevant Indian standards,
          project specifications, drawings and current
          local practices.
        </p>

      </section>

    </div>
  );
}
