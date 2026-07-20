/** Contrato do controle de projetos (`projetos.json`, editado à mão). */

export type ProjetoStatus =
  | "discovery"
  | "refinamento"
  | "em_andamento"
  | "em_testes"
  | "bloqueado"
  | "pausado"
  | "concluido";

/** Um registro semanal de evolução (adicionado toda semana à mão). */
export interface RegistroSemanal {
  /** Segunda-feira da semana, `YYYY-MM-DD`. */
  semana: string;
  /** Progresso acumulado, 0–100. */
  progresso: number;
  /** Saúde do projeto: 1 (em perigo) a 5 (on tracking). */
  saude: number;
  /** Nota livre sobre como andou o projeto na semana. */
  nota: string;
}

export interface Projeto {
  /** Slug estável, usado na URL de detalhe (`#/projetos/<id>`). */
  id: string;
  /** Código curto de exibição (ex.: "P01"). */
  codigo: string;
  nome: string;
  /** E-mail do engenheiro (casa com sync/config.json) ou `null` se sem dono. */
  engenheiroEmail: string | null;
  /** Nome de exibição do engenheiro, ou `null` se sem dono. */
  engenheiroNome: string | null;
  /** Data de início `YYYY-MM-DD`, ou `null`. */
  inicio: string | null;
  /** Previsão de término `YYYY-MM-DD`, ou `null` se sem data definida. */
  prazo: string | null;
  /** Data de fechamento real `YYYY-MM-DD`, ou `null` enquanto aberto. */
  fechamento: string | null;
  status: ProjetoStatus;
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
