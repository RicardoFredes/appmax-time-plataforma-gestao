/**
 * Campo de data com dropdown de calendário — substitui `<Input type="date">`
 * (o input nativo varia de estilo entre navegadores). Popover leve, no mesmo
 * padrão de `dropdown.tsx` (sem dependência nova): fecha ao clicar fora ou Esc.
 * Valor em `YYYY-MM-DD` (fuso local), mesmo contrato usado no resto do app.
 */
import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

/** `Date` local (sem hora) → `YYYY-MM-DD`. */
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Escolha uma data",
  clearable = false,
  className,
}: {
  /** `YYYY-MM-DD`, ou `""` se vazio. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Mostra um X para limpar (campos opcionais, ex.: prazo/fechamento). */
  clearable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = value ? parseISO(value) : undefined;

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "h-10 w-full justify-start gap-2 px-3 font-normal",
          !selected && "text-muted-foreground",
          clearable && value && "pr-8",
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
        <span className="flex-1 truncate text-left">
          {selected ? format(selected, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : placeholder}
        </span>
      </Button>

      {clearable && value && (
        // Botão próprio (não aninhado no <Button>): a classe base do Button aplica
        // `[&_svg]:pointer-events-none` em todo svg descendente, o que capava o
        // clique no X quando ele vivia dentro do trigger.
        <button
          type="button"
          aria-label="Limpar data"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
            setOpen(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div className="absolute z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
          <Calendar
            selected={selected}
            onSelect={(d) => {
              onChange(toISO(d));
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
