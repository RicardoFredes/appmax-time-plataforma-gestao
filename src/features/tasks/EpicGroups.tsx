import { Fragment, useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueTypeIcon } from "./IssueTypeIcon";
import { SortHead, TaskRow, type SortKey, type SortState } from "./TasksTable";
import type { Task, TrackedEpic } from "./types";

type Props = {
  tasks: Task[];
  epics: TrackedEpic[];
  sort: SortState;
  onSort: (key: SortKey) => void;
};

/** Chave sentinela para tarefas sem épico pai. */
const NO_EPIC = "__no_epic__";

type Group = {
  key: string;
  summary: string;
  /** URL do épico no Jira, quando derivável a partir das tarefas. */
  url: string | null;
  tasks: Task[];
};

/** Agrupa as tarefas por `epicKey`, na ordem dos épicos acompanhados
 * (`data.epics`); épicos sem tarefas são omitidos e "Sem épico" vai por último. */
function groupByEpic(tasks: Task[], epics: TrackedEpic[]): Group[] {
  const base = tasks[0]?.url.split("/browse/")[0] ?? null;
  const buckets = new Map<string, Task[]>();
  for (const t of tasks) {
    const k = t.epicKey ?? NO_EPIC;
    const arr = buckets.get(k);
    if (arr) arr.push(t);
    else buckets.set(k, [t]);
  }

  const groups: Group[] = [];
  const seen = new Set<string>();
  // Primeiro, na ordem dos épicos acompanhados.
  for (const e of epics) {
    const items = buckets.get(e.key);
    if (!items) continue;
    seen.add(e.key);
    groups.push({
      key: e.key,
      summary: e.summary,
      url: base ? `${base}/browse/${e.key}` : null,
      tasks: items,
    });
  }
  // Épicos presentes nas tarefas mas fora da lista acompanhada.
  for (const [k, items] of buckets) {
    if (k === NO_EPIC || seen.has(k)) continue;
    groups.push({
      key: k,
      summary: items[0].epicSummary ?? k,
      url: base ? `${base}/browse/${k}` : null,
      tasks: items,
    });
  }
  // Sem épico por último.
  const orphans = buckets.get(NO_EPIC);
  if (orphans) {
    groups.push({ key: NO_EPIC, summary: "Sem épico", url: null, tasks: orphans });
  }
  return groups;
}

function EpicHeaderRow({
  group,
  open,
  onToggle,
}: {
  group: Group;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <TableRow className="bg-muted/40 hover:bg-muted/60">
      <TableCell colSpan={6} className="py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="flex flex-1 items-center gap-2 text-left"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-90",
              )}
            />
            <IssueTypeIcon issueType="Epic" className="h-3.5 w-3.5" />
            <span className="font-medium">{group.summary}</span>
            {group.key !== NO_EPIC && (
              <span className="font-mono text-xs text-muted-foreground">
                {group.key}
              </span>
            )}
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
              {group.tasks.length}
            </span>
          </button>
          {group.url && (
            <a
              href={group.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
              aria-label="Abrir épico no Jira"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function EpicGroups({ tasks, epics, sort, onSort }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        Nenhuma tarefa encontrada com esses filtros.
      </div>
    );
  }

  const groups = groupByEpic(tasks, epics);

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
          {groups.map((g) => {
            const open = !collapsed.has(g.key);
            return (
              <Fragment key={g.key}>
                <EpicHeaderRow group={g} open={open} onToggle={() => toggle(g.key)} />
                {open &&
                  g.tasks.map((t) => (
                    <TaskRow key={t.key} task={t} showEpic={false} />
                  ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
