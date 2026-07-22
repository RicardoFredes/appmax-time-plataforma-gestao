/** Cálculos puros sobre os projetos (progresso atual, tendência, agrupamentos). */

import type { Project, ProjectStatus, Report } from "./types";

/** Ordem lógica dos status (não alfabética). */
export const STATUS_ORDER: ProjectStatus[] = [
  "in_progress",
  "testing",
  "refinement",
  "discovery",
  "blocked",
  "paused",
  "done",
];

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string; badge: "default" | "info" | "secondary" | "destructive" | "warning" | "success" }
> = {
  discovery: { label: "Discovery", color: "#94a3b8", badge: "secondary" }, // slate
  refinement: { label: "Refinement", color: "#a78bfa", badge: "default" }, // violet
  in_progress: { label: "In Progress", color: "#9b6afa", badge: "default" }, // roxo Appmax
  testing: { label: "Testing", color: "#0ea5e9", badge: "info" }, // sky
  blocked: { label: "Blocked", color: "#ef4444", badge: "destructive" }, // red
  paused: { label: "Paused", color: "#f59e0b", badge: "warning" }, // amber
  done: { label: "Done", color: "#10b981", badge: "success" }, // emerald
};

/** Quarter (ex.: "2026-Q3") de uma data. */
export function quarterOf(date: Date): string {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${q}`;
}

/** Rótulo curto de um quarter ("2026-Q3" → "Q3 2026"). */
export function quarterLabel(q: string): string {
  const [year, qn] = q.split("-");
  return `${qn} ${year}`;
}

/** Quarters presentes nos projetos + o atual, em ordem decrescente (recente primeiro). */
export function availableQuarters(projects: Project[], current: string): string[] {
  const set = new Set(projects.map((p) => p.quarter));
  set.add(current);
  return [...set].sort((a, b) => b.localeCompare(a));
}

/** Rótulo de prioridade/importância por nível 1–5. */
export const PRIORITY_LABEL: Record<number, string> = {
  5: "Máxima",
  4: "Alta",
  3: "Média",
  2: "Baixa",
  1: "Mínima",
};

export function priorityMeta(n: number): { level: number; label: string } {
  const level = Math.max(1, Math.min(5, Math.round(n)));
  return { level, label: PRIORITY_LABEL[level] };
}

/** Metadados de saúde (on-tracking) por nota 1–5. */
export const HEALTH_META: Record<number, { label: string; color: string }> = {
  5: { label: "On tracking", color: "#10b981" }, // emerald
  4: { label: "No caminho", color: "#22c55e" }, // green
  3: { label: "Atenção", color: "#f59e0b" }, // amber
  2: { label: "Em risco", color: "#f97316" }, // orange
  1: { label: "Em perigo", color: "#ef4444" }, // red
};

/** Normaliza e resolve os metadados de uma nota de saúde (arredonda, clampa 1–5). */
export function healthMeta(n: number): { level: number; label: string; color: string } {
  const level = Math.max(1, Math.min(5, Math.round(n)));
  return { level, ...HEALTH_META[level] };
}

/** Registros ordenados por data (mais antigo → mais recente); desempata por criação. */
export function sortedReports(p: Project): Report[] {
  return [...p.reports].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  );
}

/** Último registro (o "atual"), ou `undefined` se não houver nenhum. */
export function lastReport(p: Project): Report | undefined {
  const rs = sortedReports(p);
  return rs[rs.length - 1];
}

/** Progresso atual (0–100), 0 se não houver registro. */
export function currentProgress(p: Project): number {
  return lastReport(p)?.progress ?? 0;
}

/** Status ainda sem execução real — fora da conta de Progresso. */
export const STATUS_EXCLUDED_FROM_PROGRESS: ProjectStatus[] = ["discovery", "refinement"];

/**
 * Se o projeto entra na conta de Progresso do panorama. Exclui os status
 * `discovery` e `refinement` (ainda não há execução), para não puxarem a
 * média para baixo com 0%.
 */
export function countsInProgress(p: Project): boolean {
  return !STATUS_EXCLUDED_FROM_PROGRESS.includes(p.status);
}

/**
 * Saúde atual (1–5), do último registro **real** (sem `milestone`). `null` quando o
 * projeto só tem marcos (start/end/info) — nesse caso não entra na conta de
 * on-tracking (média ponderada, distribuição): é filtrado, não conta como neutro.
 */
export function currentHealth(p: Project): number | null {
  const rs = sortedReports(p);
  for (let i = rs.length - 1; i >= 0; i--) {
    if (!rs[i].milestone) return rs[i].health;
  }
  return null;
}

/**
 * Variação do progresso entre os dois últimos registros. `null` quando há
 * menos de dois registros (sem base de comparação ainda).
 */
export function trend(p: Project): number | null {
  // Marcos (start/end) não são medições semanais — não contam na variação.
  const rs = sortedReports(p).filter((r) => !r.milestone);
  if (rs.length < 2) return null;
  return rs[rs.length - 1].progress - rs[rs.length - 2].progress;
}

export interface EngineerGroup {
  /** Chave de agrupamento: id do engenheiro (uuid), ou "sem-dono". */
  key: string;
  name: string;
  /** `null` no grupo "sem dono". */
  avatarUrl: string | null;
  hasOwner: boolean;
  projects: Project[];
  /** Média do progresso atual dos projetos do engenheiro. */
  avgProgress: number;
}

/**
 * Agrupa projetos por engenheiro (sem dono vai para o fim). Como um projeto pode
 * ter vários engenheiros (N:N), ele aparece em **cada** grupo dos seus engenheiros;
 * projeto sem engenheiro cai no grupo "sem-dono".
 */
export function byEngineer(projects: Project[]): EngineerGroup[] {
  const map = new Map<string, EngineerGroup>();
  const push = (
    key: string,
    name: string,
    avatarUrl: string | null,
    hasOwner: boolean,
    p: Project,
  ) => {
    let g = map.get(key);
    if (!g) {
      g = { key, name, avatarUrl, hasOwner, projects: [], avgProgress: 0 };
      map.set(key, g);
    }
    g.projects.push(p);
  };
  for (const p of projects) {
    if (p.engineers.length === 0) {
      push("sem-dono", "Sem engenheiro", null, false, p);
    } else {
      for (const e of p.engineers) push(e.id, e.name, e.avatarUrl, true, p);
    }
  }
  const groups = [...map.values()];
  for (const g of groups) {
    g.avgProgress = Math.round(
      g.projects.reduce((acc, p) => acc + currentProgress(p), 0) / g.projects.length,
    );
  }
  // Com dono primeiro (por nome), "sem dono" por último.
  return groups.sort((a, b) => {
    if (a.hasOwner !== b.hasOwner) return a.hasOwner ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

/** Média do progresso atual de uma lista de projetos (0 se vazia). */
export function avgProgress(projects: Project[]): number {
  if (projects.length === 0) return 0;
  return Math.round(
    projects.reduce((acc, p) => acc + currentProgress(p), 0) / projects.length,
  );
}

/** Soma dos pesos de prioridade (usada como denominador nas médias ponderadas). */
function totalWeight(projects: Project[]): number {
  return projects.reduce((acc, p) => acc + Math.max(1, p.priority), 0);
}

/** Progresso médio ponderado pela prioridade/importância (0 se vazia). */
export function weightedAvgProgress(projects: Project[]): number {
  const w = totalWeight(projects);
  if (w === 0) return 0;
  return Math.round(
    projects.reduce((acc, p) => acc + currentProgress(p) * Math.max(1, p.priority), 0) / w,
  );
}

/**
 * Saúde média ponderada pela prioridade (1 casa decimal; 0 se ninguém tiver
 * saúde). Projetos sem saúde (só marcos) são **ignorados** — não entram no peso.
 */
export function weightedAvgHealth(projects: Project[]): number {
  let sum = 0;
  let w = 0;
  for (const p of projects) {
    const s = currentHealth(p);
    if (s === null) continue;
    const weight = Math.max(1, p.priority);
    sum += s * weight;
    w += weight;
  }
  if (w === 0) return 0;
  return Math.round((sum / w) * 10) / 10;
}

/** Ordena projetos: status (STATUS_ORDER), depois maior progresso, depois nome. */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(a.status);
    const sb = STATUS_ORDER.indexOf(b.status);
    if (sa !== sb) return sa - sb;
    const pa = currentProgress(a);
    const pb = currentProgress(b);
    if (pa !== pb) return pb - pa;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}
