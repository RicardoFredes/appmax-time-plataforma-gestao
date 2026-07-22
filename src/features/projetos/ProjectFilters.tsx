/** Filtros da listagem de projetos: por engenheiro + ocultar concluídos. */
import { UserRound } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { MiniAvatar } from "./project-form-helpers";
import type { Engineer } from "./types";

/** Dropdown com checkboxes (mesmo padrão do picker de engenheiros do detalhe). */
export function EngineerFilter({
  engineers,
  selected,
  onToggle,
}: {
  engineers: Engineer[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const label =
    selected.size === 0
      ? "Todos os engenheiros"
      : engineers
          .filter((e) => selected.has(e.id))
          .map((e) => e.name)
          .join(", ");

  return (
    <DropdownMenu
      align="start"
      trigger={
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          <UserRound className="h-4 w-4 shrink-0" />
          <span className="max-w-[220px] truncate">{label}</span>
        </button>
      }
    >
      <div className="w-56 p-1.5">
        {engineers.length === 0 && (
          <p className="px-1.5 py-1 text-xs text-muted-foreground">Nenhum engenheiro neste quarter.</p>
        )}
        {engineers.map((e) => (
          <label
            key={e.id}
            className="flex items-center gap-2 rounded-sm px-1.5 py-1 text-sm hover:bg-accent"
          >
            <Checkbox checked={selected.has(e.id)} onCheckedChange={() => onToggle(e.id)} />
            <MiniAvatar name={e.name} avatarUrl={e.avatarUrl} />
            <span className="truncate">{e.name}</span>
          </label>
        ))}
      </div>
    </DropdownMenu>
  );
}

/** Switch "Mostrar concluídos" (concluídos escondidos por padrão, como em Tarefas). */
export function HideDoneToggle({
  showDone,
  onToggle,
}: {
  showDone: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={showDone}
      onClick={onToggle}
      className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
    >
      <span
        className={cn(
          "relative h-4 w-7 rounded-full transition-colors",
          showDone ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-background transition-transform",
            showDone && "translate-x-3",
          )}
        />
      </span>
      Mostrar concluídos
    </button>
  );
}
