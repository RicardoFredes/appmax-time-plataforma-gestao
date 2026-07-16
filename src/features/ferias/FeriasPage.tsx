import { useMemo } from "react";
import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Palmtree } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/people";
import type { SustentacaoData, Vacation } from "@/features/tasks/types";

type Status = "agora" | "proxima" | "passada";

interface Item {
  v: Vacation;
  inicio: Date;
  fim: Date;
  status: Status;
  /** Dias corridos (inclusivo nas duas pontas). */
  dias: number;
  /** Rótulo relativo ("faltam 4 dias", "termina em 2 dias", "há 10 dias"). */
  relativo: string;
}

const STATUS_META: Record<
  Status,
  { label: string; badge: "warning" | "default" | "secondary"; bar: string }
> = {
  agora: { label: "Em férias agora", badge: "warning", bar: "#f59e0b" }, // amber
  proxima: { label: "A seguir", badge: "default", bar: "#9b6afa" }, // roxo Appmax
  passada: { label: "Encerradas", badge: "secondary", bar: "#cbd5e1" }, // slate-300
};

const ORDER: Status[] = ["agora", "proxima", "passada"];

function pluralDias(n: number): string {
  return `${n} ${n === 1 ? "dia" : "dias"}`;
}

function buildItem(v: Vacation, today: Date): Item {
  const inicio = startOfDay(parseISO(v.inicio));
  const fim = startOfDay(parseISO(v.fim));
  const dias = differenceInCalendarDays(fim, inicio) + 1;

  let status: Status;
  let relativo: string;
  if (today < inicio) {
    status = "proxima";
    const d = differenceInCalendarDays(inicio, today);
    relativo = d === 0 ? "começa hoje" : `começa em ${pluralDias(d)}`;
  } else if (today > fim) {
    status = "passada";
    relativo = `terminou há ${pluralDias(differenceInCalendarDays(today, fim))}`;
  } else {
    status = "agora";
    const d = differenceInCalendarDays(fim, today);
    relativo = d === 0 ? "último dia" : `termina em ${pluralDias(d)}`;
  }
  return { v, inicio, fim, status, dias, relativo };
}

function fmt(d: Date): string {
  return format(d, "dd MMM yyyy", { locale: ptBR });
}

/** Linha do tempo (gantt) das ausências, com eixo de meses e marcador de hoje. */
function Timeline({ items, today }: { items: Item[]; today: Date }) {
  const layout = useMemo(() => {
    const starts = items.map((i) => i.inicio.getTime());
    const ends = items.map((i) => i.fim.getTime());
    const min = new Date(Math.min(...starts, today.getTime()));
    const max = new Date(Math.max(...ends, today.getTime()));
    const windowStart = startOfMonth(min);
    const windowEnd = endOfMonth(max);
    const totalDays = Math.max(1, differenceInCalendarDays(windowEnd, windowStart));
    const pct = (d: Date) =>
      (differenceInCalendarDays(d, windowStart) / totalDays) * 100;
    const months = eachMonthOfInterval({ start: windowStart, end: windowEnd });
    return { windowStart, windowEnd, totalDays, pct, months };
  }, [items, today]);

  const rowH = 44;
  const todayInside =
    today >= layout.windowStart && today <= layout.windowEnd;

  return (
    <Card className="overflow-hidden p-5">
      <div className="mb-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Linha do tempo
      </div>
      <div className="overflow-x-auto">
        <div className="relative min-w-[560px]">
          {/* Eixo de meses */}
          <div className="relative mb-2 h-5 border-b">
            {layout.months.map((m) => (
              <div
                key={m.toISOString()}
                className="absolute top-0 flex h-5 items-center border-l pl-1.5 text-[11px] font-medium text-muted-foreground"
                style={{ left: `${layout.pct(m)}%` }}
              >
                {format(m, "MMM yyyy", { locale: ptBR })}
              </div>
            ))}
          </div>

          {/* Faixas */}
          <div className="relative" style={{ height: items.length * rowH }}>
            {/* Grade de meses */}
            {layout.months.map((m) => (
              <div
                key={m.toISOString()}
                className="absolute top-0 bottom-0 border-l border-border/50"
                style={{ left: `${layout.pct(m)}%` }}
              />
            ))}

            {/* Marcador de hoje */}
            {todayInside && (
              <div
                className="absolute top-0 bottom-0 z-10 w-px bg-rose-500"
                style={{ left: `${layout.pct(today)}%` }}
              >
                <span className="absolute -top-0.5 left-1 text-[10px] font-medium text-rose-500">
                  hoje
                </span>
              </div>
            )}

            {/* Barras */}
            {items.map((it, i) => {
              const left = layout.pct(it.inicio);
              const width = Math.max(
                1.5,
                layout.pct(it.fim) - left + 100 / layout.totalDays,
              );
              const meta = STATUS_META[it.status];
              return (
                <div
                  key={`${it.v.email}-${it.v.inicio}`}
                  className="absolute flex items-center"
                  style={{ top: i * rowH + 6, height: rowH - 12, left: `${left}%`, width: `${width}%` }}
                >
                  <div
                    className="flex h-full w-full items-center gap-2 overflow-hidden rounded-md px-2 text-xs font-medium text-white shadow-sm"
                    style={{ backgroundColor: meta.bar }}
                    title={`${it.v.name} · ${fmt(it.inicio)} – ${fmt(it.fim)}`}
                  >
                    <span className="truncate">{it.v.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function VacationCard({ item }: { item: Item }) {
  const meta = STATUS_META[item.status];
  return (
    <li className="flex items-center gap-3 py-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: meta.bar }}
        aria-hidden
      >
        {initials(item.v.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{item.v.name}</span>
          <span className="text-xs text-muted-foreground">· {item.relativo}</span>
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">
          {fmt(item.inicio)} – {fmt(item.fim)}{" "}
          <span className="text-xs">({pluralDias(item.dias)})</span>
        </div>
      </div>
    </li>
  );
}

export function FeriasPage({ data }: { data: SustentacaoData | undefined }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const items = useMemo(
    () =>
      (data?.ferias ?? [])
        .map((v) => buildItem(v, today))
        .sort((a, b) => a.inicio.getTime() - b.inicio.getTime()),
    [data, today],
  );

  const grupos = useMemo(() => {
    const map: Record<Status, Item[]> = { agora: [], proxima: [], passada: [] };
    for (const it of items) map[it.status].push(it);
    return map;
  }, [items]);

  const emFerias = grupos.agora.length;
  const proximas = grupos.proxima.length;

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma escala disponível. Rode <code>pnpm sync</code> (ou{" "}
        <code>pnpm sync:export</code>) para gerar a partir de{" "}
        <code>sync/config.json</code> e <code>sync/vacations.json</code>.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Férias e Ausências</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Períodos que afetam a escala de sustentação, de{" "}
            <code>sync/vacations.json</code>.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <div className="text-2xl font-semibold leading-none tabular-nums">
              {emFerias}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Em férias agora
            </div>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <div className="text-2xl font-semibold leading-none tabular-nums">
              {proximas}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              A seguir
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Palmtree className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Nenhuma férias ou ausência registrada.
          </p>
          <p className="text-xs text-muted-foreground">
            Adicione em <code>sync/vacations.json</code> e rode{" "}
            <code>pnpm sync:export</code>.
          </p>
        </Card>
      ) : (
        <>
          <Timeline items={items} today={today} />

          <div className="space-y-5">
            {ORDER.filter((s) => grupos[s].length > 0).map((s) => (
              <div key={s}>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_META[s].bar }}
                  />
                  <h2 className="text-sm font-semibold tracking-tight">
                    {STATUS_META[s].label}
                  </h2>
                  <Badge variant={STATUS_META[s].badge} className="ml-1">
                    {grupos[s].length}
                  </Badge>
                </div>
                <Card className="px-4">
                  <ul className={cn("divide-y")}>
                    {grupos[s].map((it) => (
                      <VacationCard key={`${it.v.email}-${it.v.inicio}`} item={it} />
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
