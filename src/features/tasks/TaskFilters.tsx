import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { URGENCY_META, URGENCY_ORDER } from "./urgency";

export type FiltersState = {
  search: string;
  board: string;
  status: string;
  urgency: string;
};

type Props = {
  state: FiltersState;
  boards: string[];
  statuses: string[];
  hasActiveFilters: boolean;
  onChange: (patch: Partial<FiltersState>) => void;
  onReset: () => void;
};

const ALL = "__all__";

export function TaskFilters({
  state,
  boards,
  statuses,
  hasActiveFilters,
  onChange,
  onReset,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={state.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Buscar por título, board, resumo ou responsável..."
          className="pl-8"
        />
      </div>

      <Select
        value={state.board || ALL}
        onValueChange={(v) => onChange({ board: v === ALL ? "" : v })}
      >
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="Todos os boards" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os boards</SelectItem>
          {boards.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={state.status || ALL}
        onValueChange={(v) => onChange({ status: v === ALL ? "" : v })}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os status</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={state.urgency || ALL}
        onValueChange={(v) => onChange({ urgency: v === ALL ? "" : v })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Toda urgência" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toda urgência</SelectItem>
          {URGENCY_ORDER.map((u) => (
            <SelectItem key={u} value={u}>
              {URGENCY_META[u].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
