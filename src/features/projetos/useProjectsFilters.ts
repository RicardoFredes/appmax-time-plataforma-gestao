/**
 * Estado e derivação dos filtros da listagem de Projetos: quarter, agrupamento do
 * relatório, ocultar concluídos e filtro por engenheiro. Espelha (e sincroniza com)
 * o query string via `url-state.ts`, no mesmo padrão do `TasksPanel`.
 */
import { useEffect, useMemo, useState } from "react";
import { EXTERNAL_NAV_EVENT } from "@/lib/route-sync";
import { availableQuarters, quarterOf } from "./derive";
import { buildProjectsSearch, parseProjectsState, type Grouping } from "./url-state";
import type { Engineer, Project } from "./types";

export interface ProjectStats {
  total: number;
  active: number;
  done: number;
  /** Data do reporte mais recente entre os projetos (referência do relatório). */
  date: string | null;
}

export function useProjectsFilters(allProjects: Project[]) {
  // Quarter atual pelo relógio do cliente; a visão principal começa nele.
  const currentQuarter = useMemo(() => quarterOf(new Date()), []);

  // Estado inicial vindo da URL (filtros no query string — `quarter` ausente cai no atual).
  const initial = useMemo(() => parseProjectsState(window.location.search), []);
  const [quarter, setQuarter] = useState(() => initial.quarter ?? currentQuarter);
  const [grouping, setGrouping] = useState<Grouping>(initial.grouping);
  const [showDone, setShowDone] = useState(initial.showDone);
  const [engineerFilter, setEngineerFilter] = useState<Set<string>>(new Set(initial.engineers));

  const quarters = useMemo(() => {
    const qs = availableQuarters(allProjects, currentQuarter);
    return qs.includes(quarter) ? qs : [quarter, ...qs].sort((a, b) => b.localeCompare(a));
  }, [allProjects, currentQuarter, quarter]);

  // Reflete os filtros na URL (replaceState — não polui o histórico).
  useEffect(() => {
    const search = buildProjectsSearch(
      { quarter, grouping, currentQuarter, showDone, engineers: [...engineerFilter] },
      window.location.search,
    );
    const url = window.location.pathname + search + window.location.hash;
    window.history.replaceState(null, "", url);
  }, [quarter, grouping, currentQuarter, showDone, engineerFilter]);

  // Re-lê a URL quando o backoffice (embed) empurra novos filtros — sem isto o
  // estado seria lido só no mount e o sync backoffice -> painel não refletiria.
  useEffect(() => {
    const reread = () => {
      const s = parseProjectsState(window.location.search);
      setQuarter(s.quarter && quarters.includes(s.quarter) ? s.quarter : currentQuarter);
      setGrouping(s.grouping);
      setShowDone(s.showDone);
      setEngineerFilter(new Set(s.engineers));
    };
    window.addEventListener(EXTERNAL_NAV_EVENT, reread);
    return () => window.removeEventListener(EXTERNAL_NAV_EVENT, reread);
  }, [quarters, currentQuarter]);

  // Projetos do quarter selecionado, antes dos filtros de concluídos/engenheiro
  // (base do picker de engenheiros — a lista de opções não encolhe com os filtros).
  const quarterProjects = useMemo(
    () => allProjects.filter((p) => p.quarter === quarter),
    [allProjects, quarter],
  );

  const engineerOptions = useMemo(() => {
    const byId = new Map<string, Engineer>();
    for (const p of quarterProjects) for (const e of p.engineers) byId.set(e.id, e);
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [quarterProjects]);

  const projects = useMemo(
    () =>
      quarterProjects.filter(
        (p) =>
          (showDone || p.status !== "done") &&
          (engineerFilter.size === 0 || p.engineers.some((e) => engineerFilter.has(e.id))),
      ),
    [quarterProjects, showDone, engineerFilter],
  );

  const stats = useMemo((): ProjectStats => {
    const active = projects.filter(
      (p) => p.status === "in_progress" || p.status === "testing",
    ).length;
    const done = projects.filter((p) => p.status === "done").length;
    const date =
      projects
        .flatMap((p) => p.reports.map((r) => r.date))
        .sort((a, b) => b.localeCompare(a))[0] ?? null;
    return { total: projects.length, active, done, date };
  }, [projects]);

  function toggleEngineer(id: string) {
    setEngineerFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return {
    currentQuarter,
    quarter,
    setQuarter,
    quarters,
    grouping,
    setGrouping,
    showDone,
    setShowDone,
    engineerFilter,
    toggleEngineer,
    quarterProjects,
    engineerOptions,
    projects,
    stats,
  };
}
