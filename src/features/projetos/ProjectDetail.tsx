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
  CalendarPlus,
  MoreVertical,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownItem, DropdownMenu } from "@/components/ui/dropdown";
import { EvolutionChart } from "./EvolutionChart";
import { Gauge } from "./Gauge";
import {
  STATUS_META,
  currentProgress,
  quarterLabel,
  sortedReports,
  currentHealth,
  trend,
} from "./derive";
import { Priority } from "./Priority";
import { Linkify } from "./Linkify";
import { Delta, HealthBadge, MILESTONE_META } from "./project-detail-parts";
import type { Project } from "./types";

export function ProjectDetail({
  project,
  onBack,
  canEdit = false,
  onEdit,
  onReport,
  onDelete,
  onEditReport,
  onDeleteReport,
}: {
  project: Project;
  onBack: () => void;
  canEdit?: boolean;
  onEdit?: () => void;
  onReport?: () => void;
  /** Apaga o projeto inteiro. */
  onDelete?: () => void;
  /** Edita um registro específico (recebe o `id`). */
  onEditReport?: (id: string) => void;
  /** Apaga um registro específico (recebe o `id`). */
  onDeleteReport?: (id: string) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const rs = useMemo(() => sortedReports(project), [project]);
  // Gráfico usa `rs` (cronológico); histórico mostra do mais recente ao mais antigo.
  const desc = useMemo(() => [...rs].reverse(), [rs]);
  const meta = STATUS_META[project.status];
  const current = currentProgress(project);
  const currentTrend = trend(project);

  const fmtDate = (d: string | null) =>
    d ? format(startOfDay(parseISO(d)), "dd MMM yyyy", { locale: ptBR }) : "—";
  const due = project.dueDate ? startOfDay(parseISO(project.dueDate)) : null;
  // Relativo do prazo só faz sentido enquanto o projeto está aberto.
  const daysToDue =
    due && !project.closedDate ? differenceInCalendarDays(due, today) : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={onBack}>
            <ArrowLeft /> Voltar
          </Button>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onReport}>
                <CalendarPlus /> Reportar
              </Button>
              <DropdownMenu
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-9 px-0"
                    aria-label="Mais ações"
                  >
                    <MoreVertical />
                  </Button>
                }
              >
                <DropdownItem onSelect={onEdit}>
                  <Pencil className="h-4 w-4" /> Editar
                </DropdownItem>
                <DropdownItem destructive onSelect={onDelete}>
                  <Trash2 className="h-4 w-4" /> Apagar
                </DropdownItem>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
          <Badge variant={meta.badge}>{meta.label}</Badge>
          <Priority level={project.priority} showLabel />
          <Badge variant="outline" className="font-mono">
            {quarterLabel(project.quarter)}
          </Badge>
        </div>
        <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            {project.engineers.length > 0
              ? project.engineers.map((e) => e.name).join(", ")
              : "Sem engenheiro"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Início:{" "}
            <span className="font-medium text-foreground">{fmtDate(project.startDate)}</span>
          </span>
          <span>
            Previsão:{" "}
            <span className="font-medium text-foreground">{fmtDate(project.dueDate)}</span>
            {daysToDue !== null && (
              <span className={daysToDue < 0 ? "text-rose-600 dark:text-rose-400" : undefined}>
                {" "}
                · {daysToDue < 0 ? `vencido há ${-daysToDue}d` : `em ${daysToDue}d`}
              </span>
            )}
          </span>
          <span>
            Fechamento:{" "}
            <span className="font-medium text-foreground">{fmtDate(project.closedDate)}</span>
          </span>
        </div>
        {project.description && (
          <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm text-muted-foreground">
            <Linkify text={project.description} />
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
                  <span className="text-2xl font-bold leading-none tabular-nums">{current}%</span>
                  {currentTrend !== null && (
                    <span className="mb-0.5">
                      <Delta value={currentTrend} />
                    </span>
                  )}
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${current}%`, backgroundColor: meta.color }}
                  />
                </div>
              </div>
            </Card>
            <Card className="flex flex-col p-4">
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                On-tracking
              </div>
              <div className="flex flex-1 items-center">
                <Gauge health={currentHealth(project)} />
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Evolução do progresso
            </div>
            <EvolutionChart reports={rs} />
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
            Histórico ({rs.length})
          </div>
          <div className="flex-1 divide-y overflow-y-auto">
            {desc.map((r, i) => {
              const m = r.milestone ? MILESTONE_META[r.milestone] : null;
              // Delta ignora marcos (não são medições). Lista em ordem decrescente
              // (mais recente → mais antigo): o registro anterior vem depois de `i`.
              const previous = m ? undefined : desc.slice(i + 1).find((x) => !x.milestone);
              const delta = previous ? r.progress - previous.progress : null;
              return (
                <div key={r.id} className="group p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      {m ? (
                        <m.Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                      ) : (
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {format(parseISO(r.date), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{r.progress}%</span>
                    {delta !== null && <Delta value={delta} />}
                    {/* Marcos (start/end) não têm on-tracking: exibem o rótulo do marco. */}
                    {m ? (
                      <span className="text-xs font-medium" style={{ color: m.color }}>
                        {m.label}
                      </span>
                    ) : (
                      <HealthBadge health={r.health} />
                    )}
                    {canEdit && (onEditReport || onDeleteReport) && (
                      <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        {onEditReport && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            title="Editar este registro"
                            onClick={() => onEditReport(r.id)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onDeleteReport && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Apagar este registro"
                            onClick={() => onDeleteReport(r.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {r.note ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      <Linkify text={r.note} />
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
