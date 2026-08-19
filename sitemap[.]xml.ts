import { createFileRoute } from "@tanstack/react-router";
import { TOOLS } from "@/lib/tools";
import { getPosts } from "@/lib/blog";

const BASE_URL = "https://www.bttotek.in";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Only public, indexable pages are included.
        // Private/admin/auth routes must never appear here.

        const staticPages: SitemapEntry[] = [
          {
            path: "/",
            changefreq: "weekly",
            priority: "1.0",
          },
          {
            path: "/tools",
            changefreq: "weekly",
            priority: "0.9",
          },
          {
            path: "/blog",
            changefreq: "weekly",
            priority: "0.8",
          },
          {
            path: "/about",
            changefreq: "monthly",
            priority: "0.6",
          },
          {
            path: "/contact",
            changefreq: "monthly",
            priority: "0.6",
          },
          {
            path: "/privacy",
            changefreq: "yearly",
            priority: "0.4",
          },
          {
            path: "/terms",
            changefreq: "yearly",
            priority: "0.4",
          },
          {
            path: "/disclaimer",
            changefreq: "yearly",
            priority: "0.4",
          },
        ];

        const toolPages: SitemapEntry[] = TOOLS.map(
          (tool) => ({
            path: `/tools/${tool.slug}`,
            changefreq: "monthly",
            priority: "0.8",
          }),
        );

        const posts = await getPosts();

        const blogPages: SitemapEntry[] = posts.map(
          (post) => ({
            path: `/blog/${post.slug}`,
            lastmod: post.date,
            changefreq: "monthly",
            priority: "0.7",
          }),
        );

        // Remove duplicate URLs.
        const entries = Array.from(
          new Map(
            [
              ...staticPages,
              ...toolPages,
              ...blogPages,
            ].map((entry) => [
              entry.path,
              entry,
            ]),
          ).values(),
        );

        const escapeXml = (value: string): string =>
          value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

        const urls = entries.map((entry) => {
          const loc = `${BASE_URL}${entry.path}`;

          return [
            "  <url>",
            `    <loc>${escapeXml(loc)}</loc>`,
            ...(entry.lastmod
              ? [
                  `    <lastmod>${escapeXml(
                    entry.lastmod,
                  )}</lastmod>`,
                ]
              : []),
            `    <changefreq>${entry.changefreq}</changefreq>`,
            `    <priority>${entry.priority}</priority>`,
            "  </url>",
          ].join("\n");
        });

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type":
              "application/xml; charset=utf-8",
            "Cache-Control":
              "public, max-age=3600",
          },
        });
      },
    },
  },
});
