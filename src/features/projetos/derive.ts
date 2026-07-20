/** Cálculos puros sobre os projetos (progresso atual, tendência, agrupamentos). */

import type { Projeto, ProjetoStatus, RegistroSemanal } from "./types";

/** Ordem lógica dos status (não alfabética). */
export const STATUS_ORDER: ProjetoStatus[] = [
  "in_progress",
  "testing",
  "refinement",
  "discovery",
  "blocked",
  "paused",
  "done",
];

export const STATUS_META: Record<
  ProjetoStatus,
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
export function quarterDe(date: Date): string {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${q}`;
}

/** Rótulo curto de um quarter ("2026-Q3" → "Q3 2026"). */
export function quarterLabel(q: string): string {
  const [ano, qn] = q.split("-");
  return `${qn} ${ano}`;
}

/** Quarters presentes nos projetos + o atual, em ordem decrescente (recente primeiro). */
export function quartersDisponiveis(projetos: Projeto[], atual: string): string[] {
  const set = new Set(projetos.map((p) => p.quarter));
  set.add(atual);
  return [...set].sort((a, b) => b.localeCompare(a));
}

/** Rótulo de prioridade/importância por nível 1–5. */
export const PRIORIDADE_LABEL: Record<number, string> = {
  5: "Máxima",
  4: "Alta",
  3: "Média",
  2: "Baixa",
  1: "Mínima",
};

export function prioridadeMeta(n: number): { nivel: number; label: string } {
  const nivel = Math.max(1, Math.min(5, Math.round(n)));
  return { nivel, label: PRIORIDADE_LABEL[nivel] };
}

/** Metadados de saúde (on-tracking) por nota 1–5. */
export const SAUDE_META: Record<number, { label: string; color: string }> = {
  5: { label: "On tracking", color: "#10b981" }, // emerald
  4: { label: "No caminho", color: "#22c55e" }, // green
  3: { label: "Atenção", color: "#f59e0b" }, // amber
  2: { label: "Em risco", color: "#f97316" }, // orange
  1: { label: "Em perigo", color: "#ef4444" }, // red
};

/** Normaliza e resolve os metadados de uma nota de saúde (arredonda, clampa 1–5). */
export function saudeMeta(n: number): { nivel: number; label: string; color: string } {
  const nivel = Math.max(1, Math.min(5, Math.round(n)));
  return { nivel, ...SAUDE_META[nivel] };
}

/** Registros ordenados por semana (mais antigo → mais recente). */
export function registrosOrdenados(p: Projeto): RegistroSemanal[] {
  return [...p.registros].sort((a, b) => a.semana.localeCompare(b.semana));
}

/** Último registro (o "atual"), ou `undefined` se não houver nenhum. */
export function ultimoRegistro(p: Projeto): RegistroSemanal | undefined {
  const rs = registrosOrdenados(p);
  return rs[rs.length - 1];
}

/** Progresso atual (0–100), 0 se não houver registro. */
export function progressoAtual(p: Projeto): number {
  return ultimoRegistro(p)?.progresso ?? 0;
}

/** Status ainda sem execução real — fora da conta de Progresso. */
export const STATUS_FORA_DO_PROGRESSO: ProjetoStatus[] = ["discovery", "refinement"];

/**
 * Se o projeto entra na conta de Progresso do panorama. Exclui os status
 * `discovery` e `refinement` (ainda não há execução), para não puxarem a
 * média para baixo com 0%.
 */
export function contaNoProgresso(p: Projeto): boolean {
  return !STATUS_FORA_DO_PROGRESSO.includes(p.status);
}

/**
 * Saúde atual (1–5), do último registro **real** (sem `marco`). `null` quando o
 * projeto só tem marcos (início/fim/info) — nesse caso não entra na conta de
 * on-tracking (média ponderada, distribuição): é filtrado, não conta como neutro.
 */
export function saudeAtual(p: Projeto): number | null {
  const rs = registrosOrdenados(p);
  for (let i = rs.length - 1; i >= 0; i--) {
    if (!rs[i].marco) return rs[i].saude;
  }
  return null;
}

/**
 * Variação do progresso entre os dois últimos registros. `null` quando há
 * menos de dois registros (sem base de comparação ainda).
 */
export function tendencia(p: Projeto): number | null {
  // Marcos (início/fim) não são medições semanais — não contam na variação.
  const rs = registrosOrdenados(p).filter((r) => !r.marco);
  if (rs.length < 2) return null;
  return rs[rs.length - 1].progresso - rs[rs.length - 2].progresso;
}

export interface GrupoEngenheiro {
  /** Chave de agrupamento: e-mail, ou "sem-dono". */
  key: string;
  nome: string;
  email: string | null;
  projetos: Projeto[];
  /** Média do progresso atual dos projetos do engenheiro. */
  progressoMedio: number;
}

/** Agrupa projetos por engenheiro (sem dono vai para o fim). */
export function porEngenheiro(projetos: Projeto[]): GrupoEngenheiro[] {
  const mapa = new Map<string, GrupoEngenheiro>();
  for (const p of projetos) {
    const key = p.engenheiroEmail ?? "sem-dono";
    let g = mapa.get(key);
    if (!g) {
      g = {
        key,
        nome: p.engenheiroNome ?? "Sem engenheiro",
        email: p.engenheiroEmail,
        projetos: [],
        progressoMedio: 0,
      };
      mapa.set(key, g);
    }
    g.projetos.push(p);
  }
  const grupos = [...mapa.values()];
  for (const g of grupos) {
    g.progressoMedio = Math.round(
      g.projetos.reduce((acc, p) => acc + progressoAtual(p), 0) / g.projetos.length,
    );
  }
  // Com dono primeiro (por nome), "sem dono" por último.
  return grupos.sort((a, b) => {
    if ((a.email === null) !== (b.email === null)) return a.email === null ? 1 : -1;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

/** Média do progresso atual de uma lista de projetos (0 se vazia). */
export function progressoMedio(projetos: Projeto[]): number {
  if (projetos.length === 0) return 0;
  return Math.round(
    projetos.reduce((acc, p) => acc + progressoAtual(p), 0) / projetos.length,
  );
}

/** Soma dos pesos de prioridade (usada como denominador nas médias ponderadas). */
function pesoTotal(projetos: Projeto[]): number {
  return projetos.reduce((acc, p) => acc + Math.max(1, p.prioridade), 0);
}

/** Progresso médio ponderado pela prioridade/importância (0 se vazia). */
export function progressoMedioPonderado(projetos: Projeto[]): number {
  const w = pesoTotal(projetos);
  if (w === 0) return 0;
  return Math.round(
    projetos.reduce((acc, p) => acc + progressoAtual(p) * Math.max(1, p.prioridade), 0) / w,
  );
}

/**
 * Saúde média ponderada pela prioridade (1 casa decimal; 0 se ninguém tiver
 * saúde). Projetos sem saúde (só marcos) são **ignorados** — não entram no peso.
 */
export function saudeMediaPonderada(projetos: Projeto[]): number {
  let soma = 0;
  let w = 0;
  for (const p of projetos) {
    const s = saudeAtual(p);
    if (s === null) continue;
    const peso = Math.max(1, p.prioridade);
    soma += s * peso;
    w += peso;
  }
  if (w === 0) return 0;
  return Math.round((soma / w) * 10) / 10;
}

/** Ordena projetos: status (STATUS_ORDER), depois maior progresso, depois nome. */
export function ordenarProjetos(projetos: Projeto[]): Projeto[] {
  return [...projetos].sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(a.status);
    const sb = STATUS_ORDER.indexOf(b.status);
    if (sa !== sb) return sa - sb;
    const pa = progressoAtual(a);
    const pb = progressoAtual(b);
    if (pa !== pb) return pb - pa;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}
