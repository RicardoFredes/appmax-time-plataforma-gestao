import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskFilters, type FiltersState } from "./TaskFilters";
import { PeopleChips } from "./PeopleChips";
import { StatusTicker } from "./StatusTicker";
import { KanbanBoard } from "./KanbanBoard";
import { EpicGroups } from "./EpicGroups";
import { TasksTable, type SortKey, type SortState } from "./TasksTable";
import { isEpic } from "./issue";
import { kanbanLane, type KanbanLane } from "./status";
import {
  buildSearch,
  parsePanelState,
  type Layout,
  type View,
} from "./url-state";
import { EXTERNAL_NAV_EVENT } from "@/lib/route-sync";
import { EMPTY_FILTERS, UNASSIGNED, compareBy, computeFacets } from "./panel-derive";
import type { TasksData } from "./types";

export function TasksPanel({ data }: { data: TasksData }) {
  // Estado inicial vindo da URL (links compartilháveis).
  const initial = useMemo(
    () => parsePanelState(window.location.search),
    [],
  );
  const [view, setView] = useState<View>(initial.view);
  const [filters, setFilters] = useState<FiltersState>(initial.filters);
  const [lane, setLane] = useState<KanbanLane | null>(initial.lane);
  const [people, setPeople] = useState<Set<string>>(new Set(initial.people));
  const [showDone, setShowDone] = useState(initial.showDone);
  const [sort, setSort] = useState<SortState>(initial.sort);
  const [layout, setLayout] = useState<Layout>(initial.layout);

  // Reflete o estado atual na URL (replaceState — não polui o histórico).
  useEffect(() => {
    const search = buildSearch({
      view,
      layout,
      filters,
      lane,
      people: [...people],
      showDone,
      sort,
    });
    const url = window.location.pathname + search + window.location.hash;
    window.history.replaceState(null, "", url);
  }, [view, layout, filters, lane, people, showDone, sort]);

  // Re-lê a URL quando o backoffice (embed) empurra novos filtros. Sem isto o
  // estado seria lido só no mount, e o sync backoffice -> painel não refletiria.
  useEffect(() => {
    const reread = () => {
      const s = parsePanelState(window.location.search);
      setView(s.view);
      setLayout(s.layout);
      setFilters(s.filters);
      setLane(s.lane);
      setPeople(new Set(s.people));
      setShowDone(s.showDone);
      setSort(s.sort);
    };
    window.addEventListener(EXTERNAL_NAV_EVENT, reread);
    return () => window.removeEventListener(EXTERNAL_NAV_EVENT, reread);
  }, []);

  // Membros do time (definidos em sync/config.json), indexados por e-mail.
  const teamByEmail = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of data.users) map.set(u.email, u.name);
    return map;
  }, [data.users]);

  // O Kanban só existe na aba Tasks; lá a coluna Done é sempre visível.
  const kanban = view === "tasks" && layout === "kanban";
  // No Kanban a coluna Done é sempre visível; o toggle showDone só vale nas listas.
  const includeDone = showDone || kanban;

  // Conjunto base conforme a aba, já aplicando:
  // - épicos nunca entram como linha (são cabeçalho de grupo na aba Épicos);
  // - "Tasks" mostra todas; "Épicos" só as de épicos acompanhados;
  // - só tarefas não-atribuídas ou de pessoas do time;
  // - concluídas escondidas por padrão nas listas (sempre visíveis no Kanban).
  const base = useMemo(
    () =>
      data.tasks.filter((t) => {
        if (isEpic(t.issueType)) return false;
        if (view === "epic" && !t.sources.includes("epic")) return false;
        // Mantém só não-atribuídas ou pessoas do time (por e-mail).
        const isUnassigned = t.assigneeName === "Não atribuída";
        if (!isUnassigned && !teamByEmail.has(t.assigneeEmail)) return false;
        if (!includeDone && t.statusCategory === "done") return false;
        return true;
      }),
    [data.tasks, view, teamByEmail, includeDone],
  );

  const facets = useMemo(() => computeFacets(base, teamByEmail), [base, teamByEmail]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return base.filter((t) => {
      if (filters.board && t.board !== filters.board) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.urgency && t.urgency !== filters.urgency) return false;
      if (people.size > 0) {
        const personId =
          t.assigneeName === "Não atribuída" ? UNASSIGNED : t.assigneeEmail;
        if (!people.has(personId)) return false;
      }
      if (lane && kanbanLane(t.status) !== lane) return false;
      if (q) {
        const hay = `${t.key} ${t.summary} ${t.board} ${t.description} ${t.assigneeName} ${t.epicSummary ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [base, filters, people, lane]);

  // Ordenação lógica por coluna (mantém a ordem original quando sort é null).
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => dir * compareBy(sort.key, a, b));
  }, [filtered, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  const hasActiveFilters =
    !!filters.search ||
    !!filters.board ||
    !!filters.status ||
    !!filters.urgency ||
    lane !== null ||
    people.size > 0;

  function reset() {
    setFilters(EMPTY_FILTERS);
    setLane(null);
    setPeople(new Set());
  }

  function togglePerson(email: string) {
    setPeople((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  function switchTab(next: string) {
    setView(next as View);
    reset();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={switchTab}>
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="epic">Épicos</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "tasks" && (
          <Tabs
            value={layout}
            onValueChange={(v) => setLayout(v as "table" | "kanban")}
          >
            <TabsList>
              <TabsTrigger value="table">Tabela</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <StatusTicker
        counts={facets.laneCounts}
        active={lane}
        onToggle={(l) => setLane((cur) => (cur === l ? null : l))}
      />

      <TaskFilters
        state={filters}
        boards={facets.boards}
        statuses={facets.statuses}
        hasActiveFilters={hasActiveFilters}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onReset={reset}
      />

      <PeopleChips
        people={facets.people}
        selected={people}
        onToggle={togglePerson}
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {base.length} tarefas
        </p>
        {!kanban ? (
          <button
            type="button"
            role="switch"
            aria-checked={showDone}
            onClick={() => setShowDone((v) => !v)}
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
            Mostrar concluídas
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">
            Done sempre visível
          </span>
        )}
      </div>

      {view === "epic" ? (
        <EpicGroups
          tasks={sorted}
          epics={data.epics}
          sort={sort}
          onSort={toggleSort}
        />
      ) : layout === "table" ? (
        <TasksTable tasks={sorted} showEpic={false} sort={sort} onSort={toggleSort} />
      ) : (
        <KanbanBoard tasks={sorted} showEpic={false} />
      )}
    </div>
  );
}
