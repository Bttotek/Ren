import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS } from "@/lib/tools";
import { DEFAULT_SETTINGS, useSiteSettings, type SiteSettings } from "@/lib/site-settings";

type Tab =
  | "dashboard" | "posts" | "pages" | "faqs" | "leads" | "reviews" | "comments"
  | "tools" | "bbs" | "measurement" | "live-sheet" | "excel" | "pdf"
  | "seo" | "keywords" | "content-quality" | "internal-links" | "sitemap" | "redirects"
  | "media" | "social" | "appearance" | "adsense" | "analytics" | "apps" | "users"
  | "security" | "backup" | "health" | "settings";

type NavItem = { id: Tab; label: string; section: string };

const ADMIN_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", section: "Overview" },
  { id: "posts", label: "Posts", section: "Content" },
  { id: "pages", label: "Pages", section: "Content" },
  { id: "faqs", label: "FAQs", section: "Content" },
  { id: "leads", label: "Leads", section: "Content" },
  { id: "reviews", label: "Reviews", section: "Content" },
  { id: "comments", label: "Comments", section: "Content" },
  { id: "media", label: "Media Library", section: "Content" },
  { id: "tools", label: "All Tools (51 Calculators)", section: "Tools" },
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
  { id: "settings", label: "General Settings", section: "System" },
];

function FullModuleEditor({ title, tabKey }: { title: string; tabKey: string }) {
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
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: `module_${tabKey}`,
        value: config,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    setLoading(false);
    if (error) toast.error("Failed to save: " + error.message);
    else toast.success(`${title} settings updated & live!`);
  }

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="font-display text-xl font-bold">{title} Control Panel</h2>
          <p className="text-xs text-muted-foreground">Manage layout, texts, and active configurations for {title}.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Changes
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Title</span>
          <input
            value={config.heading}
            onChange={(e) => setConfig({ ...config, heading: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status / Mode</span>
          <select
            value={config.status}
            onChange={(e) => setConfig({ ...config, status: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="Active">Active & Live</option>
            <option value="Maintenance">Maintenance Mode</option>
            <option value="Disabled">Disabled</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subheading / Description</span>
        <input
          value={config.subheading}
          onChange={(e) => setConfig({ ...config, subheading: e.target.value })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom Content / Layout Data / JSON</span>
        <textarea
          value={config.customCode}
          onChange={(e) => setConfig({ ...config, customCode: e.target.value })}
          rows={6}
          placeholder="Enter custom HTML, text, parameters, or JSON configuration..."
          className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm font-mono outline-none focus:border-accent"
        />
      </label>
    </div>
  );
}

function ToolsPanel() {
  const [selectedSlug, setSelectedSlug] = useState(TOOLS[0]?.slug || "");
  const [customName, setCustomName] = useState("");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const currentTool = TOOLS.find((t) => t.slug === selectedSlug);

  useEffect(() => {
    async function loadToolConfig() {
      if (!selectedSlug) return;
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", `tool_cfg_${selectedSlug}`)
        .maybeSingle();

      if (data?.value) {
        setCustomName(data.value.customName || currentTool?.name || "");
        setStatus(data.value.status || "Active");
        setDescription(data.value.description || currentTool?.description || "");
      } else {
        setCustomName(currentTool?.name || "");
        setStatus("Active");
        setDescription(currentTool?.description || "");
      }
    }
    loadToolConfig();
  }, [selectedSlug, currentTool]);

  async function handleSave() {
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: `tool_cfg_${selectedSlug}`,
        value: { customName, status, description },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    setBusy(false);
    if (error) toast.error("Save failed: " + error.message);
    else toast.success(`Calculator (${currentTool?.name}) updated!`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold">51 Calculators Master Control</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Select any tool to change display name, active status, or custom description.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Select Tool ({TOOLS.length} Available)</span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none font-medium"
            >
              {TOOLS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Status Mode</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="Active">Active & Live</option>
              <option value="Maintenance">Under Maintenance</option>
              <option value="Disabled">Hidden / Disabled</option>
            </select>
          </label>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Custom Display Title</span>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Tool Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm outline-none"
            />
          </label>

          <button
            onClick={handleSave}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            <Save className="size-4" /> Save Tool Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const cards = [
    ["Total Calculators", TOOLS.length], ["Blog Posts", "Active"], ["Pages", "Active"], ["System Health", "Good"],
  ];
  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl font-bold">BTTOTEK Master Control Panel</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One central administration area for website content, tools, exports, SEO, monetization and system controls.
        </p>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="surface-panel p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminConsole() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [open, setOpen] = useState(true);

  const active = ADMIN_NAV.find((item) => item.id === tab);
  const sections = [...new Set(ADMIN_NAV.map((item) => item.section))];

  function renderPanel() {
    switch (tab) {
      case "dashboard": return <AdminDashboard />;
      case "posts": return <PostsPanel />;
      case "pages": return <PagesPanel />;
      case "faqs": return <FaqsPanel />;
      case "leads": return <LeadsPanel />;
      case "reviews": return <ReviewsPanel />;
      case "comments": return <CommentsPanel />;
      case "tools": return <ToolsPanel />;
      case "appearance": return <LayoutPanel />;
      default: return <FullModuleEditor title={active?.label ?? "Module"} tabKey={tab} />;
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className={(open ? "w-72" : "w-16") + " shrink-0 border-r border-border bg-card transition-all duration-200"}>
          <div className="sticky top-0 flex max-h-[calc(100vh-4rem)] flex-col">
            <div className="flex items-center justify-between border-b border-border p-3">
              {open && <div><div className="font-display font-bold">BTTOTEK</div><div className="text-[11px] text-muted-foreground">Master Admin</div></div>}
              <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-md border border-border px-2 py-1 text-xs">{open ? "←" : "→"}</button>
            </div>
            <nav className="overflow-y-auto p-2">
              {sections.map((section) => (
                <div key={section} className="mb-3">
                  {open && <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{section}</div>}
                  <div className="grid gap-0.5">
                    {ADMIN_NAV.filter((item) => item.section === section).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        title={item.label}
                        className={(tab === item.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground") + " rounded-md px-2.5 py-2 text-left text-sm transition-colors"}
                      >
                        {open ? item.label : item.label.slice(0, 1)}
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
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{active?.section}</div>
                <h1 className="font-display text-2xl font-bold">{active?.label}</h1>
              </div>
              <div className="text-xs text-muted-foreground">Production target: bttotek.in/admin</div>
            </div>
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}

const fieldCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";
const labelCls = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";

function LayoutPanel() {
  const { settings, save } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);

  useEffect(() => setDraft(settings), [settings]);

  const setNav = (i: number, patch: Partial<{ to: string; label: string }>) =>
    setDraft((d) => ({ ...d, nav: d.nav.map((n, idx) => (idx === i ? { ...n, ...patch } : n)) }));

  return (
    <div className="space-y-6">
      <section className="surface-panel p-5">
        <h2 className="font-display text-lg font-bold">Header Branding & Links</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className={labelCls}>Website Name</span>
            <input
              className={fieldCls}
              value={draft.siteName}
              onChange={(e) => setDraft((d) => ({ ...d, siteName: e.target.value }))}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Logo Image URL</span>
            <input
              className={fieldCls}
              value={draft.logoUrl}
              onChange={(e) => setDraft((d) => ({ ...d, logoUrl: e.target.value }))}
            />
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <span className={labelCls}>Navigation Links</span>
          {draft.nav.map((n, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                className={fieldCls + " flex-1"}
                value={n.label}
                onChange={(e) => setNav(i, { label: e.target.value })}
              />
              <input
                className={fieldCls + " flex-1"}
                value={n.to}
                onChange={(e) => setNav(i, { to: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, nav: d.nav.filter((_, idx) => idx !== i) }))}
                className="rounded-md border border-border px-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, nav: [...d.nav, { label: "New Link", to: "/" }] }))}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
          >
            <Plus className="size-3.5" /> Add Link
          </button>
        </div>
      </section>

      <section className="surface-panel p-5">
        <h2 className="font-display text-lg font-bold">Rates & Footer Settings</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className={labelCls}>Steel Rate (₹ / kg)</span>
            <input
              type="number"
              className={fieldCls}
              value={draft.steelRate}
              onChange={(e) => setDraft((d) => ({ ...d, steelRate: Number(e.target.value) }))}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Footer Copyright Text</span>
            <input
              className={fieldCls}
              value={draft.footerText}
              onChange={(e) => setDraft((d) => ({ ...d, footerText: e.target.value }))}
            />
          </label>
        </div>
      </section>

      <button
        type="button"
        onClick={() => {
          save(draft);
          toast.success("Site layout settings updated!");
        }}
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
      >
        Save Full Website Settings
      </button>
    </div>
  );
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

function PostsPanel() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin_posts"],
    queryFn: async () => {
      let res = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (res.error || !res.data || res.data.length === 0) {
        res = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      }
      return res.data || [];
    },
  });

  async function savePost() {
    if (title.trim().length < 3) return toast.error("Title required");

    const payload = {
      title: title.trim(),
      slug: slugify(title),
      excerpt: excerpt.trim() || null,
      content: body.trim(),
      published: true,
    };

    if (editId) {
      await supabase.from("posts").update(payload).eq("id", editId);
      toast.success("Article updated!");
    } else {
      await supabase.from("posts").insert(payload);
      toast.success("Article published!");
    }

    setEditId(null); setTitle(""); setExcerpt(""); setBody("");
    void qc.invalidateQueries({ queryKey: ["admin_posts"] });
  }

  function startEdit(p: any) {
    setEditId(p.id);
    setTitle(p.title || "");
    setExcerpt(p.excerpt || "");
    setBody(p.content || p.body || "");
  }

  async function remove(id: string) {
    if (!confirm("Delete article?")) return;
    await supabase.from("posts").delete().eq("id", id);
    toast.success("Article deleted!");
    void qc.invalidateQueries({ queryKey: ["admin_posts"] });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">{editId ? "Edit Article" : "Create Article"}</h2>
        <div className="mt-4 grid gap-3">
          <Input label="Title" value={title} onChange={setTitle} />
          <Input label="Excerpt" value={excerpt} onChange={setExcerpt} />
          <label className="block">
            <span className="text-xs font-medium uppercase text-muted-foreground">Body Content</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />
          </label>
          <button onClick={savePost} className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {editId ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </div>

      <Table
        loading={isLoading}
        empty="No articles found."
        rows={(data ?? []).map((p: any) => ({
          id: p.id,
          primary: p.title,
          secondary: `/${p.slug}`,
          actions: (
            <>
              <button onClick={() => startEdit(p)} className="rounded-md border border-border p-1.5 hover:bg-secondary">
                <Edit className="size-4" />
              </button>
              <IconDelete onClick={() => remove(p.id)} />
            </>
          ),
        }))}
      />
    </div>
  );
}

function PagesPanel() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin_pages"],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  async function createPage() {
    if (title.trim().length < 3) return toast.error("Page title required");
    await supabase.from("pages").insert({ title: title.trim(), slug: slugify(title), content: content.trim() });
    toast.success("Page created!");
    setTitle(""); setContent("");
    void qc.invalidateQueries({ queryKey: ["admin_pages"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete page?")) return;
    await supabase.from("pages").delete().eq("id", id);
    toast.success("Page deleted!");
    void qc.invalidateQueries({ queryKey: ["admin_pages"] });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">New Page</h2>
        <div className="mt-4 grid gap-3">
          <Input label="Page Title" value={title} onChange={setTitle} />
          <textarea
            placeholder="Page content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none"
          />
          <button onClick={createPage} className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            Create Page
          </button>
        </div>
      </div>

      <Table
        loading={isLoading}
        empty="No pages found."
        rows={(data ?? []).map((p: any) => ({
          id: p.id,
          primary: p.title,
          secondary: `/${p.slug}`,
          actions: <IconDelete onClick={() => remove(p.id)} />,
        }))}
      />
    </div>
  );
}

function FaqsPanel() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin_faqs"],
    queryFn: async () => {
      const { data } = await supabase.from("faqs").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  async function createFaq() {
    if (q.trim().length < 4 || a.trim().length < 4) return toast.error("Question and answer required");
    await supabase.from("faqs").insert({ question: q.trim(), answer: a.trim() });
    toast.success("FAQ added!");
    setQ(""); setA("");
    void qc.invalidateQueries({ queryKey: ["admin_faqs"] });
  }

  async function remove(id: string) {
    await supabase.from("faqs").delete().eq("id", id);
    toast.success("FAQ deleted!");
    void qc.invalidateQueries({ queryKey: ["admin_faqs"] });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Add FAQ</h2>
        <div className="mt-4 grid gap-3">
          <Input label="Question" value={q} onChange={setQ} />
          <Input label="Answer" value={a} onChange={setA} />
          <button onClick={createFaq} className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            Add FAQ
          </button>
        </div>
      </div>

      <Table
        loading={isLoading}
        empty="No FAQs found."
        rows={(data ?? []).map((f: any) => ({
          id: f.id,
          primary: f.question,
          secondary: f.answer,
          actions: <IconDelete onClick={() => remove(f.id)} />,
        }))}
      />
    </div>
  );
}

function LeadsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <Table
      loading={isLoading}
      empty="No customer enquiries."
      rows={(data ?? []).map((l: any) => ({
        id: l.id,
        primary: `${l.name} (${l.email})`,
        secondary: l.message,
        actions: null,
      }))}
    />
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

function IconDelete({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-destructive">
      <Trash2 className="size-4" />
    </button>
  );
}

function Table({ loading, empty, rows }: { loading: boolean; empty: string; rows: { id: string; primary: string; secondary: string; actions: React.ReactNode }[] }) {
  if (loading) return <div className="p-4 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading database data...</div>;
  if (!rows.length) return <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{empty}</div>;
  return (
    <ul className="grid gap-2">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
          <div>
            <div className="font-medium">{r.primary}</div>
            <div className="text-xs text-muted-foreground">{r.secondary}</div>
          </div>
          <div className="flex items-center gap-2">{r.actions}</div>
        </li>
      ))}
    </ul>
  );
}

function ReviewsPanel() { return <div className="p-8 border border-dashed text-center text-sm text-muted-foreground">No tool reviews submitted yet.</div>; }
function CommentsPanel() { return <div className="p-8 border border-dashed text-center text-sm text-muted-foreground">No blog comments submitted yet.</div>; }
