import { Link, useNavigate } from "@tanstack/react-router";
import {
  Moon,
  Search,
  Sun,
  Menu,
  X,
  LayoutDashboard,
  MessageCircle,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  Play,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { searchTools, TOOLS } from "@/lib/tools";
import { useSession } from "@/hooks/use-session";
import { useSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const DEFAULT_SITE_NAME = "BTTOTEK Solutions";

/**
 * Default website logo.
 *
 * File location:
 * public/logo.png
 *
 * Browser URL:
 * /logo.png
 */
const DEFAULT_LOGO_URL = "/logo.png";

/**
 * Safe Logo component.
 *
 * If the logo URL saved in Admin/Settings is broken,
 * it automatically falls back to /logo.png.
 *
 * If even /logo.png cannot be loaded,
 * it shows a text fallback instead of a broken-image icon.
 */
function SiteLogo({
  src,
  alt,
  siteName,
  className,
}: {
  src?: string | null;
  alt: string;
  siteName: string;
  className?: string;
}) {
  const [logoSrc, setLogoSrc] = useState(
    src || DEFAULT_LOGO_URL,
  );

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLogoSrc(src || DEFAULT_LOGO_URL);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    /**
     * First failure:
     * Try the permanent public logo.
     */
    if (logoSrc !== DEFAULT_LOGO_URL) {
      setLogoSrc(DEFAULT_LOGO_URL);
      setFailed(false);
      return;
    }

    /**
     * If /logo.png itself fails,
     * don't show a broken-image icon.
     */
    setFailed(true);
  };

  if (failed) {
    return (
      <span
        aria-label={`${siteName} logo`}
        title={siteName}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-md bg-slate-900 text-sm font-bold text-white",
          className,
        )}
      >
        BT
      </span>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn(
        "size-10 shrink-0 rounded-md object-contain bg-white",
        className,
      )}
      width={40}
      height={40}
      loading="eager"
      decoding="async"
      onError={handleError}
    />
  );
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(
    "light",
  );

  useEffect(() => {
    const stored = localStorage.getItem("bttotek-theme");

    const initial =
      stored === "dark" || stored === "light"
        ? stored
        : "light";

    setTheme(initial);

    document.documentElement.classList.toggle(
      "dark",
      initial === "dark",
    );
  }, []);

  const toggle = () => {
    setTheme((previous) => {
      const next =
        previous === "dark"
          ? "light"
          : "dark";

      document.documentElement.classList.toggle(
        "dark",
        next === "dark",
      );

      localStorage.setItem(
        "bttotek-theme",
        next,
      );

      return next;
    });
  };

  return {
    theme,
    toggle,
  };
}

export function ToolSearch({
  large = false,
}: {
  large?: boolean;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const ref = useRef<HTMLDivElement>(null);

  const results = searchTools(q);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      onClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onClick,
      );
    };
  }, []);

  const openTool = (slug: string) => {
    setOpen(false);
    setQ("");

    void navigate({
      to: "/tools/$slug",
      params: {
        slug,
      },
    });
  };

  return (
    <div
      ref={ref}
      className="relative w-full"
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3",
          large
            ? "py-3 shadow-[var(--shadow-raised)]"
            : "py-2",
        )}
      >
        <Search
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />

        <input
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }

            if (
              event.key === "Enter" &&
              results.length > 0
            ) {
              openTool(results[0].slug);
            }
          }}
          placeholder={
            large
              ? "Search BBS, concrete, bigha, stamp duty, EMI…"
              : "Search calculators…"
          }
          className={cn(
            "w-full bg-transparent outline-none",
            large
              ? "text-base"
              : "text-sm",
          )}
          aria-label="Search BTTOTEK calculators"
          aria-expanded={open}
          autoComplete="off"
        />
      </div>

      {open && results.length > 0 && (
        <ul
          className="absolute top-full z-50 mt-2 max-h-80 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-[var(--shadow-raised)]"
          aria-label="Calculator search results"
        >
          {results.map((tool) => (
            <li key={tool.slug}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  openTool(tool.slug);
                }}
                className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-accent/15"
              >
                <div className="text-sm font-medium">
                  {tool.name}
                </div>

                <div className="text-xs text-muted-foreground">
                  {tool.category}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open &&
        q.trim() &&
        results.length === 0 && (
          <div className="absolute top-full z-50 mt-2 w-full rounded-lg border border-border bg-popover px-3 py-3 text-sm text-muted-foreground shadow-[var(--shadow-raised)]">
            No calculator matches “{q}”.
          </div>
        )}
    </div>
  );
}

export function SiteHeader() {
  const {
    theme,
    toggle,
  } = useTheme();

  const [
    openMenu,
    setOpenMenu,
  ] = useState(false);

  const { user } = useSession();

  const { settings } =
    useSiteSettings();

  const siteName =
    settings.siteName ||
    DEFAULT_SITE_NAME;

  const NAV = settings.nav;

  /**
   * Admin uploaded logo has priority.
   *
   * If it is empty or broken, SiteLogo automatically
   * falls back to /logo.png.
   */
  const logoUrl =
    settings.logoUrl ||
    DEFAULT_LOGO_URL;

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 py-3">

        {/* Brand / Logo */}
        <Link
          to="/"
          aria-label={`${siteName} home`}
          className="flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <SiteLogo
            src={logoUrl}
            alt={`${siteName} logo`}
            siteName={siteName}
          />

          <span
            className="max-w-[180px] truncate font-display text-base font-bold leading-tight sm:max-w-none sm:text-lg"
          >
            {siteName}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="order-2 hidden items-center gap-1 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to as "/"}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{
                className:
                  "text-foreground bg-secondary",
              }}
              activeOptions={{
                exact: item.to === "/",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search */}
        <div className="order-1 ml-auto hidden w-64 lg:block">
          <ToolSearch />
        </div>

        {/* Theme */}
        <button
          type="button"
          onClick={toggle}
          aria-label={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            theme === "dark"
              ? "Light mode"
              : "Dark mode"
          }
          className="order-3 grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun
              className="size-4"
              aria-hidden="true"
            />
          ) : (
            <Moon
              className="size-4"
              aria-hidden="true"
            />
          )}
        </button>

        {/* Account */}
        {user ? (
          <Link
            to="/dashboard"
            className="order-4 hidden shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary sm:inline-flex"
          >
            <LayoutDashboard
              className="size-4"
              aria-hidden="true"
            />
            Workspace
          </Link>
        ) : (
          <Link
            to="/auth"
            className="order-4 hidden shrink-0 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 sm:inline-flex"
          >
            Sign in
          </Link>
        )}

        {/* Mobile menu */}
        <button
          type="button"
          onClick={() =>
            setOpenMenu(
              (value) => !value,
            )
          }
          aria-label={
            openMenu
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={openMenu}
          className="order-5 ml-auto grid size-9 shrink-0 place-items-center rounded-md border border-border md:hidden"
        >
          {openMenu ? (
            <X
              className="size-4"
              aria-hidden="true"
            />
          ) : (
            <Menu
              className="size-4"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {openMenu && (
        <div className="space-y-4 border-t border-border px-4 py-4 md:hidden">
          <ToolSearch />

          <nav
            aria-label="Mobile navigation"
            className="grid gap-1"
          >
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to as "/"}
                onClick={() =>
                  setOpenMenu(false)
                }
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}

            <Link
              to={
                user
                  ? "/dashboard"
                  : "/auth"
              }
              onClick={() =>
                setOpenMenu(false)
              }
              className="rounded-md px-3 py-2 text-sm font-medium text-accent hover:bg-secondary"
            >
              {user
                ? "My workspace"
                : "Sign in"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

const SOCIAL_ICONS: Record<string, any> = {
  whatsapp: MessageCircle,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  x: Twitter,
};

export function SiteFooter() {
  const { settings } =
    useSiteSettings();

  const siteName =
    settings.siteName ||
    DEFAULT_SITE_NAME;

  /**
   * Admin uploaded logo has priority.
   *
   * If it is empty or broken, SiteLogo automatically
   * falls back to /logo.png.
   */
  const logoUrl =
    settings.logoUrl ||
    DEFAULT_LOGO_URL;

  const civilTools = TOOLS.filter(
    (tool) =>
      tool.category ===
      "Civil & Construction",
  ).slice(0, 6);

  const propertyTools = TOOLS.filter(
    (tool) =>
      tool.category ===
      "Real Estate & Finance",
  ).slice(0, 6);

  return (
    <footer className="mt-20 bg-[#0F172A] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2.5"
            aria-label={`${siteName} home`}
          >
            <SiteLogo
              src={logoUrl}
              alt={`${siteName} logo`}
              siteName={siteName}
            />

            <span className="font-display text-lg font-bold text-white">
              {siteName}
            </span>
          </Link>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Free online calculators and practical
            information for construction estimating,
            civil engineering, structural quantities,
            property calculations and project planning.
          </p>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[#F59E0B]">
            Follow us
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {[...settings.socialLinks].sort((a,b)=>a.order-b.order).filter(x=>x.enabled && x.url).map((item) => {
              const Icon = SOCIAL_ICONS[item.id] || MessageCircle;
              return <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.label} title={item.label} className="grid size-9 place-items-center rounded-md border border-slate-700 bg-slate-800/60 text-slate-300 transition-colors hover:border-[#F59E0B] hover:text-[#F59E0B]"><Icon className="size-4" aria-hidden="true" /></a>;
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[...settings.storeButtons].sort((a,b)=>a.order-b.order).filter(x=>x.enabled && x.url).map((item) => <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.label}`} className="inline-flex items-center gap-3 rounded-lg border border-slate-700 bg-black px-4 py-2 transition-colors hover:border-[#F59E0B]"><Play className="size-6 text-[#F59E0B]" aria-hidden="true" /><span className="leading-tight"><span className="block text-[10px] uppercase tracking-wide text-slate-400">Get it on</span><span className="block font-display text-sm font-bold text-white">{item.label}</span></span></a>)}
          </div>
        </div>

        {/* Civil tools */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#F59E0B]">
            Civil tools
          </h2>

          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {civilTools.map(
              (tool) => (
                <li key={tool.slug}>
                  <Link
                    to="/tools/$slug"
                    params={{
                      slug: tool.slug,
                    }}
                    className="hover:text-white"
                  >
                    {tool.name}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Property tools */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#F59E0B]">
            Real estate
          </h2>

          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {propertyTools.map(
              (tool) => (
                <li key={tool.slug}>
                  <Link
                    to="/tools/$slug"
                    params={{
                      slug: tool.slug,
                    }}
                    className="hover:text-white"
                  >
                    {tool.name}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        {[...settings.footerSections].sort((a,b)=>a.order-b.order).filter(s=>s.enabled).slice(0, 2).map((footerSection) => <div key={footerSection.id}><h2 className="text-sm font-semibold uppercase tracking-wide text-[#F59E0B]">{footerSection.title}</h2><ul className="mt-3 space-y-2 text-sm text-slate-400">{[...footerSection.links].sort((a,b)=>a.order-b.order).filter(l=>l.enabled).map(link => <li key={link.id}><Link to={link.to as any} className="hover:text-white">{link.label}</Link></li>)}</ul></div>)}
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 px-4 py-5 text-center text-xs leading-5 text-slate-400">
        {settings.footerText ||
          `© ${new Date().getFullYear()} ${siteName}.`}
        {" "}
        Calculator results are indicative and should be
        verified against applicable standards, project
        documents and current local requirements before
        important decisions.
      </div>
    </footer>
  );
}
