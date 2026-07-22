import { useCallback, useEffect, useRef, useState } from "react";
import type { TasksData } from "@/features/tasks/types";

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: TasksData };

/**
 * Carrega os dados das tarefas. Em produção lê a Pages Function `/api/tasks`
 * (cache dinâmico em KV, atualizado a partir do Jira). Se ela não existir
 * (ex.: `pnpm dev` puro, sem Wrangler), cai no arquivo estático gerado pelo
 * `pnpm sync` (`public/data/tasks.json`). Refaz o fetch quando a aba volta ao
 * foco, para refletir a revalidação em background.
 */
async function loadTasksData(): Promise<TasksData> {
  const bust = `?t=${Date.now()}`;
  try {
    const res = await fetch(`/api/tasks${bust}`);
    if (res.ok) return (await res.json()) as TasksData;
  } catch {
    // rede/endpoint indisponível -> tenta o arquivo estático abaixo.
  }
  const res = await fetch(`${import.meta.env.BASE_URL}data/tasks.json${bust}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as TasksData;
}

export function useTasksData(): { state: State; refreshing: boolean; refetch: () => void } {
  const [state, setState] = useState<State>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const activeRef = useRef(true);

  const load = useCallback(() => {
    setRefreshing(true);
    loadTasksData()
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
      })
      .finally(() => {
        if (activeRef.current) setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    activeRef.current = true;
    load();

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      activeRef.current = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return { state, refreshing, refetch: load };
}
