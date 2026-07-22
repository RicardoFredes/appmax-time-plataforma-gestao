/**
 * Acesso ao Supabase para os projetos. Tudo exige **sessão** (RLS `authenticated`,
 * herdada do backoffice) — engenheiros são usuários do sistema (`public.profiles`,
 * legível só por autenticados).
 *
 * O **banco é em inglês** (tabelas/colunas: `teams`, `team_members`, `projects`,
 * `project_engineers`, `weekly_reports`); os tipos do app são em português
 * (`Projeto`, `Engenheiro`, `Team`, `Registro`). A tradução PT↔EN vive só
 * aqui, na fronteira. `fetchProjetos` remonta o `ProjetosData` que a UI já consome.
 */
import { supabase } from "@/lib/supabase";
import type {
  Engenheiro,
  Projeto,
  ProjetoStatus,
  ProjetosData,
  Registro,
  RegistroInput,
  Team,
} from "./types";

/** Campos de topo do projeto (sem engenheiros/registros, que são tabelas à parte). */
export type ProjetoMeta = Omit<Projeto, "engenheiros" | "registros">;

type Marco = NonNullable<Registro["marco"]>;
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
      .map((r): Registro => ({
        id: r.id,
        data: r.date,
        criadoEm: r.created_at,
        progresso: r.progress,
        saude: r.health,
        nota: r.note ?? "",
        ...(r.milestone && MARCO_FROM_DB[r.milestone]
          ? { marco: MARCO_FROM_DB[r.milestone] }
          : {}),
      }))
      // Ordena por data e, no mesmo dia, pelo momento de criação.
      .sort((a, b) => a.data.localeCompare(b.data) || a.criadoEm.localeCompare(b.criadoEm)),
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

/** Payload (app → banco) de um registro. */
function registroToRow(projetoId: string, r: RegistroInput) {
  return {
    project_id: projetoId,
    date: r.data,
    progress: r.progresso,
    health: r.saude,
    note: r.nota,
    milestone: r.marco ? MARCO_TO_DB[r.marco] : null,
  };
}

/** Cria um novo registro (data livre; vários por dia são permitidos). */
export async function criarRegistro(
  projetoId: string,
  registro: RegistroInput,
): Promise<void> {
  const { error } = await supabase.from("weekly_reports").insert(registroToRow(projetoId, registro));
  if (error) throw new Error(error.message);
}

/** Atualiza um registro existente pelo `id`. */
export async function atualizarRegistro(
  projetoId: string,
  id: string,
  registro: RegistroInput,
): Promise<void> {
  const { error } = await supabase
    .from("weekly_reports")
    .update(registroToRow(projetoId, registro))
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Remove um registro pelo `id`. */
export async function deleteRegistro(id: string): Promise<void> {
  const { error } = await supabase.from("weekly_reports").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Remove um projeto (cascata apaga engenheiros vinculados e registros). */
export async function deleteProjeto(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
