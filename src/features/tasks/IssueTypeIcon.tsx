import { Bug, SquareCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { isBug, isEpic } from "./issue";

/** Ícone do tipo: épico (roxo) x bug (vermelho) x task/demais (azul). */
export function IssueTypeIcon({
  issueType,
  className,
}: {
  issueType: string;
  className?: string;
}) {
  if (isEpic(issueType)) {
    return (
      <Zap aria-label="Épico" className={cn("shrink-0 text-primary", className)} />
    );
  }
  if (isBug(issueType)) {
    return (
      <Bug aria-label="Bug" className={cn("shrink-0 text-destructive", className)} />
    );
  }
  return (
    <SquareCheck
      aria-label="Task"
      className={cn("shrink-0 text-blue-500", className)}
    />
  );
}
