import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Palmtree, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { firstName, initials } from "@/lib/people";
import type { SustentacaoData } from "@/features/tasks/types";
import {
  scheduleForAll,
  type GroupSchedule,
  type Slot,
} from "./schedule";

/** Paleta por grupo (cor da faixa/realce). */
/** Cor de realce por grupo (na ordem dos grupos). Reusada no relatório de projetos. */
export const GROUP_ACCENT = ["#9b6afa", "#0ea5e9"]; // roxo Appmax, sky

function fmtRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const s = format(start, sameMonth ? "dd" : "dd MMM", { locale: ptBR });
  const e = format(end, "dd MMM", { locale: ptBR });
  return `${s} – ${e}`;
}

function Avatar({
  name,
  accent,
  size = "md",
}: {
  name: string;
  accent: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        size === "lg" ? "h-14 w-14 text-lg" : "h-9 w-9 text-xs",
      )}
      style={{ backgroundColor: accent }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/** Cartão de destaque do responsável atual do grupo. */
function CurrentDuty({
  group,
  accent,
  totalWeeks,
}: {
  group: GroupSchedule;
  accent: string;
  totalWeeks: number;
}) {
  const slot = group.current;
  if (!slot) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem engenheiros configurados neste grupo.
      </p>
    );
  }
  const person = slot.effective;
  return (
    <div className="flex items-start gap-4">
      <Avatar name={person.name} accent={accent} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">{person.name}</span>
          {slot.coveringFor && (
            <Badge variant="warning" className="gap-1">
              <Palmtree className="h-3 w-3" />
              cobrindo {firstName(slot.coveringFor.name)}
            </Badge>
          )}
          {slot.uncovered && (
            <Badge variant="destructive">sem cobertura</Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {fmtRange(slot.start, slot.end)}
          </span>
          <span className="text-xs">
            semana {group.weekInSlot} de {totalWeeks}
          </span>
        </div>
        {slot.coveringFor && (
          <p className="mt-2 text-xs text-muted-foreground">
            Turno original de <strong>{slot.coveringFor.name}</strong>, de férias no
            período.
          </p>
        )}
      </div>
    </div>
  );
}

/** Uma linha da sequência de próximos plantões. */
function UpcomingRow({ slot, accent }: { slot: Slot; accent: string }) {
  const person = slot.effective;
  return (
    <li className="flex items-center gap-3 py-2">
      <Avatar name={person.name} accent={accent} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{person.name}</span>
          {slot.coveringFor && (
            <Badge variant="warning" className="gap-1 text-[10px]">
              <Palmtree className="h-2.5 w-2.5" />
              cobre {firstName(slot.coveringFor.name)}
            </Badge>
          )}
          {slot.uncovered && (
            <Badge variant="destructive" className="text-[10px]">
              sem cobertura
            </Badge>
          )}
        </div>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {fmtRange(slot.start, slot.end)}
      </span>
    </li>
  );
}

function GroupCard({
  group,
  accent,
  totalWeeks,
}: {
  group: GroupSchedule;
  accent: string;
  totalWeeks: number;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: accent }} />
              <h2 className="text-base font-semibold tracking-tight">
                Grupo {group.grupo}
              </h2>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{group.escopo}</p>
          </div>
          <Badge
            variant="outline"
            className="border-current/20"
            style={{ color: accent }}
          >
            {group.engenheiros.length} engenheiros
          </Badge>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Responsável esta semana
          </div>
          <CurrentDuty group={group} accent={accent} totalWeeks={totalWeeks} />
        </div>

        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Próximos na escala
          </div>
          <ul className="divide-y">
            {group.upcoming.map((slot) => (
              <UpcomingRow key={slot.index} slot={slot} accent={accent} />
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export function SustentacaoPage({ data }: { data: SustentacaoData | undefined }) {
  // `now` fixo no render; a página é recarregada quando a aba volta ao foco.
  const groups = useMemo(
    () => (data ? scheduleForAll(data, new Date()) : []),
    [data],
  );

  if (!data || groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma escala de sustentação disponível. Rode <code>pnpm sync</code> (ou{" "}
        <code>pnpm sync:export</code>) para gerar a partir de{" "}
        <code>sync/config.json</code>.
      </p>
    );
  }

  const totalWeeks = Math.max(1, data.semanasPorEngenheiro);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Escala de Sustentação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rodízio de {totalWeeks} semanas por engenheiro · quem está de plantão agora
          e a sequência a seguir.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g, i) => (
          <GroupCard
            key={g.grupo}
            group={g}
            accent={GROUP_ACCENT[i % GROUP_ACCENT.length]}
            totalWeeks={totalWeeks}
          />
        ))}
      </div>
    </div>
  );
}
