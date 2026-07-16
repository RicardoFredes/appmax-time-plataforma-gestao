/**
 * GET /api/tasks — serve o `TasksData` a partir de um cache em KV, com
 * estratégia stale-while-revalidate:
 *
 *   - cache fresco (idade < TTL)  -> devolve na hora.
 *   - cache velho (idade >= TTL)  -> devolve o velho na hora e revalida em
 *                                    background (ctx.waitUntil) buscando no Jira.
 *   - sem cache (cold start)      -> busca no Jira sincronamente e devolve.
 *
 * O acesso é protegido por Cloudflare Access (Zero Trust) no nível do projeto
 * Pages — esta função não faz autenticação própria.
 */
import { buildTasksData, normalizeConfig } from "../../sync/core.ts";
import type { JiraCreds } from "../../sync/jira.ts";
import type { TasksData, Urgency } from "../../sync/types.ts";
import configRaw from "../../sync/config.json";
import urgencyRaw from "../../sync/urgency.json";
import vacationsRaw from "../../sync/vacations.json";

interface Env {
  TASKS_KV: KVNamespace;
  JIRA_BASE_URL: string;
  JIRA_EMAIL: string;
  JIRA_API_TOKEN: string;
}

const CACHE_KEY = "tasks:data";
const LOCK_KEY = "tasks:refreshing";
const TTL_MS = 15 * 60 * 1000; // considera "fresco" por 15 min
const LOCK_TTL_S = 120; // evita revalidações concorrentes

interface Cached {
  data: TasksData;
  fetchedAt: number;
}

function creds(env: Env): JiraCreds {
  const baseUrl = (env.JIRA_BASE_URL || "").replace(/\/$/, "");
  if (!baseUrl || !env.JIRA_EMAIL || !env.JIRA_API_TOKEN) {
    throw new Error(
      "Faltam variáveis JIRA_BASE_URL / JIRA_EMAIL / JIRA_API_TOKEN no ambiente do Worker.",
    );
  }
  return { baseUrl, email: env.JIRA_EMAIL, token: env.JIRA_API_TOKEN };
}

const urgencyMap = (urgencyRaw as { urgency?: Record<string, Urgency> }).urgency ?? {};
const vacations =
  (vacationsRaw as { vacations?: { email: string; inicio: string; fim: string }[] })
    .vacations ?? [];

/** Busca no Jira e grava o resultado no KV. Usa um lock best-effort no KV. */
async function refresh(env: Env, now: number): Promise<TasksData> {
  await env.TASKS_KV.put(LOCK_KEY, String(now), { expirationTtl: LOCK_TTL_S });
  const cfg = normalizeConfig(configRaw);
  const data = await buildTasksData(creds(env), cfg, urgencyMap, vacations);
  const payload: Cached = { data, fetchedAt: now };
  await env.TASKS_KV.put(CACHE_KEY, JSON.stringify(payload));
  return data;
}

function json(data: TasksData, ageMs: number, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // O cache é gerenciado no KV; o browser não deve cachear a resposta.
      "cache-control": "no-store",
      "x-cache-age-ms": String(Math.max(0, Math.round(ageMs))),
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { env } = ctx;
  const now = Date.now();

  let cached: Cached | null = null;
  try {
    cached = await env.TASKS_KV.get<Cached>(CACHE_KEY, "json");
  } catch {
    cached = null;
  }

  if (cached) {
    const age = now - cached.fetchedAt;
    if (age >= TTL_MS) {
      // Revalida em background, mas só se ninguém já estiver revalidando.
      const locked = await env.TASKS_KV.get(LOCK_KEY);
      if (!locked) {
        ctx.waitUntil(
          refresh(env, now).catch((err) => {
            console.error("Revalidação em background falhou:", err);
          }),
        );
      }
    }
    return json(cached.data, age);
  }

  // Cold start: sem cache, busca sincronamente.
  try {
    const data = await refresh(env, now);
    return json(data, 0);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 502, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }
};
