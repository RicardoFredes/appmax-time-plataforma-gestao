/**
 * CLI interativo para registrar o progresso semanal dos projetos.
 *
 *   pnpm projetos
 *
 * Faz perguntas no terminal e grava em `src/features/projetos/projetos.json`
 * (a fonte editada à mão que o frontend lê). Sem rede, sem Jira. A `semana` de
 * um registro é sempre a segunda-feira da semana corrente (relógio local); se já
 * existir registro para essa semana, ele é editado no lugar (1 por semana).
 *
 * Preserva o cabeçalho `$doc` e o estilo do arquivo (cada registro em uma linha).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { stdin as input, stdout as output } from "node:process";

// Contrato espelhado de `src/features/projetos/types.ts` (o projeto `sync` do
// tsconfig não importa de `src`; mesma convenção do `sync/types.ts` para tasks).
type ProjetoStatus =
  | "discovery"
  | "refinement"
  | "in_progress"
  | "testing"
  | "blocked"
  | "paused"
  | "done";

interface RegistroSemanal {
  semana: string;
  progresso: number;
  saude: number;
  nota: string;
  marco?: "inicio" | "fim";
}

interface Projeto {
  id: string;
  codigo: string;
  nome: string;
  engenheiroEmail: string | null;
  engenheiroNome: string | null;
  inicio: string | null;
  prazo: string | null;
  fechamento: string | null;
  status: ProjetoStatus;
  prioridade: number;
  quarter: string;
  descricao: string;
  registros: RegistroSemanal[];
}

interface ProjetosData {
  projetos: Projeto[];
}

/** Serializa no formato do arquivo (registro em uma linha, `$doc` no topo). */
function serializeProjetosData(data: ProjetosData, doc?: string): string {
  const withDoc = doc !== undefined ? { $doc: doc, ...data } : data;
  let out = JSON.stringify(withDoc, null, 2);
  out = out.replace(/\{\n\s*"semana":[\s\S]*?\n\s*\}/g, (block) => {
    const r = JSON.parse(block) as RegistroSemanal;
    const marco = r.marco ? `, "marco": ${JSON.stringify(r.marco)}` : "";
    return `{ "semana": ${JSON.stringify(r.semana)}, "progresso": ${r.progresso}, "saude": ${r.saude}, "nota": ${JSON.stringify(r.nota)}${marco} }`;
  });
  return out + "\n";
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = resolve(__dirname, "../src/features/projetos/projetos.json");

const STATUSES: ProjetoStatus[] = [
  "discovery",
  "refinement",
  "in_progress",
  "testing",
  "blocked",
  "paused",
  "done",
];

const SAUDE_LABEL: Record<number, string> = {
  1: "Em perigo",
  2: "Em risco",
  3: "Atenção",
  4: "No caminho",
  5: "On tracking",
};

const PRIORIDADE_LABEL: Record<number, string> = {
  1: "Mínima",
  2: "Baixa",
  3: "Média",
  4: "Alta",
  5: "Máxima",
};

// ── datas ────────────────────────────────────────────────────────────────
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Segunda-feira da semana de `d` (relógio local), `YYYY-MM-DD`. */
function mondayISO(d = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0 dom … 6 sáb
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return toISO(date);
}

function quarterDe(d = new Date()): string {
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

// ── prompts ──────────────────────────────────────────────────────────────
const rl = createInterface({ input, output });

async function ask(q: string): Promise<string> {
  return (await rl.question(q)).trim();
}

/** Texto livre com valor padrão (Enter mantém o padrão). */
async function askText(label: string, def?: string): Promise<string> {
  const hint = def !== undefined && def !== "" ? ` [${def}]` : "";
  const v = await ask(`${label}${hint}: `);
  return v === "" && def !== undefined ? def : v;
}

/** Inteiro clampado em [min,max] com padrão; repete até valer. */
async function askInt(label: string, min: number, max: number, def?: number): Promise<number> {
  for (;;) {
    const hint = def !== undefined ? ` [${def}]` : "";
    const raw = await ask(`${label} (${min}–${max})${hint}: `);
    if (raw === "" && def !== undefined) return def;
    const n = Number(raw);
    if (Number.isInteger(n) && n >= min && n <= max) return n;
    console.log(`  ↳ valor inválido, informe um inteiro de ${min} a ${max}.`);
  }
}

/** Sim/Não com padrão. */
async function askYesNo(label: string, def = true): Promise<boolean> {
  const raw = (await ask(`${label} ${def ? "[S/n]" : "[s/N]"}: `)).toLowerCase();
  if (raw === "") return def;
  return raw === "s" || raw === "sim" || raw === "y";
}

/** Menu numerado; devolve o índice escolhido. */
async function askChoice(label: string, options: string[], def = 0): Promise<number> {
  console.log(`\n${label}`);
  options.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
  for (;;) {
    const raw = await ask(`Escolha [${def + 1}]: `);
    if (raw === "") return def;
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return n - 1;
    console.log(`  ↳ escolha de 1 a ${options.length}.`);
  }
}

/** Data `YYYY-MM-DD` ou null (Enter/"-" limpa). */
async function askDate(label: string, def: string | null): Promise<string | null> {
  const hint = def ? ` [${def}]` : ' [vazio = sem data, "-" limpa]';
  for (;;) {
    const raw = await ask(`${label}${hint}: `);
    if (raw === "") return def;
    if (raw === "-") return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    console.log("  ↳ formato esperado YYYY-MM-DD (ou - para limpar).");
  }
}

// ── serialização (mesmo formato do arquivo, compartilhada com o frontend) ──
function load(): { doc: string | undefined; data: ProjetosData } {
  const raw = JSON.parse(readFileSync(JSON_PATH, "utf8")) as ProjetosData & { $doc?: string };
  const { $doc, ...rest } = raw;
  return { doc: $doc, data: rest as ProjetosData };
}

function save(doc: string | undefined, data: ProjetosData): void {
  writeFileSync(JSON_PATH, serializeProjetosData(data, doc), "utf8");
  console.log(`\n✔ Gravado em ${JSON_PATH.replace(process.cwd() + "/", "")}`);
}

// ── helpers de projeto ─────────────────────────────────────────────────────
function ultimo(p: Projeto): RegistroSemanal | undefined {
  return [...p.registros].sort((a, b) => a.semana.localeCompare(b.semana)).pop();
}

function resumo(p: Projeto): string {
  const u = ultimo(p);
  const prog = u ? `${u.progresso}%` : "—";
  const saude = u ? `saúde ${u.saude}` : "sem registro";
  return `${p.codigo}  ${p.nome}  ·  ${p.status}  ·  ${prog}  ·  ${saude}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Engenheiros já presentes (dedup por e-mail), para reaproveitar identidade. */
function engenheiros(data: ProjetosData): { email: string; nome: string }[] {
  const map = new Map<string, string>();
  for (const p of data.projetos) {
    if (p.engenheiroEmail && p.engenheiroNome) map.set(p.engenheiroEmail, p.engenheiroNome);
  }
  return [...map].map(([email, nome]) => ({ email, nome })).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

async function escolherEngenheiro(data: ProjetosData): Promise<{ email: string | null; nome: string | null }> {
  const eng = engenheiros(data);
  const opts = [...eng.map((e) => `${e.nome} (${e.email})`), "Outro (digitar)", "Sem dono"];
  const i = await askChoice("Engenheiro:", opts);
  if (i < eng.length) return { email: eng[i].email, nome: eng[i].nome };
  if (i === eng.length) {
    const nome = await askText("Nome do engenheiro");
    const email = await askText("E-mail do engenheiro");
    return { email: email || null, nome: nome || null };
  }
  return { email: null, nome: null };
}

// ── ações ──────────────────────────────────────────────────────────────────
/** Adiciona (ou edita) o registro da semana `semana` de um projeto. */
async function registrarSemana(p: Projeto, semana: string): Promise<void> {
  const anterior = ultimo(p);
  const existente = p.registros.find((r) => r.semana === semana);
  console.log(`\n▸ ${p.nome} — semana de ${semana}`);
  if (existente) console.log("  (já há registro nesta semana — será atualizado)");

  const base = existente ?? anterior;
  const progresso = await askInt("  Progresso acumulado", 0, 100, base?.progresso ?? 0);
  const saudeLinha = Object.entries(SAUDE_LABEL)
    .map(([n, l]) => `${n}=${l}`)
    .join("  ");
  console.log(`  Saúde: ${saudeLinha}`);
  const saude = await askInt("  Saúde", 1, 5, base?.saude ?? 3);
  const nota = await askText("  Nota da semana", existente?.nota ?? "");

  const reg: RegistroSemanal = { semana, progresso, saude, nota };
  if (existente) Object.assign(existente, reg);
  else p.registros.push(reg);
  p.registros.sort((a, b) => a.semana.localeCompare(b.semana));
}

/** Varredura: percorre os projetos do quarter atual pedindo o registro da semana. */
async function varreduraSemanal(data: ProjetosData): Promise<boolean> {
  const semana = mondayISO();
  const q = quarterDe();
  const abertos = data.projetos.filter((p) => p.quarter === q && p.status !== "done");
  if (abertos.length === 0) {
    console.log(`\nNenhum projeto aberto no quarter ${q}.`);
    return false;
  }
  console.log(`\nVarredura semanal — ${q}, semana de ${semana} (${abertos.length} projetos).`);
  console.log('Enter = "sim" para cada projeto; responda "n" para pular.\n');
  let mudou = false;
  for (const p of abertos) {
    if (await askYesNo(`Atualizar ${p.codigo} ${p.nome}?`)) {
      await registrarSemana(p, semana);
      mudou = true;
    }
  }
  return mudou;
}

async function escolherProjeto(data: ProjetosData, label = "Projeto:"): Promise<Projeto | null> {
  if (data.projetos.length === 0) {
    console.log("Nenhum projeto cadastrado ainda.");
    return null;
  }
  const ordenados = [...data.projetos].sort((a, b) => a.codigo.localeCompare(b.codigo));
  const i = await askChoice(label, ordenados.map(resumo));
  return ordenados[i];
}

async function registrarUm(data: ProjetosData): Promise<boolean> {
  const p = await escolherProjeto(data, "Qual projeto registrar?");
  if (!p) return false;
  await registrarSemana(p, mondayISO());
  return true;
}

async function editarDados(data: ProjetosData): Promise<boolean> {
  const p = await escolherProjeto(data, "Qual projeto editar?");
  if (!p) return false;
  console.log(`\nEditando ${p.codigo} — ${p.nome}`);
  p.nome = await askText("Nome", p.nome);
  p.descricao = await askText("Descrição", p.descricao);
  p.status = STATUSES[await askChoice("Status:", STATUSES, STATUSES.indexOf(p.status))];
  p.prioridade = await askInt(
    `Prioridade (1 ${PRIORIDADE_LABEL[1]} … 5 ${PRIORIDADE_LABEL[5]})`,
    1,
    5,
    p.prioridade,
  );
  p.quarter = await askText("Quarter", p.quarter);
  if (await askYesNo("Trocar engenheiro?", false)) {
    const e = await escolherEngenheiro(data);
    p.engenheiroEmail = e.email;
    p.engenheiroNome = e.nome;
  }
  p.inicio = await askDate("Início", p.inicio);
  p.prazo = await askDate("Prazo", p.prazo);
  p.fechamento = await askDate("Fechamento", p.fechamento);
  if (p.status === "done" && !p.fechamento) {
    if (await askYesNo(`Marcar fechamento como hoje (${toISO(new Date())})?`)) {
      p.fechamento = toISO(new Date());
    }
  }
  return true;
}

async function novoProjeto(data: ProjetosData): Promise<boolean> {
  console.log("\nNovo projeto");
  const nome = await askText("Nome");
  if (!nome) {
    console.log("Nome vazio, cancelado.");
    return false;
  }
  let id = await askText("id (slug da URL)", slugify(nome));
  while (data.projetos.some((p) => p.id === id)) {
    console.log("  ↳ id já existe.");
    id = await askText("id (slug da URL)", slugify(nome) + "-2");
  }
  const nextNum = data.projetos.length + 1;
  const codigo = await askText("Código (ex.: PRJ-1)", `PRJ-${nextNum}`);
  const descricao = await askText("Descrição", "");
  const status = STATUSES[await askChoice("Status:", STATUSES, STATUSES.indexOf("in_progress"))];
  const prioridade = await askInt(
    `Prioridade (1 ${PRIORIDADE_LABEL[1]} … 5 ${PRIORIDADE_LABEL[5]})`,
    1,
    5,
    3,
  );
  const quarter = await askText("Quarter", quarterDe());
  const eng = await escolherEngenheiro(data);
  const inicio = await askDate("Início", null);
  const prazo = await askDate("Prazo", null);

  const p: Projeto = {
    id,
    codigo,
    nome,
    engenheiroEmail: eng.email,
    engenheiroNome: eng.nome,
    inicio,
    prazo,
    fechamento: null,
    status,
    prioridade,
    quarter,
    descricao,
    registros: [],
  };
  data.projetos.push(p);
  if (await askYesNo("Adicionar o registro da semana agora?")) {
    await registrarSemana(p, mondayISO());
  }
  return true;
}

// ── loop principal ──────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const { doc, data } = load();
  console.log(`Controle de projetos — ${data.projetos.length} projeto(s). Arquivo: ${JSON_PATH.replace(process.cwd() + "/", "")}`);

  let dirty = false;
  loop: for (;;) {
    const acao = await askChoice("\nO que deseja fazer?", [
      "Varredura semanal (todos os projetos do quarter)",
      "Registrar a semana de UM projeto",
      "Editar dados de um projeto",
      "Novo projeto",
      dirty ? "Salvar e sair" : "Sair",
    ]);
    switch (acao) {
      case 0:
        dirty = (await varreduraSemanal(data)) || dirty;
        break;
      case 1:
        dirty = (await registrarUm(data)) || dirty;
        break;
      case 2:
        dirty = (await editarDados(data)) || dirty;
        break;
      case 3:
        dirty = (await novoProjeto(data)) || dirty;
        break;
      case 4:
        break loop;
    }
  }

  if (dirty) save(doc, data);
  else console.log("\nNada alterado.");
  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
