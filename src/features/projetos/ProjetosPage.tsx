import { useEffect, useMemo, useState } from "react";
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
  FolderKanban,
  Palmtree,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initials, firstName } from "@/lib/people";
import { scheduleForAll } from "@/features/sustentacao/schedule";
import type { SustentacaoData } from "@/features/tasks/types";
import projetosData from "./projetos.json";
import { ProjetoDetalhe } from "./ProjetoDetalhe";
import { Velocimetro } from "./Velocimetro";
import type { Projeto, ProjetosData } from "./types";
import {
  PRIORIDADE_LABEL,
  STATUS_META,
  ordenarProjetos,
  porEngenheiro,
  prioridadeMeta,
  progressoAtual,
  progressoMedio,
  progressoMedioPonderado,
  quarterDe,
  quarterLabel,
  quartersDisponiveis,
  saudeAtual,
  saudeMediaPonderada,
  saudeMeta,
  ultimoRegistro,
} from "./derive";

const DATA = projetosData as ProjetosData;

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
  return <Badge variant={meta.badge}>{meta.label}</Badge>;
}

function SaudeDot({ saude }: { saude: number }) {
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

function Importancia({ nivel }: { nivel: number }) {
  const m = prioridadeMeta(nivel);
  return (
    <span
      className="inline-flex h-6 items-center gap-1 rounded-full bg-amber-500/10 px-2 text-[11px] font-medium text-amber-600 dark:text-amber-400"
      title={`Importância: ${m.label} (${m.nivel}/5)`}
    >
      <Star className="h-3 w-3 fill-current" />
      {m.nivel}
    </span>
  );
}

function Avatar({ nome }: { nome: string | null }) {
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
 * Uma linha de projeto (clicável → abre o detalhe). Usada nas duas visões:
 * lista "Por projeto"/"Por engenheiro" e Relatório da semana. As diferenças
 * são controladas por flags:
 * - `showEngenheiro`: sub-linha com o responsável (oculta na visão por engenheiro).
 * - `showImportancia`: badge de importância (oculto no relatório, onde o grupo já indica).
 * - `showNota`: nota do registro mais recente abaixo (usada no relatório).
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
      onClick={() => onOpen(projeto.id)}
      className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
    >
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
          {projeto.codigo}
        </Badge>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{projeto.nome}</span>
            <StatusBadge status={projeto.status} />
          </div>
          {showEngenheiro && (
            <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <UserRound className="h-3.5 w-3.5 shrink-0" />
              {projeto.engenheiroNome ?? "Sem engenheiro"}
            </div>
          )}
        </div>
        {showImportancia && <Importancia nivel={projeto.prioridade} />}
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

/* ---------------------------------------------------------------- visão por eng. */

function PorEngenheiro({
  projetos,
  onOpen,
}: {
  projetos: Projeto[];
  onOpen: (id: string) => void;
}) {
  const grupos = useMemo(() => porEngenheiro(projetos), [projetos]);
  return (
    <div className="space-y-6">
      {grupos.map((g) => (
        <div key={g.key}>
          <div className="mb-2 flex items-center gap-3">
            <Avatar nome={g.email ? g.nome : null} />
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
          <Card className="divide-y">
            {ordenarProjetos(g.projetos).map((p) => (
              <ProjetoRow key={p.id} projeto={p} onOpen={onOpen} showEngenheiro={false} />
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- relatório da semana */

interface Metricas {
  progPond: number;
  saudePond: number;
  emRisco: number;
  atencao: number;
  onTrack: number;
  vencidos: number;
  altaImp: number;
}

function computeMetricas(projetos: Projeto[], today: Date): Metricas {
  const venc = (p: Projeto) =>
    p.prazo &&
    p.status !== "concluido" &&
    differenceInCalendarDays(startOfDay(parseISO(p.prazo)), today) < 0;
  return {
    progPond: progressoMedioPonderado(projetos),
    saudePond: saudeMediaPonderada(projetos),
    emRisco: projetos.filter((p) => saudeAtual(p) <= 2).length,
    atencao: projetos.filter((p) => saudeAtual(p) === 3).length,
    onTrack: projetos.filter((p) => saudeAtual(p) >= 4).length,
    vencidos: projetos.filter(venc).length,
    altaImp: projetos.filter((p) => p.prioridade >= 4).length,
  };
}

/** Nome + escopo de quem está de plantão nesta semana, por grupo. */
function dutyResumo(sustentacao: SustentacaoData | undefined) {
  if (!sustentacao) return [];
  return scheduleForAll(sustentacao, new Date()).map((g) => ({
    escopo: g.escopo,
    nome: g.current?.effective.name ?? "—",
    cobrindo: g.current?.coveringFor?.name ?? null,
    uncovered: g.current?.uncovered ?? false,
  }));
}

interface GrupoPrioridade {
  nivel: number;
  label: string;
  projetos: Projeto[];
}

/**
 * Agrupa os projetos por nível de prioridade (5 → 1). Dentro de cada grupo,
 * pior saúde primeiro, depois nome.
 */
function agruparPorPrioridade(projetos: Projeto[]): GrupoPrioridade[] {
  const map = new Map<number, Projeto[]>();
  for (const p of projetos) {
    const n = prioridadeMeta(p.prioridade).nivel;
    const arr = map.get(n);
    if (arr) arr.push(p);
    else map.set(n, [p]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([nivel, ps]) => ({
      nivel,
      label: PRIORIDADE_LABEL[nivel],
      projetos: ps.sort((a, b) => {
        const s = saudeAtual(a) - saudeAtual(b);
        return s !== 0 ? s : a.nome.localeCompare(b.nome, "pt-BR");
      }),
    }));
}

function buildReport(
  projetos: Projeto[],
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

  for (const g of agruparPorPrioridade(projetos)) {
    L.push(`${g.label} (importância ${g.nivel}/5):`);
    for (const p of g.projetos) {
      const u = ultimoRegistro(p);
      const nota = u?.nota?.trim() || p.descricao || "—";
      const sm = saudeMeta(saudeAtual(p));
      const resp = p.engenheiroNome ?? "Sem engenheiro";
      L.push(
        `  - [${p.codigo}] ${p.nome} (${resp}) — ${progressoAtual(p)}% · ${STATUS_META[p.status].label} · ${sm.label} (${sm.nivel}/5): ${nota}`,
      );
    }
    L.push("");
  }
  return L.join("\n").trim();
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

function RelatorioSemana({
  projetos,
  semana,
  sustentacao,
  onOpen,
}: {
  projetos: Projeto[];
  semana: string | null;
  sustentacao: SustentacaoData | undefined;
  onOpen: (id: string) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [copied, setCopied] = useState(false);
  const duty = useMemo(() => dutyResumo(sustentacao), [sustentacao]);
  const metricas = useMemo(() => computeMetricas(projetos, today), [projetos, today]);
  const grupos = useMemo(() => agruparPorPrioridade(projetos), [projetos]);
  const texto = useMemo(
    () => buildReport(projetos, duty, metricas, semana),
    [projetos, duty, metricas, semana],
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Panorama e status por projeto
          {semana && (
            <> · semana de {format(parseISO(semana), "dd MMM yyyy", { locale: ptBR })}</>
          )}
          .
        </p>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="text-emerald-500" /> : <Copy />}
          {copied ? "Copiado" : "Copiar relatório"}
        </Button>
      </div>

      {/* Panorama gráfico, ponderado pela importância */}
      <Card className="p-5">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Progresso ponderado
            </div>
            <div className="mt-1 text-3xl font-bold leading-none tabular-nums">
              {metricas.progPond}%
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${metricas.progPond}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Saúde ponderada
            </div>
            <Velocimetro saude={metricas.saudePond} />
          </div>
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              On-tracking
            </div>
            <DistBar
              onTrack={metricas.onTrack}
              atencao={metricas.atencao}
              emRisco={metricas.emRisco}
            />
            {metricas.vencidos > 0 && (
              <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                {metricas.vencidos} com prazo vencido
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Sustentação da semana (acima dos projetos) */}
      {duty.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold tracking-tight">Sustentação esta semana</h2>
          </div>
          <Card className="divide-y">
            {duty.map((d) => (
              <div key={d.escopo} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{d.escopo}</span>
                  {d.cobrindo && (
                    <Badge variant="warning" className="gap-1">
                      <Palmtree className="h-3 w-3" />
                      cobre {firstName(d.cobrindo)}
                    </Badge>
                  )}
                  {d.uncovered && <Badge variant="destructive">sem cobertura</Badge>}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" />
                  {d.nome}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Projetos agrupados por prioridade */}
      <div className="space-y-5">
        {grupos.map((g) => (
          <div key={g.nivel}>
            <div className="mb-2 flex items-center gap-2">
              <Importancia nivel={g.nivel} />
              <h2 className="text-sm font-semibold tracking-tight">{g.label}</h2>
              <Badge variant="outline" className="ml-1">
                {g.projetos.length}
              </Badge>
            </div>
            <Card className="divide-y">
              {g.projetos.map((p) => (
                <ProjetoRow
                  key={p.id}
                  projeto={p}
                  onOpen={onOpen}
                  showImportancia={false}
                  showNota
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <div className="text-2xl font-semibold leading-none tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export function ProjetosPage({ sustentacao }: { sustentacao?: SustentacaoData }) {
  const [id, navigate] = useProjetoRoute();

  // Quarter atual pelo relógio do cliente; a visão principal começa nele.
  const quarterAtual = useMemo(() => quarterDe(new Date()), []);
  const quarters = useMemo(
    () => quartersDisponiveis(DATA.projetos, quarterAtual),
    [quarterAtual],
  );
  const [quarter, setQuarter] = useState(quarterAtual);

  const projetos = useMemo(
    () => DATA.projetos.filter((p) => p.quarter === quarter),
    [quarter],
  );

  const stats = useMemo(() => {
    const emAndamento = projetos.filter(
      (p) => p.status === "em_andamento" || p.status === "em_testes",
    ).length;
    const concluidos = projetos.filter((p) => p.status === "concluido").length;
    const semana =
      projetos
        .flatMap((p) => p.registros.map((r) => r.semana))
        .sort((a, b) => b.localeCompare(a))[0] ?? null;
    return {
      total: projetos.length,
      emAndamento,
      concluidos,
      medio: progressoMedio(projetos),
      semana,
    };
  }, [projetos]);

  const ordenados = useMemo(() => ordenarProjetos(projetos), [projetos]);

  // Detalhe de um projeto (busca em todos os quarters, não só no selecionado).
  if (id) {
    const projeto = DATA.projetos.find((p) => p.id === id);
    if (projeto) {
      return <ProjetoDetalhe projeto={projeto} onBack={() => navigate(null)} />;
    }
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Projeto <code>{id}</code> não encontrado.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(null)}>
          Voltar à lista
        </Button>
      </div>
    );
  }

  if (DATA.projetos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum projeto cadastrado. Edite{" "}
        <code>src/features/projetos/projetos.json</code>.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Projetos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evolução semanal por projeto e por engenheiro · de <code>projetos.json</code>.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quarter
            </span>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger className="h-9 w-44">
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
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Stat label="Projetos" value={stats.total} />
          <Stat label="Ativos" value={stats.emAndamento} />
          <Stat label="Concluídos" value={stats.concluidos} />
          <Stat label="Progresso médio" value={`${stats.medio}%`} />
        </div>
      </div>

      {projetos.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nenhum projeto em {quarterLabel(quarter)}.
        </Card>
      ) : (
        <Tabs defaultValue="projeto">
          <TabsList>
            <TabsTrigger value="projeto">Por projeto</TabsTrigger>
            <TabsTrigger value="engenheiro">Por engenheiro</TabsTrigger>
            <TabsTrigger value="relatorio">Relatório da semana</TabsTrigger>
          </TabsList>

          <TabsContent value="projeto">
            <Card className="divide-y">
              {ordenados.map((p) => (
                <ProjetoRow key={p.id} projeto={p} onOpen={(pid) => navigate(pid)} />
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="engenheiro">
            <PorEngenheiro projetos={projetos} onOpen={(pid) => navigate(pid)} />
          </TabsContent>

          <TabsContent value="relatorio">
            <RelatorioSemana
              projetos={projetos}
              semana={stats.semana}
              sustentacao={sustentacao}
              onOpen={(pid) => navigate(pid)}
            />
          </TabsContent>
        </Tabs>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <FolderKanban className="h-3.5 w-3.5" />
        Clique em um projeto para ver o histórico. Para atualizar, adicione um registro
        semanal em <code>src/features/projetos/projetos.json</code> e faça o deploy.
      </div>
    </div>
  );
}
