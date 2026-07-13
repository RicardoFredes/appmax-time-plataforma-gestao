/**
 * Contrato de dados entre o script de sync (`sync/`) e o frontend.
 * O arquivo `public/data/tasks.json` deve seguir exatamente este formato.
 * A mesma estrutura é declarada em `sync/types.ts` — mantenha as duas em sincronia.
 */

export type StatusCategory = "new" | "indeterminate" | "done";

/** Motivo pelo qual a tarefa entrou no painel. */
export type TaskSource = "assignee" | "epic";

/** Urgência avaliada manualmente (ver sync/urgency.json). */
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

export interface TasksData {
  generatedAt: string;
  tasks: Task[];
  users: TrackedUser[];
  epics: TrackedEpic[];
  boards: string[];
}
