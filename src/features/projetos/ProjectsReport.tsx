import { useMemo, useState } from "react";
import { format, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Copy, Palmtree, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { firstName } from "@/lib/people";
import type { SustentacaoData } from "@/features/tasks/types";
import { healthMeta } from "./derive";
import { Gauge } from "./Gauge";
import { ProjectRow, RowLead } from "./ProjectRow";
import { Donut, DistBar, MiniStat } from "./report-charts";
import { computeMetrics, dutySummary } from "./report-metrics";
import { GROUPING_LABEL, buildSections } from "./report-sections";
import { buildReportText, copyText } from "./report-text";
import type { Grouping } from "./url-state";
import type { Project } from "./types";

export function ProjectsReport({
  projects,
  stats,
  sustentacao,
  grouping,
  onGroupingChange,
  onOpen,
}: {
  projects: Project[];
  stats: { total: number; active: number; done: number; date: string | null };
  sustentacao: SustentacaoData | undefined;
  grouping: Grouping;
  onGroupingChange: (grouping: Grouping) => void;
  onOpen: (id: string) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [copied, setCopied] = useState(false);
  const duty = useMemo(() => dutySummary(sustentacao), [sustentacao]);
  const metrics = useMemo(() => computeMetrics(projects, today), [projects, today]);
  const { sections, showEngineer, showImportance } = useMemo(
    () => buildSections(projects, grouping),
    [projects, grouping],
  );
  const text = useMemo(
    () => buildReportText(sections, duty, metrics, stats.date),
    [sections, duty, metrics, stats.date],
  );

  const copy = async () => {
    if (await copyText(text)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Panorama e status por projeto
          {stats.date && (
            <> · atualizado em {format(parseISO(stats.date), "dd MMM yyyy", { locale: ptBR })}</>
          )}
          .
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Visualizar por
          </span>
          <Select value={grouping} onValueChange={(v) => onGroupingChange(v as Grouping)}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(GROUPING_LABEL) as Grouping[]).map((d) => (
                <SelectItem key={d} value={d}>
                  {GROUPING_LABEL[d]}
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
            <Donut value={metrics.weightedProgress} inner={metrics.simpleProgress} />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#9b6afa" }} />
              Ponderada{" "}
              <span className="font-semibold tabular-nums text-foreground">{metrics.weightedProgress}%</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#f97316" }} />
              Simples{" "}
              <span className="font-semibold tabular-nums text-foreground">{metrics.simpleProgress}%</span>
            </span>
          </div>
        </Card>
        <Card className="flex flex-col p-5 text-center sm:col-span-2">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Saúde ponderada
          </div>
          <div className="flex flex-1 items-center justify-center">
            <Gauge health={metrics.weightedHealth} showValue={false} />
          </div>
          {(() => {
            const m = healthMeta(metrics.weightedHealth);
            return (
              <div
                className="mt-2 inline-flex items-center justify-center gap-1.5 self-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ backgroundColor: `${m.color}1a`, color: m.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                {m.label} · {m.level}/5
              </div>
            );
          })()}
        </Card>
        <div className="flex flex-col gap-2 sm:col-span-4">
          <Card className="p-5">
            <div className="grid grid-cols-4 gap-2">
              <MiniStat label="Projetos" value={stats.total} />
              <MiniStat label="Ativos" value={stats.active} />
              <MiniStat
                label="No progresso"
                value={metrics.countedProjects}
                title="Base do cálculo de Progresso: exclui Discovery e Refinement"
              />
              <MiniStat label="Concluídos" value={stats.done} />
            </div>
          </Card>
          <Card className="flex flex-1 flex-col p-5">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              On-tracking
            </div>
            <div className="flex flex-1 items-center">
              <div className="w-full">
                <DistBar
                  onTrack={metrics.onTrack}
                  warning={metrics.warning}
                  atRisk={metrics.atRisk}
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
              <div key={d.scope} className="flex px-4 py-3">
                <RowLead
                  icon={<ShieldCheck className="h-4 w-4 shrink-0" style={{ color: d.color }} />}
                  code={`Grupo ${d.group}`}
                  title={d.scope}
                  badges={
                    <>
                      {d.coveringFor && (
                        <Badge variant="warning" className="gap-1">
                          <Palmtree className="h-3 w-3" />
                          cobre {firstName(d.coveringFor)}
                        </Badge>
                      )}
                      {d.uncovered && <Badge variant="destructive">sem cobertura</Badge>}
                    </>
                  }
                  sub={
                    <>
                      <UserRound className="h-3.5 w-3.5 shrink-0" />
                      {d.name}
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
        {sections.map((s) => (
          <div key={s.key}>
            {s.header}
            <Card className="divide-y">
              {s.projects.map((p) => (
                <ProjectRow
                  key={p.id}
                  project={p}
                  onOpen={onOpen}
                  showEngineer={showEngineer}
                  showImportance={showImportance}
                />
              ))}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
