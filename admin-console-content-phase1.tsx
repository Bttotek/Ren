import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  Search,
  Eye,
  EyeOff,
  Star,
  Copy,
  X,
  FileText,
  Calculator,
  ChevronLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  LayoutList,
  UsersRound,
  FileQuestion,
  MessageSquareText,
  UserRoundSearch,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS } from "@/lib/tools";
import { useSiteSettings, type SiteSettings } from "@/lib/site-settings";
import AdminCmsSettingsPanel from "@/components/admin-cms-settings-panel";
import AdminDownloadControls from "@/components/admin-download-controls";

type Tab =
  | "dashboard"
  | "posts"
  | "pages"
  | "faqs"
  | "leads"
  | "reviews"
  | "comments"
  | "tools"
  | "bbs"
  | "measurement"
  | "live-sheet"
  | "excel"
  | "pdf"
  | "downloads"
  | "seo"
  | "keywords"
  | "content-quality"
  | "internal-links"
  | "sitemap"
  | "redirects"
  | "media"
  | "social"
  | "appearance"
  | "adsense"
  | "analytics"
  | "apps"
  | "users"
  | "security"
  | "backup"
  | "health"
  | "settings"
  | "cms";

type NavItem = {
  id: Tab;
  label: string;
  section: string;
};

const ADMIN_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", section: "Overview" },

  { id: "content", label: "Content Overview", section: "Content" },
  { id: "posts", label: "Posts", section: "Content" },
  { id: "pages", label: "Pages", section: "Content" },
  { id: "faqs", label: "FAQs", section: "Content" },
  { id: "leads", label: "Leads", section: "Content" },
  { id: "reviews", label: "Reviews", section: "Content" },
  { id: "comments", label: "Comments", section: "Content" },
  { id: "media", label: "Media Library", section: "Content" },

  { id: "tools", label: "All Tools / Calculators", section: "Tools" },
  { id: "bbs", label: "BBS Pro", section: "Tools" },
  { id: "measurement", label: "Measurement", section: "Tools" },
  { id: "live-sheet", label: "Live Sheet Builder", section: "Tools" },

  { id: "downloads", label: "Download Services", section: "Downloads" },
  { id: "excel", label: "Excel Templates", section: "Downloads" },
  { id: "pdf", label: "PDF Templates", section: "Downloads" },

  { id: "seo", label: "SEO Dashboard", section: "SEO" },
  { id: "keywords", label: "Keyword Rank Tracker", section: "SEO" },
  { id: "content-quality", label: "Content Quality", section: "SEO" },
  { id: "internal-links", label: "Internal Links", section: "SEO" },
  { id: "sitemap", label: "Sitemap / Robots", section: "SEO" },
  { id: "redirects", label: "Redirects / 404", section: "SEO" },

  { id: "appearance", label: "Theme & Layout", section: "Appearance" },

  { id: "adsense", label: "AdSense", section: "Monetization" },
  { id: "analytics", label: "Analytics", section: "Analytics" },
  { id: "apps", label: "Android Apps", section: "Apps" },

  { id: "users", label: "Users & Roles", section: "Security" },
  { id: "security", label: "Security & Logs", section: "Security" },

  { id: "backup", label: "Backup / Restore", section: "System" },
  { id: "health", label: "System Health", section: "System" },
  { id: "cms", label: "CMS / Website Editor", section: "System" },
  { id: "settings", label: "General Settings", section: "System" },
];

type ToolStatus = "Published" | "Draft" | "Disabled";

type ToolRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  status: ToolStatus;
  featured: boolean;
  custom: boolean;
  icon?: string;
};

type ToolConfig = {
  customName?: string;
  status?: string;
  description?: string;
  longDescription?: string;
  featured?: boolean;
  category?: string;
  slug?: string;
};

type PostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  body?: string | null;
  published?: boolean | null;
  featured_image?: string | null;
  category?: string | null;
  tags?: string | string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);

const fieldCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/20";

const labelCls =
  "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  const cls =
    normalized === "published" || normalized === "active"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : normalized === "draft"
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-red-500/10 text-red-600 border-red-500/20";

  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase " +
        cls
      }
    >
      {status}
    </span>
  );
}


function stripHtml(value: string) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function editorInitialHtml(value: string) {
  if (!value) return "";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
    .join("");
}

function qualityReport(html: string) {
  const text = stripHtml(html);
  const sentences = text
    .split(/[.!?]+/)
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x.length >= 35);
  const duplicates = sentences.filter((x, i) => sentences.indexOf(x) !== i);
  const words = text.split(/\s+/).filter(Boolean);
  const grammarIssues: string[] = [];

  if (/\s{2,}/.test(text)) grammarIssues.push("Multiple spaces found");
  if (/[!?.,]{2,}/.test(text)) grammarIssues.push("Repeated punctuation found");
  if (/(^|[.!?]\s+)[a-z]/.test(text)) grammarIssues.push("Sentence starts with lowercase text");
  if (/\b(he|she|it)\s+(go|do|have|are|were|make|need|use)\b/i.test(text)) {
    grammarIssues.push("Possible subject–verb agreement issue");
  }
  if (/\b(the|a|an)\s+[,.]/i.test(text)) grammarIssues.push("Article/punctuation issue");

  const duplicateRatio = sentences.length ? duplicates.length / sentences.length : 0;
  const originality = Math.max(0, Math.round(100 - duplicateRatio * 100));
  const plagiarismStatus = originality >= 85 ? "green" : originality >= 65 ? "amber" : "red";

  return {
    words: words.length,
    characters: text.length,
    grammarIssues,
    originality,
    plagiarismStatus,
    duplicateSentences: duplicates.length,
  };
}

function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = 300,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [report, setReport] = useState(() => qualityReport(value));

  useEffect(() => {
    if (!ref.current || document.activeElement === ref.current) return;
    const next = editorInitialHtml(value);
    if (ref.current.innerHTML !== next) ref.current.innerHTML = next;
    setReport(qualityReport(value));
  }, [value]);

  function exec(command: string, commandValue?: string) {
    ref.current?.focus();
    document.execCommand(command, false, commandValue);
    const next = ref.current?.innerHTML || "";
    onChange(next);
    setReport(qualityReport(next));
  }

  function link() {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  }

  function onInput() {
    const next = ref.current?.innerHTML || "";
    onChange(next);
    setReport(qualityReport(next));
  }

  const Button = ({ label: text, onClick }: { label: string; onClick: () => void }) => (
    <button
      type="button"
      title={text}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rounded border border-border bg-background px-2 py-1 text-xs font-semibold hover:bg-secondary"
    >
      {text}
    </button>
  );

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={labelCls}>{label}</span>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{report.words} words</span>
          <span>•</span>
          <span>{report.characters} chars</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-input bg-background">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/40 p-2">
          <Button label="Undo" onClick={() => exec("undo")} />
          <Button label="Redo" onClick={() => exec("redo")} />
          <span className="mx-1 h-5 w-px bg-border" />
          <select
            aria-label="Text style"
            className="rounded border border-border bg-background px-2 py-1 text-xs"
            defaultValue="p"
            onChange={(e) => exec("formatBlock", `<${e.target.value}>`)}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="blockquote">Quote</option>
          </select>
          <select
            aria-label="Font"
            className="rounded border border-border bg-background px-2 py-1 text-xs"
            defaultValue="Arial"
            onChange={(e) => exec("fontName", e.target.value)}
          >
            <option>Arial</option>
            <option>Georgia</option>
            <option>Times New Roman</option>
            <option>Verdana</option>
            <option>Trebuchet MS</option>
            <option>Courier New</option>
          </select>
          <select
            aria-label="Font size"
            className="rounded border border-border bg-background px-2 py-1 text-xs"
            defaultValue="3"
            onChange={(e) => exec("fontSize", e.target.value)}
          >
            <option value="1">8px</option>
            <option value="2">10px</option>
            <option value="3">14px</option>
            <option value="4">18px</option>
            <option value="5">24px</option>
            <option value="6">32px</option>
            <option value="7">48px</option>
          </select>
          <span className="mx-1 h-5 w-px bg-border" />
          <Button label="Bold" onClick={() => exec("bold")} />
          <Button label="Italic" onClick={() => exec("italic")} />
          <Button label="Underline" onClick={() => exec("underline")} />
          <Button label="Strike" onClick={() => exec("strikeThrough")} />
          <Button label="Clear formatting" onClick={() => exec("removeFormat")} />
          <span className="mx-1 h-5 w-px bg-border" />
          <Button label="Bulleted list" onClick={() => exec("insertUnorderedList")} />
          <Button label="Numbered list" onClick={() => exec("insertOrderedList")} />
          <Button label="Left" onClick={() => exec("justifyLeft")} />
          <Button label="Center" onClick={() => exec("justifyCenter")} />
          <Button label="Right" onClick={() => exec("justifyRight")} />
          <Button label="Justify" onClick={() => exec("justifyFull")} />
          <Button label="Link" onClick={link} />
          <Button label="Unlink" onClick={() => exec("unlink")} />
          <Button label="Code" onClick={() => exec("formatBlock", "pre")} />
          <Button label="More" onClick={() => exec("insertHorizontalRule")} />
          <button
            type="button"
            onClick={() => setHtmlMode((v) => !v)}
            className="ml-auto rounded border border-border px-2 py-1 text-xs font-semibold"
          >
            {htmlMode ? "Visual" : "HTML"}
          </button>
        </div>

        {htmlMode ? (
          <textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setReport(qualityReport(e.target.value));
            }}
            spellCheck
            style={{ minHeight }}
            className="w-full resize-y border-0 bg-background p-4 font-mono text-sm outline-none"
          />
        ) : (
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            data-placeholder={placeholder}
            spellCheck
            onInput={onInput}
            style={{ minHeight }}
            className="prose prose-sm max-w-none overflow-y-auto bg-background p-4 leading-7 outline-none empty:before:text-muted-foreground/50 empty:before:content-[attr(data-placeholder)]"
          />
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-border bg-secondary/20 px-3 py-2 text-[11px]">
          <span className="font-semibold">Grammar:</span>
          {report.grammarIssues.length === 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <CheckCircle2 className="size-3.5" /> Good
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-red-600">
              <AlertTriangle className="size-3.5" /> {report.grammarIssues.join(" • ")}
            </span>
          )}
          <span className="ml-auto font-semibold">Plagiarism / Originality:</span>
          <span
            className={
              report.plagiarismStatus === "green"
                ? "font-bold text-emerald-600"
                : report.plagiarismStatus === "amber"
                  ? "font-bold text-amber-600"
                  : "font-bold text-red-600"
            }
          >
            {report.originality}% {report.plagiarismStatus === "green" ? "GREEN" : report.plagiarismStatus === "amber" ? "CHECK" : "RED"}
          </span>
          {report.duplicateSentences > 0 && (
            <span className="text-red-600">{report.duplicateSentences} duplicate sentence(s)</span>
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Browser spell-check is enabled. The originality indicator is an automatic local heuristic; a true web-wide plagiarism check requires a connected plagiarism API.
      </p>
    </div>
  );
}

type ModuleField = { key: string; label: string; placeholder: string; type?: "text" | "url" | "number" };

const MODULE_FIELDS: Record<string, { intro: string; fields: ModuleField[] }> = {
  seo: { intro: "Search visibility, metadata and indexing controls.", fields: [
    { key: "siteTitle", label: "Default SEO title", placeholder: "BTTOTEK Solutions" },
    { key: "description", label: "Default meta description", placeholder: "Construction calculators, BBS and practical tools." },
    { key: "canonical", label: "Canonical base URL", placeholder: "https://www.bttotek.in", type: "url" },
  ] },
  keywords: { intro: "Track target keywords and the pages they belong to.", fields: [
    { key: "provider", label: "Rank provider", placeholder: "Manual / Search Console" },
    { key: "defaultCountry", label: "Country", placeholder: "India" },
    { key: "refreshHours", label: "Refresh interval (hours)", placeholder: "24", type: "number" },
  ] },
  "content-quality": { intro: "Editorial quality thresholds used before publishing.", fields: [
    { key: "minWords", label: "Minimum words", placeholder: "800", type: "number" },
    { key: "minHeadings", label: "Minimum headings", placeholder: "3", type: "number" },
    { key: "requireSeo", label: "Require SEO fields", placeholder: "true" },
  ] },
  "internal-links": { intro: "Manage internal-linking targets and audits.", fields: [
    { key: "minLinks", label: "Recommended internal links", placeholder: "3", type: "number" },
    { key: "scanPath", label: "Primary content path", placeholder: "/blog" },
  ] },
  sitemap: { intro: "Control sitemap and robots behavior.", fields: [
    { key: "sitemapEnabled", label: "Sitemap enabled", placeholder: "true" },
    { key: "robotsMode", label: "Robots mode", placeholder: "index,follow" },
  ] },
  redirects: { intro: "Keep legacy URLs and 404 handling under control.", fields: [
    { key: "notFoundMode", label: "404 behavior", placeholder: "Custom 404" },
    { key: "redirectPolicy", label: "Redirect policy", placeholder: "301" },
  ] },
  social: { intro: "Social sharing identity and outbound profiles.", fields: [
    { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/...", type: "url" },
    { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/...", type: "url" },
    { key: "youtube", label: "YouTube URL", placeholder: "https://youtube.com/...", type: "url" },
  ] },
  adsense: { intro: "Advertising configuration and placement status.", fields: [
    { key: "publisherId", label: "Publisher ID", placeholder: "ca-pub-..." },
    { key: "autoAds", label: "Auto ads", placeholder: "false" },
    { key: "testMode", label: "Test mode", placeholder: "true" },
  ] },
  analytics: { intro: "Traffic and product analytics configuration.", fields: [
    { key: "gaId", label: "Google Analytics ID", placeholder: "G-..." },
    { key: "searchConsole", label: "Search Console verification", placeholder: "Verification token" },
  ] },
  apps: { intro: "Android app distribution and release information.", fields: [
    { key: "playStoreUrl", label: "Play Store URL", placeholder: "https://play.google.com/...", type: "url" },
    { key: "latestVersion", label: "Latest version", placeholder: "1.0.0" },
    { key: "releaseNotes", label: "Release notes", placeholder: "What's new" },
  ] },
  users: { intro: "User-account policy. Admin role assignment remains database protected.", fields: [
    { key: "signupEnabled", label: "Signup enabled", placeholder: "true" },
    { key: "emailConfirmation", label: "Email confirmation", placeholder: "true" },
  ] },
  security: { intro: "Security policy and audit preferences.", fields: [
    { key: "sessionHours", label: "Session duration (hours)", placeholder: "24", type: "number" },
    { key: "auditEnabled", label: "Audit logging", placeholder: "true" },
  ] },
  backup: { intro: "Backup policy metadata. Actual database backups remain a Supabase infrastructure responsibility.", fields: [
    { key: "schedule", label: "Backup schedule", placeholder: "Daily" },
    { key: "retentionDays", label: "Retention days", placeholder: "30", type: "number" },
  ] },
  health: { intro: "System health thresholds and operational notes.", fields: [
    { key: "latencyWarnMs", label: "Latency warning (ms)", placeholder: "800", type: "number" },
    { key: "healthEndpoint", label: "Health endpoint", placeholder: "/api/health" },
  ] },
  settings: { intro: "General website settings not covered by the visual layout editor.", fields: [
    { key: "supportEmail", label: "Support email", placeholder: "support@bttotek.in" },
    { key: "timezone", label: "Timezone", placeholder: "Asia/Kolkata" },
    { key: "currency", label: "Currency", placeholder: "INR" },
  ] },
  bbs: { intro: "BBS Pro-specific defaults and calculation presentation.", fields: [
    { key: "steelUnitWeightFormula", label: "Steel unit-weight formula", placeholder: "d²/162" },
    { key: "defaultCoverMm", label: "Default cover (mm)", placeholder: "40", type: "number" },
  ] },
  measurement: { intro: "Measurement tool defaults and unit presentation.", fields: [
    { key: "defaultUnit", label: "Default unit", placeholder: "m" },
    { key: "precision", label: "Decimal precision", placeholder: "2", type: "number" },
  ] },
  "live-sheet": { intro: "Live Sheet Builder defaults and export behavior.", fields: [
    { key: "autosave", label: "Autosave", placeholder: "true" },
    { key: "exportFormat", label: "Default export", placeholder: "xlsx" },
  ] },
};

function TemplateManager({ service }: { service: "pdf" | "excel" }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [mode, setMode] = useState<"free" | "paid">("free");
  return (
    <div className="space-y-5">
      <section className="surface-panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div><div className="text-[10px] font-bold uppercase tracking-wider text-accent">Downloads</div><h2 className="mt-1 font-display text-xl font-bold">{service === "pdf" ? "PDF Template Manager" : "Excel Template Manager"}</h2><p className="mt-1 text-sm text-muted-foreground">Manage this file type as a product: title, price and access mode.</p></div>
          <FileText className="size-5 text-muted-foreground" />
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="surface-panel space-y-4 p-5">
          <label className="grid gap-1"><span className={labelCls}>Template name</span><input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={service === "pdf" ? "BBS PDF Report" : "Quantity Estimate Excel"} /></label>
          <label className="grid gap-1"><span className={labelCls}>Access mode</span><select className={fieldCls} value={mode} onChange={(e) => setMode(e.target.value as "free" | "paid")}><option value="free">Free</option><option value="paid">Paid</option></select></label>
          <label className="grid gap-1"><span className={labelCls}>Price (₹)</span><input type="number" min="0" className={fieldCls} value={price} onChange={(e) => setPrice(e.target.value)} /></label>
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">Template catalog UI is ready. File upload/product storage should be connected to the protected storage bucket before publishing a paid product.</div>
        </div>
        <div className="surface-panel p-5"><h3 className="font-semibold">Service controls</h3><p className="mt-1 text-sm text-muted-foreground">Global PDF/Excel free-vs-paid rules are managed from Download Services.</p><div className="mt-4 rounded-lg bg-secondary/50 p-4 text-sm"><div>Selected mode: <strong>{mode}</strong></div><div className="mt-1">Price: <strong>₹{Number(price || 0).toFixed(2)}</strong></div><div className="mt-1">Template: <strong>{name || "Untitled"}</strong></div></div></div>
      </div>
    </div>
  );
}

function FullModuleEditor({ title, tabKey }: { title: string; tabKey: string }) {
  const definition = MODULE_FIELDS[tabKey] ?? { intro: `Configuration for ${title}.`, fields: [
    { key: "status", label: "Status", placeholder: "Active" },
    { key: "notes", label: "Admin notes", placeholder: `Notes for ${title}` },
  ] };
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const { data } = await supabase.from("site_settings").select("value").eq("key", `module_${tabKey}`).maybeSingle();
      const raw = data?.value && typeof data.value === "object" ? data.value as Record<string, unknown> : {};
      setConfig(Object.fromEntries(definition.fields.map((f) => [f.key, raw[f.key] == null ? "" : String(raw[f.key])] )));
      setLoading(false);
    })();
  }, [tabKey]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ key: `module_${tabKey}`, value: config, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error(`Save failed: ${error.message}`); else toast.success(`${title} settings saved.`);
  }

  if (loading) return <div className="surface-panel p-8 text-center text-sm text-muted-foreground"><Loader2 className="mr-2 inline size-4 animate-spin" />Loading {title} settings...</div>;

  return (
    <div className="space-y-5">
      <section className="surface-panel p-5"><div className="text-[10px] font-bold uppercase tracking-wider text-accent">{activeSectionFor(tabKey)}</div><h2 className="mt-1 font-display text-xl font-bold">{title} Workspace</h2><p className="mt-1 text-sm text-muted-foreground">{definition.intro}</p></section>
      <div className="surface-panel p-5"><div className="grid gap-4 sm:grid-cols-2">{definition.fields.map((f) => <label key={f.key} className="grid gap-1"><span className={labelCls}>{f.label}</span><input type={f.type ?? "text"} className={fieldCls} value={config[f.key] ?? ""} onChange={(e) => setConfig((c) => ({ ...c, [f.key]: e.target.value }))} placeholder={f.placeholder} /></label>)}</div><div className="mt-5 flex justify-end"><button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60">{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save {title}</button></div></div>
      <div className="grid gap-4 md:grid-cols-3"><div className="surface-panel p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Module</div><div className="mt-1 font-semibold">{title}</div></div><div className="surface-panel p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Storage</div><div className="mt-1 font-semibold">Admin settings</div></div><div className="surface-panel p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Access</div><div className="mt-1 font-semibold">Admin only</div></div></div>
    </div>
  );
}

function activeSectionFor(tabKey: string) {
  return ADMIN_NAV.find((x) => x.id === tabKey)?.section ?? "Module";
}

/* ============================================================
   WORDPRESS STYLE TOOLS / CALCULATORS
============================================================ */

function ToolsPanel() {
  const qc = useQueryClient();

  const [mode, setMode] = useState<"list" | "editor">("list");

  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [customTools, setCustomTools] = useState<ToolRecord[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [status, setStatus] = useState<ToolStatus>("Draft");
  const [featured, setFeatured] = useState(false);

  const [saving, setSaving] = useState(false);

  const [toolConfigs, setToolConfigs] = useState<
    Record<string, ToolConfig>
  >({});

  const loadCustomTools = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "admin_custom_tools")
      .maybeSingle();

    if (data?.value && Array.isArray(data.value)) {
      setCustomTools(data.value);
    } else {
      setCustomTools([]);
    }
  };

  const loadToolConfigs = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .like("key", "tool_cfg_%");

    const result: Record<string, ToolConfig> = {};

    (data || []).forEach((row: any) => {
      const slugKey = row.key.replace("tool_cfg_", "");
      result[slugKey] = row.value || {};
    });

    setToolConfigs(result);
  };

  useEffect(() => {
    void loadCustomTools();
    void loadToolConfigs();
  }, []);

  const categories = useMemo(() => {
    const values = [
      ...TOOLS.map((tool) => tool.category),
      ...customTools.map((tool) => tool.category),
    ];

    return ["All", ...Array.from(new Set(values))];
  }, [customTools]);

  const allTools: ToolRecord[] = useMemo(() => {
    const builtIn: ToolRecord[] = TOOLS.map((tool) => {
      const cfg = toolConfigs[tool.slug] || {};

      return {
        id: `builtin-${tool.slug}`,
        slug: tool.slug,
        name: cfg.customName || tool.name,
        category: cfg.category || tool.category,
        description: cfg.description || tool.description || "",
        longDescription:
          cfg.longDescription || cfg.description || tool.description || "",
        status:
          cfg.status === "Disabled"
            ? "Disabled"
            : cfg.status === "Draft"
              ? "Draft"
              : "Published",
        featured: Boolean(cfg.featured),
        custom: false,
      };
    });

    return [...builtIn, ...customTools];
  }, [customTools, toolConfigs]);

  const filteredTools = useMemo(() => {
    const query = search.toLowerCase().trim();

    return allTools.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.slug.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" || tool.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || tool.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allTools, search, categoryFilter, statusFilter]);

  function resetEditor() {
    setEditingSlug(null);
    setName("");
    setSlug("");
    setCategory("General");
    setDescription("");
    setLongDescription("");
    setStatus("Draft");
    setFeatured(false);
  }

  function newTool() {
    resetEditor();
    setMode("editor");
  }

  function editTool(tool: ToolRecord) {
    setEditingSlug(tool.slug);
    setName(tool.name);
    setSlug(tool.slug);
    setCategory(tool.category);
    setDescription(tool.description);
    setLongDescription(tool.longDescription);
    setStatus(tool.status);
    setFeatured(tool.featured);
    setMode("editor");
  }

  async function saveBuiltInTool() {
    if (!editingSlug) return;

    setSaving(true);

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: `tool_cfg_${editingSlug}`,
          value: {
            customName: name.trim(),
            status:
              status === "Published"
                ? "Active"
                : status === "Draft"
                  ? "Draft"
                  : "Disabled",
            description: description.trim(),
            longDescription: longDescription.trim(),
            featured,
            category,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Calculator updated successfully.");

    await loadToolConfigs();

    setMode("list");
  }

  async function saveCustomTool() {
    if (name.trim().length < 3) {
      toast.error("Calculator name is required.");
      return;
    }

    const finalSlug = slugify(slug || name);

    if (!finalSlug) {
      toast.error("Valid slug is required.");
      return;
    }

    setSaving(true);

    const record: ToolRecord = {
      id: editingSlug
        ? `custom-${editingSlug}`
        : `custom-${finalSlug}-${Date.now()}`,
      slug: finalSlug,
      name: name.trim(),
      category: category.trim() || "General",
      description: description.trim(),
      longDescription: longDescription.trim(),
      status,
      featured,
      custom: true,
    };

    let nextTools: ToolRecord[];

    if (editingSlug) {
      nextTools = customTools.map((tool) =>
        tool.slug === editingSlug ? record : tool,
      );
    } else {
      const duplicate = customTools.some(
        (tool) => tool.slug === finalSlug,
      );

      if (duplicate || TOOLS.some((tool) => tool.slug === finalSlug)) {
        setSaving(false);
        toast.error("This slug already exists.");
        return;
      }

      nextTools = [...customTools, record];
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: "admin_custom_tools",
          value: nextTools,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setCustomTools(nextTools);

    toast.success(
      editingSlug
        ? "Calculator updated successfully."
        : status === "Published"
          ? "Calculator published successfully."
          : "Calculator saved as draft.",
    );

    resetEditor();
    setMode("list");
  }

  async function saveTool() {
    if (!editingSlug) {
      await saveCustomTool();
      return;
    }

    const builtIn = TOOLS.some(
      (tool) => tool.slug === editingSlug,
    );

    if (builtIn) {
      await saveBuiltInTool();
    } else {
      await saveCustomTool();
    }
  }

  async function deleteTool(tool: ToolRecord) {
    if (!tool.custom) {
      toast.error(
        "Built-in calculator delete nahi kiya ja sakta. Use Disabled/Draft kar sakte ho.",
      );
      return;
    }

    if (!confirm(`Delete "${tool.name}" permanently?`)) return;

    const nextTools = customTools.filter(
      (item) => item.slug !== tool.slug,
    );

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: "admin_custom_tools",
          value: nextTools,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

    if (error) {
      toast.error(error.message);
      return;
    }

    setCustomTools(nextTools);

    toast.success("Calculator deleted.");
  }

  async function togglePublish(tool: ToolRecord) {
    const nextStatus: ToolStatus =
      tool.status === "Published" ? "Draft" : "Published";

    if (tool.custom) {
      const nextTools = customTools.map((item) =>
        item.slug === tool.slug
          ? {
              ...item,
              status: nextStatus,
            }
          : item,
      );

      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            key: "admin_custom_tools",
            value: nextTools,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" },
        );

      if (error) {
        toast.error(error.message);
        return;
      }

      setCustomTools(nextTools);
    } else {
      const existing = toolConfigs[tool.slug] || {};

      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            key: `tool_cfg_${tool.slug}`,
            value: {
              ...existing,
              customName: existing.customName || tool.name,
              status:
                nextStatus === "Published"
                  ? "Active"
                  : "Draft",
              description:
                existing.description || tool.description,
              longDescription:
                existing.longDescription || tool.longDescription,
              featured: existing.featured || false,
              category: existing.category || tool.category,
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" },
        );

      if (error) {
        toast.error(error.message);
        return;
      }

      await loadToolConfigs();
    }

    toast.success(
      nextStatus === "Published"
        ? "Calculator published."
        : "Calculator moved to draft.",
    );

    void qc.invalidateQueries();
  }

  if (mode === "editor") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              resetEditor();
              setMode("list");
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to Calculators
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetEditor}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              Reset
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={saveTool}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-6 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <Calculator className="size-6" />
              <div>
                <h2 className="font-display text-xl font-bold">
                  {editingSlug
                    ? "Edit Calculator"
                    : "Add New Calculator"}
                </h2>

                <p className="text-xs text-muted-foreground">
                  WordPress-style calculator editor
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <div className="space-y-5">
              <label className="grid gap-1">
                <span className={labelCls}>Calculator Name</span>

                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);

                    if (!editingSlug) {
                      setSlug(slugify(e.target.value));
                    }
                  }}
                  className={fieldCls}
                  placeholder="Steel Weight Calculator"
                />
              </label>

              <label className="grid gap-1">
                <span className={labelCls}>Slug</span>

                <input
                  value={slug}
                  onChange={(e) =>
                    setSlug(slugify(e.target.value))
                  }
                  className={fieldCls}
                  placeholder="steel-weight-calculator"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className={labelCls}>Category</span>

                  <input
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className={fieldCls}
                    placeholder="Construction"
                  />
                </label>

                <label className="grid gap-1">
                  <span className={labelCls}>Status</span>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ToolStatus)
                    }
                    className={fieldCls}
                  >
                    <option value="Published">
                      Published
                    </option>
                    <option value="Draft">Draft</option>
                    <option value="Disabled">
                      Disabled
                    </option>
                  </select>
                </label>
              </div>

              <RichTextEditor
                label="Short Description"
                value={description}
                onChange={setDescription}
                placeholder="Short calculator description..."
                minHeight={180}
              />

              <RichTextEditor
                label="Full Description / Content"
                value={longDescription}
                onChange={setLongDescription}
                placeholder="Write full calculator content..."
                minHeight={360}
              />
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className={labelCls}>Publish</div>

                <div className="mt-4">
                  <StatusBadge status={status} />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setStatus(
                      status === "Published"
                        ? "Draft"
                        : "Published",
                    )
                  }
                  className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
                >
                  {status === "Published"
                    ? "Move to Draft"
                    : "Publish Calculator"}
                </button>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) =>
                      setFeatured(e.target.checked)
                    }
                    className="size-4"
                  />

                  <div>
                    <div className="text-sm font-semibold">
                      Featured Calculator
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Show in featured tools
                    </div>
                  </div>
                </label>
              </div>

              <div className="rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground">
                  URL Preview
                </div>

                <div className="mt-2 break-all">
                  /tools/{slug || "calculator-slug"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Calculators
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage all calculators like WordPress posts.
          </p>
        </div>

        <button
          type="button"
          onClick={newTool}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          <Plus className="size-4" />
          Add New Calculator
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search calculators..."
              className={fieldCls + " pl-9"}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className={fieldCls}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className={fieldCls}
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden border-b border-border bg-muted/30 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_180px_120px_180px] md:gap-4">
          <div>Calculator</div>
          <div>Category</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="grid gap-3 p-4 md:grid-cols-[1fr_180px_120px_180px] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Calculator className="size-4 shrink-0 text-muted-foreground" />

                  <div className="truncate font-semibold">
                    {tool.name}
                  </div>

                  {tool.featured && (
                    <Star className="size-3.5 fill-current text-amber-500" />
                  )}

                  {tool.custom && (
                    <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">
                      CUSTOM
                    </span>
                  )}
                </div>

                <div className="mt-1 truncate text-xs text-muted-foreground">
                  /tools/{tool.slug}
                </div>

                <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {tool.description}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {tool.category}
              </div>

              <div>
                <StatusBadge status={tool.status} />
              </div>

              <div className="flex justify-start gap-1 md:justify-end">
                <button
                  type="button"
                  title="Publish / Draft"
                  onClick={() =>
                    void togglePublish(tool)
                  }
                  className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary"
                >
                  {tool.status === "Published" ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>

                <button
                  type="button"
                  title="Edit"
                  onClick={() => editTool(tool)}
                  className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary"
                >
                  <Edit className="size-4" />
                </button>

                <button
                  type="button"
                  title="Delete"
                  onClick={() =>
                    void deleteTool(tool)
                  }
                  className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}

          {!filteredTools.length && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No calculators found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   WORDPRESS STYLE POSTS / BLOG
============================================================ */


function ContentOverviewPanel({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const items = [
    { tab: "posts" as Tab, title: "Posts", icon: FileText, description: "Create, edit, schedule and publish articles.", metric: "Editorial workflow" },
    { tab: "pages" as Tab, title: "Pages", icon: LayoutList, description: "Manage website pages, visibility and SEO settings.", metric: "Website structure" },
    { tab: "faqs" as Tab, title: "FAQs", icon: FileQuestion, description: "Organize questions, answers, categories and ordering.", metric: "Knowledge base" },
    { tab: "reviews" as Tab, title: "Reviews", icon: Star, description: "Moderate ratings and publish trusted customer reviews.", metric: "Moderation queue" },
    { tab: "comments" as Tab, title: "Comments", icon: MessageSquareText, description: "Review, approve, hide or remove user comments.", metric: "Community moderation" },
    { tab: "leads" as Tab, title: "Leads", icon: UserRoundSearch, description: "Track enquiries, source, status, notes and follow-ups.", metric: "Sales pipeline" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-raised)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Content workspace</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Content Management</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Every content area has its own workflow. Use the dedicated workspace below instead of a generic editor.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
            <div className="font-semibold">6 dedicated modules</div>
            <div className="text-muted-foreground">Editorial, moderation and leads</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onNavigate(item.tab)}
              className="group rounded-2xl border border-border bg-card p-5 text-left shadow-[var(--shadow-raised)] transition hover:-translate-y-0.5 hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-accent">
                  <Icon className="size-5" />
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {item.metric}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              <div className="mt-5 text-sm font-semibold text-accent group-hover:underline">Open workspace →</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PostsPanel() {
  const qc = useQueryClient();

  const [mode, setMode] = useState<"list" | "editor">("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery<PostRecord[]>({
    queryKey: ["admin_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.body,
        body: post.body,
        published: post.published,
        featured_image: post.cover_url,
        category: post.category,
        tags: post.tags,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        created_at: post.created_at,
        updated_at: post.updated_at,
      }));
    },
  });

  const posts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return data || [];

    return (data || []).filter((post) => {
      const postTags = Array.isArray(post.tags)
        ? post.tags.join(" ")
        : post.tags || "";

      return (
        post.title?.toLowerCase().includes(query) ||
        post.slug?.toLowerCase().includes(query) ||
        post.category?.toLowerCase().includes(query) ||
        postTags.toLowerCase().includes(query)
      );
    });
  }, [data, search]);

  function resetEditor() {
    setEditId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setBody("");
    setFeaturedImage("");
    setCategory("General");
    setTags("");
    setSeoTitle("");
    setSeoDescription("");
    setPublished(true);
  }

  function newPost() {
    resetEditor();
    setMode("editor");
  }

  function editPost(post: PostRecord) {
    setEditId(post.id);
    setTitle(post.title || "");
    setSlug(post.slug || "");
    setExcerpt(post.excerpt || "");
    setBody(post.content || post.body || "");
    setFeaturedImage(post.featured_image || "");
    setCategory(post.category || "General");
    setTags(Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "");
    setSeoTitle(post.seo_title || "");
    setSeoDescription(post.seo_description || "");
    setPublished(post.published !== false);
    setMode("editor");
  }

  async function savePost(forcePublished?: boolean) {
    if (title.trim().length < 3) {
      toast.error("Post title required.");
      return;
    }

    const finalSlug = slugify(slug || title);
    if (!finalSlug) {
      toast.error("Valid slug required.");
      return;
    }

    setSaving(true);

    const isPublished = forcePublished ?? published;
    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      body: body.trim(),
      published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      cover_url: featuredImage.trim() || null,
      category: category.trim() || "General",
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const result = editId
      ? await supabase.from("blog_posts").update(payload).eq("id", editId)
      : await supabase.from("blog_posts").insert(payload);

    setSaving(false);

    if (result.error) {
      toast.error("Post save failed: " + result.error.message);
      return;
    }

    toast.success(
      editId
        ? "Post updated successfully."
        : isPublished
          ? "Post published successfully."
          : "Post saved as draft.",
    );

    resetEditor();
    setMode("list");
    void qc.invalidateQueries({ queryKey: ["admin_posts"] });
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this blog post permanently?")) return;

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Post deleted.");
    void qc.invalidateQueries({ queryKey: ["admin_posts"] });
  }

  async function togglePost(post: PostRecord) {
    const next = !post.published;
    const { error } = await supabase
      .from("blog_posts")
      .update({
        published: next,
        published_at: next ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(next ? "Post published." : "Post moved to draft.");
    void qc.invalidateQueries({ queryKey: ["admin_posts"] });
  }

  function duplicatePost(post: PostRecord) {
    resetEditor();
    setTitle(`${post.title} Copy`);
    setSlug(slugify(`${post.title}-copy`));
    setExcerpt(post.excerpt || "");
    setBody(post.content || post.body || "");
    setFeaturedImage(post.featured_image || "");
    setCategory(post.category || "General");
    setTags(Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "");
    setSeoTitle(post.seo_title || "");
    setSeoDescription(post.seo_description || "");
    setPublished(false);
    setMode("editor");
  }

  if (mode === "editor") {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              resetEditor();
              setMode("list");
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to Posts
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPublished(false)}
              className="rounded-md border border-border px-3 py-2 text-sm font-semibold"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void savePost(true)}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Publish
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editId) setSlug(slugify(e.target.value));
                }}
                placeholder="Add post title"
                className="w-full border-0 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/50 sm:text-3xl"
              />
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Permalink:</span>
                <span>/blog/{slug || "post-slug"}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <label className="grid gap-1">
                <span className={labelCls}>Post Content</span>
                <RichTextEditor
                  label="Post Content"
                  value={body}
                  onChange={setBody}
                  placeholder="Write your article here..."
                  minHeight={520}
                />
              </label>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">Excerpt</h3>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                placeholder="Short description / excerpt..."
                className={fieldCls + " mt-3"}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">SEO Settings</h3>
              <div className="mt-4 space-y-4">
                <label className="grid gap-1">
                  <span className={labelCls}>SEO Title</span>
                  <input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className={fieldCls}
                    placeholder="SEO optimized title"
                  />
                </label>
                <label className="grid gap-1">
                  <span className={labelCls}>SEO Description</span>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={4}
                    className={fieldCls}
                    placeholder="Meta description..."
                  />
                </label>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold">Publish</h3>
                <StatusBadge status={published ? "Published" : "Draft"} />
              </div>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void savePost()}
                  className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                >
                  {saving ? "Saving..." : published ? "Update Post" : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setPublished(!published)}
                  className="w-full rounded-md border border-border px-4 py-2 text-sm font-semibold"
                >
                  {published ? "Move to Draft" : "Publish Post"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">Post Settings</h3>
              <div className="mt-4 space-y-4">
                <label className="grid gap-1">
                  <span className={labelCls}>Slug</span>
                  <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className={fieldCls} />
                </label>
                <label className="grid gap-1">
                  <span className={labelCls}>Category</span>
                  <input value={category} onChange={(e) => setCategory(e.target.value)} className={fieldCls} placeholder="Construction" />
                </label>
                <label className="grid gap-1">
                  <span className={labelCls}>Tags</span>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} className={fieldCls} placeholder="steel, construction, calculator" />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">Featured Image</h3>
              <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className={fieldCls + " mt-3"} placeholder="https://..." />
              {featuredImage && (
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <img src={featuredImage} alt="" className="aspect-video w-full object-cover" />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">Preview</h3>
              <div className="mt-3 rounded-lg border border-border p-4">
                <div className="text-lg font-bold">{title || "Post Title"}</div>
                <div className="mt-2 text-xs text-muted-foreground">/blog/{slug || "post-slug"}</div>
                <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{excerpt || "Your post excerpt will appear here."}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Posts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your blog like WordPress.</p>
        </div>
        <button type="button" onClick={newPost} className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
          <Plus className="size-4" /> Add New Post
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className={fieldCls + " pl-9"} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden border-b border-border bg-muted/30 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_150px_120px_210px] md:gap-4">
          <div>Post</div><div>Category</div><div>Status</div><div className="text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground"><Loader2 className="mr-2 inline size-4 animate-spin" />Loading posts...</div>
        ) : posts.length ? (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <div key={post.id} className="grid gap-3 p-4 md:grid-cols-[1fr_150px_120px_210px] md:items-center md:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><FileText className="size-4 shrink-0 text-muted-foreground" /><div className="truncate font-semibold">{post.title}</div></div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">/blog/{post.slug}</div>
                  {post.excerpt && <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{post.excerpt}</div>}
                </div>
                <div className="text-xs text-muted-foreground">{post.category || "General"}</div>
                <div><StatusBadge status={post.published ? "Published" : "Draft"} /></div>
                <div className="flex justify-start gap-1 md:justify-end">
                  <button type="button" title="Publish / Draft" onClick={() => void togglePost(post)} className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary">{post.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                  <button type="button" title="Edit" onClick={() => editPost(post)} className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary"><Edit className="size-4" /></button>
                  <button type="button" title="Duplicate" onClick={() => duplicatePost(post)} className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary"><Copy className="size-4" /></button>
                  <button type="button" title="Delete" onClick={() => void deletePost(post.id)} className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground/40" />
            <div className="mt-3 font-semibold">No posts found</div>
            <p className="mt-1 text-sm text-muted-foreground">Create your first blog post.</p>
            <button type="button" onClick={newPost} className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Create Post</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */

function DashboardCount({ label, table }: { label: string; table: "profiles" | "blog_posts" | "leads" | "tool_reviews" | "blog_comments" }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard", table],
    queryFn: async () => {
      const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 30_000,
  });
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{isLoading ? "—" : data}</div>
      <div className="mt-2 text-[11px] text-muted-foreground">Live database count</div>
    </div>
  );
}

function AdminDashboard() {
  const qc = useQueryClient();
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Operations dashboard</div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">BTTOTEK Control Center</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              A command center for users, content, tools, downloads, revenue and website health. Each area is designed around the job it performs rather than a generic editor.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-background p-1">
              {(["7d", "30d", "90d"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRange(item)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    range === item ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {item === "7d" ? "7 days" : item === "30d" ? "30 days" : "90 days"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void qc.invalidateQueries({ queryKey: ["admin-dashboard"] })}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-secondary"
            >
              <RefreshCw className="size-3.5" /> Refresh
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-semibold">Business snapshot</h3>
            <p className="text-xs text-muted-foreground">The most important operational numbers.</p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{range}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCount label="Users" table="profiles" />
          <DashboardCount label="Blog Posts" table="blog_posts" />
          <DashboardCount label="Leads" table="leads" />
          <DashboardCount label="Reviews" table="tool_reviews" />
          <DashboardCount label="Comments" table="blog_comments" />
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Calculators</div><div className="mt-2 text-2xl font-bold tracking-tight">{TOOLS.length}</div><div className="mt-2 text-[11px] text-muted-foreground">Configured tools</div></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">PDF downloads</div><div className="mt-2 text-2xl font-bold tracking-tight">—</div><div className="mt-2 text-[11px] text-muted-foreground">Connects in Phase 2</div></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Revenue</div><div className="mt-2 text-2xl font-bold tracking-tight">₹—</div><div className="mt-2 text-[11px] text-muted-foreground">Connects in Phase 2</div></div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">Activity overview</h3>
              <p className="mt-1 text-xs text-muted-foreground">Visual space reserved for live users, tool usage and download trends.</p>
            </div>
            <span className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground">UI ready</span>
          </div>
          <div className="mt-6 grid h-48 grid-cols-12 items-end gap-2">
            {[34, 48, 42, 61, 55, 72, 64, 78, 58, 83, 70, 88].map((height, index) => (
              <div key={index} className="flex h-full items-end">
                <div className="w-full rounded-t-md bg-accent/20" style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 text-[10px] text-muted-foreground"><span>Users</span><span className="text-center">Tool usage</span><span className="text-right">Downloads</span></div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h3 className="font-semibold">System status</h3><p className="mt-1 text-xs text-muted-foreground">High-level health at a glance.</p></div><CheckCircle2 className="size-5 text-emerald-500" /></div>
          <div className="mt-5 space-y-3">
            {[
              ["Authentication", "Protected"],
              ["Database", "Connected"],
              ["Storage", "Ready"],
              ["Admin RLS", "Required"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5"><span className="text-xs font-medium">{label}</span><span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" />{value}</span></div>
            ))}
          </div>
          <button type="button" onClick={() => setRange("90d")} className="mt-4 w-full rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary">Open System Health</button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-amber-500" /><h3 className="font-semibold">Attention needed</h3></div>
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li className="rounded-lg bg-amber-500/5 px-3 py-2">Review pending moderation items.</li>
            <li className="rounded-lg bg-amber-500/5 px-3 py-2">Configure PDF/Excel download rules.</li>
            <li className="rounded-lg bg-amber-500/5 px-3 py-2">Connect analytics and revenue data in Phase 2.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Quick actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[["Create Post", "posts"], ["Manage Tools", "tools"], ["Downloads", "downloads"], ["Appearance", "appearance"]].map(([label]) => (
              <button key={label} type="button" className="rounded-lg border border-border px-3 py-2.5 text-left text-xs font-semibold hover:bg-secondary">{label}</button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Admin security</h3>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">The UI never grants admin access by itself. Phase 2 will enforce the same permissions at Supabase RLS/database level.</p>
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] font-medium text-emerald-700">Admin-only controls stay isolated from normal users.</div>
        </div>
      </section>
    </div>
  );
}


/* ============================================================
   USERS & ROLES — DEDICATED UI
   Phase 1: presentation/workflow only. Backend/RLS connects in Phase 2.
============================================================ */

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  provider: "Email" | "Google";
  role: "User" | "Editor" | "Admin" | "Super Admin";
  status: "Active" | "Disabled";
  joined: string;
  lastActive: string;
  downloads: number;
};

const DEMO_ADMIN_USERS: AdminUserRow[] = [
  {
    id: "USR-001",
    name: "Demo User",
    email: "user@example.com",
    provider: "Google",
    role: "User",
    status: "Active",
    joined: "20 Aug 2026",
    lastActive: "Today",
    downloads: 12,
  },
  {
    id: "USR-002",
    name: "Content Editor",
    email: "editor@example.com",
    provider: "Email",
    role: "Editor",
    status: "Active",
    joined: "18 Aug 2026",
    lastActive: "Today",
    downloads: 4,
  },
];

function UsersPanel() {
  const [section, setSection] = useState<"users" | "roles" | "activity">("users");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "Active" | "Disabled">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRow["role"]>("all");
  const [selected, setSelected] = useState<AdminUserRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_ADMIN_USERS.filter((user) => {
      const matchesQuery =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q);
      const matchesStatus = status === "all" || user.status === status;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [query, status, roleFilter]);

  const roles = [
    {
      name: "Super Admin",
      description: "Full control including security, roles, settings and system operations.",
      color: "bg-destructive/10 text-destructive",
      permissions: "Everything",
    },
    {
      name: "Admin",
      description: "Manage users, content, tools, downloads, SEO and analytics.",
      color: "bg-accent/10 text-accent",
      permissions: "Most modules",
    },
    {
      name: "Editor",
      description: "Manage posts, pages, FAQs, media and reviews without security access.",
      color: "bg-secondary text-foreground",
      permissions: "Content",
    },
    {
      name: "User",
      description: "Normal website account. Never receives Admin Console access.",
      color: "bg-muted text-muted-foreground",
      permissions: "Website only",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Security workspace</div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">Users & Roles</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage website accounts and administrator permissions from a dedicated security interface.
              Database authorization and RLS will be connected in Phase 2.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs">
            <div className="font-semibold text-emerald-700">Admin boundary</div>
            <div className="mt-1 text-muted-foreground">Normal users cannot access this console.</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total users", "—", "Connects to profiles"],
            ["Active users", "—", "Current status"],
            ["Admins", "—", "Admin + Super Admin"],
            ["Disabled", "—", "Access blocked"],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-xl border border-border bg-background p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
              <div className="mt-2 text-2xl font-bold">{value}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{note}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          ["users", "All Users"],
          ["roles", "Roles & Permissions"],
          ["activity", "User Activity"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSection(value as typeof section)}
            className={
              section === value
                ? "rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background"
                : "rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {section === "users" && (
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-semibold">User directory</h3>
              <p className="mt-1 text-xs text-muted-foreground">Search, filter and inspect account details.</p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("User creation will be connected in Phase 2.")}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground"
            >
              + Add user
            </button>
          </div>

          <div className="grid gap-2 border-b border-border p-4 md:grid-cols-[1fr_auto_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or user ID…"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All roles</option>
              <option>User</option>
              <option>Editor</option>
              <option>Admin</option>
              <option>Super Admin</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Login</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Last active</th>
                  <th className="px-4 py-3">Downloads</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/70 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-4">
                      <div className="font-medium">{user.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{user.email}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{user.id}</div>
                    </td>
                    <td className="px-4 py-4 text-xs">{user.provider}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold">{user.role}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700">{user.status}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{user.joined}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{user.lastActive}</td>
                    <td className="px-4 py-4 font-semibold">{user.downloads}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(user)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No users match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {section === "roles" && (
        <section className="grid gap-4 lg:grid-cols-2">
          {roles.map((role) => (
            <div key={role.name} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${role.color}`}>{role.name}</span>
                  <h3 className="mt-4 font-semibold">{role.permissions}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("Role permissions will be connected in Phase 2.")}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                >
                  Configure
                </button>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {["Dashboard", "Content", "Tools", "Downloads", "SEO", "Analytics", "Security", "Settings"].map((permission) => (
                  <div key={permission} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs">
                    <span>{permission}</span>
                    <span className={role.name === "User" && permission !== "Dashboard" ? "text-muted-foreground" : "font-semibold text-emerald-600"}>
                      {role.name === "User" && permission !== "Dashboard" ? "No" : "Yes"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {section === "activity" && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h3 className="font-semibold">User activity</h3>
            <p className="mt-1 text-xs text-muted-foreground">Login, download, profile and account events will appear here after backend connection.</p>
          </div>
          <div className="mt-5 space-y-2">
            {[
              ["Today", "User signed in with Google", "Authentication"],
              ["Today", "PDF download requested", "Downloads"],
              ["Yesterday", "Profile created", "Users"],
            ].map(([time, event, source]) => (
              <div key={`${time}-${event}`} className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium">{event}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{source}</div>
                </div>
                <span className="text-xs text-muted-foreground">{time}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">User detail</div>
                <h3 className="mt-1 text-xl font-bold">{selected.name}</h3>
                <p className="text-sm text-muted-foreground">{selected.email}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-muted" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["User ID", selected.id],
                ["Login", selected.provider],
                ["Role", selected.role],
                ["Status", selected.status],
                ["Joined", selected.joined],
                ["Downloads", String(selected.downloads)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
                  <div className="mt-1 text-sm font-semibold">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => toast.info("Status changes connect in Phase 2.")} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">
                Disable / Enable
              </button>
              <button type="button" onClick={() => toast.info("Role changes connect in Phase 2.")} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">
                Change role
              </button>
              <button type="button" onClick={() => toast.info("User deletion connects in Phase 2.")} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">
                Delete user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ADMIN CONSOLE
============================================================ */

export function AdminConsole() {
  const [tab, setTab] =
    useState<Tab>("dashboard");

  const [open, setOpen] = useState(true);

  const active = ADMIN_NAV.find(
    (item) => item.id === tab,
  );

  const sections = [
    ...new Set(
      ADMIN_NAV.map((item) => item.section),
    ),
  ];

  function renderPanel() {
    switch (tab) {
      case "dashboard":
        return <AdminDashboard />;

      case "content":
        return <ContentOverviewPanel onNavigate={setTab} />;

      case "posts":
        return <PostsPanel />;

      case "tools":
        return <ToolsPanel />;

      case "pages":
        return <PagesPanel />;

      case "faqs":
        return <FaqsPanel />;

      case "leads":
        return <LeadsPanel />;

      case "reviews":
        return <ReviewsPanel />;

      case "comments":
        return <CommentsPanel />;

      case "media":
        return <MediaPanel />;

      case "appearance":
      case "social":
        return <LayoutPanel />;

      case "downloads":
        return <AdminDownloadControls />;

      case "users":
        return <UsersPanel />;

      case "excel":
        return <TemplateManager service="excel" />;

      case "pdf":
        return <TemplateManager service="pdf" />;

      case "cms":
        return <AdminCmsSettingsPanel />;

      default:
        return (
          <FullModuleEditor
            title={active?.label ?? "Module"}
            tabKey={tab}
          />
        );
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside
          className={
            (open ? "w-72" : "w-16") +
            " shrink-0 border-r border-border bg-card transition-all duration-200"
          }
        >
          <div className="sticky top-0 flex max-h-[calc(100vh-4rem)] flex-col">
            <div className="flex items-center justify-between border-b border-border p-3">
              {open && (
                <div>
                  <div className="font-display font-bold">
                    BTTOTEK
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    Master Admin
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setOpen((value) => !value)
                }
                className="rounded-md border border-border px-2 py-1 text-xs"
              >
                {open ? "←" : "→"}
              </button>
            </div>

            <nav className="overflow-y-auto p-2">
              {sections.map((section) => (
                <div
                  key={section}
                  className="mb-3"
                >
                  {open && (
                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {section}
                    </div>
                  )}

                  <div className="grid gap-0.5">
                    {ADMIN_NAV.filter(
                      (item) =>
                        item.section === section,
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setTab(item.id)
                        }
                        title={item.label}
                        className={
                          (tab === item.id
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground") +
                          " rounded-md px-2.5 py-2 text-left text-sm transition-colors"
                        }
                      >
                        {open
                          ? item.label
                          : item.label.slice(0, 1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {active?.section}
                </div>

                <h1 className="font-display text-2xl font-bold">
                  {active?.label}
                </h1>
              </div>

              <div className="text-xs text-muted-foreground">
                Production target: bttotek.in/admin
              </div>
            </div>

            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   MEDIA LIBRARY / SITE-ASSETS
============================================================ */

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif", "svg", "ico"];

function getFileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() || "";
}

function MediaPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("media");

  async function loadMedia() {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from("site-assets")
      .list(folder, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      toast.error("Media load failed: " + error.message);
      setItems([]);
    } else {
      setItems((data || []).filter((item) => item.id));
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadMedia();
  }, [folder]);

  async function uploadMedia(file: File) {
    const ext = getFileExtension(file.name);
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      toast.error("Sirf PNG, JPG, JPEG, WEBP, GIF, SVG ya ICO image upload karein.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size 5 MB se kam honi chahiye.");
      return;
    }

    setUploading(true);
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-");
    const path = `${folder}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from("site-assets")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    setUploading(false);

    if (error) {
      toast.error("Upload failed: " + error.message);
      return;
    }

    toast.success("Image uploaded successfully.");
    await loadMedia();
  }

  async function deleteMedia(name: string) {
    if (!confirm(`Delete "${name}"?`)) return;

    const path = `${folder}/${name}`;
    const { error } = await supabase.storage
      .from("site-assets")
      .remove([path]);

    if (error) {
      toast.error("Delete failed: " + error.message);
      return;
    }

    toast.success("Image deleted.");
    await loadMedia();
  }

  function publicUrl(name: string) {
    return supabase.storage
      .from("site-assets")
      .getPublicUrl(`${folder}/${name}`).data.publicUrl;
  }

  async function copyUrl(name: string) {
    const url = publicUrl(name);
    await navigator.clipboard.writeText(url);
    toast.success("Image URL copied.");
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">Media Library</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              site-assets bucket se images upload, preview, copy aur delete karein.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadMedia()}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-secondary"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className={fieldCls + " max-w-xs"}
          >
            <option value="media">media</option>
            <option value="branding">branding</option>
          </select>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90">
            <Upload className="size-4" />
            {uploading ? "Uploading..." : "Upload Image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/x-icon"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.currentTarget.value = "";
                if (file) void uploadMedia(file);
              }}
            />
          </label>
        </div>
      </section>

      <section className="surface-panel p-5">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 inline size-4 animate-spin" />
            Loading media...
          </div>
        ) : !items.length ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <ImageIcon className="mx-auto size-10 text-muted-foreground/50" />
            <div className="mt-3 font-semibold">No images found</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Is folder mein abhi koi image nahi hai.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id || item.name} className="overflow-hidden rounded-lg border border-border bg-background">
                <div className="aspect-square bg-secondary/30 p-3">
                  <img
                    src={publicUrl(item.name)}
                    alt={item.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-semibold" title={item.name}>
                    {item.name}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void copyUrl(item.name)}
                      className="flex-1 rounded-md border border-border px-2 py-1.5 text-xs font-semibold hover:bg-secondary"
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteMedia(item.name)}
                      className="rounded-md border border-border px-2 py-1.5 text-xs font-semibold text-destructive hover:bg-secondary"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   LAYOUT PANEL
============================================================ */

function LayoutPanel() {
  const { settings, save } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [section, setSection] = useState<"branding" | "navigation" | "social" | "footer" | "apps">("branding");
  useEffect(() => setDraft(settings), [settings]);

  const patch = (fn: (d: SiteSettings) => SiteSettings) => setDraft(d => fn({ ...d, nav: d.nav.map(x => ({ ...x })), socialLinks: d.socialLinks.map(x => ({ ...x })), footerSections: d.footerSections.map(x => ({ ...x, links: x.links.map(l => ({ ...l })) })), storeButtons: d.storeButtons.map(x => ({ ...x })) }));
  const move = <T extends { order?: number }>(items: T[], index: number, direction: -1 | 1) => {
    const next = [...items].sort((a,b)=>a.order-b.order); const target = index + direction;
    if (target < 0 || target >= next.length) return next;
    [next[index], next[target]] = [next[target], next[index]];
    return next.map((x,i)=>({ ...x, order:i }));
  };
  const saveAll = () => { save(draft); toast.success("Appearance settings saved"); };

  const tabs = [
    ["branding", "Branding"], ["navigation", "Navigation"], ["social", "Social Media"], ["footer", "Footer"], ["apps", "Store Buttons"],
  ] as const;

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-5">
      {tabs.map(([id,label]) => <button key={id} type="button" onClick={()=>setSection(id)} className={cn("rounded-xl border p-3 text-left transition", section===id ? "border-accent bg-accent/10" : "border-border bg-card hover:bg-secondary")}><div className="text-xs font-bold">{label}</div><div className="mt-1 text-[10px] text-muted-foreground">Manage {label.toLowerCase()}</div></button>)}
    </div>

    {section === "branding" && <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <section className="surface-panel p-5"><div className="text-[10px] font-bold uppercase tracking-wider text-accent">Website Identity</div><h2 className="mt-1 font-display text-xl font-bold">Branding & Theme</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1"><span className={labelCls}>Website name</span><input className={fieldCls} value={draft.siteName} onChange={e=>setDraft(d=>({...d,siteName:e.target.value}))}/></label>
          <label className="grid gap-1"><span className={labelCls}>Logo URL</span><input className={fieldCls} value={draft.logoUrl} onChange={e=>setDraft(d=>({...d,logoUrl:e.target.value}))}/></label>
          <label className="grid gap-1"><span className={labelCls}>Favicon URL</span><input className={fieldCls} value={draft.faviconUrl || ""} onChange={e=>setDraft(d=>({...d,faviconUrl:e.target.value}))}/></label>
          <label className="grid gap-1"><span className={labelCls}>Steel rate ₹/kg</span><input type="number" className={fieldCls} value={draft.steelRate} onChange={e=>setDraft(d=>({...d,steelRate:Number(e.target.value)}))}/></label>
        </div>
      </section>
      <section className="surface-panel p-5"><div className="text-sm font-semibold">Live preview</div><div className="mt-4 rounded-xl border border-border bg-background p-4"><div className="flex items-center gap-3"><img src={draft.logoUrl || "/logo.png"} className="size-10 rounded-md border object-contain"/><div><div className="font-bold">{draft.siteName}</div><div className="text-xs text-muted-foreground">Header branding preview</div></div></div><div className="mt-4 rounded-lg bg-secondary p-3 text-xs">Footer: {draft.footerText}</div></div></section>
    </div>}

    {section === "navigation" && <section className="surface-panel p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-wider text-accent">Header</div><h2 className="mt-1 font-display text-xl font-bold">Navigation Manager</h2><p className="mt-1 text-sm text-muted-foreground">Add, hide, reorder or remove public navigation links.</p></div><Plus className="size-5 text-muted-foreground"/></div>
      <div className="mt-5 space-y-2">{[...draft.nav].sort((a,b)=>(a.order??0)-(b.order??0)).map((n,i)=><div key={`${n.label}-${i}`} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1.4fr_auto_auto_auto_auto] sm:items-center"><input className={fieldCls} value={n.label} onChange={e=>patch(d=>({...d,nav:d.nav.map((x,j)=>j===i?{...x,label:e.target.value}:x)}))}/><input className={fieldCls} value={n.to} onChange={e=>patch(d=>({...d,nav:d.nav.map((x,j)=>j===i?{...x,to:e.target.value}:x)}))}/><button type="button" onClick={()=>patch(d=>({...d,nav:d.nav.map((x,j)=>j===i?{...x,enabled:x.enabled===false}:x)}))} className="rounded-md border px-3 py-2 text-xs">{n.enabled===false?<EyeOff/>:<Eye/>}</button><button type="button" onClick={()=>patch(d=>({...d,nav:move(d.nav,i,-1)}))} className="rounded-md border px-3 py-2 text-xs">↑</button><button type="button" onClick={()=>patch(d=>({...d,nav:move(d.nav,i,1)}))} className="rounded-md border px-3 py-2 text-xs">↓</button><button type="button" onClick={()=>patch(d=>({...d,nav:d.nav.filter((_,j)=>j!==i)}))} className="rounded-md border px-3 py-2 text-xs text-destructive"><Trash2/></button></div>)}</div>
      <button type="button" onClick={()=>patch(d=>({...d,nav:[...d.nav,{label:"New Link",to:"/",enabled:true,order:d.nav.length}]}))} className="mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"><Plus/> Add navigation link</button>
    </section>}

    {section === "social" && <section className="surface-panel p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-wider text-accent">Footer & Sharing</div><h2 className="mt-1 font-display text-xl font-bold">Social Media Manager</h2><p className="mt-1 text-sm text-muted-foreground">Each social button is independent: URL, show/hide, order and delete.</p></div><MessageCircle className="size-5 text-muted-foreground"/></div>
      <div className="mt-5 space-y-3">{[...draft.socialLinks].sort((a,b)=>a.order-b.order).map((x,i)=><div key={x.id} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[140px_1fr_auto_auto_auto_auto] sm:items-center"><input className={fieldCls} value={x.label} onChange={e=>patch(d=>({...d,socialLinks:d.socialLinks.map(v=>v.id===x.id?{...v,label:e.target.value}:v)}))}/><input className={fieldCls} value={x.url} placeholder="https://..." onChange={e=>patch(d=>({...d,socialLinks:d.socialLinks.map(v=>v.id===x.id?{...v,url:e.target.value}:v)}))}/><button type="button" onClick={()=>patch(d=>({...d,socialLinks:d.socialLinks.map(v=>v.id===x.id?{...v,enabled:!v.enabled}:v)}))} className="rounded-md border px-3 py-2 text-xs">{x.enabled?<Eye/>:<EyeOff/>}</button><button type="button" onClick={()=>patch(d=>({...d,socialLinks:move(d.socialLinks,i,-1)}))} className="rounded-md border px-3 py-2">↑</button><button type="button" onClick={()=>patch(d=>({...d,socialLinks:move(d.socialLinks,i,1)}))} className="rounded-md border px-3 py-2">↓</button><button type="button" onClick={()=>patch(d=>({...d,socialLinks:d.socialLinks.filter(v=>v.id!==x.id)}))} className="rounded-md border px-3 py-2 text-destructive"><Trash2/></button></div>)}</div>
      <button type="button" onClick={()=>patch(d=>({...d,socialLinks:[...d.socialLinks,{id:`social-${Date.now()}`,label:"New Social",url:"",enabled:true,order:d.socialLinks.length}]}))} className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"><Plus/> Add social platform</button>
    </section>}

    {section === "footer" && <section className="surface-panel p-5"><div><div className="text-[10px] font-bold uppercase tracking-wider text-accent">Footer Builder</div><h2 className="mt-1 font-display text-xl font-bold">Footer Sections & Links</h2><p className="mt-1 text-sm text-muted-foreground">Manage sections, links, visibility and order without editing code.</p></div>
      <div className="mt-5 space-y-4">{[...draft.footerSections].sort((a,b)=>a.order-b.order).map(sectionData=><div key={sectionData.id} className="rounded-xl border border-border p-4"><div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"><input className={fieldCls} value={sectionData.title} onChange={e=>patch(d=>({...d,footerSections:d.footerSections.map(v=>v.id===sectionData.id?{...v,title:e.target.value}:v)}))}/><button type="button" onClick={()=>patch(d=>({...d,footerSections:d.footerSections.map(v=>v.id===sectionData.id?{...v,enabled:!v.enabled}:v)}))} className="rounded-md border px-3 py-2 text-xs">{sectionData.enabled?<Eye/>:<EyeOff/>}</button><button type="button" onClick={()=>patch(d=>({...d,footerSections:d.footerSections.filter(v=>v.id!==sectionData.id)}))} className="rounded-md border px-3 py-2 text-destructive"><Trash2/></button></div><div className="mt-3 space-y-2">{sectionData.links.map(link=><div key={link.id} className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto_auto] sm:items-center"><input className={fieldCls} value={link.label} onChange={e=>patch(d=>({...d,footerSections:d.footerSections.map(v=>v.id===sectionData.id?{...v,links:v.links.map(l=>l.id===link.id?{...l,label:e.target.value}:l)}:v)}))}/><input className={fieldCls} value={link.to} onChange={e=>patch(d=>({...d,footerSections:d.footerSections.map(v=>v.id===sectionData.id?{...v,links:v.links.map(l=>l.id===link.id?{...l,to:e.target.value}:l)}:v)}))}/><button type="button" onClick={()=>patch(d=>({...d,footerSections:d.footerSections.map(v=>v.id===sectionData.id?{...v,links:v.links.map(l=>l.id===link.id?{...l,enabled:!l.enabled}:l)}:v)}))} className="rounded-md border px-3 py-2">{link.enabled?<Eye/>:<EyeOff/>}</button><button type="button" onClick={()=>patch(d=>({...d,footerSections:d.footerSections.map(v=>v.id===sectionData.id?{...v,links:v.links.filter(l=>l.id!==link.id)}:v)}))} className="rounded-md border px-3 py-2 text-destructive"><Trash2/></button></div>)}</div><button type="button" onClick={()=>patch(d=>({...d,footerSections:d.footerSections.map(v=>v.id===sectionData.id?{...v,links:[...v.links,{id:`link-${Date.now()}`,label:"New Link",to:"/",enabled:true,order:v.links.length}]}:v)}))} className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"><Plus/> Add footer link</button></div>)}</div>
      <label className="mt-4 grid gap-1"><span className={labelCls}>Copyright / footer text</span><input className={fieldCls} value={draft.footerText} onChange={e=>setDraft(d=>({...d,footerText:e.target.value}))}/></label>
      <button type="button" onClick={()=>patch(d=>({...d,footerSections:[...d.footerSections,{id:`section-${Date.now()}`,title:"New Section",enabled:true,order:d.footerSections.length,links:[]}]}))} className="mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold"><Plus/> Add footer section</button>
    </section>}

    {section === "apps" && <section className="surface-panel p-5"><div className="text-[10px] font-bold uppercase tracking-wider text-accent">Footer App Buttons</div><h2 className="mt-1 font-display text-xl font-bold">App Store Manager</h2><p className="mt-1 text-sm text-muted-foreground">Google Play and future store badges can be independently enabled or removed.</p><div className="mt-5 space-y-3">{[...draft.storeButtons].sort((a,b)=>a.order-b.order).map((x,i)=><div key={x.id} className="grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-[150px_1fr_auto_auto] sm:items-center"><select className={fieldCls} value={x.kind} onChange={e=>patch(d=>({...d,storeButtons:d.storeButtons.map(v=>v.id===x.id?{...v,kind:e.target.value as any}:v)}))}><option value="google-play">Google Play</option><option value="apple-store">Apple App Store</option><option value="custom">Custom Store</option></select><input className={fieldCls} value={x.url} placeholder="Store URL" onChange={e=>patch(d=>({...d,storeButtons:d.storeButtons.map(v=>v.id===x.id?{...v,url:e.target.value}:v)}))}/><button type="button" onClick={()=>patch(d=>({...d,storeButtons:d.storeButtons.map(v=>v.id===x.id?{...v,enabled:!v.enabled}:v)}))} className="rounded-md border px-3 py-2">{x.enabled?<Eye/>:<EyeOff/>}</button><button type="button" onClick={()=>patch(d=>({...d,storeButtons:d.storeButtons.filter(v=>v.id!==x.id)}))} className="rounded-md border px-3 py-2 text-destructive"><Trash2/></button></div>)}</div><button type="button" onClick={()=>patch(d=>({...d,storeButtons:[...d.storeButtons,{id:`store-${Date.now()}`,kind:"custom",label:"App Store",url:"",enabled:true,order:d.storeButtons.length}]}))} className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"><Plus/> Add store button</button></section>}

    <div className="sticky bottom-3 z-10 flex justify-end"><button type="button" onClick={saveAll} className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-lg"><Save/> Save Appearance Changes</button></div>
  </div>;
}

/* ============================================================
   PAGES
============================================================ */

function PagesPanel() {
  const qc = useQueryClient();

  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin_pages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      return data || [];
    },
  });

  async function createPage() {
    if (title.trim().length < 3) {
      toast.error("Page title required");
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slugify(title),
      content: content.trim(),
    };

    const result = editId
      ? await supabase.from("pages").update(payload).eq("id", editId)
      : await supabase.from("pages").insert(payload);

    const { error } = result;

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editId ? "Page updated!" : "Page created!");

    setEditId(null);
    setTitle("");
    setContent("");

    void qc.invalidateQueries({
      queryKey: ["admin_pages"],
    });
  }

  function editPage(page: any) {
    setEditId(page.id);
    setTitle(page.title || "");
    setContent(page.content || page.body || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!confirm("Delete page?")) return;

    const { error } = await supabase
      .from("pages")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Page deleted!");

    void qc.invalidateQueries({
      queryKey: ["admin_pages"],
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">
          New Page
        </h2>

        <div className="mt-4 grid gap-3">
          <Input
            label="Page Title"
            value={title}
            onChange={setTitle}
          />

          <RichTextEditor
            label="Page Content"
            value={content}
            onChange={setContent}
            placeholder="Write page content..."
            minHeight={420}
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={createPage}
              className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              {editId ? "Update Page" : "Create Page"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setTitle(""); setContent(""); }}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <Table
        loading={isLoading}
        empty="No pages found."
        rows={(data ?? []).map(
          (p: any) => ({
            id: p.id,
            primary: p.title,
            secondary: `/${p.slug}`,
            actions: (
              <div className="flex items-center gap-2">
                <IconEdit onClick={() => editPage(p)} />
                <IconDelete onClick={() => remove(p.id)} />
              </div>
            ),
          }),
        )}
      />
    </div>
  );
}

/* ============================================================
   FAQ
============================================================ */

function FaqsPanel() {
  const qc = useQueryClient();

  const [editId, setEditId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin_faqs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("faqs")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      return data || [];
    },
  });

  async function createFaq() {
    if (
      q.trim().length < 4 ||
      a.trim().length < 4
    ) {
      toast.error(
        "Question and answer required",
      );
      return;
    }

    const payload = {
      question: q.trim(),
      answer: a.trim(),
    };

    const result = editId
      ? await supabase.from("faqs").update(payload).eq("id", editId)
      : await supabase.from("faqs").insert(payload);

    const { error } = result;

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editId ? "FAQ updated!" : "FAQ added!");

    setEditId(null);
    setQ("");
    setA("");

    void qc.invalidateQueries({
      queryKey: ["admin_faqs"],
    });
  }

  function editFaq(faq: any) {
    setEditId(faq.id);
    setQ(faq.question || "");
    setA(faq.answer || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    const { error } = await supabase
      .from("faqs")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("FAQ deleted!");

    void qc.invalidateQueries({
      queryKey: ["admin_faqs"],
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">
          Add FAQ
        </h2>

        <div className="mt-4 grid gap-3">
          <Input
            label="Question"
            value={q}
            onChange={setQ}
          />

          <RichTextEditor
            label="Answer"
            value={a}
            onChange={setA}
            placeholder="Write the FAQ answer..."
            minHeight={260}
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={createFaq}
              className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              {editId ? "Update FAQ" : "Add FAQ"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setQ(""); setA(""); }}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <Table
        loading={isLoading}
        empty="No FAQs found."
        rows={(data ?? []).map(
          (f: any) => ({
            id: f.id,
            primary: f.question,
            secondary: f.answer,
            actions: (
              <div className="flex items-center gap-2">
                <IconEdit onClick={() => editFaq(f)} />
                <IconDelete onClick={() => remove(f.id)} />
              </div>
            ),
          }),
        )}
      />
    </div>
  );
}

/* ============================================================
   LEADS
============================================================ */

function LeadsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      return data || [];
    },
  });

  return (
    <Table
      loading={isLoading}
      empty="No customer enquiries."
      rows={(data ?? []).map(
        (l: any) => ({
          id: l.id,
          primary: `${l.name} (${l.email})`,
          secondary: l.message,
          actions: null,
        }),
      )}
    />
  );
}

/* ============================================================
   INPUT / TABLE
============================================================ */

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={
          "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        }
      />
    </label>
  );
}

function IconEdit({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Edit"
      className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      <Edit className="size-4" />
    </button>
  );
}

function IconDelete({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

function Table({
  loading,
  empty,
  rows,
}: {
  loading: boolean;
  empty: string;
  rows: {
    id: string;
    primary: string;
    secondary: string;
    actions: React.ReactNode;
  }[];
}) {
  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        <Loader2 className="mr-2 inline size-4 animate-spin" />
        Loading database data...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }

  return (
    <ul className="grid gap-2">
      {rows.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <div className="font-medium">
              {r.primary}
            </div>

            <div className="truncate text-xs text-muted-foreground">
              {r.secondary}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {r.actions}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================
   PLACEHOLDER PANELS
============================================================ */

function ReviewsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin_reviews"], queryFn: async () => {
    const { data, error } = await supabase.from("tool_reviews").select("id,tool_slug,author_name,rating,body,approved,created_at").order("created_at", { ascending: false });
    if (error) throw error; return data ?? [];
  }});
  async function toggle(row: any) { const { error } = await supabase.from("tool_reviews").update({ approved: !row.approved }).eq("id", row.id); if (error) toast.error(error.message); else { toast.success(row.approved ? "Review hidden" : "Review approved"); void qc.invalidateQueries({ queryKey: ["admin_reviews"] }); } }
  async function remove(row: any) { if (!window.confirm("Delete this review?")) return; const { error } = await supabase.from("tool_reviews").delete().eq("id", row.id); if (error) toast.error(error.message); else void qc.invalidateQueries({ queryKey: ["admin_reviews"] }); }
  return <div className="space-y-5"><section className="surface-panel p-5"><h2 className="font-display text-xl font-bold">Review Moderation</h2><p className="mt-1 text-sm text-muted-foreground">Approve, hide or delete tool reviews before they appear publicly.</p></section><div className="surface-panel overflow-hidden">{isLoading ? <div className="p-8 text-center text-sm text-muted-foreground">Loading reviews...</div> : !data?.length ? <div className="p-8 text-center text-sm text-muted-foreground">No reviews yet.</div> : <div className="divide-y divide-border">{data.map((r: any) => <div key={r.id} className="grid gap-3 p-4 md:grid-cols-[1fr_120px_110px_auto] md:items-center"><div><div className="font-semibold">{r.author_name} · {"★".repeat(r.rating)}</div><div className="text-xs text-muted-foreground">{r.tool_slug} · {new Date(r.created_at).toLocaleString()}</div><p className="mt-1 text-sm">{r.body}</p></div><StatusBadge status={r.approved ? "Approved" : "Pending"}/><button type="button" onClick={() => void toggle(r)} className="rounded-md border border-border px-3 py-2 text-xs font-semibold">{r.approved ? "Hide" : "Approve"}</button><button type="button" onClick={() => void remove(r)} className="grid size-8 place-items-center rounded-md border border-border hover:text-destructive"><Trash2 className="size-4"/></button></div>)}</div>}</div></div>;
}

function CommentsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin_comments"], queryFn: async () => { const { data, error } = await supabase.from("blog_comments").select("id,post_slug,author_name,author_email,body,approved,created_at").order("created_at", { ascending: false }); if (error) throw error; return data ?? []; }});
  async function toggle(row: any) { const { error } = await supabase.from("blog_comments").update({ approved: !row.approved }).eq("id", row.id); if (error) toast.error(error.message); else { toast.success(row.approved ? "Comment hidden" : "Comment approved"); void qc.invalidateQueries({ queryKey: ["admin_comments"] }); } }
  async function remove(row: any) { if (!window.confirm("Delete this comment?")) return; const { error } = await supabase.from("blog_comments").delete().eq("id", row.id); if (error) toast.error(error.message); else void qc.invalidateQueries({ queryKey: ["admin_comments"] }); }
  return <div className="space-y-5"><section className="surface-panel p-5"><h2 className="font-display text-xl font-bold">Comment Moderation</h2><p className="mt-1 text-sm text-muted-foreground">Review blog comments, publish good comments and remove spam.</p></section><div className="surface-panel overflow-hidden">{isLoading ? <div className="p-8 text-center text-sm text-muted-foreground">Loading comments...</div> : !data?.length ? <div className="p-8 text-center text-sm text-muted-foreground">No comments yet.</div> : <div className="divide-y divide-border">{data.map((c: any) => <div key={c.id} className="grid gap-3 p-4 md:grid-cols-[1fr_120px_auto_auto] md:items-center"><div><div className="font-semibold">{c.author_name} <span className="font-normal text-muted-foreground">({c.author_email})</span></div><div className="text-xs text-muted-foreground">/blog/{c.post_slug} · {new Date(c.created_at).toLocaleString()}</div><p className="mt-1 text-sm">{c.body}</p></div><StatusBadge status={c.approved ? "Approved" : "Pending"}/><button type="button" onClick={() => void toggle(c)} className="rounded-md border border-border px-3 py-2 text-xs font-semibold">{c.approved ? "Hide" : "Approve"}</button><button type="button" onClick={() => void remove(c)} className="grid size-8 place-items-center rounded-md border border-border hover:text-destructive"><Trash2 className="size-4"/></button></div>)}</div>}</div></div>;
}

export default AdminConsole;
