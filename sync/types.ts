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

export interface TasksData {
  generatedAt: string;
  tasks: Task[];
  users: TrackedUser[];
  epics: TrackedEpic[];
  boards: string[];
}

export interface SyncConfig {
  options: {
    includeDone: boolean;
    maxResultsPerQuery: number;
    doneWithinDays: number;
    /** Só traz tarefas criadas a partir desta data (YYYY-MM-DD). "" = sem corte. */
    createdFrom: string;
  };
  users: TrackedUser[];
  epics: string[];
}
