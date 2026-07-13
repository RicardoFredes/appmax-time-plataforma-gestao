import { ExternalLink } from "lucide-react";
import { KANBAN_LANES, kanbanLane, statusBadgeStyle } from "./status";
import { URGENCY_META } from "./urgency";
import { IssueTypeIcon } from "./IssueTypeIcon";
import { TaskTitle } from "./TaskTitle";
import type { Task } from "./types";

type Props = {
  tasks: Task[];
  showEpic: boolean;
};

function UrgencyTag({ urgency }: { urgency: Task["urgency"] }) {
  if (!urgency) return null;
  const meta = URGENCY_META[urgency];
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: meta.bg, color: meta.text }}
    >
      {meta.label}
    </span>
  );
}

function Card({ task, showEpic }: { task: Task; showEpic: boolean }) {
  return (
    <div className="rounded-md border bg-card p-2.5 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">
          {task.key}
        </span>
        <UrgencyTag urgency={task.urgency} />
      </div>
      <a
        href={task.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-1 text-[13px] font-medium leading-snug hover:text-primary"
      >
        <IssueTypeIcon issueType={task.issueType} className="mt-0.5 h-3.5 w-3.5" />
        <span className="line-clamp-3">
          <TaskTitle summary={task.summary} />
        </span>
        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60" />
      </a>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={statusBadgeStyle(task.status)}
        >
          {task.status}
        </span>
        <span>{task.assigneeName}</span>
        {showEpic && task.epicSummary && (
          <span className="truncate">· {task.epicSummary}</span>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, showEpic }: Props) {
  const byLane = KANBAN_LANES.map((lane) => ({
    lane,
    items: tasks.filter((t) => kanbanLane(t.status) === lane.id),
  }));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {byLane.map(({ lane, items }) => (
        <div key={lane.id} className="rounded-lg border bg-muted/30">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: lane.color }}
            />
            <span className="text-sm font-medium">{lane.label}</span>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {items.length}
            </span>
          </div>
          <div className="flex flex-col gap-2 p-2">
            {items.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                —
              </p>
            ) : (
              items.map((t) => (
                <Card key={t.key} task={t} showEpic={showEpic} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
