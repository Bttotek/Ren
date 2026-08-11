import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user: User | null = session?.user ?? null;
  return { session, user, loading };
}

export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    void supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        // A missing role is a normal access-denied state. Database/network
        // failures are intentionally treated as non-admin so the protected
        // panel never fails open.
        if (error) {
          console.error("[Admin auth] role lookup failed", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(Boolean(data));
        }
        setChecking(false);
      })
      .catch((error) => {
        if (!active) return;
        console.error("[Admin auth] role lookup failed", error);
        setIsAdmin(false);
        setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return { isAdmin, checking };
}
