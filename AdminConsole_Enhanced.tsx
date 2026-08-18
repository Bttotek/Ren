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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS } from "@/lib/tools";
import { useSiteSettings, type SiteSettings } from "@/lib/site-settings";
import AdminCmsSettingsPanel from "@/components/admin-cms-settings-panel";

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

  { id: "excel", label: "Excel Templates", section: "Downloads" },
  { id: "pdf", label: "PDF Templates", section: "Downloads" },

  { id: "seo", label: "SEO Dashboard", section: "SEO" },
  { id: "keywords", label: "Keyword Rank Tracker", section: "SEO" },
  { id: "content-quality", label: "Content Quality", section: "SEO" },
  { id: "internal-links", label: "Internal Links", section: "SEO" },
  { id: "sitemap", label: "Sitemap / Robots", section: "SEO" },
  { id: "redirects", label: "Redirects / 404", section: "SEO" },

  { id: "appearance", label: "Theme & Layout", section: "Appearance" },
  { id: "social", label: "Social Media", section: "Appearance" },

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
  tags?: string | null;
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

function FullModuleEditor({
  title,
  tabKey,
}: {
  title: string;
  tabKey: string;
}) {
  const [config, setConfig] = useState({
    heading: "",
    subheading: "",
    customCode: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);

      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", `module_${tabKey}`)
        .maybeSingle();

      if (data?.value) {
        setConfig(data.value);
      } else {
        setConfig({
          heading: `${title} Module`,
          subheading: `Configuration for ${title} on bttotek.in`,
          customCode: "",
          status: "Active",
        });
      }

      setLoading(false);
    }

    loadConfig();
  }, [tabKey, title]);

  async function handleSave() {
    setLoading(true);

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: `module_${tabKey}`,
          value: config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

    setLoading(false);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success(`${title} settings updated & live!`);
    }
  }

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="font-display text-xl font-bold">
            {title} Control Panel
          </h2>

          <p className="text-xs text-muted-foreground">
            Manage layout, texts, and active configurations for {title}.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          Save Changes
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Display Title</span>

          <input
            value={config.heading}
            onChange={(e) =>
              setConfig({
                ...config,
                heading: e.target.value,
              })
            }
            className={fieldCls + " mt-1"}
          />
        </label>

        <label className="block">
          <span className={labelCls}>Status / Mode</span>

          <select
            value={config.status}
            onChange={(e) =>
              setConfig({
                ...config,
                status: e.target.value,
              })
            }
            className={fieldCls + " mt-1"}
          >
            <option value="Active">Active & Live</option>
            <option value="Maintenance">Maintenance Mode</option>
            <option value="Disabled">Disabled</option>
          </select>
        </label>
      </div>

      <RichTextEditor
        label="Subheading / Description"
        value={config.subheading}
        onChange={(value) =>
          setConfig({ ...config, subheading: value })
        }
        placeholder={`Write ${title} content...`}
        minHeight={260}
      />

      <label className="block">
        <span className={labelCls}>
          Custom Content / Layout Data / JSON
        </span>

        <textarea
          value={config.customCode}
          onChange={(e) =>
            setConfig({
              ...config,
              customCode: e.target.value,
            })
          }
          rows={6}
          placeholder="Enter custom HTML, text, parameters, or JSON configuration..."
          className={
            "mt-1 w-full rounded-md border border-input bg-background p-3 text-sm font-mono outline-none focus:border-accent"
          }
        />
      </label>
    </div>
  );
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
  const [seoDescription, setSeoDescription] =
    useState("");

  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery<PostRecord[]>({
    queryKey: ["admin_posts"],
    queryFn: async () => {
      let res = await supabase
        .from("posts")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (
        res.error ||
        !res.data ||
        res.data.length === 0
      ) {
        res = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", {
            ascending: false,
          });
      }

      return (res.data || []) as PostRecord[];
    },
  });

  const posts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return data || [];

    return (data || []).filter((post) => {
      return (
        post.title?.toLowerCase().includes(query) ||
        post.slug?.toLowerCase().includes(query) ||
        post.category
          ?.toLowerCase()
          .includes(query) ||
        post.tags?.toLowerCase().includes(query)
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
    setTags(post.tags || "");
    setSeoTitle(post.seo_title || "");
    setSeoDescription(
      post.seo_description || "",
    );
    setPublished(post.published !== false);

    setMode("editor");
  }

  async function savePost() {
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

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      content: body.trim(),
      published,
      featured_image:
        featuredImage.trim() || null,
      category: category.trim() || "General",
      tags: tags.trim() || null,
      seo_title: seoTitle.trim() || null,
      seo_description:
        seoDescription.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let error: any = null;

    if (editId) {
      const result = await supabase
        .from("posts")
        .update(payload)
        .eq("id", editId);

      error = result.error;

      if (error) {
        const fallbackPayload = {
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt,
          content: payload.content,
          published: payload.published,
        };

        const fallback = await supabase
          .from("posts")
          .update(fallbackPayload)
          .eq("id", editId);

        error = fallback.error;
      }
    } else {
      const result = await supabase
        .from("posts")
        .insert(payload);

      error = result.error;

      if (error) {
        const fallbackPayload = {
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt,
          content: payload.content,
          published: payload.published,
        };

        const fallback = await supabase
          .from("posts")
          .insert(fallbackPayload);

        error = fallback.error;
      }
    }

    setSaving(false);

    if (error) {
      toast.error("Post save failed: " + error.message);
      return;
    }

    toast.success(
      editId
        ? "Post updated successfully."
        : published
          ? "Post published successfully."
          : "Post saved as draft.",
    );

    resetEditor();
    setMode("list");

    void qc.invalidateQueries({
      queryKey: ["admin_posts"],
    });
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this blog post permanently?")) {
      return;
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Post deleted.");

    void qc.invalidateQueries({
      queryKey: ["admin_posts"],
    });
  }

  async function togglePost(post: PostRecord) {
    const next = !post.published;

    const { error } = await supabase
      .from("posts")
      .update({
        published: next,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      next ? "Post published." : "Post moved to draft.",
    );

    void qc.invalidateQueries({
      queryKey: ["admin_posts"],
    });
  }

  function duplicatePost(post: PostRecord) {
    resetEditor();

    setTitle(`${post.title} Copy`);
    setSlug(slugify(`${post.title}-copy`));
    setExcerpt(post.excerpt || "");
    setBody(post.content || post.body || "");
    setFeaturedImage(post.featured_image || "");
    setCategory(post.category || "General");
    setTags(post.tags || "");
    setSeoTitle(post.seo_title || "");
    setSeoDescription(
      post.seo_description || "",
    );
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
              onClick={() => {
                setPublished(true);
                void savePost();
              }}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
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

                  if (!editId) {
                    setSlug(slugify(e.target.value));
                  }
                }}
                placeholder="Add post title"
                className="w-full border-0 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/50 sm:text-3xl"
              />

              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Permalink:</span>

                <span>
                  /blog/{slug || "post-slug"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <label className="grid gap-1">
                <span className={labelCls}>
                  Post Content
                </span>

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
              <h3 className="font-display font-bold">
                Excerpt
              </h3>

              <textarea
                value={excerpt}
                onChange={(e) =>
                  setExcerpt(e.target.value)
                }
                rows={4}
                placeholder="Short description / excerpt..."
                className={fieldCls + " mt-3"}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">
                SEO Settings
              </h3>

              <div className="mt-4 space-y-4">
                <label className="grid gap-1">
                  <span className={labelCls}>
                    SEO Title
                  </span>

                  <input
                    value={seoTitle}
                    onChange={(e) =>
                      setSeoTitle(e.target.value)
                    }
                    className={fieldCls}
                    placeholder="SEO optimized title"
                  />
                </label>

                <label className="grid gap-1">
                  <span className={labelCls}>
                    SEO Description
                  </span>

                  <textarea
                    value={seoDescription}
                    onChange={(e) =>
                      setSeoDescription(e.target.value)
                    }
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
                <h3 className="font-display font-bold">
                  Publish
                </h3>

                <StatusBadge
                  status={
                    published ? "Published" : "Draft"
                  }
                />
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={savePost}
                  className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : published
                      ? "Update Post"
                      : "Save Draft"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPublished(!published)
                  }
                  className="w-full rounded-md border border-border px-4 py-2 text-sm font-semibold"
                >
                  {published
                    ? "Move to Draft"
                    : "Publish Post"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">
                Post Settings
              </h3>

              <div className="mt-4 space-y-4">
                <label className="grid gap-1">
                  <span className={labelCls}>
                    Slug
                  </span>

                  <input
                    value={slug}
                    onChange={(e) =>
                      setSlug(slugify(e.target.value))
                    }
                    className={fieldCls}
                  />
                </label>

                <label className="grid gap-1">
                  <span className={labelCls}>
                    Category
                  </span>

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
                  <span className={labelCls}>
                    Tags
                  </span>

                  <input
                    value={tags}
                    onChange={(e) =>
                      setTags(e.target.value)
                    }
                    className={fieldCls}
                    placeholder="steel, construction, calculator"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">
                Featured Image
              </h3>

              <input
                value={featuredImage}
                onChange={(e) =>
                  setFeaturedImage(e.target.value)
                }
                className={fieldCls + " mt-3"}
                placeholder="https://..."
              />

              {featuredImage && (
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <img
                    src={featuredImage}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-bold">
                Preview
              </h3>

              <div className="mt-3 rounded-lg border border-border p-4">
                <div className="text-lg font-bold">
                  {title || "Post Title"}
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  /blog/{slug || "post-slug"}
                </div>

                <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">
                  {excerpt ||
                    "Your post excerpt will appear here."}
                </p>
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
          <h2 className="font-display text-2xl font-bold">
            Posts
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your blog like WordPress.
          </p>
        </div>

        <button
          type="button"
          onClick={newPost}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          <Plus className="size-4" />
          Add New Post
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search posts..."
            className={fieldCls + " pl-9"}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden border-b border-border bg-muted/30 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_150px_120px_210px] md:gap-4">
          <div>Post</div>
          <div>Category</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 inline size-4 animate-spin" />
            Loading posts...
          </div>
        ) : posts.length ? (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <div
                key={post.id}
                className="grid gap-3 p-4 md:grid-cols-[1fr_150px_120px_210px] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />

                    <div className="truncate font-semibold">
                      {post.title}
                    </div>
                  </div>

                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    /blog/{post.slug}
                  </div>

                  {post.excerpt && (
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {post.excerpt}
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {post.category || "General"}
                </div>

                <div>
                  <StatusBadge
                    status={
                      post.published
                        ? "Published"
                        : "Draft"
                    }
                  />
                </div>

                <div className="flex justify-start gap-1 md:justify-end">
                  <button
                    type="button"
                    title="Publish / Draft"
                    onClick={() =>
                      void togglePost(post)
                    }
                    className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary"
                  >
                    {post.published ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    title="Edit"
                    onClick={() => editPost(post)}
                    className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary"
                  >
                    <Edit className="size-4" />
                  </button>

                  <button
                    type="button"
                    title="Duplicate"
                    onClick={() =>
                      duplicatePost(post)
                    }
                    className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary"
                  >
                    <Copy className="size-4" />
                  </button>

                  <button
                    type="button"
                    title="Delete"
                    onClick={() =>
                      void deletePost(post.id)
                    }
                    className="grid size-8 place-items-center rounded-md border border-border hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground/40" />

            <div className="mt-3 font-semibold">
              No posts found
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first blog post.
            </p>

            <button
              type="button"
              onClick={newPost}
              className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Create Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */

function AdminDashboard() {
  const cards = [
    ["Total Calculators", TOOLS.length],
    ["Blog Posts", "Manage"],
    ["Pages", "Manage"],
    ["System Health", "Good"],
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl font-bold">
          BTTOTEK Master Control Panel
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          WordPress-style control panel for calculators,
          blog posts and website content.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div
            key={String(label)}
            className="surface-panel p-4"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </div>

            <div className="mt-2 text-2xl font-bold">
              {value}
            </div>
          </div>
        ))}
      </div>
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

      case "appearance":
        return <LayoutPanel />;

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
   LAYOUT PANEL
============================================================ */

function LayoutPanel() {
  const { settings, save } =
    useSiteSettings();

  const [draft, setDraft] =
    useState<SiteSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const setNav = (
    i: number,
    patch: Partial<{
      to: string;
      label: string;
    }>,
  ) =>
    setDraft((d) => ({
      ...d,
      nav: d.nav.map((n, idx) =>
        idx === i
          ? {
              ...n,
              ...patch,
            }
          : n,
      ),
    }));

  return (
    <div className="space-y-6">
      <section className="surface-panel p-5">
        <h2 className="font-display text-lg font-bold">
          Header Branding & Links
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className={labelCls}>
              Website Name
            </span>

            <input
              className={fieldCls}
              value={draft.siteName}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  siteName: e.target.value,
                }))
              }
            />
          </label>

          <label className="grid gap-1">
            <span className={labelCls}>
              Logo Image URL
            </span>

            <input
              className={fieldCls}
              value={draft.logoUrl}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  logoUrl: e.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <span className={labelCls}>
            Navigation Links
          </span>

          {draft.nav.map((n, i) => (
            <div
              key={i}
              className="flex flex-wrap gap-2"
            >
              <input
                className={
                  fieldCls + " flex-1"
                }
                value={n.label}
                onChange={(e) =>
                  setNav(i, {
                    label: e.target.value,
                  })
                }
              />

              <input
                className={
                  fieldCls + " flex-1"
                }
                value={n.to}
                onChange={(e) =>
                  setNav(i, {
                    to: e.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    nav: d.nav.filter(
                      (_, idx) => idx !== i,
                    ),
                  }))
                }
                className="rounded-md border border-border px-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                nav: [
                  ...d.nav,
                  {
                    label: "New Link",
                    to: "/",
                  },
                ],
              }))
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
          >
            <Plus className="size-3.5" />
            Add Link
          </button>
        </div>
      </section>

      <section className="surface-panel p-5">
        <h2 className="font-display text-lg font-bold">
          Rates & Footer Settings
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className={labelCls}>
              Steel Rate (₹ / kg)
            </span>

            <input
              type="number"
              className={fieldCls}
              value={draft.steelRate}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  steelRate:
                    Number(e.target.value),
                }))
              }
            />
          </label>

          <label className="grid gap-1">
            <span className={labelCls}>
              Footer Copyright Text
            </span>

            <input
              className={fieldCls}
              value={draft.footerText}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  footerText: e.target.value,
                }))
              }
            />
          </label>
        </div>
      </section>

      <button
        type="button"
        onClick={() => {
          save(draft);
          toast.success(
            "Site layout settings updated!",
          );
        }}
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
      >
        Save Full Website Settings
      </button>
    </div>
  );
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
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No tool reviews submitted yet.
    </div>
  );
}

function CommentsPanel() {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No blog comments submitted yet.
    </div>
  );
}

export default AdminConsole;
