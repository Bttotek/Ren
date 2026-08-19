import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ServiceKey = "pdf" | "excel";

type Setting = {
  service_key: ServiceKey;
  enabled: boolean;
  access_mode: "free" | "paid";
  free_daily_limit: number;
  price: number;
};

const defaults: Setting[] = [
  { service_key: "pdf", enabled: true, access_mode: "free", free_daily_limit: 2, price: 0 },
  { service_key: "excel", enabled: true, access_mode: "free", free_daily_limit: 2, price: 0 },
];

export default function AdminDownloadControls() {
  const [rows, setRows] = useState<Setting[]>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("download_service_settings")
      .select("service_key,enabled,access_mode,free_daily_limit,price")
      .order("service_key");

    if (error) {
      toast.error(`Could not load download controls: ${error.message}`);
    } else if (data?.length) {
      setRows(
        defaults.map(
          (fallback) =>
            (data.find((x) => x.service_key === fallback.service_key) as Setting | undefined) ??
            fallback,
        ),
      );
    }

    setLoading(false);
  }

  function patch(service_key: ServiceKey, patch: Partial<Setting>) {
    setRows((current) =>
      current.map((row) =>
        row.service_key === service_key ? { ...row, ...patch } : row,
      ),
    );
  }

  async function save() {
    setSaving(true);

    const { error } = await supabase
      .from("download_service_settings")
      .upsert(
        rows.map((row) => ({
          ...row,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "service_key" },
      );

    setSaving(false);

    if (error) {
      toast.error(`Save failed: ${error.message}`);
    } else {
      toast.success("Download service controls updated.");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">Download Services</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Control PDF and Excel access without changing calculator code.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.service_key}
            className="space-y-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {row.service_key.toUpperCase()} Download
              </h3>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) =>
                    patch(row.service_key, { enabled: e.target.checked })
                  }
                />
                Enabled
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Access
              </span>
              <select
                value={row.access_mode}
                onChange={(e) =>
                  patch(row.service_key, {
                    access_mode: e.target.value as Setting["access_mode"],
                  })
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="free">Free</option>
                <option value="paid">Paid / Premium</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Free downloads per day
              </span>
              <input
                type="number"
                min={0}
                value={row.free_daily_limit}
                onChange={(e) =>
                  patch(row.service_key, {
                    free_daily_limit: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>

            <label className="block text-sm">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Price (₹)
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={row.price}
                onChange={(e) =>
                  patch(row.service_key, {
                    price: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Save Download Settings
      </button>
    </div>
  );
}
