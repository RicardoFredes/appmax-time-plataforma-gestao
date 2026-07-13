/**
 * Normalização de status do Jira em categorias amigáveis (pt-BR).
 * Paleta coesa (tons Tailwind) alinhada ao tema roxo da Appmax:
 * - `solid`: cor cheia (ticker, bolinhas do Kanban);
 * - `bg`/`text`: badge "soft" (fundo tinto claro + texto forte), calmo no tema neutro.
 * Progressão fria → ativa → concluída.
 */

export type StatusKey =
  | "Backlog"
  | "A fazer"
  | "Em progresso"
  | "Em revisão"
  | "Em teste"
  | "Bloqueado"
  | "Concluído"
  | "Outro";

export const STATUS_ORDER: StatusKey[] = [
  "Backlog",
  "A fazer",
  "Em progresso",
  "Em revisão",
  "Em teste",
  "Bloqueado",
  "Concluído",
  "Outro",
];

type ColorSet = { solid: string; bg: string; text: string };

export const STATUS_META: Record<StatusKey, ColorSet> = {
  Backlog: { solid: "#64748b", bg: "#f1f5f9", text: "#475569" }, // slate
  "A fazer": { solid: "#0ea5e9", bg: "#e0f2fe", text: "#0369a1" }, // sky
  "Em progresso": { solid: "#6366f1", bg: "#e0e7ff", text: "#4338ca" }, // indigo
  "Em revisão": { solid: "#8b5cf6", bg: "#ede9fe", text: "#6d28d9" }, // violet (marca)
  "Em teste": { solid: "#f59e0b", bg: "#fef3c7", text: "#b45309" }, // amber
  Bloqueado: { solid: "#ef4444", bg: "#fee2e2", text: "#b91c1c" }, // red
  Concluído: { solid: "#10b981", bg: "#d1fae5", text: "#047857" }, // emerald
  Outro: { solid: "#a1a1aa", bg: "#f4f4f5", text: "#52525b" }, // zinc
};

/** Cor cheia por categoria (ticker, bolinhas). */
export const STATUS_COLORS: Record<StatusKey, string> = Object.fromEntries(
  STATUS_ORDER.map((k) => [k, STATUS_META[k].solid]),
) as Record<StatusKey, string>;

export function statusCategory(rawStatus: string): StatusKey {
  const s = (rawStatus || "").toString().toLowerCase();
  if (/done|conclu|finaliz/.test(s)) return "Concluído";
  if (/review|revis/.test(s)) return "Em revisão";
  if (/test|valida|homolog/.test(s)) return "Em teste";
  if (/progress|execu|desenvolv|building|andamento|doing/.test(s))
    return "Em progresso";
  if (/bloque|block|imped/.test(s)) return "Bloqueado";
  if (/backlog/.test(s)) return "Backlog";
  if (/to do|a fazer|abert|planej|defini|selected|todo/.test(s))
    return "A fazer";
  return "Outro";
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
  { id: "backlog", label: "Backlog", color: STATUS_META["Backlog"].solid },
  { id: "todo", label: "To Do", color: STATUS_META["A fazer"].solid },
  { id: "doing", label: "Doing", color: STATUS_META["Em progresso"].solid },
  { id: "done", label: "Done", color: STATUS_META["Concluído"].solid },
];

const LANE_BY_CATEGORY: Record<StatusKey, KanbanLane> = {
  Backlog: "backlog",
  "A fazer": "todo",
  "Em progresso": "doing",
  "Em revisão": "doing",
  "Em teste": "doing",
  Bloqueado: "doing",
  Concluído: "done",
  Outro: "todo",
};

export function kanbanLane(rawStatus: string): KanbanLane {
  return LANE_BY_CATEGORY[statusCategory(rawStatus)];
}
