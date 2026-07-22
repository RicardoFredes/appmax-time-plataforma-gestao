/** Contrato do controle de projetos (fonte: Supabase; ver `data.ts`). */

export type ProjectStatus =
  | "discovery"
  | "refinement"
  | "in_progress"
  | "testing"
  | "blocked"
  | "paused"
  | "done";

/**
 * Engenheiro = usuário do sistema (`public.profiles` do backoffice). Identidade
 * por `id` (uuid do auth.users); nome/avatar só para exibição.
 */
export interface Engineer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** Time (`public.teams`). Projetos pertencem a um time; engenheiros são membros dele. */
export interface Team {
  id: string;
  slug: string;
  name: string;
}

/** Tipo de marco (app = banco, sem tradução): início/fim (bandeira) e info. */
export type Milestone = "start" | "end" | "info";

/**
 * Conteúdo de um registro de evolução (o que se escreve/edita). Reportes têm
 * **data livre** — qualquer dia, vários no mesmo dia (não são mais semanais).
 */
export interface ReportInput {
  /** Data do reporte, `YYYY-MM-DD`. */
  date: string;
  /** Progresso acumulado, 0–100. */
  progress: number;
  /** Saúde do projeto: 1 (em perigo) a 5 (on tracking). Ignorada em marcos. */
  health: number;
  /** Nota livre sobre como andou o projeto. */
  note: string;
  /**
   * Marco opcional — registro que **não tem saúde/on-tracking** (a `health` é
   * ignorada): `start`/`end` demarcam o começo/término do projeto (ícone de
   * bandeira); `info` é uma atualização puramente informativa (ícone de info).
   */
  milestone?: Milestone;
}

/** Um registro de evolução já persistido (com `id` e momento de criação). */
export interface Report extends ReportInput {
  /** Identificador único (uuid do banco). */
  id: string;
  /** Momento de criação (ISO) — desempata a ordem de vários reportes no mesmo dia. */
  createdAt: string;
}

export interface Project {
  /** Slug estável, usado na URL de detalhe (`#/projetos/<id>`). */
  id: string;
  /** Código curto de exibição (ex.: "P01"). */
  code: string;
  name: string;
  /** Engenheiros do projeto (N:N, todos iguais). Vazio = sem dono. */
  engineers: Engineer[];
  /** Data de início `YYYY-MM-DD`, ou `null`. */
  startDate: string | null;
  /** Previsão de término `YYYY-MM-DD`, ou `null` se sem data definida. */
  dueDate: string | null;
  /** Data de fechamento real `YYYY-MM-DD`, ou `null` enquanto aberto. */
  closedDate: string | null;
  status: ProjectStatus;
  /** Time dono do projeto (`teams.id`), ou `null` se sem time. */
  teamId: string | null;
  /** Importância/prioridade: 1 (mínima) a 5 (máxima). Peso nas métricas gerais. */
  priority: number;
  /** Quarter ao qual o projeto pertence, ex.: "2026-Q3". */
  quarter: string;
  description: string;
  reports: Report[];
}

export interface ProjectsData {
  projects: Project[];
}
