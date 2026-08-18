import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { findPost } from "@/lib/blog";
import { BlogComments, EngagementBar } from "@/components/engagement";

const SITE_URL = "https://www.bttotek.in";
const SITE_NAME = "BTTOTEK Solutions";
const BLOG_URL = `${SITE_URL}/blog`;

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = findPost(params.slug);

    if (!post) {
      throw notFound();
    }

    return { post };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          {
            title: "Article unavailable — BTTOTEK",
          },
          {
            name: "robots",
            content: "noindex, nofollow",
          },
        ],
      };
    }

    const { post } = loaderData;

    const canonicalUrl = `${BLOG_URL}/${encodeURIComponent(post.slug)}`;

    const articleTitle = `${post.title} | BTTOTEK Solutions`;

    const wordCount = post.body
      ?.join(" ")
      .split(/\s+/)
      .filter(Boolean).length;

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: BLOG_URL,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: canonicalUrl,
        },
      ],
    };

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      url: canonicalUrl,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
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
      isPartOf: {
        "@type": "Blog",
        "@id": `${BLOG_URL}#blog`,
        name: "BTTOTEK Solutions Blog",
        url: BLOG_URL,
      },
      articleSection: post.category,
      inLanguage: "en-IN",
      ...(wordCount
        ? {
            wordCount,
          }
        : {}),
    };

    return {
      meta: [
        {
          title: articleTitle,
        },
        {
          name: "description",
          content: post.excerpt,
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
        {
          property: "og:site_name",
          content: SITE_NAME,
        },
        {
          property: "og:type",
          content: "article",
        },
        {
          property: "og:title",
          content: post.title,
        },
        {
          property: "og:description",
          content: post.excerpt,
        },
        {
          property: "og:url",
          content: canonicalUrl,
        },
        {
          property: "og:locale",
          content: "en_IN",
        },
        {
          property: "article:published_time",
          content: post.date,
        },
        {
          property: "article:section",
          content: post.category,
        },
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "twitter:title",
          content: post.title,
        },
        {
          name: "twitter:description",
          content: post.excerpt,
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
          children: JSON.stringify(articleSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
      ],
    };
  },

  component: BlogPost,

  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">
        Article not found
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        The article may have been moved or removed.
      </p>

      <Link
        to="/blog"
        className="mt-4 inline-block text-sm text-primary underline"
      >
        Back to blog
      </Link>
    </div>
  ),
});

function BlogPost() {
  const { post } = Route.useLoaderData();

  const publishedDate = new Date(post.date).toLocaleDateString("en-IN", {
    dateStyle: "long",
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
              to="/blog"
              className="hover:text-foreground hover:underline"
            >
              Blog
            </Link>
          </li>

          <li aria-hidden="true">/</li>

          <li className="text-foreground">
            {post.title}
          </li>
        </ol>
      </nav>

      <Link
        to="/blog"
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All articles
      </Link>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-0.5">
            {post.category}
          </span>

          <span aria-hidden="true">·</span>

          <time dateTime={post.date}>
            {publishedDate}
          </time>

          <span aria-hidden="true">·</span>

          <span>{post.readMins} min read</span>
        </div>

        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {post.excerpt}
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          Published by {SITE_NAME}
        </p>
      </header>

      <div className="mt-8 border-b border-border pb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Article
        </span>
      </div>

      <div className="mt-8 space-y-5">
        {post.body.map((paragraph: string, index: number) => (
          <p
            key={`${post.slug}-${index}`}
            className="text-[15px] leading-7 text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <section className="mt-10 rounded-lg border border-border bg-muted/30 p-5">
        <h2 className="font-display text-lg font-semibold">
          Important information
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This article is provided for general educational and calculation
          guidance. Information, rates, rules, standards and project
          requirements can change or vary by location and date. Before making
          an important construction, structural, property, tax, legal or
          financial decision, verify the relevant information with current
          authoritative sources, project documents or a suitably qualified
          professional.
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="font-display text-lg font-semibold">
          Related BTTOTEK resources
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Continue exploring BTTOTEK calculators and other information.
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link
            to="/tools"
            className="text-primary underline underline-offset-4"
          >
            Browse calculators
          </Link>

          <Link
            to="/blog"
            className="text-primary underline underline-offset-4"
          >
            More articles
          </Link>

          <Link
            to="/about"
            className="text-primary underline underline-offset-4"
          >
            About BTTOTEK
          </Link>

          <Link
            to="/disclaimer"
            className="text-primary underline underline-offset-4"
          >
            Disclaimer
          </Link>

          <Link
            to="/contact"
            className="text-primary underline underline-offset-4"
          >
            Contact
          </Link>
        </div>
      </section>

      <EngagementBar
        type="post"
        slug={post.slug}
        title={post.title}
      />

      <BlogComments postSlug={post.slug} />
    </article>
  );
}
