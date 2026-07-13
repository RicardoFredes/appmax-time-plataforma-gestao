/**
 * Serialização do estado do painel em query params, para links compartilháveis.
 * Sem router: usa URLSearchParams + History API (replaceState).
 */
import type { FiltersState } from "./TaskFilters";
import type { SortKey, SortState } from "./TasksTable";
import type { KanbanLane } from "./status";

export type View = "tasks" | "epic";
export type Layout = "table" | "kanban";

export interface PanelState {
  view: View;
  layout: Layout;
  filters: FiltersState;
  lane: KanbanLane | null;
  people: string[];
  showDone: boolean;
  sort: SortState;
}

const LANES: KanbanLane[] = ["backlog", "todo", "doing", "done"];
const SORT_KEYS: SortKey[] = ["assignee", "urgency", "status"];

export function parsePanelState(search: string): PanelState {
  const p = new URLSearchParams(search);

  const laneRaw = p.get("lane") as KanbanLane | null;
  const lane = laneRaw && LANES.includes(laneRaw) ? laneRaw : null;

  let sort: SortState = null;
  const sortRaw = p.get("sort");
  if (sortRaw) {
    const [key, dir] = sortRaw.split(":");
    if (SORT_KEYS.includes(key as SortKey) && (dir === "asc" || dir === "desc")) {
      sort = { key: key as SortKey, dir };
    }
  }

  const peopleRaw = p.get("people");

  return {
    view: p.get("view") === "epic" ? "epic" : "tasks",
    layout: p.get("layout") === "kanban" ? "kanban" : "table",
    filters: {
      search: p.get("q") ?? "",
      board: p.get("board") ?? "",
      status: p.get("status") ?? "",
      urgency: p.get("urgency") ?? "",
    },
    lane,
    people: peopleRaw ? peopleRaw.split(",").filter(Boolean) : [],
    showDone: p.get("done") === "1",
    sort,
  };
}

/** Monta a query string (só com o que difere do padrão), incluindo o "?". */
export function buildSearch(s: PanelState): string {
  const p = new URLSearchParams();
  if (s.view !== "tasks") p.set("view", s.view);
  if (s.layout !== "table") p.set("layout", s.layout);
  if (s.filters.search) p.set("q", s.filters.search);
  if (s.filters.board) p.set("board", s.filters.board);
  if (s.filters.status) p.set("status", s.filters.status);
  if (s.filters.urgency) p.set("urgency", s.filters.urgency);
  if (s.lane) p.set("lane", s.lane);
  if (s.people.length) p.set("people", s.people.join(","));
  if (s.showDone) p.set("done", "1");
  if (s.sort) p.set("sort", `${s.sort.key}:${s.sort.dir}`);
  const str = p.toString();
  return str ? `?${str}` : "";
}
