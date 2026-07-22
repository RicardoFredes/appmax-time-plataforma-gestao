import { useEffect, useMemo, useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/components/ui/confirm";
import { EXTERNAL_NAV_EVENT } from "@/lib/route-sync";
import { useSupabaseSession } from "@/lib/useSupabaseSession";
import type { SustentacaoData } from "@/features/tasks/types";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectFormDialog } from "./ProjectFormDialog";
import { ReportFormDialog } from "./ReportFormDialog";
import { ProjectsReport } from "./ProjectsReport";
import { useProjectsData } from "./useProjectsData";
import { useProjectActions } from "./project-actions";
import type { Project } from "./types";
import { parseProjectsState, buildProjectsSearch, type Grouping } from "./url-state";
import { quarterOf, quarterLabel, availableQuarters } from "./derive";

/**
 * Sub-rota da aba: id do projeto aberto (via hash `#/projetos/<id>`), ou `null`
 * na listagem. Linkável e sobrevive ao reload.
 */
function useProjectRoute(): [string | null, (id: string | null) => void] {
  const read = (): string | null => {
    const h = window.location.hash.replace(/^#\/?/, "");
    const parts = h.split("/");
    return parts[0] === "projetos" && parts[1] ? decodeURIComponent(parts[1]) : null;
  };
  const [id, setId] = useState<string | null>(read);
  useEffect(() => {
    const on = () => setId(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const navigate = (pid: string | null) => {
    window.location.hash = pid ? `/projetos/${pid}` : "/projetos";
    setId(pid);
  };
  return [id, navigate];
}

export function ProjectsPage({ sustentacao }: { sustentacao?: SustentacaoData }) {
  const [id, navigate] = useProjectRoute();
  const { state, refetch } = useProjectsData();
  const session = useSupabaseSession();
  const canEdit = session !== null;
  const confirm = useConfirm();
  const { removeProject, removeReport } = useProjectActions({ confirm, refetch, navigate });

  // Dados carregados (vazio enquanto carrega — mantém a ordem dos hooks estável).
  const allProjects = state.status === "ready" ? state.data.projects : [];

  // Dialogs de CRUD.
  const [newOpen, setNewOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  // `reporting` = novo reporte / edição; `reportId` presente → edita aquele registro.
  const [reporting, setReporting] = useState<{ project: Project; reportId?: string } | null>(null);

  // Quarter atual pelo relógio do cliente; a visão principal começa nele.
  const currentQuarter = useMemo(() => quarterOf(new Date()), []);

  // Filtros no query string (padrão do projeto — ver ./url-state.ts). Estado
  // inicial vindo da URL; `quarter` ausente cai no atual.
  const initial = useMemo(() => parseProjectsState(window.location.search), []);
  const [quarter, setQuarter] = useState(() => initial.quarter ?? currentQuarter);
  const [grouping, setGrouping] = useState<Grouping>(initial.grouping);

  const quarters = useMemo(() => {
    const qs = availableQuarters(allProjects, currentQuarter);
    return qs.includes(quarter) ? qs : [quarter, ...qs].sort((a, b) => b.localeCompare(a));
  }, [allProjects, currentQuarter, quarter]);

  // Reflete os filtros na URL (replaceState — não polui o histórico).
  useEffect(() => {
    const search = buildProjectsSearch(
      { quarter, grouping, currentQuarter },
      window.location.search,
    );
    const url = window.location.pathname + search + window.location.hash;
    window.history.replaceState(null, "", url);
  }, [quarter, grouping, currentQuarter]);

  // Re-lê a URL quando o backoffice (embed) empurra novos filtros — sem isto o
  // estado seria lido só no mount e o sync backoffice -> painel não refletiria.
  useEffect(() => {
    const reread = () => {
      const s = parseProjectsState(window.location.search);
      setQuarter(s.quarter && quarters.includes(s.quarter) ? s.quarter : currentQuarter);
      setGrouping(s.grouping);
    };
    window.addEventListener(EXTERNAL_NAV_EVENT, reread);
    return () => window.removeEventListener(EXTERNAL_NAV_EVENT, reread);
  }, [quarters, currentQuarter]);

  const projects = useMemo(
    () => allProjects.filter((p) => p.quarter === quarter),
    [allProjects, quarter],
  );

  const stats = useMemo(() => {
    const active = projects.filter(
      (p) => p.status === "in_progress" || p.status === "testing",
    ).length;
    const done = projects.filter((p) => p.status === "done").length;
    // Data do reporte mais recente entre os projetos (referência do relatório).
    const date =
      projects
        .flatMap((p) => p.reports.map((r) => r.date))
        .sort((a, b) => b.localeCompare(a))[0] ?? null;
    return {
      total: projects.length,
      active,
      done,
      date,
    };
  }, [projects]);

  // Estados de carregamento/erro do Supabase.
  if (state.status === "loading") return <ProjectsSkeleton />;
  if (state.status === "error") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Erro ao carregar projetos: {state.error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  // Detalhe de um projeto (busca em todos os quarters, não só no selecionado).
  // A rota usa o código (ex.: PRJ-3); aceita o slug antigo como fallback.
  const openProject = id
    ? allProjects.find((p) => p.code === id) ?? allProjects.find((p) => p.id === id) ?? null
    : null;

  // Dialogs de CRUD, montados uma vez (acessíveis do detalhe e da lista).
  const dialogs = (
    <>
      <ProjectFormDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        project={null}
        existingProjects={allProjects}
        currentQuarter={currentQuarter}
        onSaved={refetch}
      />
      {editing && (
        <ProjectFormDialog
          open
          onOpenChange={(v) => !v && setEditing(null)}
          project={editing}
          existingProjects={allProjects}
          currentQuarter={currentQuarter}
          onSaved={refetch}
        />
      )}
      {reporting && (
        <ReportFormDialog
          open
          onOpenChange={(v) => !v && setReporting(null)}
          project={reporting.project}
          reportId={reporting.reportId}
          onSaved={refetch}
        />
      )}
    </>
  );

  if (id) {
    const content = openProject ? (
      <ProjectDetail
        project={openProject}
        onBack={() => navigate(null)}
        canEdit={canEdit}
        onEdit={() => setEditing(openProject)}
        onReport={() => setReporting({ project: openProject })}
        onDelete={() => removeProject(openProject)}
        onEditReport={(regId) => setReporting({ project: openProject, reportId: regId })}
        onDeleteReport={(regId) => removeReport(openProject, regId)}
        onUpdated={refetch}
      />
    ) : (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Projeto <code>{id}</code> não encontrado.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(null)}>
          Voltar à lista
        </Button>
      </div>
    );
    return (
      <>
        {content}
        {dialogs}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Controle de Projetos</h1>
            <div className="flex items-center gap-2">
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((q) => (
                    <SelectItem key={q} value={q}>
                      {quarterLabel(q)}
                      {q === currentQuarter ? " · atual" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canEdit && (
                <Button size="sm" onClick={() => setNewOpen(true)}>
                  <Plus /> Novo projeto
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Evolução semanal dos projetos.
          </p>
        </div>

        {allProjects.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Nenhum projeto cadastrado ainda.
            {canEdit && " Use “Novo projeto” para começar."}
          </Card>
        ) : projects.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Nenhum projeto em {quarterLabel(quarter)}.
          </Card>
        ) : (
          <ProjectsReport
            projects={projects}
            stats={stats}
            sustentacao={sustentacao}
            grouping={grouping}
            onGroupingChange={setGrouping}
            onOpen={(pid) => navigate(pid)}
          />
        )}

        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <FolderKanban className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="leading-relaxed">
            Clique em um projeto para ver o histórico e{" "}
            {canEdit ? "reportar a semana / editar" : "acompanhar a evolução"}.
            {!canEdit && " (Edição disponível dentro do backoffice.)"}
          </p>
        </div>
      </div>
      {dialogs}
    </>
  );
}

/** Esqueleto enquanto os projetos carregam do Supabase. */
function ProjectsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid gap-2 sm:grid-cols-8">
        <Skeleton className="h-40 sm:col-span-2" />
        <Skeleton className="h-40 sm:col-span-2" />
        <Skeleton className="h-40 sm:col-span-4" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
