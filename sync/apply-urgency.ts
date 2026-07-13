/** Overlay de urgência: lê sync/urgency.json e aplica em cada tarefa por key. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Task, Urgency } from "./types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URGENCY_FILE = path.resolve(__dirname, "urgency.json");

export function applyUrgency(tasks: Task[]): Task[] {
  if (!fs.existsSync(URGENCY_FILE)) return tasks;
  const raw = JSON.parse(fs.readFileSync(URGENCY_FILE, "utf8"));
  const map = (raw.urgency ?? {}) as Record<string, Urgency>;
  return tasks.map((t) => ({ ...t, urgency: map[t.key] ?? null }));
}
