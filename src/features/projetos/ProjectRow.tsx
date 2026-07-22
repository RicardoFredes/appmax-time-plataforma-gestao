import type { ReactNode } from "react";
import { ChevronRight, Folder, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/people";
import { STATUS_META, currentProgress, currentHealth, healthMeta, lastReport } from "./derive";
import { Priority } from "./Priority";
import type { Project } from "./types";

/** Nomes dos engenheiros do projeto, unidos (ou "Sem engenheiro"). */
export function engineerNames(p: Project): string {
  return p.engineers.length > 0
    ? p.engineers.map((e) => e.name).join(", ")
    : "Sem engenheiro";
}

export function StatusBadge({ status }: { status: Project["status"] }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.badge} className="shrink-0">
      {meta.label}
    </Badge>
  );
}

export function HealthDot({ health }: { health: number | null }) {
  if (health === null) {
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
  const m = healthMeta(health);
  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium"
      style={{ backgroundColor: `${m.color}1a`, color: m.color }}
      title={`On-tracking: ${m.label} (${m.level}/5)`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.level}/5
    </span>
  );
}

export function Avatar({ name, avatarUrl }: { name: string | null; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
      aria-hidden
    >
      {name ? initials(name) : "—"}
    </div>
  );
}

/**
 * Bloco-líder de uma linha em card `divide-y`: ícone + código mono + título
 * (`text-sm font-medium`) + badges opcionais na primeira linha, e uma sub-linha
 * discreta. Compartilhado pela linha de projeto e pela linha de sustentação para
 * manter os estilos (tamanho do título, chip de código) em sincronia.
 */
export function RowLead({
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
 * - `showEngineer`: sub-linha com o responsável (oculta ao agrupar por engenheiro).
 * - `showImportance`: badge de importância (oculto ao agrupar por prioridade).
 * - `showNote`: nota do registro mais recente abaixo.
 */
export function ProjectRow({
  project,
  onOpen,
  showEngineer = true,
  showImportance = true,
  showNote = false,
}: {
  project: Project;
  onOpen: (id: string) => void;
  showEngineer?: boolean;
  showImportance?: boolean;
  showNote?: boolean;
}) {
  const meta = STATUS_META[project.status];
  const current = currentProgress(project);
  const u = lastReport(project);
  return (
    <button
      type="button"
      onClick={() => onOpen(project.code)}
      className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
    >
      <div className="flex items-center gap-3">
        <RowLead
          icon={<Folder className="h-4 w-4 shrink-0 text-primary" />}
          code={project.code}
          title={project.name}
          sub={
            showEngineer && (
              <>
                <UserRound className="h-3.5 w-3.5 shrink-0" />
                {engineerNames(project)}
              </>
            )
          }
        />
        <StatusBadge status={project.status} />
        {showImportance && <Priority level={project.priority} />}
        <HealthDot health={currentHealth(project)} />
        <div className="hidden w-28 items-center gap-2 sm:flex">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${current}%`, backgroundColor: meta.color }}
            />
          </div>
        </div>
        <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
          {current}%
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      {showNote && (
        <p className="mt-1.5 text-sm text-muted-foreground">
          {u?.note?.trim() || project.description || "Sem nota registrada."}
        </p>
      )}
    </button>
  );
}
