/**
 * Estado dos filtros da página de Projetos serializado em query params.
 *
 * Padrão do projeto (ver `src/lib/route-sync.ts` e `src/features/tasks/url-state.ts`):
 * a **rota** fica no hash (`#/projetos/<id>`) e os **filtros** no query string, via
 * History API (`replaceState`), espelhados na URL do backoffice nos dois sentidos.
 * Aqui os params são `quarter` (ex.: `2026-Q3`) e `por` (agrupamento do relatório).
 *
 * Nota: os valores de `Grouping` (`prioridade`/`engenheiro`/`status`) e a chave `por`
 * são **contrato de URL** (linkáveis, espelhados no backoffice) — ficam em PT de propósito.
 */

/** Agrupamento do relatório. Valores viajam no query param `por` (contrato de URL). */
export type Grouping = "prioridade" | "engenheiro" | "status";

const GROUPINGS: Grouping[] = ["prioridade", "engenheiro", "status"];
const DEFAULT_GROUPING: Grouping = "prioridade";

export interface ProjectsUrlState {
  /** Quarter no param, ou `null` quando ausente (o componente resolve p/ o atual). */
  quarter: string | null;
  grouping: Grouping;
  /** Mostrar projetos concluídos (escondidos por padrão, como em Tarefas). */
  showDone: boolean;
  /** Ids dos engenheiros selecionados no filtro (vazio = todos). */
  engineers: string[];
}

export function parseProjectsState(search: string): ProjectsUrlState {
  const p = new URLSearchParams(search);
  const por = p.get("por");
  const engineersRaw = p.get("eng");
  return {
    quarter: p.get("quarter"),
    grouping: por && GROUPINGS.includes(por as Grouping) ? (por as Grouping) : DEFAULT_GROUPING,
    showDone: p.get("done") === "1",
    engineers: engineersRaw ? engineersRaw.split(",").filter(Boolean) : [],
  };
}

/**
 * Monta a query string refletindo o estado, **preservando** params que não são
 * desta página (ex.: `chrome`, filtros da aba Tarefas). Só grava o que difere do
 * padrão (quarter atual / `prioridade` / concluídos escondidos / sem filtro de
 * engenheiro), mantendo a URL limpa. Inclui o `?`.
 */
export function buildProjectsSearch(
  s: {
    quarter: string;
    grouping: Grouping;
    currentQuarter: string;
    showDone: boolean;
    engineers: string[];
  },
  currentSearch: string,
): string {
  const p = new URLSearchParams(currentSearch);
  if (s.quarter && s.quarter !== s.currentQuarter) p.set("quarter", s.quarter);
  else p.delete("quarter");
  if (s.grouping !== DEFAULT_GROUPING) p.set("por", s.grouping);
  else p.delete("por");
  if (s.showDone) p.set("done", "1");
  else p.delete("done");
  if (s.engineers.length) p.set("eng", s.engineers.join(","));
  else p.delete("eng");
  const str = p.toString();
  return str ? `?${str}` : "";
}
