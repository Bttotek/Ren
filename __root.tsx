import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Toaster } from "@/components/ui/sonner";
import { OfflineBanner } from "@/components/offline-banner";
import { ContentProtection } from "@/components/content-protection";
import { StickyFooterAd } from "@/components/ad-slot";
import { SiteSettingsProvider } from "@/lib/site-settings";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://www.bttotek.in";
const SITE_NAME = "BTTOTEK Solutions";
const DEFAULT_TITLE =
  "BTTOTEK Solutions — Civil, Construction & Property Calculators";
const DEFAULT_DESCRIPTION =
  "Free online calculators for civil construction, structural quantities, material estimates, land and property calculations, home loans and related project planning.";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-muted-foreground">
          BTTOTEK Solutions
        </p>

        <h1 className="mt-2 text-7xl font-bold text-foreground">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>

          <Link
            to="/tools"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Browse calculators
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-muted-foreground">
          BTTOTEK Solutions
        </p>

        <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          This page did not load
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Something went wrong while loading this page. Please try again or
          return to the home page.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => {
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-IN",
        publisher: {
          "@type": "Organization",
          "@id": `${SITE_URL}#organization`,
          name: SITE_NAME,
          url: SITE_URL,
        },
      };

      const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      };

      return {
        meta: [
          {
            charSet: "utf-8",
          },
          {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
          },
          {
            title: DEFAULT_TITLE,
          },
          {
            name: "description",
            content: DEFAULT_DESCRIPTION,
          },
          {
            name: "author",
            content: SITE_NAME,
          },
          {
            name: "robots",
            content:
              "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
          {
            property: "og:site_name",
            content: SITE_NAME,
          },
          {
            property: "og:type",
            content: "website",
          },
          {
            property: "og:title",
            content: DEFAULT_TITLE,
          },
          {
            property: "og:description",
            content: DEFAULT_DESCRIPTION,
          },
          {
            property: "og:url",
            content: `${SITE_URL}/`,
          },
          {
            property: "og:locale",
            content: "en_IN",
          },
          {
            name: "twitter:card",
            content: "summary",
          },
          {
            name: "twitter:title",
            content: DEFAULT_TITLE,
          },
          {
            name: "twitter:description",
            content: DEFAULT_DESCRIPTION,
          },
        ],

        links: [
          {
            rel: "stylesheet",
            href: appCss,
          },
          {
            rel: "preconnect",
            href: "https://fonts.googleapis.com",
          },
          {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossOrigin: "anonymous",
          },
          {
            rel: "stylesheet",
            href:
              "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
          },
          {
            rel: "icon",
            href: "/favicon.ico",
            type: "image/x-icon",
          },
          {
            rel: "canonical",
            href: `${SITE_URL}/`,
          },
        ],

        scripts: [
          {
            async: true,
            src:
              "https://www.googletagmanager.com/gtag/js?id=G-PZ7DWLR7GD",
          },
          {
            children: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PZ7DWLR7GD');
            `,
          },

          ...(import.meta.env.VITE_ADSENSE_CLIENT
            ? [
                {
                  async: true,
                  src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADSENSE_CLIENT}`,
                  crossOrigin: "anonymous" as const,
                },
              ]
            : []),

          {
            type: "application/ld+json",
            children: JSON.stringify(websiteSchema),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify(organizationSchema),
          },
        ],
      };
    },

    shellComponent: RootShell,

    component: RootComponent,

    notFoundComponent: NotFoundComponent,

    errorComponent: ErrorComponent,
  });

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED"
      ) {
        return;
      }

      void router.invalidate();

      if (event !== "SIGNED_OUT") {
        void queryClient.invalidateQueries();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <div className="flex min-h-screen flex-col">
          <ContentProtection />

          <OfflineBanner />

          <SiteHeader />

          <main className="flex-1">
            <Outlet />
          </main>

          <StickyFooterAd />

          <SiteFooter />
        </div>
      </SiteSettingsProvider>

      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
