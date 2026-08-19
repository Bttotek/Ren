import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Download, FileSpreadsheet, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useEstimate } from "@/lib/estimate-context";
import { useSheets } from "@/lib/sheet-context";
import { exportEstimatePdf } from "@/lib/pdf";
import { exportEstimateExcel } from "@/lib/excel";
import { tapFeedback } from "@/lib/native";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { canDownloadService } from "@/lib/download-access";

export function EstimateActions({ toolSlug, toolName }: { toolSlug: string; toolName: string }) {
  const estimate = useEstimate();
  const sheetCtx = useSheets();
  const { user } = useSession();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const items = estimate?.items ?? [];
  const sheets = sheetCtx?.sheets ?? [];

  const disabled = items.length === 0 && sheets.length === 0;

  async function onExport() {
    await tapFeedback();

    const access = await canDownloadService("pdf");
    if (!access.allowed) {
      toast.info(access.reason);
      return;
    }

    exportEstimatePdf({
      toolName,
      projectName: toolName,
      inputs: [{ label: "Tool", value: toolName }],
      results: items,
      sheets,
    });
  }

  async function onExportExcel() {
    await tapFeedback();

    const access = await canDownloadService("excel");
    if (!access.allowed) {
      toast.info(access.reason);
      return;
    }

    try {
      await exportEstimateExcel({
        toolName,
        projectName: toolName,
        results: items,
        sheets,
      });
    } catch {
      toast.error("Could not build the Excel file");
    }
  }


  async function onSave() {
    await tapFeedback("medium");
    if (!user) {
      toast.info("Sign in to save estimates to your workspace");
      void navigate({ to: "/auth" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("saved_estimates").insert({
      user_id: user.id,
      tool_slug: toolSlug,
      project_name: `${toolName} — ${new Date().toLocaleDateString("en-IN")}`,
      inputs: {},
      results: { items, sheets },
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save this estimate");
      return;
    }
    toast.success("Saved to your workspace");
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <button
        onClick={onSave}
        disabled={disabled || saving}
        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save to workspace
      </button>
      <button
        onClick={onExport}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
      >
        <Download className="size-4" /> Export PDF
      </button>
      <button
        onClick={onExportExcel}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
      >
        <FileSpreadsheet className="size-4" /> Export Excel
      </button>
    </div>

  );
}
