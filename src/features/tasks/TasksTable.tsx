import { ChevronDown, ChevronUp, ChevronsUpDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { IssueTypeIcon } from "./IssueTypeIcon";
import { TaskTitle } from "./TaskTitle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusBadgeStyle } from "./status";
import { URGENCY_META } from "./urgency";
import type { Task } from "./types";

export type SortKey = "assignee" | "urgency" | "status";
export type SortState = { key: SortKey; dir: "asc" | "desc" } | null;

type Props = {
  tasks: Task[];
  showEpic: boolean;
  sort: SortState;
  onSort: (key: SortKey) => void;
};

export function SortHead({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {label}
        <Icon className={cn("h-3.5 w-3.5", active ? "opacity-90" : "opacity-40")} />
      </button>
    </TableHead>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={statusBadgeStyle(status)}
    >
      {status || "—"}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: Task["urgency"] }) {
  if (!urgency)
    return <span className="text-xs text-muted-foreground">—</span>;
  const meta = URGENCY_META[urgency];
  return (
    <span
      className="inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: meta.bg, color: meta.text }}
    >
      {meta.label}
    </span>
  );
}

/** Colunas de uma linha de tarefa (compartilhadas entre a tabela plana e a
 * visão agrupada por épico). A coluna "Épico" só entra quando `showEpic`. */
export function TaskRow({ task: t, showEpic }: { task: Task; showEpic: boolean }) {
  return (
    <TableRow className="align-top">
      <TableCell className="font-mono text-xs text-muted-foreground">
        {t.key}
      </TableCell>
      <TableCell>
        <a
          href={t.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-start gap-1 font-medium hover:text-primary"
        >
          <IssueTypeIcon issueType={t.issueType} className="mt-0.5 h-3.5 w-3.5" />
          <span className="border-b border-transparent group-hover:border-primary">
            <TaskTitle summary={t.summary} />
          </span>
          <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60" />
        </a>
        {t.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
            {t.description}
          </p>
        )}
      </TableCell>
      <TableCell className="text-sm">{t.assigneeName}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{t.board}</TableCell>
      {showEpic && (
        <TableCell className="text-xs text-muted-foreground">
          {t.epicSummary ?? "—"}
        </TableCell>
      )}
      <TableCell>
        <UrgencyBadge urgency={t.urgency} />
      </TableCell>
      <TableCell>
        <StatusBadge status={t.status} />
      </TableCell>
    </TableRow>
  );
}

export function TasksTable({ tasks, showEpic, sort, onSort }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        Nenhuma tarefa encontrada com esses filtros.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[110px]">Chave</TableHead>
            <TableHead className="min-w-[280px]">Tarefa</TableHead>
            <SortHead
              label="Responsável"
              sortKey="assignee"
              sort={sort}
              onSort={onSort}
              className="w-[160px]"
            />
            <TableHead className="w-[150px]">Board</TableHead>
            {showEpic && <TableHead className="w-[160px]">Épico</TableHead>}
            <SortHead
              label="Urgência"
              sortKey="urgency"
              sort={sort}
              onSort={onSort}
              className="w-[90px]"
            />
            <SortHead
              label="Status"
              sortKey="status"
              sort={sort}
              onSort={onSort}
              className="w-[130px]"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t) => (
            <TaskRow key={t.key} task={t} showEpic={showEpic} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
