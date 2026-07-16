/**
 * Espelho do contrato em `src/features/tasks/types.ts`.
 * Mantenha as duas definições em sincronia.
 */

export type StatusCategory = "new" | "indeterminate" | "done";
export type TaskSource = "assignee" | "epic";
export type Urgency = "alta" | "media" | "baixa";

export interface Task {
  key: string;
  url: string;
  summary: string;
  description: string;
  board: string;
  projectKey: string;
  issueType: string;
  status: string;
  statusCategory: StatusCategory;
  priority: string;
  assigneeName: string;
  assigneeEmail: string;
  epicKey: string | null;
  epicSummary: string | null;
  labels: string[];
  created: string;
  updated: string;
  sources: TaskSource[];
  urgency: Urgency | null;
}

export interface TrackedUser {
  email: string;
  name: string;
}

export interface TrackedEpic {
  key: string;
  summary: string;
  board: string;
}

/** Um engenheiro na ordem do rodízio de sustentação. */
export interface SustentacaoEngineer {
  email: string;
  name: string;
}

export interface SustentacaoGroup {
  grupo: number;
  escopo: string;
  /** Engenheiros na ordem do rodízio; o primeiro assume no `anchorMonday`. */
  engenheiros: SustentacaoEngineer[];
}

/** Período de férias/ausência (datas YYYY-MM-DD, inclusivas). */
export interface Vacation {
  email: string;
  name: string;
  inicio: string;
  fim: string;
}

export interface SustentacaoData {
  /** Segunda-feira (YYYY-MM-DD) em que o 1º engenheiro de cada grupo assume. */
  anchorMonday: string;
  semanasPorEngenheiro: number;
  grupos: SustentacaoGroup[];
  ferias: Vacation[];
}

export interface TasksData {
  generatedAt: string;
  tasks: Task[];
  users: TrackedUser[];
  epics: TrackedEpic[];
  boards: string[];
  sustentacao: SustentacaoData;
}

/** Usuário do config.json, com o grupo de sustentação (-1 = fora da escala). */
export interface ConfigUser extends TrackedUser {
  sustentacaoGrupo: number;
}

export interface SustentacaoConfig {
  anchorMonday: string;
  semanasPorEngenheiro: number;
  grupos: { grupo: number; escopo: string; inicio: string }[];
}

export interface SyncConfig {
  options: {
    includeDone: boolean;
    maxResultsPerQuery: number;
    doneWithinDays: number;
    /** Só traz tarefas criadas a partir desta data (YYYY-MM-DD). "" = sem corte. */
    createdFrom: string;
  };
  users: ConfigUser[];
  epics: string[];
  sustentacao: SustentacaoConfig;
}
