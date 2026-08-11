import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Single browser/server Supabase client used by the whole BTTOTEK application.
 *
 * IMPORTANT:
 * - The publishable key is safe to expose in browser builds.
 * - Never put a Supabase secret/service-role key in VITE_* variables.
 * - Do not override Supabase's Authorization header. The SDK manages it for
 *   password login, refresh, PKCE and authenticated database requests.
 */
function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    const missing = [
      ...(!url ? ["VITE_SUPABASE_URL / SUPABASE_URL"] : []),
      ...(!publishableKey ? ["VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(`Supabase configuration is missing: ${missing.join(", ")}`);
  }

  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "bttotek-auth",
    },
  });
}

let client: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    client ??= createSupabaseClient();
    return Reflect.get(client, prop, receiver);
  },
});
