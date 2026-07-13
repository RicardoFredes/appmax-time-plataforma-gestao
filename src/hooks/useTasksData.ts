import { useEffect, useState } from "react";
import type { TasksData } from "@/features/tasks/types";

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: TasksData };

/** Carrega o arquivo gerado pelo sync (`public/data/tasks.json`). */
export function useTasksData(): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.BASE_URL}data/tasks.json?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<TasksData>;
      })
      .then((data) => {
        if (active) setState({ status: "ready", data });
      })
      .catch((err: unknown) => {
        if (active)
          setState({
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
