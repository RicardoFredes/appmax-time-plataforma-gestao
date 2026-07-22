/** Métricas do panorama + resumo da sustentação (cálculos puros do relatório). */
import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";
import { scheduleForAll } from "@/features/sustentacao/schedule";
import { GROUP_ACCENT } from "@/features/sustentacao/SustentacaoPage";
import type { SustentacaoData } from "@/features/tasks/types";
import {
  currentHealth,
  currentProgress,
  countsInProgress,
  weightedAvgHealth,
  weightedAvgProgress,
} from "./derive";
import type { Project } from "./types";

export interface Metrics {
  weightedProgress: number;
  simpleProgress: number;
  /** Quantos projetos entram na conta de progresso (exceto discovery/refinement). */
  countedProjects: number;
  weightedHealth: number;
  atRisk: number;
  warning: number;
  onTrack: number;
  overdue: number;
}

export function computeMetrics(projects: Project[], today: Date): Metrics {
  const isOverdue = (p: Project) =>
    p.dueDate &&
    p.status !== "done" &&
    differenceInCalendarDays(startOfDay(parseISO(p.dueDate)), today) < 0;
  // Progresso ignora discovery/refinement (ainda sem execução real).
  const counted = projects.filter(countsInProgress);
  const simple = counted.length
    ? Math.round(counted.reduce((s, p) => s + currentProgress(p), 0) / counted.length)
    : 0;
  return {
    weightedProgress: weightedAvgProgress(counted),
    simpleProgress: simple,
    countedProjects: counted.length,
    weightedHealth: weightedAvgHealth(projects),
    // Projetos sem saúde (só marcos) não entram em nenhuma faixa da distribuição.
    atRisk: projects.filter((p) => (currentHealth(p) ?? 3) <= 2).length,
    warning: projects.filter((p) => currentHealth(p) === 3).length,
    onTrack: projects.filter((p) => (currentHealth(p) ?? 0) >= 4).length,
    overdue: projects.filter(isOverdue).length,
  };
}

export interface DutyItem {
  group: number;
  scope: string;
  name: string;
  coveringFor: string | null;
  uncovered: boolean;
  color: string;
}

/** Nome + escopo de quem está de plantão nesta semana, por grupo. */
export function dutySummary(sustentacao: SustentacaoData | undefined): DutyItem[] {
  if (!sustentacao) return [];
  return scheduleForAll(sustentacao, new Date()).map((g, i) => ({
    group: g.grupo,
    scope: g.escopo,
    name: g.current?.effective.name ?? "—",
    coveringFor: g.current?.coveringFor?.name ?? null,
    uncovered: g.current?.uncovered ?? false,
    color: GROUP_ACCENT[i % GROUP_ACCENT.length],
  }));
}

/** Comparador dentro de um grupo: prioridade desc, pior saúde primeiro, nome. */
export function compareProjects(a: Project, b: Project): number {
  if (b.priority !== a.priority) return b.priority - a.priority;
  // Sem saúde (só marcos) ordena como neutro (3).
  const s = (currentHealth(a) ?? 3) - (currentHealth(b) ?? 3);
  if (s !== 0) return s;
  return a.name.localeCompare(b.name, "pt-BR");
}
