import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTasksData } from "@/hooks/useTasksData";
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksPanel } from "@/features/tasks/TasksPanel";
import { SustentacaoPage } from "@/features/sustentacao/SustentacaoPage";
import { FeriasPage } from "@/features/ferias/FeriasPage";
import type { TasksData } from "@/features/tasks/types";

type Page = "tarefas" | "sustentacao" | "ferias";

/** Página atual a partir do hash da URL (linkável, sobrevive ao reload). */
function usePage(): [Page, (p: Page) => void] {
  const read = (): Page => {
    const h = window.location.hash.replace(/^#\/?/, "");
    return h === "sustentacao" || h === "ferias" ? h : "tarefas";
  };
  const [page, setPage] = useState<Page>(read);
  useEffect(() => {
    const onHash = () => setPage(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (p: Page) => {
    window.location.hash = p === "tarefas" ? "" : `/${p}`;
    setPage(p);
  };
  return [page, navigate];
}

function TopNav({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Logo variant="mark" className="h-7" />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Time Plataforma
        </span>
      </div>
      <Tabs value={page} onValueChange={(v) => onNavigate(v as Page)}>
        <TabsList>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="sustentacao">Sustentação</TabsTrigger>
          <TabsTrigger value="ferias">Férias</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="text-2xl font-semibold leading-none tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Header({ data }: { data: TasksData }) {
  const unassigned = data.tasks.filter(
    (t) => t.assigneeName === "Não atribuída",
  ).length;
  const generated = data.generatedAt
    ? format(new Date(data.generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : "—";

  return (
    <div className="space-y-5 border-b pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Tarefas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jira · tecnologia-appmax · atualizado em {generated}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Stat label="Tarefas" value={data.tasks.length} />
          <Stat label="Sem dono" value={unassigned} />
          <Stat label="Boards" value={data.boards.length} />
          <Stat label="Épicos" value={data.epics.length} />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
      <div className="flex items-center gap-2 font-medium text-destructive">
        <AlertCircle className="h-5 w-5" />
        Não foi possível carregar os dados
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Erro ao ler <code className="rounded bg-muted px-1">public/data/tasks.json</code>: {error}
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <RefreshCw className="h-3.5 w-3.5" />
        Rode <code className="rounded bg-muted px-1">pnpm sync</code> para gerar o
        arquivo a partir do Jira.
      </p>
    </div>
  );
}

export function App() {
  const state = useTasksData();
  const [page, navigate] = usePage();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <TopNav page={page} onNavigate={navigate} />
      {state.status === "loading" && <LoadingState />}
      {state.status === "error" && <ErrorState error={state.error} />}
      {state.status === "ready" &&
        (page === "sustentacao" ? (
          <SustentacaoPage data={state.data.sustentacao} />
        ) : page === "ferias" ? (
          <FeriasPage data={state.data.sustentacao} />
        ) : (
          <div className="space-y-6">
            <Header data={state.data} />
            <TasksPanel data={state.data} />
          </div>
        ))}
    </div>
  );
}
