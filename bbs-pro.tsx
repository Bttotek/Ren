import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, FileSpreadsheet, FileText, CloudUpload, Cloud, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useSheets, type SheetSnapshot } from "@/lib/sheet-context";
import { useSiteSettings } from "@/lib/site-settings";
import { fmt } from "@/components/calc-kit";
import { exportEstimateExcel } from "@/lib/excel";
import { exportEstimatePdf } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import { canDownloadService } from "@/lib/download-access";

const DIAS = [6, 8, 10, 12, 16, 20, 25, 32, 40];

type Row = {
  id: string;
  member: string;
  dia: number;
  span: number;
  spacing: number;
  members: number;
  bars: number;
};

const inputCls =
  "numeric w-full min-w-20 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring/40";
const textCls =
  "w-full min-w-36 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring/40";
const thCls =
  "sticky top-0 z-10 whitespace-nowrap border-b border-border bg-[#0F172A] px-2 py-2 text-left text-[11px] font-semibold tracking-wide text-slate-100 uppercase";
const tdCls = "border-b border-border/60 px-2 py-1.5 align-middle whitespace-nowrap";

const fieldWrap = "flex flex-col gap-1";
const labelCls = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";
const formInput =
  "numeric rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

function derive(r: Row) {
  const bars = r.spacing > 0 ? Math.floor((r.span * 1000) / r.spacing) + 1 : Math.max(0, r.bars);
  const perMember = bars * r.span;
  const totalLength = perMember * Math.max(1, r.members);
  const unitWeight = (r.dia * r.dia) / 162.2;
  const weight = totalLength * unitWeight;
  return { bars, unitWeight, totalLength, weight };
}

export function BBSProSheet({ toolName = "Bar Bending Schedule" }: { toolName?: string }) {
  const ctx = useSheets();
  const { settings } = useSiteSettings();
  const [project, setProject] = useState("Untitled project");
  const [draft, setDraft] = useState<Omit<Row, "id">>({
    member: "Beam B1 — main bar",
    dia: 12,
    span: 4,
    spacing: 150,
    members: 1,
    bars: 0,
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const computed = useMemo(
    () => rows.map((r, i) => ({ ...r, sl: i + 1, ...derive(r) })),
    [rows],
  );
  const totalWeight = computed.reduce((s, c) => s + c.weight, 0);
  const cost = totalWeight * settings.steelRate;

  const byDia = useMemo(() => {
    const m: Record<number, number> = {};
    for (const c of computed) m[c.dia] = (m[c.dia] ?? 0) + c.weight;
    return m;
  }, [computed]);

  const snapshot: SheetSnapshot = useMemo(
    () => ({
      id: "bbs-pro",
      title: `${project} — Bar Bending Schedule (IS 2502)`,
      columns: [
        "Sl No",
        "Member / Description",
        "Dia (mm)",
        "Span (m)",
        "Spacing (mm)",
        "Members",
        "Bars/Mem",
        "Total Length (m)",
        "Unit Wt (kg/m)",
        "Weight (kg)",
      ],
      rows: [
        ...computed.map((c) => [
          c.sl,
          c.member,
          c.dia,
          c.span,
          c.spacing,
          c.members,
          c.bars,
          Number(c.totalLength.toFixed(3)),
          Number(c.unitWeight.toFixed(4)),
          Number(c.weight.toFixed(2)),
        ]),
        ...DIAS.filter((d) => (byDia[d] ?? 0) > 0).map((d) => [
          "",
          `Ø${d} mm subtotal`,
          d,
          "",
          "",
          "",
          "",
          "",
          "",
          Number((byDia[d] ?? 0).toFixed(2)),
        ]),
        ["", "TOTAL STEEL", "", "", "", "", "", "", "", Number(totalWeight.toFixed(2))],
      ],
    }),
    [project, computed, byDia, totalWeight],
  );

  const publish = ctx?.publishSheet;
  useEffect(() => {
    publish?.(snapshot);
  }, [publish, snapshot]);

  // --- SUPABASE SAVE TO CLOUD FUNCTION ---
  const saveToSupabase = async () => {
    if (computed.length === 0) {
      toast.error("Pehle kuch items add karein!");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("bbs_records")
        .insert([
          {
            project_name: project || "Untitled BBS Project",
            data: snapshot,
          },
        ]);

      if (error) {
        toast.error("Cloud Save Failed: " + error.message);
      } else {
        const time = new Date().toLocaleTimeString();
        setLastSaved(time);
        toast.success(`Project "${project}" Supabase Cloud par save ho gaya!`);
      }
    } catch (err: any) {
      toast.error("Network Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const add = () => {
    if (draft.span <= 0 || draft.dia <= 0) {
      toast.error("Enter a valid diameter and span");
      return;
    }
    setRows((p) => [...p, { ...draft, id: crypto.randomUUID() }]);
    toast.success("Row appended to the live schedule");
  };

  const update = (id: string, patch: Partial<Row>) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const results = [
    { label: "Total bars", value: String(computed.reduce((s, c) => s + c.bars * Math.max(1, c.members), 0)) },
    { label: "Total steel weight", value: `${fmt(totalWeight, 2)} kg` },
    { label: "In tonnes", value: `${fmt(totalWeight / 1000, 3)} t` },
    { label: `Steel cost @ ₹${settings.steelRate}/kg`, value: `₹ ${fmt(cost, 0)}` },
  ];

  const exportExcel = async () => {
    const access = await canDownloadService("excel");
    if (!access.allowed) {
      toast.info(access.reason);
      return;
    }

    await exportEstimateExcel({
      toolName,
      projectName: project,
      results,
      sheets: [snapshot],
    });
  };

  const exportPdf = async () => {
    const access = await canDownloadService("pdf");
    if (!access.allowed) {
      toast.info(access.reason);
      return;
    }

    exportEstimatePdf({
      toolName: `${toolName} (IS 2502)`,
      projectName: project,
      inputs: [{ label: "Steel rate", value: `₹${settings.steelRate}/kg` }],
      results,
      sheets: [snapshot],
    });
  };

  return (
    <section className="surface-panel mt-6 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold">BBS Pro — IS 2502 live schedule</h3>
            {lastSaved && (
              <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                <CheckCircle2 className="size-3" /> Saved at {lastSaved}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Unit weight d²/162.2 kg/m. Add each member, edit inline, export or sync to Supabase Cloud.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveToSupabase}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            <CloudUpload className="size-3.5" /> {isSaving ? "Saving..." : "Save to Cloud"}
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
          >
            <FileSpreadsheet className="size-3.5" /> Excel
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
          >
            <FileText className="size-3.5" /> PDF
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cn(fieldWrap, "sm:col-span-2")}>
          <label className={labelCls} htmlFor="bbs-project">Project</label>
          <input
            id="bbs-project"
            className={formInput}
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
        </div>
        <div className={cn(fieldWrap, "sm:col-span-2")}>
          <label className={labelCls} htmlFor="bbs-member">Member / description</label>
          <input
            id="bbs-member"
            className={formInput}
            value={draft.member}
            onChange={(e) => setDraft((d) => ({ ...d, member: e.target.value }))}
          />
        </div>
        <div className={fieldWrap}>
          <label className={labelCls} htmlFor="bbs-dia">Dia (mm)</label>
          <select
            id="bbs-dia"
            className={formInput}
            value={draft.dia}
            onChange={(e) => setDraft((d) => ({ ...d, dia: Number(e.target.value) }))}
          >
            {DIAS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className={fieldWrap}>
          <label className={labelCls} htmlFor="bbs-span">Span / cut length (m)</label>
          <input
            id="bbs-span"
            type="number"
            className={formInput}
            value={draft.span}
            onChange={(e) => setDraft((d) => ({ ...d, span: Number(e.target.value) }))}
          />
        </div>
        <div className={fieldWrap}>
          <label className={labelCls} htmlFor="bbs-spacing">Spacing (mm) — 0 for manual</label>
          <input
            id="bbs-spacing"
            type="number"
            className={formInput}
            value={draft.spacing}
            onChange={(e) => setDraft((d) => ({ ...d, spacing: Number(e.target.value) }))}
          />
        </div>
        <div className={fieldWrap}>
          <label className={labelCls} htmlFor="bbs-members">No. of members</label>
          <input
            id="bbs-members"
            type="number"
            className={formInput}
            value={draft.members}
            onChange={(e) => setDraft((d) => ({ ...d, members: Number(e.target.value) }))}
          />
        </div>
        <div className={fieldWrap}>
          <label className={labelCls} htmlFor="bbs-bars">Bars / member (manual)</label>
          <input
            id="bbs-bars"
            type="number"
            className={formInput}
            value={draft.bars}
            disabled={draft.spacing > 0}
            onChange={(e) => setDraft((d) => ({ ...d, bars: Number(e.target.value) }))}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={add}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#0F172A] hover:opacity-90"
          >
            <Plus className="size-4" /> Add to sheet
          </button>
        </div>
      </div>

      <div className="mt-5 max-h-[22rem] overflow-auto rounded-md border border-border">
        <table className="w-full min-w-[980px] border-collapse text-xs">
          <thead>
            <tr>
              {[
                "Sl No",
                "Member / Description",
                "Dia (mm)",
                "Span (m)",
                "Spacing (mm)",
                "Members",
                "Bars/Mem",
                "Total Length (m)",
                "Unit Wt (kg/m)",
                "Weight (kg)",
                "Action",
              ].map((h) => (
                <th key={h} className={thCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {computed.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-muted-foreground">
                  No bars yet — fill the form above and press “Add to sheet”.
                </td>
              </tr>
            ) : (
              computed.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className={tdCls}>{c.sl}</td>
                  <td className={tdCls}>
                    <input className={textCls} value={c.member} onChange={(e) => update(c.id, { member: e.target.value })} />
                  </td>
                  <td className={tdCls}>
                    <select className={inputCls} value={c.dia} onChange={(e) => update(c.id, { dia: Number(e.target.value) })}>
                      {DIAS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdCls}>
                    <input type="number" className={inputCls} value={c.span} onChange={(e) => update(c.id, { span: Number(e.target.value) })} />
                  </td>
                  <td className={tdCls}>
                    <input type="number" className={inputCls} value={c.spacing} onChange={(e) => update(c.id, { spacing: Number(e.target.value) })} />
                  </td>
                  <td className={tdCls}>
                    <input type="number" className={inputCls} value={c.members} onChange={(e) => update(c.id, { members: Number(e.target.value) })} />
                  </td>
                  <td className={cn(tdCls, "numeric")}>{c.bars}</td>
                  <td className={cn(tdCls, "numeric")}>{fmt(c.totalLength, 3)}</td>
                  <td className={cn(tdCls, "numeric")}>{fmt(c.unitWeight, 4)}</td>
                  <td className={cn(tdCls, "numeric font-semibold")}>{fmt(c.weight, 2)}</td>
                  <td className={tdCls}>
                    <button
                      type="button"
                      aria-label="Delete row"
                      onClick={() => setRows((p) => p.filter((r) => r.id !== c.id))}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((r) => (
          <div key={r.label} className="rounded-md border border-accent/50 bg-accent/10 px-3 py-2">
            <div className="text-[11px] tracking-wide text-muted-foreground uppercase">{r.label}</div>
            <div className="numeric text-lg font-bold">{r.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
