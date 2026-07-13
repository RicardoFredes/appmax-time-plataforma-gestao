import { Bug, SquareCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isBug } from "./issue";

/** Ícone do tipo: bug (vermelho) x task/demais (azul). */
export function IssueTypeIcon({
  issueType,
  className,
}: {
  issueType: string;
  className?: string;
}) {
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
