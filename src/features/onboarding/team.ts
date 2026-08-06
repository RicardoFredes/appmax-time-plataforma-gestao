/**
 * O time, hardcoded. A lista de pessoas espelha `sync/config.json` (fonte do
 * resto do painel): ao adicionar/remover alguém lá, reflita aqui. Cargos e
 * skills vieram do controle interno do time (`time-plataforma/data/team.json`)
 * e **não** existem no `config.json`.
 */
import type { Member, TeamTrack } from "./types";

export const TEAM_NAME = "Time Plataforma e Backoffice";

/** Apresentação do time. Parágrafos renderizados em sequência na aba. */
export const TEAM_MISSION: string[] = [
  "Somos o time de Plataforma e Backoffice da Appmax e do Max. Cuidamos das " +
    "interfaces por onde a empresa opera e por onde o cliente passa: os painéis " +
    "internos que a operação usa todo dia, a área do cliente, os sites, os apps de " +
    "Android e iOS dos dois produtos e as jornadas de recuperação de vendas, as que " +
    "trazem de volta a compra que quase não aconteceu.",
  "Duas frentes convivem o tempo todo. **Projeto** é o que está no roadmap do quarter, " +
    "com progresso e saúde reportados semana a semana (aba Projetos). **Sustentação** é " +
    "o plantão que responde ao que quebra, em rodízio de duas semanas por engenheiro, " +
    "em dois grupos: Plataforma/Backoffice e Aplicativo (aba Sustentação). Todo mundo " +
    "faz os dois; ninguém fica só apagando incêndio nem só construindo.",
  "O time se divide em duas trilhas: **fullstack**, que toca o web e as APIs de " +
    "borda, e **mobile**, que toca os apps em Flutter. A stack web nova é React + " +
    "TypeScript + Tailwind; o Vue que você vai encontrar é legado em migração, e o " +
    "monolito Laravel (`sistema`) ainda é a fonte de verdade de boa parte do negócio.",
];

export const TRACKS: TeamTrack[] = [
  { id: "manager", label: "Liderança" },
  { id: "fullstack", label: "Fullstack" },
  { id: "mobile", label: "Mobile" },
];

/**
 * Ordem = senioridade declarada, do mais sênior pro mais júnior dentro da
 * trilha. `position` sai do controle interno do time; quem entrou depois
 * daquele snapshot fica sem cargo até ser validado.
 */
export const MEMBERS: Member[] = [
  {
    email: "ricardo.silveira@appmax.com.br",
    name: "Ricardo Silveira",
    nickname: "Fredes",
    track: "manager",
    position: "Manager | Staff III",
    skills: ["design", "ux", "vue", "react", "node", "postgres", "php"],
    dutyGroup: -1,
  },
  {
    email: "joao.justo@appmax.com.br",
    name: "João Justo",
    track: "fullstack",
    position: "Staff I",
    skills: ["vue", "node", "php", "react"],
    dutyGroup: 1,
  },
  {
    email: "paulo.araujo@appmax.com.br",
    name: "Paulo Felipe de Araujo",
    track: "fullstack",
    position: "Software Engineer V",
    skills: [],
    dutyGroup: -1,
    isNew: true,
  },
  {
    email: "witerlland.silva@appmax.com.br",
    name: "Witerlland Silva",
    nickname: "Witer",
    track: "fullstack",
    position: "Software Engineer IV",
    skills: ["vue", "react", "node", "design"],
    dutyGroup: 1,
  },
  {
    email: "bruno.schneider@appmax.com.br",
    name: "Bruno Schneider",
    track: "fullstack",
    position: "Software Engineer II",
    skills: ["vue", "react", "node", "design"],
    dutyGroup: 1,
  },
  {
    email: "felipe.carvalho@appmax.com.br",
    name: "Felipe Carvalho",
    nickname: "Felipe Evaldt",
    track: "fullstack",
    position: "Software Engineer II",
    skills: ["vue", "react", "node", "design"],
    dutyGroup: 1,
  },
  {
    email: "jose.chagury@appmax.com.br",
    name: "José Chagury",
    track: "fullstack",
    position: "Software Engineer I",
    skills: ["react", "node", "python", "vue"],
    dutyGroup: -1,
  },
  {
    email: "ian.oliveira@appmax.com.br",
    name: "Ian Oliveira",
    track: "mobile",
    position: "Software Engineer V",
    skills: ["firebase", "flutter"],
    dutyGroup: 2,
  },
  {
    email: "diogo.januario@appmax.com.br",
    name: "Diogo Januário",
    track: "mobile",
    position: "Software Engineer III",
    skills: ["flutter", "firebase"],
    dutyGroup: 2,
  },
];

export const MEMBER_BY_EMAIL = new Map(MEMBERS.map((m) => [m.email, m]));

/** Como a pessoa aparece nos rótulos curtos: apelido quando existe. */
export function displayName(m: Member): string {
  return m.nickname ?? m.name;
}
