/**
 * Sessão atual do Supabase (herdada do backoffice via `postMessage` → aplicada em
 * `route-sync.ts`). `null` = sem sessão → escritas ficam desabilitadas no painel.
 */
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export function useSupabaseSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return session;
}
