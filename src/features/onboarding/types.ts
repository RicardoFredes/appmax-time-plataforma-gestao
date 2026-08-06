/**
 * Contrato dos dados do onboarding. Tudo aqui é **hardcoded** nos arquivos
 * irmãos (`team.ts`, `repos.ts`, `contexts.ts`, `stack.ts`). Não passa por
 * Jira, Supabase nem pelo `sync`. É documentação versionada: quando o time ou
 * os repositórios mudarem, edite o arquivo de dados correspondente.
 */

/** Trilha do membro dentro do time (usada nos cards e no organograma). */
export interface TeamTrack {
  id: string;
  label: string;
}

export interface Member {
  email: string;
  /** Nome completo, igual ao `sync/config.json` (fonte do resto do painel). */
  name: string;
  /** Como a pessoa é chamada no dia a dia, quando difere do nome. */
  nickname?: string;
  /** Foto em `public/img/avatar/`; sem ela, a UI cai nas iniciais. */
  avatar?: string;
  track: string;
  /** Cargo formal; `undefined` quando ainda não foi definido/validado. */
  position?: string;
  /** Skills declaradas, da mais forte pra mais fraca. */
  skills: string[];
  /** Entrou há pouco: ganha destaque de "novo no time". */
  isNew?: boolean;
}

/** Agrupamento visual dos repositórios (produto/plataforma a que pertencem). */
export interface RepoGroup {
  id: string;
  label: string;
  description: string;
}

export interface Repo {
  /** Nome da pasta/repositório. */
  name: string;
  group: string;
  /** Uma linha sobre o que é, vinda do README/CLAUDE.md do próprio repo. */
  description: string;
  /** Tecnologias principais (ids de `stack.ts` quando houver ícone). */
  stack: string[];
  /** URL do repositório; ausente quando não há remote configurado. */
  url?: string;
  host?: "bitbucket" | "github";
}

export interface ContextGroup {
  id: string;
  label: string;
}

/** Contexto = fatia de domínio que o time sustenta, com N1 e N2 responsáveis. */
export interface Context {
  slug: string;
  name: string;
  group: string;
  /** E-mail do responsável primário; pode apontar pra alguém de outro time. */
  n1?: string;
  n2?: string;
}

export interface StackCategory {
  id: string;
  label: string;
}

export interface StackItem {
  id: string;
  label: string;
  category: string;
  description: string;
  /** Caminho do logo em `public/img/stack/`. */
  logo?: string;
  /** Preenchido quando a tecnologia está em saída. */
  deprecation?: string;
  ecosystem?: { label: string; purpose: string }[];
}

export interface QuickLink {
  label: string;
  description: string;
  url: string;
  /** Logo em `public/img/tools/`; sem ele, cai num ícone genérico. */
  logo?: string;
  /** Logo monocromático escuro: precisa inverter no tema dark. */
  mono?: boolean;
}
