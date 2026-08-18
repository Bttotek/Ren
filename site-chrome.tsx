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

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored = localStorage.getItem("bttotek-theme");
    const initial = stored === "dark" || stored === "light" ? stored : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);
  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("bttotek-theme", next);
      return next;
    });
  };
  return { theme, toggle };
}

export function ToolSearch({ large = false }: { large?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const results = searchTools(q);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3",
          large ? "py-3 shadow-[var(--shadow-raised)]" : "py-2",
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={large ? "Search BBS, concrete, bigha, stamp duty, EMI…" : "Search tools…"}
          className={cn("w-full bg-transparent outline-none", large ? "text-base" : "text-sm")}
          aria-label="Search calculators"
        />
      </div>
      {open && results.length > 0 && (
        <ul className="absolute top-full z-50 mt-2 max-h-80 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-[var(--shadow-raised)]">
          {results.map((t) => (
            <li key={t.slug}>
              <button
                onMouseDown={() => {
                  setOpen(false);
                  setQ("");
                  void navigate({ to: "/tools/$slug", params: { slug: t.slug } });
                }}
                className="w-full rounded-md px-3 py-2 text-left hover:bg-accent/15"
              >
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.category}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && q.trim() && results.length === 0 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border border-border bg-popover px-3 py-3 text-sm text-muted-foreground shadow-[var(--shadow-raised)]">
          No tool matches “{q}”.
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const [openMenu, setOpenMenu] = useState(false);
  const { user } = useSession();
  const { settings } = useSiteSettings();
  const NAV = settings.nav;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Dynamic Logo & Dynamic Site Name */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName} className="size-9 object-contain rounded-md" />
          ) : (
            <span className="accent-gradient grid size-9 place-items-center rounded-md font-display text-sm font-bold text-accent-foreground">
              {settings.siteName ? settings.siteName.slice(0, 2).toUpperCase() : "BT"}
            </span>
          )}
          <span
            className="block max-w-[150px] truncate font-display text-base font-bold sm:max-w-none sm:text-lg"
            aria-label={settings.siteName || "BTTOTEK Solutions"}
          >
            {settings.siteName || "BTTOTEK Solutions"}
          </span>
        </Link>

        {/* Dynamic Navigation Links */}
        <nav className="order-2 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to as "/"}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="order-1 ml-auto hidden w-64 lg:block">
          <ToolSearch />
        </div>

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="order-3 grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {user ? (
          <Link
            to="/dashboard"
            className="order-4 hidden shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary sm:inline-flex"
          >
            <LayoutDashboard className="size-4" /> Workspace
          </Link>
        ) : (
          <Link
            to="/auth"
            className="order-4 hidden shrink-0 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 sm:inline-flex"
          >
            Sign in
          </Link>
        )}

        <button
          onClick={() => setOpenMenu((v) => !v)}
          aria-label="Toggle menu"
          className="order-5 ml-auto grid size-9 shrink-0 place-items-center rounded-md border border-border md:hidden"
        >
          {openMenu ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {openMenu && (
        <div className="space-y-3 border-t border-border px-4 py-4 md:hidden">
          <ToolSearch />
          <div className="grid gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to as "/"}
                onClick={() => setOpenMenu(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to={user ? "/dashboard" : "/auth"}
              onClick={() => setOpenMenu(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-accent hover:bg-secondary"
            >
              {user ? "My workspace" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

const SOCIALS = [
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "x", label: "X (Twitter)", Icon: Twitter },
] as const;

export function SiteFooter() {
  const { settings } = useSiteSettings();

  return (
    <footer className="mt-20 bg-[#0F172A] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* Dynamic Site Name in Footer */}
          <div className="font-display text-lg font-bold text-white">
            {settings.siteName || "BTTOTEK Solutions"}
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Engineering-grade calculators for construction estimating, structural quantities and
            real-estate analytics.
          </p>

          <h4 className="mt-6 text-sm font-semibold tracking-wide text-[#F59E0B] uppercase">Follow us</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {SOCIALS.map(({ key, label, Icon }) => (
              <a
                key={key}
                href={settings.social[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="grid size-9 place-items-center rounded-md border border-slate-700 bg-slate-800/60 text-slate-300 transition-colors hover:border-[#F59E0B] hover:text-[#F59E0B]"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>

          <a
            href={settings.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-3 rounded-lg border border-slate-700 bg-black px-4 py-2 transition-colors hover:border-[#F59E0B]"
          >
            <Play className="size-6 text-[#F59E0B]" />
            <span className="leading-tight">
              <span className="block text-[10px] tracking-wide text-slate-400 uppercase">Get it on</span>
              <span className="block font-display text-sm font-bold text-white">Google Play</span>
            </span>
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-wide text-[#F59E0B] uppercase">Civil tools</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {TOOLS.filter((t) => t.category === "Civil & Construction")
              .slice(0, 6)
              .map((t) => (
                <li key={t.slug}>
                  <Link to="/tools/$slug" params={{ slug: t.slug }} className="hover:text-white">
                    {t.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-wide text-[#F59E0B] uppercase">Real estate</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {TOOLS.filter((t) => t.category === "Real Estate & Finance")
              .slice(0, 6)
              .map((t) => (
                <li key={t.slug}>
                  <Link to="/tools/$slug" params={{ slug: t.slug }} className="hover:text-white">
                    {t.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-wide text-[#F59E0B] uppercase">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link to="/tools" className="hover:text-white">All tools</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link to="/about" className="hover:text-white">About us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms of service</Link></li>
            <li>
  <Link to="/disclaimer" className="hover:text-white">
    Disclaimer
  </Link>
</li>
          </ul>
        </div>
      </div>

      {/* Dynamic Footer Copyright Text */}
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-400">
        {settings.footerText || `© ${new Date().getFullYear()} BTTOTEK Solutions.`} Results are indicative — verify against IS codes and local rates before execution.
      </div>
    </footer>
  );
}
