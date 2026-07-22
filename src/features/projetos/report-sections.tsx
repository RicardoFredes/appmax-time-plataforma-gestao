/** Agrupamento dos projetos em seções do relatório, por dimensão (Grouping). */
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_LABEL,
  STATUS_META,
  STATUS_ORDER,
  byEngineer,
  priorityMeta,
  sortProjects,
} from "./derive";
import { Avatar } from "./ProjectRow";
import { Priority } from "./Priority";
import { compareProjects as compareInGroup } from "./report-metrics";
import type { Grouping } from "./url-state";
import type { Project } from "./types";

export const GROUPING_LABEL: Record<Grouping, string> = {
  prioridade: "Prioridade",
  engenheiro: "Engenheiro",
  status: "Status",
};

/** Uma seção do relatório: um cabeçalho e os projetos daquele grupo. */
export interface Section {
  key: string;
  header: ReactNode;
  /** Rótulo textual da seção (para o relatório copiável). */
  text: string;
  projects: Project[];
}

/** Agrupa por nível de prioridade (5 → 1). */
function groupByPriority(projects: Project[]): { level: number; projects: Project[] }[] {
  const map = new Map<number, Project[]>();
  for (const p of projects) {
    const n = priorityMeta(p.priority).level;
    const arr = map.get(n);
    if (arr) arr.push(p);
    else map.set(n, [p]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([level, ps]) => ({ level, projects: ps.slice().sort(compareInGroup) }));
}

/** Agrupa por status, na ordem lógica de `STATUS_ORDER`. */
function groupByStatus(projects: Project[]): { status: Project["status"]; projects: Project[] }[] {
  const map = new Map<Project["status"], Project[]>();
  for (const p of projects) {
    const arr = map.get(p.status);
    if (arr) arr.push(p);
    else map.set(p.status, [p]);
  }
  return STATUS_ORDER.filter((s) => map.has(s)).map((s) => ({
    status: s,
    projects: map.get(s)!.slice().sort(compareInGroup),
  }));
}

/** Monta as seções + as flags de exibição da linha conforme a dimensão. */
export function buildSections(
  projects: Project[],
  grouping: Grouping,
): { sections: Section[]; showEngineer: boolean; showImportance: boolean } {
  if (grouping === "engenheiro") {
    return {
      showEngineer: false,
      showImportance: true,
      sections: byEngineer(projects).map((g) => ({
        key: g.key,
        text: g.name,
        projects: sortProjects(g.projects),
        header: (
          <div className="mb-2 flex items-center gap-3">
            <Avatar name={g.hasOwner ? g.name : null} avatarUrl={g.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold tracking-tight">{g.name}</h2>
                <Badge variant="outline">
                  {g.projects.length} {g.projects.length === 1 ? "projeto" : "projetos"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                progresso médio {g.avgProgress}%
              </p>
            </div>
          </div>
        ),
      })),
    };
  }
  if (grouping === "status") {
    return {
      showEngineer: true,
      showImportance: true,
      sections: groupByStatus(projects).map(({ status, projects: ps }) => ({
        key: status,
        text: STATUS_META[status].label,
        projects: ps,
        header: (
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_META[status].color }}
            />
            <h2 className="text-sm font-semibold tracking-tight">{STATUS_META[status].label}</h2>
            <Badge variant="outline" className="ml-1">
              {ps.length}
            </Badge>
          </div>
        ),
      })),
    };
  }
  // prioridade (padrão)
  return {
    showEngineer: true,
    showImportance: false,
    sections: groupByPriority(projects).map((g) => ({
      key: `p${g.level}`,
      text: PRIORITY_LABEL[g.level],
      projects: g.projects,
      header: (
        <div className="mb-2 flex items-center gap-2">
          <Priority level={g.level} />
          <h2 className="text-sm font-semibold tracking-tight">{PRIORITY_LABEL[g.level]}</h2>
          <Badge variant="outline" className="ml-1">
            {g.projects.length}
          </Badge>
        </div>
      ),
    })),
  };
}
