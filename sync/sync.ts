/**
 * Orquestrador do sync Jira -> SQLite -> JSON.
 *
 *   pnpm sync                 # busca no Jira, atualiza o SQLite e exporta o JSON
 *   pnpm sync -- --export-only  # só reexporta o JSON a partir do SQLite (sem rede)
 *
 * Fonte de dados do frontend: public/data/tasks.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JiraClient, credsFromEnv } from "./jira.ts";
import {
  openDb,
  upsertTask,
  pruneStale,
  readAllTasks,
} from "./db.ts";
import { applyUrgency } from "./apply-urgency.ts";
import type { SyncConfig, TasksData, TrackedEpic } from "./types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.resolve(ROOT, "public/data/tasks.json");
const CONFIG_FILE = path.resolve(__dirname, "config.json");

/** Carrega variáveis do `.env` na raiz (parser mínimo, sem dependência externa). */
function loadEnvFile(): void {
  const envPath = path.resolve(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

function loadConfig(): SyncConfig {
  const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  return {
    options: {
      includeDone: raw.options?.includeDone ?? false,
      maxResultsPerQuery: raw.options?.maxResultsPerQuery ?? 100,
      doneWithinDays: raw.options?.doneWithinDays ?? 21,
    },
    users: raw.users ?? [],
    epics: raw.epics ?? [],
  };
}

function statusClause(cfg: SyncConfig): string {
  return cfg.options.includeDone
    ? `(statusCategory != Done OR updated >= -${cfg.options.doneWithinDays}d)`
    : "statusCategory != Done";
}

function exportJson(cfg: SyncConfig, epics: TrackedEpic[], generatedAt: string) {
  const db = openDb();
  const tasks = applyUrgency(readAllTasks(db));
  db.close();

  const boards = Array.from(new Set(tasks.map((t) => t.board).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  const data: TasksData = {
    generatedAt,
    tasks,
    users: cfg.users,
    epics,
    boards,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(
    `✓ Exportado ${tasks.length} tarefas -> ${path.relative(ROOT, OUT_FILE)}`,
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

async function fetchEpicsMeta(
  jira: JiraClient,
  cfg: SyncConfig,
): Promise<TrackedEpic[]> {
  if (cfg.epics.length === 0) return [];
  const jql = `key in (${cfg.epics.join(",")})`;
  const issues = await jira.searchAll(jql, cfg.options.maxResultsPerQuery);
  return issues.map((i) => ({
    key: i.key,
    summary: i.fields.summary ?? i.key,
    board: i.fields.project?.name ?? "",
  }));
}

async function runSync(): Promise<void> {
  loadEnvFile();
  const cfg = loadConfig();
  const jira = new JiraClient(credsFromEnv());
  const syncedAt = nowIso();
  const db = openDb();

  // 1) Tarefas atribuídas aos usuários acompanhados.
  if (cfg.users.length > 0) {
    const emails = cfg.users.map((u) => `"${u.email}"`).join(",");
    const jql = `assignee in (${emails}) AND ${statusClause(cfg)} ORDER BY updated DESC`;
    console.log(`→ Buscando tarefas atribuídas (${cfg.users.length} usuários)...`);
    const issues = await jira.searchAll(jql, cfg.options.maxResultsPerQuery);
    for (const issue of issues) {
      upsertTask(db, jira.mapIssue(issue, ["assignee"]), syncedAt);
    }
    console.log(`  ${issues.length} tarefas atribuídas.`);
  }

  // 2) Tarefas dos épicos listados (board de épicos).
  if (cfg.epics.length > 0) {
    const keys = cfg.epics.join(",");
    const jql = `parent in (${keys}) AND ${statusClause(cfg)} ORDER BY updated DESC`;
    console.log(`→ Buscando tarefas de ${cfg.epics.length} épico(s)...`);
    const issues = await jira.searchAll(jql, cfg.options.maxResultsPerQuery);
    for (const issue of issues) {
      upsertTask(db, jira.mapIssue(issue, ["epic"]), syncedAt);
    }
    console.log(`  ${issues.length} tarefas de épicos.`);
  }

  const removed = pruneStale(db, syncedAt);
  if (removed > 0) console.log(`  ${removed} tarefas fora de escopo removidas.`);
  db.close();

  const epics = await fetchEpicsMeta(jira, cfg);
  exportJson(cfg, epics, syncedAt);
}

async function main(): Promise<void> {
  const exportOnly = process.argv.includes("--export-only");
  if (exportOnly) {
    loadEnvFile();
    const cfg = loadConfig();
    exportJson(cfg, [], nowIso());
    return;
  }
  await runSync();
}

main().catch((err) => {
  console.error("✗ Sync falhou:", err instanceof Error ? err.message : err);
  process.exit(1);
});
