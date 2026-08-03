/** Datas de uma tarefa: formatação curta e semântica do prazo (due date). */
import { differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Task } from "./types";

/** "12 mar 26" — compacto para caber na coluna; "—" quando não há data. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "dd MMM yy", { locale: ptBR });
}

/** `overdue` = prazo passou, `soon` = vence em até 2 dias. */
export type DueTone = "overdue" | "soon" | "normal";

/** Tom do prazo relativo a hoje. Concluídas nunca alarmam (já entregues). */
export function dueTone(task: Task, today = startOfDay(new Date())): DueTone {
  if (!task.dueDate || task.statusCategory === "done") return "normal";
  const due = parseISO(task.dueDate);
  if (Number.isNaN(due.getTime())) return "normal";
  const days = differenceInCalendarDays(startOfDay(due), today);
  if (days < 0) return "overdue";
  return days <= 2 ? "soon" : "normal";
}
