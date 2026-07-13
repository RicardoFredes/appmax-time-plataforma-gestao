/**
 * Camada SQLite: fonte local (cache) das tarefas sincronizadas do Jira.
 * O banco fica em `data/gestor.db` (gitignored) e alimenta o export de JSON.
 */
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { Task, TaskSource } from "./types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../data/gestor.db");

export function openDb(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      key             TEXT PRIMARY KEY,
      url             TEXT NOT NULL,
      summary         TEXT NOT NULL,
      description     TEXT NOT NULL DEFAULT '',
      board           TEXT NOT NULL DEFAULT '',
      project_key     TEXT NOT NULL DEFAULT '',
      issue_type      TEXT NOT NULL DEFAULT '',
      status          TEXT NOT NULL DEFAULT '',
      status_category TEXT NOT NULL DEFAULT 'new',
      priority        TEXT NOT NULL DEFAULT '',
      assignee_name   TEXT NOT NULL DEFAULT '',
      assignee_email  TEXT NOT NULL DEFAULT '',
      epic_key        TEXT,
      epic_summary    TEXT,
      labels          TEXT NOT NULL DEFAULT '[]',
      created         TEXT NOT NULL DEFAULT '',
      updated         TEXT NOT NULL DEFAULT '',
      sources         TEXT NOT NULL DEFAULT '[]',
      synced_at       TEXT NOT NULL
    );
  `);
  return db;
}

/** Insere/atualiza uma tarefa; mescla `sources` de tarefas que aparecem por mais de um motivo. */
export function upsertTask(
  db: Database.Database,
  task: Task,
  syncedAt: string,
): void {
  const existing = db
    .prepare("SELECT sources FROM tasks WHERE key = ?")
    .get(task.key) as { sources: string } | undefined;

  let sources: TaskSource[] = task.sources;
  if (existing) {
    const prev = JSON.parse(existing.sources) as TaskSource[];
    sources = Array.from(new Set([...prev, ...task.sources]));
  }

  db.prepare(
    `INSERT INTO tasks (
       key, url, summary, description, board, project_key, issue_type,
       status, status_category, priority, assignee_name, assignee_email,
       epic_key, epic_summary, labels, created, updated, sources, synced_at
     ) VALUES (
       @key, @url, @summary, @description, @board, @project_key, @issue_type,
       @status, @status_category, @priority, @assignee_name, @assignee_email,
       @epic_key, @epic_summary, @labels, @created, @updated, @sources, @synced_at
     )
     ON CONFLICT(key) DO UPDATE SET
       url=excluded.url, summary=excluded.summary, description=excluded.description,
       board=excluded.board, project_key=excluded.project_key, issue_type=excluded.issue_type,
       status=excluded.status, status_category=excluded.status_category, priority=excluded.priority,
       assignee_name=excluded.assignee_name, assignee_email=excluded.assignee_email,
       epic_key=excluded.epic_key, epic_summary=excluded.epic_summary,
       labels=excluded.labels, created=excluded.created, updated=excluded.updated,
       sources=excluded.sources, synced_at=excluded.synced_at`,
  ).run({
    key: task.key,
    url: task.url,
    summary: task.summary,
    description: task.description,
    project_key: task.projectKey,
    board: task.board,
    issue_type: task.issueType,
    status: task.status,
    status_category: task.statusCategory,
    priority: task.priority,
    assignee_name: task.assigneeName,
    assignee_email: task.assigneeEmail,
    epic_key: task.epicKey,
    epic_summary: task.epicSummary,
    labels: JSON.stringify(task.labels),
    created: task.created,
    updated: task.updated,
    sources: JSON.stringify(sources),
    synced_at: syncedAt,
  });
}

/** Remove tarefas que não foram tocadas neste sync (saíram do escopo/foram concluídas). */
export function pruneStale(db: Database.Database, syncedAt: string): number {
  const info = db
    .prepare("DELETE FROM tasks WHERE synced_at <> ?")
    .run(syncedAt);
  return info.changes;
}

export function readAllTasks(db: Database.Database): Task[] {
  const rows = db
    .prepare("SELECT * FROM tasks ORDER BY updated DESC")
    .all() as Record<string, any>[];
  return rows.map((r) => ({
    key: r.key,
    url: r.url,
    summary: r.summary,
    description: r.description,
    board: r.board,
    projectKey: r.project_key,
    issueType: r.issue_type,
    status: r.status,
    statusCategory: r.status_category,
    priority: r.priority,
    assigneeName: r.assignee_name,
    assigneeEmail: r.assignee_email,
    epicKey: r.epic_key,
    epicSummary: r.epic_summary,
    labels: JSON.parse(r.labels),
    created: r.created,
    updated: r.updated,
    sources: JSON.parse(r.sources),
    urgency: null,
  }));
}
