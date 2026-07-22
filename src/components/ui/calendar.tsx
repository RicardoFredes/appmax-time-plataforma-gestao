/**
 * Grade de calendário (mês), construída com `date-fns` — sem dependência de
 * `react-day-picker`. Usada pelo `DatePicker` (dropdown), mas exportada solta
 * para qualquer lugar que precise só da grade.
 */
import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
}: {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}) {
  const [month, setMonth] = React.useState(() => selected ?? new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const isDisabled = (d: Date) =>
    Boolean((minDate && isBefore(d, minDate)) || (maxDate && isAfter(d, maxDate)));

  return (
    <div className={cn("w-64 select-none p-3", className)}>
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize">
          {format(month, "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="flex h-8 items-center justify-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const outside = !isSameMonth(d, month);
          const selectedDay = selected && isSameDay(d, selected);
          const disabled = isDisabled(d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-30",
                outside && "text-muted-foreground/50",
                isToday(d) && !selectedDay && "font-semibold text-primary",
                selectedDay &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
