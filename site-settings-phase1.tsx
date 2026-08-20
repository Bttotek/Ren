import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NavLink = { to: string; label: string; enabled?: boolean; order?: number };
export type SocialLink = { id: string; label: string; url: string; enabled: boolean; order: number };
export type FooterLink = { id: string; label: string; to: string; enabled: boolean; order: number };
export type FooterSection = { id: string; title: string; enabled: boolean; order: number; links: FooterLink[] };
export type StoreButton = { id: string; kind: "google-play" | "apple-store" | "custom"; label: string; url: string; enabled: boolean; order: number };

export type SiteSettings = {
  siteName: string;
  logoUrl: string;
  faviconUrl?: string;
  nav: NavLink[];
  adsenseClient: string;
  adSlotHome: string;
  adSlotTool: string;
  adSlotFooter: string;
  steelRate: number;
  playStoreUrl: string;
  footerText: string;
  social: {
    whatsapp: string;
    facebook: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    x: string;
  };
  socialLinks: SocialLink[];
  footerSections: FooterSection[];
  storeButtons: StoreButton[];
};

const legacySocial = {
  whatsapp: "https://wa.me/919999999999",
  facebook: "https://facebook.com/bttotek",
  linkedin: "https://linkedin.com/company/bttotek",
  instagram: "https://instagram.com/bttotek",
  youtube: "https://youtube.com/@bttotek",
  x: "https://x.com/bttotek",
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "BTTOTEK Solutions",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.png",
  nav: [
    { to: "/", label: "Home", enabled: true, order: 0 },
    { to: "/tools", label: "Tools", enabled: true, order: 1 },
    { to: "/blog", label: "Blog", enabled: true, order: 2 },
    { to: "/about", label: "About", enabled: true, order: 3 },
    { to: "/contact", label: "Contact", enabled: true, order: 4 },
  ],
  adsenseClient: "pub-8429448930796495",
  adSlotHome: "",
  adSlotTool: "",
  adSlotFooter: "",
  steelRate: 72,
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.bttotek.civilengine",
  footerText: "© BTTOTEK Solutions. All rights reserved.",
  social: legacySocial,
  socialLinks: [
    { id: "whatsapp", label: "WhatsApp", url: legacySocial.whatsapp, enabled: true, order: 0 },
    { id: "facebook", label: "Facebook", url: legacySocial.facebook, enabled: true, order: 1 },
    { id: "instagram", label: "Instagram", url: legacySocial.instagram, enabled: true, order: 2 },
    { id: "youtube", label: "YouTube", url: legacySocial.youtube, enabled: true, order: 3 },
    { id: "linkedin", label: "LinkedIn", url: legacySocial.linkedin, enabled: true, order: 4 },
    { id: "x", label: "X", url: legacySocial.x, enabled: true, order: 5 },
  ],
  footerSections: [
    { id: "company", title: "Company", enabled: true, order: 0, links: [
      { id: "tools", label: "All calculators", to: "/tools", enabled: true, order: 0 },
      { id: "blog", label: "Blog & insights", to: "/blog", enabled: true, order: 1 },
      { id: "about", label: "About us", to: "/about", enabled: true, order: 2 },
      { id: "contact", label: "Contact", to: "/contact", enabled: true, order: 3 },
      { id: "privacy", label: "Privacy policy", to: "/privacy", enabled: true, order: 4 },
      { id: "terms", label: "Terms of use", to: "/terms", enabled: true, order: 5 },
    ]},
  ],
  storeButtons: [
    { id: "google-play", kind: "google-play", label: "Google Play", url: "https://play.google.com/store/apps/details?id=com.bttotek.civilengine", enabled: true, order: 0 },
  ],
};

const DB_KEY = "global_site_settings";
type Ctx = { settings: SiteSettings; save: (next: SiteSettings) => void };
const SettingsContext = createContext<Ctx | null>(null);

function normalizeSettings(raw: Partial<SiteSettings>): SiteSettings {
  const socialLinks = raw.socialLinks?.length ? raw.socialLinks : DEFAULT_SETTINGS.socialLinks.map(x => ({ ...x }));
  const storeButtons = raw.storeButtons?.length ? raw.storeButtons : [{ ...DEFAULT_SETTINGS.storeButtons[0], url: raw.playStoreUrl || DEFAULT_SETTINGS.playStoreUrl }];
  const footerSections = raw.footerSections?.length ? raw.footerSections : DEFAULT_SETTINGS.footerSections.map(s => ({ ...s, links: s.links.map(l => ({ ...l })) }));
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    nav: (raw.nav?.length ? raw.nav : DEFAULT_SETTINGS.nav).map((n, i) => ({ ...n, enabled: n.enabled !== false, order: n.order ?? i })),
    social: { ...DEFAULT_SETTINGS.social, ...(raw.social ?? {}) },
    socialLinks: socialLinks.map((x, i) => ({ ...x, enabled: x.enabled !== false, order: x.order ?? i })),
    footerSections: footerSections.map((s, i) => ({ ...s, enabled: s.enabled !== false, order: s.order ?? i, links: (s.links ?? []).map((l, j) => ({ ...l, enabled: l.enabled !== false, order: l.order ?? j })) })),
    storeButtons: storeButtons.map((x, i) => ({ ...x, enabled: x.enabled !== false, order: x.order ?? i })),
  };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    async function loadFromDB() {
      try {
        const { data } = await supabase.from("site_settings").select("value").eq("key", DB_KEY).maybeSingle();
        if (data?.value) setSettings(normalizeSettings(data.value as Partial<SiteSettings>));
      } catch (e) { console.error("Settings load error:", e); }
    }
    loadFromDB();
  }, []);

  const save = useCallback((next: SiteSettings) => {
    const normalized = normalizeSettings(next);
    setSettings(normalized);
    supabase.from("site_settings").upsert({ key: DB_KEY, value: normalized, updated_at: new Date().toISOString() }, { onConflict: "key" }).then(({ error }) => {
      if (error) console.error("Error saving settings:", error);
    });
  }, []);

  const value = useMemo(() => ({ settings, save }), [settings, save]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  return ctx ?? { settings: DEFAULT_SETTINGS, save: () => undefined };
}
