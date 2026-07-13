import { cn } from "@/lib/utils";

export type PersonChip = {
  id: string;
  label: string;
  title: string;
  count: number;
};

type Props = {
  people: PersonChip[];
  selected: Set<string>;
  onToggle: (id: string) => void;
};

/** Chips do time + "Não atribuído" (multi-seleção) para filtrar por responsável. */
export function PeopleChips({ people, selected, onToggle }: Props) {
  if (people.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        Meu time
      </span>
      <div className="flex flex-wrap gap-1.5">
        {people.map((p) => {
          const active = selected.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              title={p.title}
              onClick={() => onToggle(p.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition select-none",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30",
              )}
            >
              {p.label}{" "}
              <span className={cn(active ? "opacity-80" : "opacity-60")}>
                ({p.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
