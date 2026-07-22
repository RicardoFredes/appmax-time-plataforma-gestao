import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Check,
  ChevronRight,
  Copy,
  Folder,
  FolderKanban,
  Palmtree,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/components/ui/confirm";
import { initials, firstName } from "@/lib/people";
import { EXTERNAL_NAV_EVENT } from "@/lib/route-sync";
import { useSupabaseSession } from "@/lib/useSupabaseSession";
import { scheduleForAll } from "@/features/sustentacao/schedule";
import { GROUP_ACCENT } from "@/features/sustentacao/SustentacaoPage";
import type { SustentacaoData } from "@/features/tasks/types";
import { ProjetoDetalhe } from "./ProjetoDetalhe";
import { ProjetoFormDialog, RegistroFormDialog } from "./ProjetoForms";
import { Prioridade } from "./Prioridade";
import { Velocimetro } from "./Velocimetro";
import { useProjetosData } from "./useProjetosData";
import { deleteProjeto, deleteRegistro } from "./data";
import type { Projeto } from "./types";
import { parseProjetosState, buildProjetosSearch } from "./url-state";
import {
  PRIORIDADE_LABEL,
  STATUS_META,
  STATUS_ORDER,
  ordenarProjetos,
  porEngenheiro,
  prioridadeMeta,
  progressoAtual,
  progressoMedioPonderado,
  quarterDe,
  quarterLabel,
  quartersDisponiveis,
  contaNoProgresso,
  saudeAtual,
  saudeMediaPonderada,
  saudeMeta,
  ultimoRegistro,
} from "./derive";

/** Nomes dos engenheiros do projeto, unidos (ou "Sem engenheiro"). */
function nomesEngenheiros(p: Projeto): string {
  return p.engenheiros.length > 0
    ? p.engenheiros.map((e) => e.nome).join(", ")
    : "Sem engenheiro";
}

/**
 * Sub-rota da aba: id do projeto aberto (via hash `#/projetos/<id>`), ou `null`
 * na listagem. Linkável e sobrevive ao reload.
 */
function useProjetoRoute(): [string | null, (id: string | null) => void] {
  const read = (): string | null => {
    const h = window.location.hash.replace(/^#\/?/, "");
    const parts = h.split("/");
    return parts[0] === "projetos" && parts[1] ? decodeURIComponent(parts[1]) : null;
  };
  const [id, setId] = useState<string | null>(read);
  useEffect(() => {
    const on = () => setId(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const navigate = (pid: string | null) => {
    window.location.hash = pid ? `/projetos/${pid}` : "/projetos";
    setId(pid);
  };
  return [id, navigate];
}

/* ------------------------------------------------------------------ átomos */

function StatusBadge({ status }: { status: Projeto["status"] }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.badge} className="shrink-0">
      {meta.label}
    </Badge>
  );
}

function SaudeDot({ saude }: { saude: number | null }) {
  if (saude === null) {
    return (
      <span
        className="inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium text-muted-foreground"
        title="Sem on-tracking"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        —
      </span>
    );
  }
  const m = saudeMeta(saude);
  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium"
      style={{ backgroundColor: `${m.color}1a`, color: m.color }}
      title={`On-tracking: ${m.label} (${m.nivel}/5)`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.nivel}/5
    </span>
  );
}

function Avatar({ nome, avatarUrl }: { nome: string | null; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
      aria-hidden
    >
      {nome ? initials(nome) : "—"}
    </div>
  );
}

/**
 * Bloco-líder de uma linha em card `divide-y`: ícone + código mono + título
 * (`text-sm font-medium`) + badges opcionais na primeira linha, e uma sub-linha
 * discreta. Compartilhado pela linha de projeto e pela linha de sustentação para
 * manter os estilos (tamanho do título, chip de código) em sincronia.
 */
function RowLead({
  icon,
  code,
  title,
  badges,
  sub,
}: {
  icon: ReactNode;
  code: ReactNode;
  title: ReactNode;
  badges?: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {icon}
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{code}</span>
        <span className="truncate text-sm font-medium">{title}</span>
        {badges}
      </div>
      {sub && (
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}

/**
 * Uma linha de projeto (clicável → abre o detalhe). As diferenças por
 * agrupamento são controladas por flags:
 * - `showEngenheiro`: sub-linha com o responsável (oculta ao agrupar por engenheiro).
 * - `showImportancia`: badge de importância (oculto ao agrupar por prioridade).
 * - `showNota`: nota do registro mais recente abaixo.
 */
function ProjetoRow({
  projeto,
  onOpen,
  showEngenheiro = true,
  showImportancia = true,
  showNota = false,
}: {
  projeto: Projeto;
  onOpen: (id: string) => void;
  showEngenheiro?: boolean;
  showImportancia?: boolean;
  showNota?: boolean;
}) {
  const meta = STATUS_META[projeto.status];
  const atual = progressoAtual(projeto);
  const u = ultimoRegistro(projeto);
  return (
    <button
      type="button"
      onClick={() => onOpen(projeto.codigo)}
      className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
    >
      <div className="flex items-center gap-3">
        <RowLead
          icon={<Folder className="h-4 w-4 shrink-0 text-primary" />}
          code={projeto.codigo}
          title={projeto.nome}
          sub={
            showEngenheiro && (
              <>
                <UserRound className="h-3.5 w-3.5 shrink-0" />
                {nomesEngenheiros(projeto)}
              </>
            )
          }
        />
        <StatusBadge status={projeto.status} />
        {showImportancia && <Prioridade nivel={projeto.prioridade} />}
        <SaudeDot saude={saudeAtual(projeto)} />
        <div className="hidden w-28 items-center gap-2 sm:flex">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${atual}%`, backgroundColor: meta.color }}
            />
          </div>
        </div>
        <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
          {atual}%
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      {showNota && (
        <p className="mt-1.5 text-sm text-muted-foreground">
          {u?.nota?.trim() || projeto.descricao || "Sem nota registrada."}
        </p>
      )}
    </button>
  );
}

/* ------------------------------------------------------- métricas e agrupamento */

interface Metricas {
  progPond: number;
  progSimples: number;
  /** Quantos projetos entram na conta de progresso (exceto discovery/refinement). */
  progConsiderados: number;
  saudePond: number;
  emRisco: number;
  atencao: number;
  onTrack: number;
  vencidos: number;
}

function computeMetricas(projetos: Projeto[], today: Date): Metricas {
  const venc = (p: Projeto) =>
    p.prazo &&
    p.status !== "done" &&
    differenceInCalendarDays(startOfDay(parseISO(p.prazo)), today) < 0;
  // Progresso ignora discovery/refinement (ainda sem execução real).
  const considerados = projetos.filter(contaNoProgresso);
  const mediaSimples = considerados.length
    ? Math.round(considerados.reduce((s, p) => s + progressoAtual(p), 0) / considerados.length)
    : 0;
  return {
    progPond: progressoMedioPonderado(considerados),
    progSimples: mediaSimples,
    progConsiderados: considerados.length,
    saudePond: saudeMediaPonderada(projetos),
    // Projetos sem saúde (só marcos) não entram em nenhuma faixa da distribuição.
    emRisco: projetos.filter((p) => (saudeAtual(p) ?? 3) <= 2).length,
    atencao: projetos.filter((p) => saudeAtual(p) === 3).length,
    onTrack: projetos.filter((p) => (saudeAtual(p) ?? 0) >= 4).length,
    vencidos: projetos.filter(venc).length,
  };
}

/** Nome + escopo de quem está de plantão nesta semana, por grupo. */
function dutyResumo(sustentacao: SustentacaoData | undefined) {
  if (!sustentacao) return [];
  return scheduleForAll(sustentacao, new Date()).map((g, i) => ({
    grupo: g.grupo,
    escopo: g.escopo,
    nome: g.current?.effective.name ?? "—",
    cobrindo: g.current?.coveringFor?.name ?? null,
    uncovered: g.current?.uncovered ?? false,
    color: GROUP_ACCENT[i % GROUP_ACCENT.length],
  }));
}

/** Comparador dentro de um grupo: prioridade desc, pior saúde primeiro, nome. */
function comparadorProjeto(a: Projeto, b: Projeto): number {
  if (b.prioridade !== a.prioridade) return b.prioridade - a.prioridade;
  // Sem saúde (só marcos) ordena como neutro (3).
  const s = (saudeAtual(a) ?? 3) - (saudeAtual(b) ?? 3);
  if (s !== 0) return s;
  return a.nome.localeCompare(b.nome, "pt-BR");
}

/** Dimensão de organização do relatório. */
export type Dimensao = "prioridade" | "engenheiro" | "status";

/** Uma seção do relatório: um cabeçalho e os projetos daquele grupo. */
interface Secao {
  key: string;
  header: ReactNode;
  /** Rótulo textual da seção (para o relatório copiável). */
  texto: string;
  projetos: Projeto[];
}

/** Agrupa por nível de prioridade (5 → 1). */
function agruparPorPrioridade(projetos: Projeto[]): { nivel: number; projetos: Projeto[] }[] {
  const map = new Map<number, Projeto[]>();
  for (const p of projetos) {
    const n = prioridadeMeta(p.prioridade).nivel;
    const arr = map.get(n);
    if (arr) arr.push(p);
    else map.set(n, [p]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([nivel, ps]) => ({ nivel, projetos: ps.slice().sort(comparadorProjeto) }));
}

/** Agrupa por status, na ordem lógica de `STATUS_ORDER`. */
function agruparPorStatus(projetos: Projeto[]): { status: Projeto["status"]; projetos: Projeto[] }[] {
  const map = new Map<Projeto["status"], Projeto[]>();
  for (const p of projetos) {
    const arr = map.get(p.status);
    if (arr) arr.push(p);
    else map.set(p.status, [p]);
  }
  return STATUS_ORDER.filter((s) => map.has(s)).map((s) => ({
    status: s,
    projetos: map.get(s)!.slice().sort(comparadorProjeto),
  }));
}

/** Monta as seções + as flags de exibição da linha conforme a dimensão. */
function montarSecoes(
  projetos: Projeto[],
  dim: Dimensao,
): { secoes: Secao[]; showEngenheiro: boolean; showImportancia: boolean } {
  if (dim === "engenheiro") {
    return {
      showEngenheiro: false,
      showImportancia: true,
      secoes: porEngenheiro(projetos).map((g) => ({
        key: g.key,
        texto: g.nome,
        projetos: ordenarProjetos(g.projetos),
        header: (
          <div className="mb-2 flex items-center gap-3">
            <Avatar nome={g.temDono ? g.nome : null} avatarUrl={g.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold tracking-tight">{g.nome}</h2>
                <Badge variant="outline">
                  {g.projetos.length} {g.projetos.length === 1 ? "projeto" : "projetos"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                progresso médio {g.progressoMedio}%
              </p>
            </div>
          </div>
        ),
      })),
    };
  }
  if (dim === "status") {
    return {
      showEngenheiro: true,
      showImportancia: true,
      secoes: agruparPorStatus(projetos).map(({ status, projetos: ps }) => ({
        key: status,
        texto: STATUS_META[status].label,
        projetos: ps,
        header: (
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_META[status].color }}
            />
            <h2 className="text-sm font-semibold tracking-tight">{STATUS_META[status].label}</h2>
            <Badge variant="outline" className="ml-1">
              {ps.length}
            </Badge>
          </div>
        ),
      })),
    };
  }
  // prioridade (padrão)
  return {
    showEngenheiro: true,
    showImportancia: false,
    secoes: agruparPorPrioridade(projetos).map((g) => ({
      key: `p${g.nivel}`,
      texto: PRIORIDADE_LABEL[g.nivel],
      projetos: g.projetos,
      header: (
        <div className="mb-2 flex items-center gap-2">
          <Prioridade nivel={g.nivel} />
          <h2 className="text-sm font-semibold tracking-tight">{PRIORIDADE_LABEL[g.nivel]}</h2>
          <Badge variant="outline" className="ml-1">
            {g.projetos.length}
          </Badge>
        </div>
      ),
    })),
  };
}

function buildReport(
  secoes: Secao[],
  duty: ReturnType<typeof dutyResumo>,
  m: Metricas,
  semana: string | null,
): string {
  const L: string[] = ["Relatório de projetos — Time Plataforma"];
  if (semana) L.push(`Semana de ${format(parseISO(semana), "dd/MM/yyyy", { locale: ptBR })}`);
  L.push("");

  L.push("Panorama (ponderado pela importância):");
  L.push(`- Progresso ponderado: ${m.progPond}%`);
  L.push(`- Saúde ponderada: ${m.saudePond}/5`);
  L.push(`- On-track: ${m.onTrack} · Atenção: ${m.atencao} · Em risco: ${m.emRisco} · Vencidos: ${m.vencidos}`);
  L.push("");

  if (duty.length) {
    L.push("Sustentação esta semana:");
    for (const d of duty) {
      const extra = d.uncovered
        ? " (sem cobertura)"
        : d.cobrindo
          ? ` (cobrindo ${d.cobrindo})`
          : "";
      L.push(`- ${d.escopo}: ${d.nome}${extra}`);
    }
    L.push("");
  }

  for (const s of secoes) {
    L.push(`${s.texto}:`);
    for (const p of s.projetos) {
      const u = ultimoRegistro(p);
      const nota = u?.nota?.trim() || p.descricao || "—";
      const sa = saudeAtual(p);
      const onTrack = sa !== null ? ` · ${saudeMeta(sa).label} (${saudeMeta(sa).nivel}/5)` : "";
      const resp = nomesEngenheiros(p);
      L.push(
        `  - [${p.codigo}] ${p.nome} (${resp}) — ${progressoAtual(p)}% · ${STATUS_META[p.status].label}${onTrack}: ${nota}`,
      );
    }
    L.push("");
  }
  return L.join("\n").trim();
}

/**
 * Rosca com dois anéis concêntricos: o externo é a média ponderada (destaque,
 * roxo) e o interno a média simples (laranja). O centro mostra a ponderada.
 */
function Donut({ value, inner }: { value: number; inner: number }) {
  const size = 104;
  const stroke = 7;
  const gap = 1;
  const center = size / 2;
  const rings = [
    { pct: Math.max(0, Math.min(100, value)), r: (size - stroke) / 2, color: "#9b6afa" },
    { pct: Math.max(0, Math.min(100, inner)), r: (size - stroke) / 2 - stroke - gap, color: "#f97316" },
  ];
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {rings.map((ring, i) => {
          const c = 2 * Math.PI * ring.r;
          return (
            <g key={i}>
              <circle cx={center} cy={center} r={ring.r} fill="none" strokeWidth={stroke} className="stroke-muted" />
              <circle
                cx={center}
                cy={center}
                r={ring.r}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="butt"
                stroke={ring.color}
                strokeDasharray={c}
                strokeDashoffset={c * (1 - ring.pct / 100)}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums">
        {rings[0].pct}%
      </div>
    </div>
  );
}

/** Barra empilhada da distribuição de on-tracking (on-track / atenção / risco). */
function DistBar({ onTrack, atencao, emRisco }: { onTrack: number; atencao: number; emRisco: number }) {
  const total = onTrack + atencao + emRisco || 1;
  const segs = [
    { n: onTrack, c: "#10b981", label: "On-track" },
    { n: atencao, c: "#f59e0b", label: "Atenção" },
    { n: emRisco, c: "#ef4444", label: "Em risco" },
  ];
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segs.map((s) =>
          s.n > 0 ? (
            <div key={s.label} style={{ width: `${(s.n / total) * 100}%`, backgroundColor: s.c }} />
          ) : null,
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {segs.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.c }} />
            {s.label} <span className="font-semibold tabular-nums text-foreground">{s.n}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const DIMENSAO_LABEL: Record<Dimensao, string> = {
  prioridade: "Prioridade",
  engenheiro: "Engenheiro",
  status: "Status",
};

/* ---------------------------------------------------------- relatório da semana */

function Relatorio({
  projetos,
  stats,
  sustentacao,
  dim,
  onDimChange,
  onOpen,
}: {
  projetos: Projeto[];
  stats: { total: number; emAndamento: number; concluidos: number; semana: string | null };
  sustentacao: SustentacaoData | undefined;
  dim: Dimensao;
  onDimChange: (dim: Dimensao) => void;
  onOpen: (id: string) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [copied, setCopied] = useState(false);
  const duty = useMemo(() => dutyResumo(sustentacao), [sustentacao]);
  const metricas = useMemo(() => computeMetricas(projetos, today), [projetos, today]);
  const { secoes, showEngenheiro, showImportancia } = useMemo(
    () => montarSecoes(projetos, dim),
    [projetos, dim],
  );
  const texto = useMemo(
    () => buildReport(secoes, duty, metricas, stats.semana),
    [secoes, duty, metricas, stats.semana],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard indisponível: silencioso (o texto segue visível abaixo).
    }
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Panorama e status por projeto
          {stats.semana && (
            <> · semana de {format(parseISO(stats.semana), "dd MMM yyyy", { locale: ptBR })}</>
          )}
          .
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Visualizar por
          </span>
          <Select value={dim} onValueChange={(v) => onDimChange(v as Dimensao)}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(DIMENSAO_LABEL) as Dimensao[]).map((d) => (
                <SelectItem key={d} value={d}>
                  {DIMENSAO_LABEL[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="text-emerald-500" /> : <Copy />}
            {copied ? "Copiado" : "Copiar relatório"}
          </Button>
        </div>
      </div>

      {/* Panorama gráfico, ponderado pela importância */}
      <div className="grid gap-2 sm:grid-cols-8">
        <Card className="flex flex-col p-5 text-center sm:col-span-2">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Progresso
          </div>
          <div className="flex flex-1 items-center justify-center">
            <Donut value={metricas.progPond} inner={metricas.progSimples} />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#9b6afa" }} />
              Ponderada{" "}
              <span className="font-semibold tabular-nums text-foreground">{metricas.progPond}%</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#f97316" }} />
              Simples{" "}
              <span className="font-semibold tabular-nums text-foreground">{metricas.progSimples}%</span>
            </span>
          </div>
        </Card>
        <Card className="flex flex-col p-5 text-center sm:col-span-2">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Saúde ponderada
          </div>
          <div className="flex flex-1 items-center justify-center">
            <Velocimetro saude={metricas.saudePond} showValor={false} />
          </div>
          {(() => {
            const m = saudeMeta(metricas.saudePond);
            return (
              <div
                className="mt-2 inline-flex items-center justify-center gap-1.5 self-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ backgroundColor: `${m.color}1a`, color: m.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                {m.label} · {m.nivel}/5
              </div>
            );
          })()}
        </Card>
        <div className="flex flex-col gap-2 sm:col-span-4">
          <Card className="p-5">
            <div className="grid grid-cols-4 gap-2">
              <MiniStat label="Projetos" value={stats.total} />
              <MiniStat label="Ativos" value={stats.emAndamento} />
              <MiniStat
                label="No progresso"
                value={metricas.progConsiderados}
                title="Base do cálculo de Progresso: exclui Discovery e Refinement"
              />
              <MiniStat label="Concluídos" value={stats.concluidos} />
            </div>
          </Card>
          <Card className="flex flex-1 flex-col p-5">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              On-tracking
            </div>
            <div className="flex flex-1 items-center">
              <div className="w-full">
                <DistBar
                  onTrack={metricas.onTrack}
                  atencao={metricas.atencao}
                  emRisco={metricas.emRisco}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sustentação da semana (acima dos projetos) */}
      {duty.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold tracking-tight">Sustentação esta semana</h2>
          </div>
          <Card className="divide-y">
            {duty.map((d) => (
              <div key={d.escopo} className="flex px-4 py-3">
                <RowLead
                  icon={<ShieldCheck className="h-4 w-4 shrink-0" style={{ color: d.color }} />}
                  code={`Grupo ${d.grupo}`}
                  title={d.escopo}
                  badges={
                    <>
                      {d.cobrindo && (
                        <Badge variant="warning" className="gap-1">
                          <Palmtree className="h-3 w-3" />
                          cobre {firstName(d.cobrindo)}
                        </Badge>
                      )}
                      {d.uncovered && <Badge variant="destructive">sem cobertura</Badge>}
                    </>
                  }
                  sub={
                    <>
                      <UserRound className="h-3.5 w-3.5 shrink-0" />
                      {d.nome}
                    </>
                  }
                />
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Projetos agrupados conforme a dimensão selecionada */}
      <div className="space-y-5">
        {secoes.map((s) => (
          <div key={s.key}>
            {s.header}
            <Card className="divide-y">
              {s.projetos.map((p) => (
                <ProjetoRow
                  key={p.id}
                  projeto={p}
                  onOpen={onOpen}
                  showEngenheiro={showEngenheiro}
                  showImportancia={showImportancia}
                />
              ))}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- página */

function MiniStat({
  label,
  value,
  title,
}: {
  label: string;
  value: number | string;
  title?: string;
}) {
  return (
    <div className="text-center" title={title}>
      <div className="text-2xl font-semibold leading-none tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export function ProjetosPage({ sustentacao }: { sustentacao?: SustentacaoData }) {
  const [id, navigate] = useProjetoRoute();
  const { state, refetch } = useProjetosData();
  const session = useSupabaseSession();
  const podeEditar = session !== null;
  const confirm = useConfirm();

  // Dados carregados (vazio enquanto carrega — mantém a ordem dos hooks estável).
  const projetosAll = state.status === "ready" ? state.data.projetos : [];

  // Dialogs de CRUD.
  const [novoOpen, setNovoOpen] = useState(false);
  const [editar, setEditar] = useState<Projeto | null>(null);
  // `reportar` = reportar/editar registro; `semana` presente → edita aquela semana.
  const [reportar, setReportar] = useState<{ projeto: Projeto; semana?: string } | null>(null);

  // Quarter atual pelo relógio do cliente; a visão principal começa nele.
  const quarterAtual = useMemo(() => quarterDe(new Date()), []);

  // Filtros no query string (padrão do projeto — ver ./url-state.ts). Estado
  // inicial vindo da URL; `quarter` ausente cai no atual.
  const initial = useMemo(() => parseProjetosState(window.location.search), []);
  const [quarter, setQuarter] = useState(() => initial.quarter ?? quarterAtual);
  const [dim, setDim] = useState<Dimensao>(initial.dim);

  const quarters = useMemo(() => {
    const qs = quartersDisponiveis(projetosAll, quarterAtual);
    return qs.includes(quarter) ? qs : [quarter, ...qs].sort((a, b) => b.localeCompare(a));
  }, [projetosAll, quarterAtual, quarter]);


  // Reflete os filtros na URL (replaceState — não polui o histórico).
  useEffect(() => {
    const search = buildProjetosSearch(
      { quarter, dim, quarterAtual },
      window.location.search,
    );
    const url = window.location.pathname + search + window.location.hash;
    window.history.replaceState(null, "", url);
  }, [quarter, dim, quarterAtual]);

  // Re-lê a URL quando o backoffice (embed) empurra novos filtros — sem isto o
  // estado seria lido só no mount e o sync backoffice -> painel não refletiria.
  useEffect(() => {
    const reread = () => {
      const s = parseProjetosState(window.location.search);
      setQuarter(s.quarter && quarters.includes(s.quarter) ? s.quarter : quarterAtual);
      setDim(s.dim);
    };
    window.addEventListener(EXTERNAL_NAV_EVENT, reread);
    return () => window.removeEventListener(EXTERNAL_NAV_EVENT, reread);
  }, [quarters, quarterAtual]);

  const projetos = useMemo(
    () => projetosAll.filter((p) => p.quarter === quarter),
    [projetosAll, quarter],
  );

  const stats = useMemo(() => {
    const emAndamento = projetos.filter(
      (p) => p.status === "in_progress" || p.status === "testing",
    ).length;
    const concluidos = projetos.filter((p) => p.status === "done").length;
    const semana =
      projetos
        .flatMap((p) => p.registros.map((r) => r.semana))
        .sort((a, b) => b.localeCompare(a))[0] ?? null;
    return {
      total: projetos.length,
      emAndamento,
      concluidos,
      semana,
    };
  }, [projetos]);

  // Estados de carregamento/erro do Supabase.
  if (state.status === "loading") return <ProjetosSkeleton />;
  if (state.status === "error") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Erro ao carregar projetos: {state.error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  // Detalhe de um projeto (busca em todos os quarters, não só no selecionado).
  // A rota usa o código (ex.: PRJ-3); aceita o slug antigo como fallback.
  const projetoAberto = id
    ? projetosAll.find((p) => p.codigo === id) ?? projetosAll.find((p) => p.id === id) ?? null
    : null;

  // Apaga o projeto inteiro (confirma antes; volta à lista e recarrega).
  const apagarProjeto = async (projeto: Projeto) => {
    const ok = await confirm({
      title: "Apagar projeto?",
      description: `"${projeto.nome}" e todo o seu histórico serão removidos. Não dá para desfazer.`,
      confirmLabel: "Apagar",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteProjeto(projeto.id);
      navigate(null);
      refetch();
    } catch (e) {
      await confirm({
        title: "Não foi possível apagar",
        description: e instanceof Error ? e.message : String(e),
        confirmLabel: "Ok",
        cancelLabel: "Fechar",
      });
    }
  };

  // Apaga um registro semanal (confirma antes; recarrega ao concluir).
  const apagarRegistro = async (projeto: Projeto, semana: string) => {
    const ok = await confirm({
      title: "Apagar registro?",
      description: `O registro da semana de ${semana} será removido.`,
      confirmLabel: "Apagar",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteRegistro(projeto.id, semana);
      refetch();
    } catch (e) {
      await confirm({
        title: "Não foi possível apagar",
        description: e instanceof Error ? e.message : String(e),
        confirmLabel: "Ok",
        cancelLabel: "Fechar",
      });
    }
  };

  // Dialogs de CRUD, montados uma vez (acessíveis do detalhe e da lista).
  const dialogs = (
    <>
      <ProjetoFormDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        projeto={null}
        projetosExistentes={projetosAll}
        quarterAtual={quarterAtual}
        onSaved={refetch}
      />
      {editar && (
        <ProjetoFormDialog
          open
          onOpenChange={(v) => !v && setEditar(null)}
          projeto={editar}
          projetosExistentes={projetosAll}
          quarterAtual={quarterAtual}
          onSaved={refetch}
        />
      )}
      {reportar && (
        <RegistroFormDialog
          open
          onOpenChange={(v) => !v && setReportar(null)}
          projeto={reportar.projeto}
          semana={reportar.semana}
          onSaved={refetch}
        />
      )}
    </>
  );

  if (id) {
    const content = projetoAberto ? (
      <ProjetoDetalhe
        projeto={projetoAberto}
        onBack={() => navigate(null)}
        podeEditar={podeEditar}
        onEditar={() => setEditar(projetoAberto)}
        onReportar={() => setReportar({ projeto: projetoAberto })}
        onApagar={() => apagarProjeto(projetoAberto)}
        onEditarRegistro={(semana) => setReportar({ projeto: projetoAberto, semana })}
        onApagarRegistro={(semana) => apagarRegistro(projetoAberto, semana)}
      />
    ) : (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Projeto <code>{id}</code> não encontrado.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(null)}>
          Voltar à lista
        </Button>
      </div>
    );
    return (
      <>
        {content}
        {dialogs}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Controle de Projetos</h1>
            <div className="flex items-center gap-2">
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((q) => (
                    <SelectItem key={q} value={q}>
                      {quarterLabel(q)}
                      {q === quarterAtual ? " · atual" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {podeEditar && (
                <Button size="sm" onClick={() => setNovoOpen(true)}>
                  <Plus /> Novo projeto
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Evolução semanal dos projetos.
          </p>
        </div>

        {projetosAll.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Nenhum projeto cadastrado ainda.
            {podeEditar && " Use “Novo projeto” para começar."}
          </Card>
        ) : projetos.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Nenhum projeto em {quarterLabel(quarter)}.
          </Card>
        ) : (
          <Relatorio
            projetos={projetos}
            stats={stats}
            sustentacao={sustentacao}
            dim={dim}
            onDimChange={setDim}
            onOpen={(pid) => navigate(pid)}
          />
        )}

        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <FolderKanban className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="leading-relaxed">
            Clique em um projeto para ver o histórico e{" "}
            {podeEditar ? "reportar a semana / editar" : "acompanhar a evolução"}.
            {!podeEditar && " (Edição disponível dentro do backoffice.)"}
          </p>
        </div>
      </div>
      {dialogs}
    </>
  );
}

/** Esqueleto enquanto os projetos carregam do Supabase. */
function ProjetosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid gap-2 sm:grid-cols-8">
        <Skeleton className="h-40 sm:col-span-2" />
        <Skeleton className="h-40 sm:col-span-2" />
        <Skeleton className="h-40 sm:col-span-4" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
