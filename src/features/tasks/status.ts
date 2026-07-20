/**
 * Normalização de status do Jira em categorias internas (chaves em inglês,
 * padronizadas com Projetos — ver src/features/projetos/derive.ts).
 * Paleta coesa (tons Tailwind) alinhada ao tema roxo da Appmax:
 * - `solid`: cor cheia (ticker, bolinhas do Kanban);
 * - `bg`/`text`: badge "soft" (fundo tinto claro + texto forte), calmo no tema neutro.
 * Progressão fria → ativa → concluída. O texto por tarefa exibido na UI é o status
 * **cru do Jira** (`Task.status`); estas categorias servem à cor/ordenação/lanes.
 */

export type StatusKey =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "testing"
  | "blocked"
  | "done"
  | "other";

export const STATUS_ORDER: StatusKey[] = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "testing",
  "blocked",
  "done",
  "other",
];

type ColorSet = { label: string; solid: string; bg: string; text: string };

export const STATUS_META: Record<StatusKey, ColorSet> = {
  backlog: { label: "Backlog", solid: "#64748b", bg: "#f1f5f9", text: "#475569" }, // slate
  todo: { label: "To Do", solid: "#0ea5e9", bg: "#e0f2fe", text: "#0369a1" }, // sky
  in_progress: { label: "In Progress", solid: "#6366f1", bg: "#e0e7ff", text: "#4338ca" }, // indigo
  in_review: { label: "In Review", solid: "#8b5cf6", bg: "#ede9fe", text: "#6d28d9" }, // violet (marca)
  testing: { label: "Testing", solid: "#f59e0b", bg: "#fef3c7", text: "#b45309" }, // amber
  blocked: { label: "Blocked", solid: "#ef4444", bg: "#fee2e2", text: "#b91c1c" }, // red
  done: { label: "Done", solid: "#10b981", bg: "#d1fae5", text: "#047857" }, // emerald
  other: { label: "Other", solid: "#a1a1aa", bg: "#f4f4f5", text: "#52525b" }, // zinc
};

/** Cor cheia por categoria (ticker, bolinhas). */
export const STATUS_COLORS: Record<StatusKey, string> = Object.fromEntries(
  STATUS_ORDER.map((k) => [k, STATUS_META[k].solid]),
) as Record<StatusKey, string>;

export function statusCategory(rawStatus: string): StatusKey {
  const s = (rawStatus || "").toString().toLowerCase();
  if (/done|conclu|finaliz/.test(s)) return "done";
  if (/review|revis/.test(s)) return "in_review";
  if (/test|valida|homolog/.test(s)) return "testing";
  if (/progress|execu|desenvolv|building|andamento|doing/.test(s))
    return "in_progress";
  if (/bloque|block|imped/.test(s)) return "blocked";
  if (/backlog/.test(s)) return "backlog";
  if (/to do|a fazer|abert|planej|defini|selected|todo/.test(s))
    return "todo";
  return "other";
}

export function statusColor(rawStatus: string): string {
  return STATUS_META[statusCategory(rawStatus)].solid;
}

/** Estilo do badge "soft" de status (fundo claro + texto forte). */
export function statusBadgeStyle(rawStatus: string): {
  backgroundColor: string;
  color: string;
} {
  const m = STATUS_META[statusCategory(rawStatus)];
  return { backgroundColor: m.bg, color: m.text };
}

/* ------------------------------------------------------------------ *
 * Kanban: colapsa as 8 categorias em 4 lanes.
 * ------------------------------------------------------------------ */

export type KanbanLane = "backlog" | "todo" | "doing" | "done";

export const KANBAN_LANES: {
  id: KanbanLane;
  label: string;
  color: string;
}[] = [
  { id: "backlog", label: "Backlog", color: STATUS_META.backlog.solid },
  { id: "todo", label: "To Do", color: STATUS_META.todo.solid },
  { id: "doing", label: "Doing", color: STATUS_META.in_progress.solid },
  { id: "done", label: "Done", color: STATUS_META.done.solid },
];

const LANE_BY_CATEGORY: Record<StatusKey, KanbanLane> = {
  backlog: "backlog",
  todo: "todo",
  in_progress: "doing",
  in_review: "doing",
  testing: "doing",
  blocked: "doing",
  done: "done",
  other: "todo",
};

export function kanbanLane(rawStatus: string): KanbanLane {
  return LANE_BY_CATEGORY[statusCategory(rawStatus)];
}
