/**
 * Núcleo portátil do sync: busca no Jira e monta o `TasksData` em memória,
 * sem banco e sem `fs`. Roda tanto no script local (`sync.ts` via tsx) quanto
 * na Pages Function do Cloudflare (Worker, com `nodejs_compat` para o `Buffer`
 * do Basic Auth em `jira.ts`).
 *
 * É a fonte única da orquestração das queries: os dois consumidores
 * (`sync.ts` → JSON estático e `functions/api/tasks.ts` → KV) usam este módulo.
 */
import { JiraClient, type JiraCreds } from "./jira.ts";
import type {
  ConfigUser,
  SustentacaoData,
  SyncConfig,
  Task,
  TasksData,
  TrackedEpic,
  Urgency,
  Vacation,
} from "./types.ts";

/** Normaliza o `config.json` bruto para `SyncConfig` (mesma lógica do sync.ts). */
export function normalizeConfig(raw: any): SyncConfig {
  const users: ConfigUser[] = (raw?.users ?? []).map((u: any) => ({
    email: u.email,
    name: u.name,
    sustentacaoGrupo: u.sustentacao_grupo ?? -1,
  }));
  const sust = raw?.sustentacao ?? {};
  return {
    options: {
      includeDone: raw?.options?.includeDone ?? false,
      maxResultsPerQuery: raw?.options?.maxResultsPerQuery ?? 100,
      doneWithinDays: raw?.options?.doneWithinDays ?? 21,
      createdFrom: raw?.options?.createdFrom ?? "",
    },
    users,
    epics: raw?.epics ?? [],
    sustentacao: {
      anchorMonday: sust.anchorMonday ?? "",
      semanasPorEngenheiro: sust.semanasPorEngenheiro ?? 2,
      grupos: (sust.grupos ?? []).map((g: any) => ({
        grupo: g.grupo,
        escopo: g.escopo ?? "",
        inicio: g.inicio ?? "",
      })),
    },
  };
}

/**
 * Monta a escala de sustentação a partir do config (grupos + `sustentacao_grupo`
 * dos usuários) e do arquivo de férias. A ordem do rodízio segue a ordem dos
 * usuários no config, girada para começar no engenheiro `inicio` de cada grupo.
 * Cálculo puro (sem rede) — o frontend deriva a semana corrente do relógio dele.
 */
export function buildSustentacao(
  cfg: SyncConfig,
  vacationsRaw: { email: string; inicio: string; fim: string }[] = [],
): SustentacaoData {
  const nameByEmail = new Map(cfg.users.map((u) => [u.email, u.name]));

  const grupos = cfg.sustentacao.grupos.map((g) => {
    const membros = cfg.users.filter((u) => u.sustentacaoGrupo === g.grupo);
    const startIdx = membros.findIndex((u) => u.email === g.inicio);
    const ordered = startIdx > 0 ? [...membros.slice(startIdx), ...membros.slice(0, startIdx)] : membros;
    return {
      grupo: g.grupo,
      escopo: g.escopo,
      engenheiros: ordered.map((u) => ({ email: u.email, name: u.name })),
    };
  });

  const ferias: Vacation[] = vacationsRaw.map((v) => ({
    email: v.email,
    name: nameByEmail.get(v.email) ?? v.email,
    inicio: v.inicio,
    fim: v.fim,
  }));

  return {
    anchorMonday: cfg.sustentacao.anchorMonday,
    semanasPorEngenheiro: cfg.sustentacao.semanasPorEngenheiro,
    grupos,
    ferias,
  };
}

/**
 * Cláusula JQL de escopo compartilhada pelas queries de tarefas (atribuídas e
 * de épicos): filtro de status (Done) + corte de data de criação. Usada tanto
 * aqui quanto no `sync.ts` local, para os dois caminhos não divergirem.
 */
export function scopeClause(cfg: SyncConfig): string {
  const parts = [
    cfg.options.includeDone
      ? `(statusCategory != Done OR updated >= -${cfg.options.doneWithinDays}d)`
      : "statusCategory != Done",
  ];
  if (cfg.options.createdFrom) parts.push(`created >= "${cfg.options.createdFrom}"`);
  return parts.join(" AND ");
}

/**
 * Busca as tarefas (atribuídas + de épicos), mescla `sources` por key, aplica
 * o overlay de urgência e devolve o mesmo contrato do `tasks.json`.
 */
export async function buildTasksData(
  creds: JiraCreds,
  cfg: SyncConfig,
  urgencyMap: Record<string, Urgency> = {},
  vacations: { email: string; inicio: string; fim: string }[] = [],
): Promise<TasksData> {
  const jira = new JiraClient(creds);
  const max = cfg.options.maxResultsPerQuery;
  const byKey = new Map<string, Task>();

  const addAll = (issues: Awaited<ReturnType<JiraClient["searchAll"]>>, source: Task["sources"][number]) => {
    for (const issue of issues) {
      const task = jira.mapIssue(issue, [source]);
      const prev = byKey.get(task.key);
      if (prev) {
        task.sources = Array.from(new Set([...prev.sources, ...task.sources]));
      }
      byKey.set(task.key, task);
    }
  };

  // 1) Tarefas atribuídas aos usuários acompanhados.
  if (cfg.users.length > 0) {
    const emails = cfg.users.map((u) => `"${u.email}"`).join(",");
    const jql = `assignee in (${emails}) AND ${scopeClause(cfg)} ORDER BY updated DESC`;
    addAll(await jira.searchAll(jql, max), "assignee");
  }

  // 2) Tarefas dos épicos acompanhados.
  if (cfg.epics.length > 0) {
    const jql = `parent in (${cfg.epics.join(",")}) AND ${scopeClause(cfg)} ORDER BY updated DESC`;
    addAll(await jira.searchAll(jql, max), "epic");
  }

  // 3) Metadados dos épicos.
  let epics: TrackedEpic[] = [];
  if (cfg.epics.length > 0) {
    const epicIssues = await jira.searchAll(`key in (${cfg.epics.join(",")})`, max);
    const found = new Map(
      epicIssues.map((i) => [
        i.key,
        {
          key: i.key,
          summary: i.fields.summary ?? i.key,
          board: i.fields.project?.name ?? "",
        } satisfies TrackedEpic,
      ]),
    );
    epics = cfg.epics.map((k) => found.get(k) ?? { key: k, summary: k, board: "" });
  }

  const tasks = Array.from(byKey.values())
    .map((t) => ({ ...t, urgency: urgencyMap[t.key] ?? null }))
    .sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0));

  const boards = Array.from(new Set(tasks.map((t) => t.board).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );

  return {
    generatedAt: new Date().toISOString(),
    tasks,
    users: cfg.users.map((u) => ({ email: u.email, name: u.name })),
    epics,
    boards,
    sustentacao: buildSustentacao(cfg, vacations),
  };
}
