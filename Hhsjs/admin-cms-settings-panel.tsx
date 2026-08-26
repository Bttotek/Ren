import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TOOLS, type ToolMeta } from "@/lib/tools";
import {
  cms,
  type CmsSetting,
  type CmsPage,
  type CmsMenu,
  type CmsToolOverride,
} from "@/lib/admin-cms";

const cardCls = "rounded-xl border border-border bg-card p-5 shadow-sm";
const inputCls =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelCls =
  "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

function parseJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // handled by caller through validation
  }
  throw new Error("Invalid JSON. Please check the JSON configuration.");
}

export function AdminCmsSettingsPanel() {
  const [settings, setSettings] = useState<CmsSetting[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [toolOverrides, setToolOverrides] = useState<CmsToolOverride[]>([]);

  const [settingKey, setSettingKey] = useState("");
  const [settingGroup, setSettingGroup] = useState("general");
  const [settingValue, setSettingValue] = useState("{}");
  const [settingPublic, setSettingPublic] = useState(true);

  const [pageSlug, setPageSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("{}");
  const [pageStatus, setPageStatus] = useState<CmsPage["status"]>("draft");

  const [menuLabel, setMenuLabel] = useState("");
  const [menuHref, setMenuHref] = useState("");
  const [menuLocation, setMenuLocation] = useState("header");
  const [menuOrder, setMenuOrder] = useState("0");

  const [toolSlug, setToolSlug] = useState("");
  const [toolEnabled, setToolEnabled] = useState("inherit");
  const [toolFeatured, setToolFeatured] = useState("inherit");
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [toolSeo, setToolSeo] = useState("{}");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [s, p, m, t] = await Promise.all([
        cms.settings.list(),
        cms.pages.list(),
        cms.menus.list(),
        cms.tools.list(),
      ]);
      setSettings(s);
      setPages(p);
      setMenus(m);
      setToolOverrides(t);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load CMS data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const settingGroups = useMemo(
    () => Array.from(new Set(settings.map((item) => item.setting_group))),
    [settings]
  );

  function loadSetting(item: CmsSetting) {
    setSettingKey(item.setting_key);
    setSettingGroup(item.setting_group);
    setSettingValue(safeJson(item.value));
    setSettingPublic(item.is_public !== false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveSetting() {
    if (!settingKey.trim()) {
      toast.error("Setting key is required.");
      return;
    }

    try {
      const parsed = parseJson(settingValue);
      setSaving("setting");
      await cms.settings.save({
        settingKey: settingKey.trim(),
        settingGroup: settingGroup.trim() || "general",
        value: parsed,
        isPublic: settingPublic,
      });
      toast.success("CMS setting saved.");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save setting.");
    } finally {
      setSaving("");
    }
  }

  function loadPage(item: CmsPage) {
    setPageSlug(item.slug);
    setPageTitle(item.title);
    setPageContent(safeJson(item.content));
    setPageStatus(item.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function savePage() {
    if (!pageSlug.trim() || !pageTitle.trim()) {
      toast.error("Page slug and title are required.");
      return;
    }

    try {
      const content = parseJson(pageContent);
      setSaving("page");
      await cms.pages.save({
        slug: pageSlug.trim().replace(/^\/+/, "").replace(/\/+$/, ""),
        title: pageTitle.trim(),
        content,
        status: pageStatus,
      });
      toast.success("CMS page saved.");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save page.");
    } finally {
      setSaving("");
    }
  }

  function loadMenu(item: CmsMenu) {
    setMenuLabel(item.label);
    setMenuHref(item.href);
    setMenuLocation(item.menu_location);
    setMenuOrder(String(item.sort_order));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveMenu() {
    if (!menuLabel.trim() || !menuHref.trim()) {
      toast.error("Menu label and link are required.");
      return;
    }

    try {
      setSaving("menu");
      await cms.menus.save({
        menuLocation: menuLocation.trim() || "header",
        label: menuLabel.trim(),
        href: menuHref.trim(),
        sortOrder: Number(menuOrder) || 0,
        isVisible: true,
      });
      toast.success("Menu item saved.");
      await loadAll();
      setMenuLabel("");
      setMenuHref("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save menu.");
    } finally {
      setSaving("");
    }
  }

  async function deleteMenu(id: string) {
    if (!window.confirm("Delete this CMS menu item?")) return;

    try {
      setSaving(`delete-menu-${id}`);
      await cms.menus.delete(id);
      toast.success("Menu item deleted.");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete menu.");
    } finally {
      setSaving("");
    }
  }

  function loadTool(tool: ToolMeta) {
    const item = toolOverrides.find((override) => override.tool_slug === tool.slug);

    setToolSlug(tool.slug);
    setToolEnabled(
      item?.enabled === null || item?.enabled === undefined
        ? "inherit"
        : item.enabled
          ? "true"
          : "false"
    );
    setToolFeatured(
      item?.featured === null || item?.featured === undefined
        ? "inherit"
        : item.featured
          ? "true"
          : "false"
    );

    const data =
      item?.override_data && typeof item.override_data === "object"
        ? (item.override_data as Record<string, unknown>)
        : {};

    setToolName(
      typeof data.name === "string" && data.name.trim()
        ? data.name
        : tool.name
    );
    setToolDescription(
      typeof data.description === "string" && data.description.trim()
        ? data.description
        : tool.short
    );

    const seo =
      item?.seo && typeof item.seo === "object"
        ? item.seo
        : {
            title: tool.seoTitle ?? "",
            description: tool.seoDescription ?? "",
            keywords: tool.seoKeywords ?? tool.keywords ?? [],
          };

    setToolSeo(safeJson(seo));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveTool() {
    if (!toolSlug.trim()) {
      toast.error("Tool slug is required.");
      return;
    }

    try {
      const seo = parseJson(toolSeo);
      setSaving("tool");

      await cms.tools.save({
        toolSlug: toolSlug.trim(),
        enabled:
          toolEnabled === "inherit" ? null : toolEnabled === "true",
        featured:
          toolFeatured === "inherit" ? null : toolFeatured === "true",
        overrideData: {
          name: toolName,
          description: toolDescription,
        },
        seo,
      });

      toast.success("Tool override saved.");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save tool.");
    } finally {
      setSaving("");
    }
  }

  return (
    <div className="space-y-6">
      <section className={cardCls}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="font-display text-xl font-bold">CMS Control Center</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              New non-destructive CMS layer. Existing website data remains untouched.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadAll()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "↻"} Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            ["CMS Settings", settings.length],
            ["CMS Pages", pages.length],
            ["CMS Menus", menus.length],
            ["Tool Overrides", toolOverrides.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-border bg-background p-4">
              <div className={labelCls}>{label}</div>
              <div className="mt-1 text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={cardCls}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">Global CMS Settings</h3>
            <p className="text-xs text-muted-foreground">
              Flexible JSON settings for future A-to-Z website editing.
            </p>
          </div>
          <Plus className="size-5 text-muted-foreground" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label>
            <span className={labelCls}>Setting Key</span>
            <input
              value={settingKey}
              onChange={(e) => setSettingKey(e.target.value)}
              placeholder="home.hero"
              className={inputCls}
            />
          </label>

          <label>
            <span className={labelCls}>Group</span>
            <input
              value={settingGroup}
              onChange={(e) => setSettingGroup(e.target.value)}
              placeholder="home"
              className={inputCls}
              list="cms-setting-groups"
            />
            <datalist id="cms-setting-groups">
              {settingGroups.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </label>

          <label className="lg:col-span-2">
            <span className={labelCls}>JSON Value</span>
            <textarea
              value={settingValue}
              onChange={(e) => setSettingValue(e.target.value)}
              rows={7}
              className={`${inputCls} font-mono`}
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settingPublic}
              onChange={(e) => setSettingPublic(e.target.checked)}
            />
            Publicly readable
          </label>
        </div>

        <button
          type="button"
          onClick={() => void saveSetting()}
          disabled={saving === "setting"}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving === "setting" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Setting
        </button>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Key</th>
                <th className="p-3">Group</th>
                <th className="p-3">Public</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((item) => (
                <tr key={item.id ?? item.setting_key} className="border-t border-border">
                  <td className="p-3 font-medium">{item.setting_key}</td>
                  <td className="p-3 text-muted-foreground">{item.setting_group}</td>
                  <td className="p-3">{item.is_public === false ? "No" : "Yes"}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => loadSetting(item)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!settings.length && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No new CMS settings yet. Existing legacy settings are preserved.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={cardCls}>
        <h3 className="font-display text-lg font-bold">Page Editor Foundation</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Creates editable CMS pages without modifying existing pages.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label>
            <span className={labelCls}>Slug</span>
            <input value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} placeholder="about" className={inputCls} />
          </label>
          <label>
            <span className={labelCls}>Title</span>
            <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="About BTTOTEK" className={inputCls} />
          </label>
          <label>
            <span className={labelCls}>Status</span>
            <select value={pageStatus} onChange={(e) => setPageStatus(e.target.value as CmsPage["status"])} className={inputCls}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="lg:col-span-2">
            <span className={labelCls}>Page Content JSON</span>
            <textarea value={pageContent} onChange={(e) => setPageContent(e.target.value)} rows={7} className={`${inputCls} font-mono`} />
          </label>
        </div>

        <button
          type="button"
          onClick={() => void savePage()}
          disabled={saving === "page"}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving === "page" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Page
        </button>

        <div className="mt-5 grid gap-2">
          {pages.map((item) => (
            <button
              type="button"
              key={item.id ?? item.slug}
              onClick={() => loadPage(item)}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-left hover:bg-secondary/40"
            >
              <span>
                <span className="font-medium">{item.title || item.slug}</span>
                <span className="ml-2 text-xs text-muted-foreground">/{item.slug}</span>
              </span>
              <span className="text-xs uppercase text-muted-foreground">{item.status}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={cardCls}>
        <h3 className="font-display text-lg font-bold">Menu Manager Foundation</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label>
            <span className={labelCls}>Location</span>
            <input value={menuLocation} onChange={(e) => setMenuLocation(e.target.value)} className={inputCls} />
          </label>
          <label>
            <span className={labelCls}>Label</span>
            <input value={menuLabel} onChange={(e) => setMenuLabel(e.target.value)} placeholder="Home" className={inputCls} />
          </label>
          <label>
            <span className={labelCls}>Link</span>
            <input value={menuHref} onChange={(e) => setMenuHref(e.target.value)} placeholder="/" className={inputCls} />
          </label>
          <label>
            <span className={labelCls}>Order</span>
            <input value={menuOrder} onChange={(e) => setMenuOrder(e.target.value)} type="number" className={inputCls} />
          </label>
        </div>

        <button
          type="button"
          onClick={() => void saveMenu()}
          disabled={saving === "menu"}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving === "menu" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Add Menu Item
        </button>

        <div className="mt-5 grid gap-2">
          {menus.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
              <button type="button" onClick={() => loadMenu(item)} className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.menu_location} · {item.href}</div>
              </button>
              <button
                type="button"
                onClick={() => item.id && void deleteMenu(item.id)}
                disabled={saving === `delete-menu-${item.id}`}
                className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" /> Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={cardCls}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">All Calculator Tools</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Existing calculator registry data is shown first. Admin overrides are applied only when saved, so the original calculator files remain intact.
            </p>
          </div>
          <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">
            {TOOLS.length} tools
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label>
            <span className={labelCls}>Tool</span>
            <select
              value={toolSlug}
              onChange={(e) => {
                const selected = TOOLS.find((tool) => tool.slug === e.target.value);
                if (selected) loadTool(selected);
              }}
              className={inputCls}
            >
              <option value="">Select a calculator</option>
              {TOOLS.map((tool) => (
                <option key={tool.slug} value={tool.slug}>
                  {tool.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelCls}>Slug</span>
            <input value={toolSlug} readOnly className={`${inputCls} opacity-80`} />
          </label>
          <label>
            <span className={labelCls}>Enabled</span>
            <select value={toolEnabled} onChange={(e) => setToolEnabled(e.target.value)} className={inputCls}>
              <option value="inherit">Use existing/default</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label>
            <span className={labelCls}>Featured</span>
            <select value={toolFeatured} onChange={(e) => setToolFeatured(e.target.value)} className={inputCls}>
              <option value="inherit">Use existing/default</option>
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
            </select>
          </label>
          <label>
            <span className={labelCls}>Display Name</span>
            <input value={toolName} onChange={(e) => setToolName(e.target.value)} placeholder="Calculator name" className={inputCls} />
          </label>
          <label>
            <span className={labelCls}>Category</span>
            <input
              value={TOOLS.find((tool) => tool.slug === toolSlug)?.category ?? ""}
              readOnly
              className={`${inputCls} opacity-80`}
            />
          </label>
          <label className="lg:col-span-2">
            <span className={labelCls}>Description</span>
            <textarea value={toolDescription} onChange={(e) => setToolDescription(e.target.value)} rows={4} className={inputCls} />
          </label>
          <label className="lg:col-span-2">
            <span className={labelCls}>SEO JSON</span>
            <textarea value={toolSeo} onChange={(e) => setToolSeo(e.target.value)} rows={6} className={`${inputCls} font-mono`} />
          </label>
        </div>

        <button
          type="button"
          onClick={() => void saveTool()}
          disabled={!toolSlug || saving === "tool"}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving === "tool" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Tool Settings
        </button>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Tool</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((tool) => {
                const override = toolOverrides.find((item) => item.tool_slug === tool.slug);
                const status =
                  override?.enabled === true
                    ? "Enabled"
                    : override?.enabled === false
                      ? "Disabled"
                      : "Default";
                return (
                  <tr key={tool.slug} className="border-t border-border">
                    <td className="p-3">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-muted-foreground">{tool.slug}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{tool.category}</td>
                    <td className="p-3">{status}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => loadTool(tool)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// --- ADDED DEFAULT EXPORT TO FIX VERCEL BUILD ---
export default AdminCmsSettingsPanel;
