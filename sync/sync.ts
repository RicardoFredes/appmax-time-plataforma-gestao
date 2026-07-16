/**
 * Orquestrador do sync Jira -> JSON.
 *
 *   pnpm sync                    # busca no Jira e escreve public/data/tasks.json
 *   pnpm sync -- --export-only   # só reaplica o overlay de urgência no JSON
 *                                # já existente (sem rede)
 *
 * A orquestração das queries vive em `sync/core.ts` (`buildTasksData`),
 * compartilhada com a Pages Function `/api/tasks` — os dois caminhos não
 * divergem. Fonte de dados do frontend: public/data/tasks.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { credsFromEnv } from "./jira.ts";
import { buildSustentacao, buildTasksData, normalizeConfig } from "./core.ts";
import { applyUrgency } from "./apply-urgency.ts";
import type { SyncConfig, TasksData, Urgency } from "./types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.resolve(ROOT, "public/data/tasks.json");
const CONFIG_FILE = path.resolve(__dirname, "config.json");
const URGENCY_FILE = path.resolve(__dirname, "urgency.json");
const VACATIONS_FILE = path.resolve(__dirname, "vacations.json");

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
  return normalizeConfig(JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")));
}

function loadUrgencyMap(): Record<string, Urgency> {
  if (!fs.existsSync(URGENCY_FILE)) return {};
  const raw = JSON.parse(fs.readFileSync(URGENCY_FILE, "utf8"));
  return (raw.urgency ?? {}) as Record<string, Urgency>;
}

function loadVacations(): { email: string; inicio: string; fim: string }[] {
  if (!fs.existsSync(VACATIONS_FILE)) return [];
  const raw = JSON.parse(fs.readFileSync(VACATIONS_FILE, "utf8"));
  return (raw.vacations ?? []) as { email: string; inicio: string; fim: string }[];
}

function writeJson(data: TasksData): void {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(
    `✓ Exportado ${data.tasks.length} tarefas -> ${path.relative(ROOT, OUT_FILE)}`,
  );
}

async function runSync(): Promise<void> {
  loadEnvFile();
  const cfg = loadConfig();
  console.log(
    `→ Buscando no Jira (${cfg.users.length} usuários, ${cfg.epics.length} épicos)...`,
  );
  const data = await buildTasksData(
    credsFromEnv(),
    cfg,
    loadUrgencyMap(),
    loadVacations(),
  );
  writeJson(data);
}

/** Reaplica o overlay de urgência no `tasks.json` existente, sem tocar no Jira. */
function exportOnly(): void {
  if (!fs.existsSync(OUT_FILE)) {
    throw new Error(
      `${path.relative(ROOT, OUT_FILE)} não existe — rode \`pnpm sync\` primeiro.`,
    );
  }
  const data = JSON.parse(fs.readFileSync(OUT_FILE, "utf8")) as TasksData;
  data.tasks = applyUrgency(data.tasks);
  // Reconstrói a escala a partir do config/vacations (offline, sem rede).
  data.sustentacao = buildSustentacao(loadConfig(), loadVacations());
  writeJson(data);
}

async function main(): Promise<void> {
  if (process.argv.includes("--export-only")) {
    exportOnly();
    return;
  }
  await runSync();
}

main().catch((err) => {
  console.error("✗ Sync falhou:", err instanceof Error ? err.message : err);
  process.exit(1);
});
