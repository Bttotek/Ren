import { createFileRoute, Link } from "@tanstack/react-router";
import { POSTS } from "@/lib/blog";

const SITE_URL = "https://www.bttotek.in";
const SITE_NAME = "BTTOTEK Solutions";
const BLOG_URL = `${SITE_URL}/blog`;

export const Route = createFileRoute("/blog/")({
  head: () => {
    const title = "Engineering & Property Insights Blog | BTTOTEK Solutions";

    const description =
      "Practical guides from BTTOTEK covering construction estimating, bar bending schedules, concrete calculations, property valuation, rental yield, stamp duty and related topics.";

    const schema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${BLOG_URL}#blog`,
      name: "BTTOTEK Solutions Blog",
      description,
      url: BLOG_URL,
      inLanguage: "en-IN",
      publisher: {
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      blogPost: POSTS.map((post) => ({
        "@type": "BlogPosting",
        "@id": `${BLOG_URL}/${encodeURIComponent(post.slug)}#article`,
        headline: post.title,
        description: post.excerpt,
        url: `${BLOG_URL}/${encodeURIComponent(post.slug)}`,
        datePublished: post.date,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${BLOG_URL}/${encodeURIComponent(post.slug)}`,
        },
        author: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      })),
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
          name: "robots",
          content:
            "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        },
        {
          name: "author",
          content: SITE_NAME,
        },

        // Open Graph
        {
          property: "og:site_name",
          content: SITE_NAME,
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
          property: "og:url",
          content: BLOG_URL,
        },
        {
          property: "og:locale",
          content: "en_IN",
        },

        // Twitter
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
      ],

      links: [
        {
          rel: "canonical",
          href: BLOG_URL,
        },
      ],

      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(schema),
        },
      ],
    };
  },

  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Page introduction */}
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">
          BTTOTEK Solutions
        </p>

        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          Engineering &amp; Property Insights
        </h1>

        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Practical articles covering construction estimating, quantity
          calculations, structural work, property-related calculations and
          everyday project planning. Each article is intended to explain a
          topic clearly and help readers understand the calculations or
          considerations involved.
        </p>
      </header>

      {/* Helpful content note */}
      <section className="mt-8 surface-panel p-5">
        <h2 className="font-display text-lg font-semibold">
          What you will find here
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          BTTOTEK articles provide educational information and practical
          calculation guidance. Where a topic depends on location, date,
          project specifications, government rules, rates or professional
          judgment, readers should verify the current information with the
          relevant authority, project documents or qualified professional.
        </p>
      </section>

      {/* Articles */}
      <section className="mt-10" aria-labelledby="blog-articles">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="blog-articles"
              className="font-display text-2xl font-bold"
            >
              Latest articles
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Guides and explanations from the BTTOTEK knowledge base.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {POSTS.map((post) => (
            <article key={post.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="surface-panel block h-full p-6 transition-colors hover:border-accent/60"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5">
                    {post.category}
                  </span>

                  <span aria-hidden="true">·</span>

                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </time>

                  <span aria-hidden="true">·</span>

                  <span>{post.readMins} min read</span>
                </div>

                <h3 className="mt-3 font-display text-xl font-bold">
                  {post.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {post.excerpt}
                </p>

                <span className="mt-4 inline-block text-sm font-medium text-accent">
                  Read article →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Editorial / quality signal */}
      <section className="mt-12 max-w-4xl border-t border-border pt-8">
        <h2 className="font-display text-xl font-semibold">
          About the information on this blog
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          BTTOTEK publishes explanatory content to help readers understand
          common calculations and planning concepts. Articles should not be
          treated as a replacement for approved drawings, site measurements,
          engineering certification, legal advice, tax advice or financial
          advice. Important decisions should be checked against current
          requirements and authoritative sources.
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link
            to="/about"
            className="text-primary underline underline-offset-4"
          >
            About BTTOTEK
          </Link>

          <Link
            to="/tools"
            className="text-primary underline underline-offset-4"
          >
            Browse calculators
          </Link>

          <Link
            to="/contact"
            className="text-primary underline underline-offset-4"
          >
            Contact
          </Link>

          <Link
            to="/disclaimer"
            className="text-primary underline underline-offset-4"
          >
            Disclaimer
          </Link>

          <Link
            to="/privacy"
            className="text-primary underline underline-offset-4"
          >
            Privacy Policy
          </Link>

          <Link
            to="/terms"
            className="text-primary underline underline-offset-4"
          >
            Terms of Use
          </Link>
        </div>
      </section>
    </div>
  );
}
