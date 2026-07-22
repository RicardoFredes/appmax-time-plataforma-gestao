/**
 * Acesso ao Supabase para os projetos. Tudo exige **sessão** (RLS `authenticated`,
 * herdada do backoffice) — engenheiros são usuários do sistema (`public.profiles`,
 * legível só por autenticados).
 *
 * O **banco é em inglês** (tabelas/colunas: `teams`, `team_members`, `projects`,
 * `project_engineers`, `weekly_reports`) e os tipos do app também são em inglês;
 * esta camada só faz a ponte de nomes (snake_case do banco ↔ camelCase do app) e
 * remonta o `ProjectsData` que a UI já consome (`fetchProjects`).
 */
import { supabase } from "@/lib/supabase";
import type {
  Engineer,
  Milestone,
  Project,
  ProjectStatus,
  ProjectsData,
  Report,
  ReportInput,
  Team,
} from "./types";

/** Campos de topo do projeto (sem engenheiros/registros, que são tabelas à parte). */
export type ProjectMeta = Omit<Project, "engineers" | "reports">;

/** Marcos válidos no banco (mesmos valores do app, sem tradução). */
const MILESTONES: Milestone[] = ["start", "end", "info"];
function asMilestone(v: string | null): Milestone | undefined {
  return v && MILESTONES.includes(v as Milestone) ? (v as Milestone) : undefined;
}

interface RawProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

function toEngineer(p: RawProfile): Engineer {
  return { id: p.id, name: p.name ?? "—", avatarUrl: p.avatar_url };
}

const SELECT =
  "id, code, name, description, status, priority, quarter, team_id," +
  " start_date, due_date, closed_date," +
  " project_engineers(profiles(id, name, avatar_url))," +
  " weekly_reports(id, date, created_at, progress, health, note, milestone)";

interface RawRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  priority: number;
  quarter: string;
  team_id: string | null;
  start_date: string | null;
  due_date: string | null;
  closed_date: string | null;
  project_engineers: { profiles: RawProfile | null }[] | null;
  weekly_reports:
    | {
        id: string;
        date: string;
        created_at: string;
        progress: number;
        health: number;
        note: string | null;
        milestone: string | null;
      }[]
    | null;
}

/** `ProjectMeta` → linha do banco. */
function metaToRow(m: ProjectMeta) {
  return {
    id: m.id,
    code: m.code,
    name: m.name,
    description: m.description,
    status: m.status,
    priority: m.priority,
    quarter: m.quarter,
    team_id: m.teamId,
    start_date: m.startDate,
    due_date: m.dueDate,
    closed_date: m.closedDate,
  };
}

/** Lê todos os projetos e remonta o `ProjectsData`. */
export async function fetchProjects(): Promise<ProjectsData> {
  const { data, error } = await supabase.from("projects").select(SELECT);
  if (error) throw new Error(error.message);

  const projects: Project[] = ((data ?? []) as unknown as RawRow[]).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? "",
    status: row.status as ProjectStatus,
    teamId: row.team_id,
    priority: row.priority,
    quarter: row.quarter,
    startDate: row.start_date,
    dueDate: row.due_date,
    closedDate: row.closed_date,
    engineers: (row.project_engineers ?? [])
      .map((pe) => pe.profiles)
      .filter((p): p is RawProfile => p != null)
      .map(toEngineer)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    reports: (row.weekly_reports ?? [])
      .map((r): Report => ({
        id: r.id,
        date: r.date,
        createdAt: r.created_at,
        progress: r.progress,
        health: r.health,
        note: r.note ?? "",
        ...(asMilestone(r.milestone) ? { milestone: asMilestone(r.milestone) } : {}),
      }))
      // Ordena por data e, no mesmo dia, pelo momento de criação.
      .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)),
  }));

  return { projects };
}

/** Lista os times. */
export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from("teams").select("id, slug, name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string; slug: string; name: string }[])
    .map((t) => ({ id: t.id, slug: t.slug, name: t.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/** Membros de um time (fonte do picker de engenheiros do projeto). */
export async function fetchTeamMembers(teamId: string): Promise<Engineer[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("profiles(id, name, avatar_url)")
    .eq("team_id", teamId);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as { profiles: RawProfile | null }[])
    .map((m) => m.profiles)
    .filter((p): p is RawProfile => p != null)
    .map(toEngineer)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/** Cria/atualiza os campos de topo de um projeto. */
export async function upsertProject(meta: ProjectMeta): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .upsert(metaToRow(meta), { onConflict: "id" });
  if (error) throw new Error(error.message);
}

/** Substitui o conjunto de engenheiros de um projeto pelos `userIds` informados. */
export async function setEngineers(
  projectId: string,
  userIds: string[],
): Promise<void> {
  // Remove os que saíram.
  let del = supabase.from("project_engineers").delete().eq("project_id", projectId);
  if (userIds.length > 0) del = del.not("user_id", "in", `(${userIds.join(",")})`);
  const { error: delErr } = await del;
  if (delErr) throw new Error(delErr.message);

  // Insere os novos (idempotente pela PK composta).
  if (userIds.length > 0) {
    const { error: insErr } = await supabase
      .from("project_engineers")
      .upsert(
        userIds.map((user_id) => ({ project_id: projectId, user_id })),
        { onConflict: "project_id,user_id" },
      );
    if (insErr) throw new Error(insErr.message);
  }
}

/** Payload (app → banco) de um registro. */
function reportToRow(projectId: string, r: ReportInput) {
  return {
    project_id: projectId,
    date: r.date,
    progress: r.progress,
    health: r.health,
    note: r.note,
    milestone: r.milestone ?? null,
  };
}

/** Cria um novo registro (data livre; vários por dia são permitidos). */
export async function createReport(
  projectId: string,
  report: ReportInput,
): Promise<void> {
  const { error } = await supabase.from("weekly_reports").insert(reportToRow(projectId, report));
  if (error) throw new Error(error.message);
}

/** Atualiza um registro existente pelo `id`. */
export async function updateReport(
  projectId: string,
  id: string,
  report: ReportInput,
): Promise<void> {
  const { error } = await supabase
    .from("weekly_reports")
    .update(reportToRow(projectId, report))
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Remove um registro pelo `id`. */
export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from("weekly_reports").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Remove um projeto (cascata apaga engenheiros vinculados e registros). */
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
