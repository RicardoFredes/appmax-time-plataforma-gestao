import { cn } from "@/lib/utils";
import { KANBAN_LANES, type KanbanLane } from "./status";

type Props = {
  counts: Record<string, number>;
  active: KanbanLane | null;
  onToggle: (lane: KanbanLane) => void;
};

/** Barra segmentada por lane (Backlog/To Do/Doing/Done), clicável para filtrar. */
export function StatusTicker({ counts, active, onToggle }: Props) {
  const visible = KANBAN_LANES.filter((l) => counts[l.id]);
  if (visible.length === 0) return null;

  return (
    <div className="flex h-9 overflow-hidden rounded-md border border-border">
      {visible.map((lane) => (
        <button
          key={lane.id}
          type="button"
          onClick={() => onToggle(lane.id)}
          title={`${lane.label}: ${counts[lane.id]}`}
          style={{ backgroundColor: lane.color, flexGrow: counts[lane.id] }}
          className={cn(
            "flex min-w-[10px] items-center justify-center whitespace-nowrap px-2 text-[11px] font-medium text-white transition hover:brightness-110",
            active && active !== lane.id && "opacity-25",
          )}
        >
          <span className="truncate">
            {lane.label} · {counts[lane.id]}
          </span>
        </button>
      ))}
    </div>
  );
}
