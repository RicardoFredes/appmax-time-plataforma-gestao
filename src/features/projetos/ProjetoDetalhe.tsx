import { useMemo } from "react";
import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  Flag,
  Minus,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EvolucaoChart } from "./EvolucaoChart";
import { Velocimetro } from "./Velocimetro";
import {
  STATUS_META,
  progressoAtual,
  quarterLabel,
  registrosOrdenados,
  saudeAtual,
  saudeMeta,
  tendencia,
} from "./derive";
import { Prioridade } from "./Prioridade";
import { Linkify } from "./Linkify";
import type { Projeto } from "./types";

function Delta({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> 0
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}
      {value}
    </span>
  );
}

/** Metadados de exibição dos marcos (registros de início/fim do projeto). */
const MARCO_META = {
  inicio: { label: "Início do projeto", color: "#9b6afa" }, // roxo Appmax
  fim: { label: "Fim do projeto", color: "#10b981" }, // emerald (done)
} as const;

function SaudeBadge({ saude }: { saude: number }) {
  const m = saudeMeta(saude);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${m.color}1a`, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label} · {m.nivel}/5
    </span>
  );
}

export function ProjetoDetalhe({
  projeto,
  onBack,
}: {
  projeto: Projeto;
  onBack: () => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const rs = useMemo(() => registrosOrdenados(projeto), [projeto]);
  const desc = [...rs].reverse();
  const meta = STATUS_META[projeto.status];
  const atual = progressoAtual(projeto);
  const trend = tendencia(projeto);

  const fmtData = (d: string | null) =>
    d ? format(startOfDay(parseISO(d)), "dd MMM yyyy", { locale: ptBR }) : "—";
  const prazo = projeto.prazo ? startOfDay(parseISO(projeto.prazo)) : null;
  // Relativo do prazo só faz sentido enquanto o projeto está aberto.
  const diasPrazo =
    prazo && !projeto.fechamento ? differenceInCalendarDays(prazo, today) : null;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground" onClick={onBack}>
          <ArrowLeft /> Voltar
        </Button>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{projeto.codigo}</span>
          <Badge variant={meta.badge}>{meta.label}</Badge>
          <Prioridade nivel={projeto.prioridade} showLabel />
          <Badge variant="outline" className="font-mono">
            {quarterLabel(projeto.quarter)}
          </Badge>
        </div>
        <h1 className="text-xl font-bold tracking-tight">{projeto.nome}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            {projeto.engenheiroNome ?? "Sem engenheiro"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Início:{" "}
            <span className="font-medium text-foreground">{fmtData(projeto.inicio)}</span>
          </span>
          <span>
            Previsão:{" "}
            <span className="font-medium text-foreground">{fmtData(projeto.prazo)}</span>
            {diasPrazo !== null && (
              <span className={diasPrazo < 0 ? "text-rose-600 dark:text-rose-400" : undefined}>
                {" "}
                · {diasPrazo < 0 ? `vencido há ${-diasPrazo}d` : `em ${diasPrazo}d`}
              </span>
            )}
          </span>
          <span>
            Fechamento:{" "}
            <span className="font-medium text-foreground">{fmtData(projeto.fechamento)}</span>
          </span>
        </div>
        {projeto.descricao && (
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            <Linkify texto={projeto.descricao} />
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Coluna 1: progresso + on-tracking (card único) e gráfico */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="flex flex-col p-4">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Progresso atual
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold leading-none tabular-nums">{atual}%</span>
                  {trend !== null && (
                    <span className="mb-0.5">
                      <Delta value={trend} />
                    </span>
                  )}
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${atual}%`, backgroundColor: meta.color }}
                  />
                </div>
              </div>
            </Card>
            <Card className="flex flex-col p-4">
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                On-tracking
              </div>
              <div className="flex flex-1 items-center">
                <Velocimetro saude={saudeAtual(projeto)} />
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Evolução do progresso
            </div>
            <EvolucaoChart registros={rs} />
            {rs.length <= 1 && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Adicione mais registros semanais para ver a curva de evolução.
              </p>
            )}
          </Card>
        </div>

        {/* Coluna 2: lista dos registros (ocupa a altura total da coluna) */}
        <Card className="flex h-full flex-col overflow-hidden">
          <div className="border-b px-4 py-3 text-sm font-semibold tracking-tight">
            Histórico semanal ({rs.length})
          </div>
          <div className="flex-1 divide-y overflow-y-auto">
            {desc.map((r, i) => {
              const m = r.marco ? MARCO_META[r.marco] : null;
              // Delta semana-a-semana ignora marcos (não são medições).
              const anterior = m ? undefined : desc.slice(i + 1).find((x) => !x.marco);
              const delta = anterior ? r.progresso - anterior.progresso : null;
              return (
                <div key={r.semana} className="p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      {m ? (
                        <Flag className="h-3.5 w-3.5" style={{ color: m.color }} />
                      ) : (
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {format(parseISO(r.semana), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{r.progresso}%</span>
                    {delta !== null && <Delta value={delta} />}
                    {/* Marcos (início/fim) não têm on-tracking: exibem o rótulo do marco. */}
                    {m ? (
                      <span className="text-xs font-medium" style={{ color: m.color }}>
                        {m.label}
                      </span>
                    ) : (
                      <SaudeBadge saude={r.saude} />
                    )}
                  </div>
                  {r.nota ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      <Linkify texto={r.nota} />
                    </p>
                  ) : m ? null : (
                    <p className="mt-1.5 text-sm italic text-muted-foreground/60">Sem nota.</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
