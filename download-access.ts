import { supabase } from "@/integrations/supabase/client";

export type DownloadService = "pdf" | "excel";

export type DownloadServiceSetting = {
  service_key: DownloadService;
  enabled: boolean;
  access_mode: "free" | "paid";
  free_daily_limit: number;
  price: number;
};

const DEFAULTS: Record<DownloadService, DownloadServiceSetting> = {
  pdf: { service_key: "pdf", enabled: true, access_mode: "free", free_daily_limit: 2, price: 0 },
  excel: { service_key: "excel", enabled: true, access_mode: "free", free_daily_limit: 2, price: 0 },
};

export async function getDownloadServiceSetting(service: DownloadService) {
  const { data, error } = await supabase
    .from("download_service_settings")
    .select("service_key,enabled,access_mode,free_daily_limit,price")
    .eq("service_key", service)
    .maybeSingle();

  if (error || !data) return DEFAULTS[service];
  return data as DownloadServiceSetting;
}

export async function canDownloadService(service: DownloadService) {
  const setting = await getDownloadServiceSetting(service);

  if (!setting.enabled) {
    return {
      allowed: false,
      reason: `${service.toUpperCase()} downloads are currently disabled by the administrator.`,
      setting,
    };
  }

  if (setting.access_mode === "paid") {
    return {
      allowed: false,
      reason: `${service.toUpperCase()} download is a premium service. Please use a paid plan.`,
      setting,
    };
  }

  return { allowed: true, reason: "", setting };
}
