import { Flag, Info, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { healthMeta } from "./derive";

/** Variação numérica (delta) com seta e cor por direção. */
export function Delta({ value }: { value: number }) {
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

/** Metadados de exibição dos marcos (registros sem on-tracking). */
export const MILESTONE_META = {
  start: { label: "Início do projeto", color: "#9b6afa", Icon: Flag }, // roxo Appmax
  end: { label: "Fim do projeto", color: "#10b981", Icon: Flag }, // emerald (done)
  info: { label: "Informativo", color: "#64748b", Icon: Info }, // slate
} as const;

/** Badge de saúde (on-tracking) com cor e rótulo. */
export function HealthBadge({ health }: { health: number }) {
  const m = healthMeta(health);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${m.color}1a`, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label} · {m.level}/5
    </span>
  );
}
