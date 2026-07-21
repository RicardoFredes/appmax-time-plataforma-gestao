/** Contrato do controle de projetos (fonte: Supabase; ver `data.ts`). */

export type ProjetoStatus =
  | "discovery"
  | "refinement"
  | "in_progress"
  | "testing"
  | "blocked"
  | "paused"
  | "done";

/**
 * Engenheiro = usuário do sistema (`public.profiles` do backoffice). Identidade
 * por `id` (uuid do auth.users); nome/avatar só para exibição.
 */
export interface Engenheiro {
  id: string;
  nome: string;
  avatarUrl: string | null;
}

/** Time (`public.teams`). Projetos pertencem a um time; engenheiros são membros dele. */
export interface Team {
  id: string;
  slug: string;
  nome: string;
}

/** Um registro semanal de evolução (adicionado toda semana à mão). */
export interface RegistroSemanal {
  /** Segunda-feira da semana, `YYYY-MM-DD`. */
  semana: string;
  /** Progresso acumulado, 0–100. */
  progresso: number;
  /** Saúde do projeto: 1 (em perigo) a 5 (on tracking). Ignorada em marcos. */
  saude: number;
  /** Nota livre sobre como andou o projeto na semana. */
  nota: string;
  /**
   * Marco opcional — registro que **não tem saúde/on-tracking** (a `saude` é
   * ignorada): `inicio`/`fim` demarcam o começo/término do projeto (ícone de
   * bandeira); `info` é uma atualização puramente informativa (ícone de info).
   */
  marco?: "inicio" | "fim" | "info";
}

export interface Projeto {
  /** Slug estável, usado na URL de detalhe (`#/projetos/<id>`). */
  id: string;
  /** Código curto de exibição (ex.: "P01"). */
  codigo: string;
  nome: string;
  /** Engenheiros do projeto (N:N, todos iguais). Vazio = sem dono. */
  engenheiros: Engenheiro[];
  /** Data de início `YYYY-MM-DD`, ou `null`. */
  inicio: string | null;
  /** Previsão de término `YYYY-MM-DD`, ou `null` se sem data definida. */
  prazo: string | null;
  /** Data de fechamento real `YYYY-MM-DD`, ou `null` enquanto aberto. */
  fechamento: string | null;
  status: ProjetoStatus;
  /** Time dono do projeto (`teams.id`), ou `null` se sem time. */
  teamId: string | null;
  /** Importância/prioridade: 1 (mínima) a 5 (máxima). Peso nas métricas gerais. */
  prioridade: number;
  /** Quarter ao qual o projeto pertence, ex.: "2026-Q3". */
  quarter: string;
  descricao: string;
  registros: RegistroSemanal[];
}

export interface ProjetosData {
  projetos: Projeto[];
}
