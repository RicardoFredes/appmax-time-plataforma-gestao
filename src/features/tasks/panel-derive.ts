/** Lógica pura do painel de tarefas: constantes, comparadores e facetas. */
import type { FiltersState } from "./TaskFilters";
import type { SortKey } from "./TasksTable";
import { STATUS_ORDER, kanbanLane, statusCategory } from "./status";
import { URGENCY_META } from "./urgency";
import type { Task } from "./types";

export const EMPTY_FILTERS: FiltersState = {
  search: "",
  board: "",
  status: "",
  urgency: "",
};

/** Id sentinela para o chip "Não atribuído" no filtro de responsável. */
export const UNASSIGNED = "__unassigned__";

/** Peso lógico da urgência (Alta < Média < Baixa; sem urgência por último). */
function urgencyRank(t: Task): number {
  return t.urgency ? URGENCY_META[t.urgency].rank : 99;
}
/** Peso lógico do status pelo fluxo (não alfabético). */
function statusRank(t: Task): number {
  const i = STATUS_ORDER.indexOf(statusCategory(t.status));
  return i < 0 ? 99 : i;
}
export function compareBy(key: SortKey, a: Task, b: Task): number {
  if (key === "assignee")
    return a.assigneeName.localeCompare(b.assigneeName, "pt-BR");
  if (key === "urgency") return urgencyRank(a) - urgencyRank(b);
  return statusRank(a) - statusRank(b);
}

export interface PeopleChip {
  id: string;
  label: string;
  title: string;
  count: number;
}

export interface Facets {
  people: PeopleChip[];
  boards: string[];
  statuses: string[];
  laneCounts: Record<string, number>;
}

/** Calcula as facetas (chips de pessoas, boards, status, contagem por lane). */
export function computeFacets(base: Task[], teamByEmail: Map<string, string>): Facets {
  const peopleCounts = new Map<string, number>();
  const boards = new Set<string>();
  const statuses = new Set<string>();
  const laneCounts: Record<string, number> = {};
  let unassignedCount = 0;
  for (const t of base) {
    // Só conta pessoas do time (por e-mail) e as não-atribuídas.
    if (t.assigneeName === "Não atribuída") {
      unassignedCount++;
    } else if (teamByEmail.has(t.assigneeEmail)) {
      peopleCounts.set(t.assigneeEmail, (peopleCounts.get(t.assigneeEmail) ?? 0) + 1);
    }
    if (t.board) boards.add(t.board);
    if (t.status) statuses.add(t.status);
    const l = kanbanLane(t.status);
    laneCounts[l] = (laneCounts[l] ?? 0) + 1;
  }
  const teamChips: PeopleChip[] = [...peopleCounts.entries()]
    .map(([email, count]) => ({
      id: email,
      label: (teamByEmail.get(email) ?? email).split(" ")[0],
      title: teamByEmail.get(email) ?? email,
      count,
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
  const people =
    unassignedCount > 0
      ? [
          { id: UNASSIGNED, label: "Não atribuído", title: "Não atribuído", count: unassignedCount },
          ...teamChips,
        ]
      : teamChips;
  return {
    people,
    boards: [...boards].sort((a, b) => a.localeCompare(b, "pt-BR")),
    statuses: [...statuses].sort((a, b) => a.localeCompare(b, "pt-BR")),
    laneCounts,
  };
}
