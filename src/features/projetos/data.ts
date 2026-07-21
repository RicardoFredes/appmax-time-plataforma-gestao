/**
 * Acesso ao Supabase para os projetos. Tudo exige **sessão** (RLS `authenticated`,
 * herdada do backoffice) — engenheiros são usuários do sistema (`public.profiles`,
 * legível só por autenticados).
 *
 * O **banco é em inglês** (tabelas/colunas: `teams`, `team_members`, `projects`,
 * `project_engineers`, `weekly_reports`); os tipos do app são em português
 * (`Projeto`, `Engenheiro`, `Team`, `RegistroSemanal`). A tradução PT↔EN vive só
 * aqui, na fronteira. `fetchProjetos` remonta o `ProjetosData` que a UI já consome.
 */
import { supabase } from "@/lib/supabase";
import type {
  Engenheiro,
  Projeto,
  ProjetoStatus,
  ProjetosData,
  RegistroSemanal,
  Team,
} from "./types";

/** Campos de topo do projeto (sem engenheiros/registros, que são tabelas à parte). */
export type ProjetoMeta = Omit<Projeto, "engenheiros" | "registros">;

type Marco = NonNullable<RegistroSemanal["marco"]>;
/** marco (app, pt) ↔ milestone (banco, en). */
const MARCO_TO_DB: Record<Marco, string> = { inicio: "start", fim: "end", info: "info" };
const MARCO_FROM_DB: Record<string, Marco> = { start: "inicio", end: "fim", info: "info" };

interface RawProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

function toEngenheiro(p: RawProfile): Engenheiro {
  return { id: p.id, nome: p.name ?? "—", avatarUrl: p.avatar_url };
}

const SELECT =
  "id, code, name, description, status, priority, quarter, team_id," +
  " start_date, due_date, closed_date," +
  " project_engineers(profiles(id, name, avatar_url))," +
  " weekly_reports(week, progress, health, note, milestone)";

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
        week: string;
        progress: number;
        health: number;
        note: string | null;
        milestone: string | null;
      }[]
    | null;
}

/** `ProjetoMeta` (pt) → linha do banco (en). */
function metaToRow(m: ProjetoMeta) {
  return {
    id: m.id,
    code: m.codigo,
    name: m.nome,
    description: m.descricao,
    status: m.status,
    priority: m.prioridade,
    quarter: m.quarter,
    team_id: m.teamId,
    start_date: m.inicio,
    due_date: m.prazo,
    closed_date: m.fechamento,
  };
}

/** Lê todos os projetos e remonta o `ProjetosData`. */
export async function fetchProjetos(): Promise<ProjetosData> {
  const { data, error } = await supabase.from("projects").select(SELECT);
  if (error) throw new Error(error.message);

  const projetos: Projeto[] = ((data ?? []) as unknown as RawRow[]).map((row) => ({
    id: row.id,
    codigo: row.code,
    nome: row.name,
    descricao: row.description ?? "",
    status: row.status as ProjetoStatus,
    teamId: row.team_id,
    prioridade: row.priority,
    quarter: row.quarter,
    inicio: row.start_date,
    prazo: row.due_date,
    fechamento: row.closed_date,
    engenheiros: (row.project_engineers ?? [])
      .map((pe) => pe.profiles)
      .filter((p): p is RawProfile => p != null)
      .map(toEngenheiro)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    registros: (row.weekly_reports ?? [])
      .map((r): RegistroSemanal => ({
        semana: r.week,
        progresso: r.progress,
        saude: r.health,
        nota: r.note ?? "",
        ...(r.milestone && MARCO_FROM_DB[r.milestone]
          ? { marco: MARCO_FROM_DB[r.milestone] }
          : {}),
      }))
      .sort((a, b) => a.semana.localeCompare(b.semana)),
  }));

  return { projetos };
}

/** Lista os times. */
export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from("teams").select("id, slug, name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string; slug: string; name: string }[])
    .map((t) => ({ id: t.id, slug: t.slug, nome: t.name }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Membros de um time (fonte do picker de engenheiros do projeto). */
export async function fetchTeamMembers(teamId: string): Promise<Engenheiro[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("profiles(id, name, avatar_url)")
    .eq("team_id", teamId);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as { profiles: RawProfile | null }[])
    .map((m) => m.profiles)
    .filter((p): p is RawProfile => p != null)
    .map(toEngenheiro)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Cria/atualiza os campos de topo de um projeto. */
export async function upsertProjeto(meta: ProjetoMeta): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .upsert(metaToRow(meta), { onConflict: "id" });
  if (error) throw new Error(error.message);
}

/** Substitui o conjunto de engenheiros de um projeto pelos `userIds` informados. */
export async function setEngenheiros(
  projetoId: string,
  userIds: string[],
): Promise<void> {
  // Remove os que saíram.
  let del = supabase.from("project_engineers").delete().eq("project_id", projetoId);
  if (userIds.length > 0) del = del.not("user_id", "in", `(${userIds.join(",")})`);
  const { error: delErr } = await del;
  if (delErr) throw new Error(delErr.message);

  // Insere os novos (idempotente pela PK composta).
  if (userIds.length > 0) {
    const { error: insErr } = await supabase
      .from("project_engineers")
      .upsert(
        userIds.map((user_id) => ({ project_id: projetoId, user_id })),
        { onConflict: "project_id,user_id" },
      );
    if (insErr) throw new Error(insErr.message);
  }
}

/** Cria/atualiza o registro de uma semana (PK `(project,week)` = edit-in-place). */
export async function upsertRegistro(
  projetoId: string,
  registro: RegistroSemanal,
): Promise<void> {
  const { error } = await supabase.from("weekly_reports").upsert(
    {
      project_id: projetoId,
      week: registro.semana,
      progress: registro.progresso,
      health: registro.saude,
      note: registro.nota,
      milestone: registro.marco ? MARCO_TO_DB[registro.marco] : null,
    },
    { onConflict: "project_id,week" },
  );
  if (error) throw new Error(error.message);
}

/** Remove um registro semanal. */
export async function deleteRegistro(projetoId: string, semana: string): Promise<void> {
  const { error } = await supabase
    .from("weekly_reports")
    .delete()
    .eq("project_id", projetoId)
    .eq("week", semana);
  if (error) throw new Error(error.message);
}

/** Remove um projeto (cascata apaga engenheiros vinculados e registros). */
export async function deleteProjeto(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
