/**
 * Seed inicial (one-off): converte resultados brutos do MCP do Jira
 * (salvos em arquivos JSON) para o SQLite + public/data/tasks.json,
 * sem precisar de API token. Depois disso, use `pnpm sync` (REST).
 *
 *   pnpm tsx sync/seed-from-mcp.ts <arquivo:source> [...] [--epics KEY,KEY]
 *   ex: pnpm tsx sync/seed-from-mcp.ts a.txt:assignee b.txt:epic --epics SEP-358
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openDb, upsertTask, pruneStale, readAllTasks } from "./db.ts";
import { applyUrgency } from "./apply-urgency.ts";
import type { Task, TaskSource, TasksData, TrackedEpic } from "./types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.resolve(ROOT, "public/data/tasks.json");
const BASE_URL = "https://tecnologia-appmax.atlassian.net";

function adfToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; text?: string; content?: unknown[] };
  if (n.type === "text" && typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) return n.content.map(adfToText).join(" ");
  return "";
}
function shortText(raw: unknown, max = 280): string {
  const text = adfToText(raw).replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function mapNode(node: any, source: TaskSource): Task {
  const f = node.fields ?? {};
  const parent = f.parent;
  const isEpicParent = parent?.fields?.issuetype?.name === "Epic";
  return {
    key: node.key,
    url: node.webUrl ?? `${BASE_URL}/browse/${node.key}`,
    summary: f.summary ?? "",
    description: shortText(f.description),
    board: f.project?.name ?? "",
    projectKey: f.project?.key ?? "",
    issueType: f.issuetype?.name ?? "",
    status: f.status?.name ?? "",
    statusCategory: (f.status?.statusCategory?.key ?? "new") as Task["statusCategory"],
    priority: f.priority?.name ?? "",
    assigneeName: f.assignee?.displayName ?? "Não atribuída",
    assigneeEmail: f.assignee?.emailAddress ?? "",
    epicKey: isEpicParent ? parent.key : null,
    epicSummary: isEpicParent ? parent.fields?.summary ?? null : null,
    labels: Array.isArray(f.labels) ? f.labels : [],
    created: f.created ?? "",
    updated: f.updated ?? "",
    sources: [source],
    urgency: null,
  };
}

function loadNodes(file: string): any[] {
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  return json.issues?.nodes ?? [];
}

function main() {
  const args = process.argv.slice(2);
  const epicsIdx = args.indexOf("--epics");
  const epicKeys =
    epicsIdx >= 0 ? args[epicsIdx + 1].split(",").map((s) => s.trim()) : [];
  const fileArgs = (epicsIdx >= 0 ? args.slice(0, epicsIdx) : args).filter(Boolean);

  const db = openDb();
  const syncedAt = new Date().toISOString();
  let total = 0;
  const epicMeta = new Map<string, TrackedEpic>();

  for (const arg of fileArgs) {
    const sep = arg.lastIndexOf(":");
    const file = arg.slice(0, sep);
    const source = arg.slice(sep + 1) as TaskSource;
    const nodes = loadNodes(file);
    for (const node of nodes) {
      const task = mapNode(node, source);
      upsertTask(db, task, syncedAt);
      total++;
      // Coleta metadados do épico a partir do parent das tarefas-filhas.
      const parent = node.fields?.parent;
      if (parent?.fields?.issuetype?.name === "Epic" && epicKeys.includes(parent.key)) {
        epicMeta.set(parent.key, {
          key: parent.key,
          summary: parent.fields?.summary ?? parent.key,
          board: node.fields?.project?.name ?? "",
        });
      }
    }
  }

  pruneStale(db, syncedAt);
  const tasks = applyUrgency(readAllTasks(db));
  db.close();

  const users = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "config.json"), "utf8"),
  ).users;
  const boards = Array.from(new Set(tasks.map((t) => t.board).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  const epics = epicKeys.map(
    (k) => epicMeta.get(k) ?? { key: k, summary: k, board: "" },
  );

  const data: TasksData = { generatedAt: syncedAt, tasks, users, epics, boards };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(`✓ Seed: ${total} nós lidos, ${tasks.length} tarefas -> tasks.json`);
}

main();
