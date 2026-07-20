import {
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Equal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { prioridadeMeta } from "./derive";

/**
 * Ícone + cor da prioridade no padrão Jira (Highest → Lowest):
 * 5 seta dupla p/ cima (vermelho) … 1 seta dupla p/ baixo (azul).
 */
const ICONE: Record<number, { Icon: LucideIcon; color: string }> = {
  5: { Icon: ChevronsUp, color: "#ef4444" }, // Máxima — vermelho
  4: { Icon: ChevronUp, color: "#f97316" }, // Alta — laranja
  3: { Icon: Equal, color: "#f59e0b" }, // Média — âmbar
  2: { Icon: ChevronDown, color: "#22c55e" }, // Baixa — verde
  1: { Icon: ChevronsDown, color: "#3b82f6" }, // Mínima — azul
};

/** Indicador de prioridade no estilo Jira (ícone colorido, com rótulo opcional). */
export function Prioridade({
  nivel,
  showLabel = false,
  className,
}: {
  nivel: number;
  showLabel?: boolean;
  className?: string;
}) {
  const { nivel: n, label } = prioridadeMeta(nivel);
  const { Icon, color } = ICONE[n];
  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-1", className)}
      style={{ color }}
      title={`Prioridade: ${label}`}
    >
      <Icon className="h-4 w-4" />
      {showLabel && <span className="text-xs font-medium">{label}</span>}
    </span>
  );
}
