/**
 * Carrega os projetos do Supabase e mantém a lista viva via **realtime**: qualquer
 * mudança nas 4 tabelas refaz o fetch. Também refaz ao voltar o foco da aba.
 * Espelha o padrão de `src/hooks/useTasksData.ts`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchProjetos } from "./data";
import type { ProjetosData } from "./types";

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: ProjetosData };

const TABELAS = [
  "projects",
  "project_engineers",
  "weekly_reports",
  "teams",
  "team_members",
] as const;

export function useProjetosData(): { state: State; refetch: () => void } {
  const [state, setState] = useState<State>({ status: "loading" });
  const activeRef = useRef(true);

  const load = useCallback(() => {
    fetchProjetos()
      .then((data) => {
        if (activeRef.current) setState({ status: "ready", data });
      })
      .catch((err: unknown) => {
        if (activeRef.current)
          // Mantém dados já carregados em caso de falha de refetch.
          setState((prev) =>
            prev.status === "ready"
              ? prev
              : {
                  status: "error",
                  error: err instanceof Error ? err.message : String(err),
                },
          );
      });
  }, []);

  useEffect(() => {
    activeRef.current = true;
    load();

    const channel = supabase.channel("projetos-db");
    for (const table of TABELAS) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => load());
    }
    channel.subscribe();

    // Leitura exige sessão (RLS authenticated): quando ela chega/renova (herdada do
    // backoffice ou login de dev), refaz o fetch — o load inicial pode ter vindo vazio.
    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") load();
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      activeRef.current = false;
      supabase.removeChannel(channel);
      authSub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return { state, refetch: load };
}
