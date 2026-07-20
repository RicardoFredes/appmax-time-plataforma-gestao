/**
 * Estado dos filtros da página de Projetos serializado em query params.
 *
 * Padrão do projeto (ver `src/lib/route-sync.ts` e `src/features/tasks/url-state.ts`):
 * a **rota** fica no hash (`#/projetos/<id>`) e os **filtros** no query string, via
 * History API (`replaceState`), espelhados na URL do backoffice nos dois sentidos.
 * Aqui os params são `quarter` (ex.: `2026-Q3`) e `por` (agrupamento do relatório).
 */
import type { Dimensao } from "./ProjetosPage";

const DIMENSOES: Dimensao[] = ["prioridade", "engenheiro", "status"];
const DIM_DEFAULT: Dimensao = "prioridade";

export interface ProjetosUrlState {
  /** Quarter no param, ou `null` quando ausente (o componente resolve p/ o atual). */
  quarter: string | null;
  dim: Dimensao;
}

export function parseProjetosState(search: string): ProjetosUrlState {
  const p = new URLSearchParams(search);
  const por = p.get("por");
  return {
    quarter: p.get("quarter"),
    dim: por && DIMENSOES.includes(por as Dimensao) ? (por as Dimensao) : DIM_DEFAULT,
  };
}

/**
 * Monta a query string refletindo o estado, **preservando** params que não são
 * desta página (ex.: `chrome`, filtros da aba Tarefas). Só grava o que difere do
 * padrão (quarter atual / `prioridade`), mantendo a URL limpa. Inclui o `?`.
 */
export function buildProjetosSearch(
  s: { quarter: string; dim: Dimensao; quarterAtual: string },
  currentSearch: string,
): string {
  const p = new URLSearchParams(currentSearch);
  if (s.quarter && s.quarter !== s.quarterAtual) p.set("quarter", s.quarter);
  else p.delete("quarter");
  if (s.dim !== DIM_DEFAULT) p.set("por", s.dim);
  else p.delete("por");
  const str = p.toString();
  return str ? `?${str}` : "";
}
