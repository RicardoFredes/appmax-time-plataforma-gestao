/** Ações de remoção (projeto/registro) com confirmação — usadas pela página. */
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { useConfirm } from "@/components/ui/confirm";
import { deleteProject, deleteReport } from "./data";
import type { Project } from "./types";

type ConfirmFn = ReturnType<typeof useConfirm>;

export function useProjectActions({
  confirm,
  refetch,
  navigate,
}: {
  confirm: ConfirmFn;
  refetch: () => void;
  navigate: (id: string | null) => void;
}) {
  // Apaga o projeto inteiro (confirma antes; volta à lista e recarrega).
  const removeProject = async (project: Project) => {
    const ok = await confirm({
      title: "Apagar projeto?",
      description: `"${project.name}" e todo o seu histórico serão removidos. Não dá para desfazer.`,
      confirmLabel: "Apagar",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteProject(project.id);
      navigate(null);
      refetch();
    } catch (e) {
      await confirm({
        title: "Não foi possível apagar",
        description: e instanceof Error ? e.message : String(e),
        confirmLabel: "Ok",
        cancelLabel: "Fechar",
      });
    }
  };

  // Apaga um registro (confirma antes; recarrega ao concluir).
  const removeReport = async (project: Project, reportId: string) => {
    const reg = project.reports.find((r) => r.id === reportId);
    const when = reg ? format(parseISO(reg.date), "dd/MM/yyyy", { locale: ptBR }) : "";
    const ok = await confirm({
      title: "Apagar registro?",
      description: `O registro${when ? ` de ${when}` : ""} será removido.`,
      confirmLabel: "Apagar",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteReport(reportId);
      refetch();
    } catch (e) {
      await confirm({
        title: "Não foi possível apagar",
        description: e instanceof Error ? e.message : String(e),
        confirmLabel: "Ok",
        cancelLabel: "Fechar",
      });
    }
  };

  return { removeProject, removeReport };
}
