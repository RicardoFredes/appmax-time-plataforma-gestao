/**
 * Dialog de reporte — cria/edita um registro de evolução (data livre, vários por
 * dia). Salva direto no Supabase (escrita exige sessão herdada do backoffice).
 */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lastReport } from "./derive";
import { createReport, updateReport } from "./data";
import { Field, todayISO } from "./project-form-helpers";
import type { Milestone, Project, ReportInput } from "./types";

type MilestoneOpt = "" | Milestone;

export function ReportFormDialog({
  open,
  onOpenChange,
  project,
  reportId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: Project;
  /** `id` do registro a editar. Ausente = novo reporte. */
  reportId?: string;
  onSaved: () => void;
}) {
  const editing = reportId != null;
  const [date, setDate] = useState(() => todayISO());
  const [progress, setProgress] = useState(0);
  const [health, setHealth] = useState(3);
  const [note, setNote] = useState("");
  const [milestone, setMilestone] = useState<MilestoneOpt>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa o form **ao abrir** (ou quando muda o alvo). NÃO depende de `date`:
  // trocar a data depois no picker não reseta os campos já preenchidos. Editando,
  // carrega o registro pelo `id`; novo reporte começa na data de hoje, com o
  // progresso herdado do último registro (é acumulado) e nota/marco em branco.
  useEffect(() => {
    if (!open) return;
    setError(null);
    const target = reportId ? project.reports.find((r) => r.id === reportId) : undefined;
    if (target) {
      setDate(target.date);
      setProgress(target.progress);
      setHealth(target.health);
      setNote(target.note ?? "");
      setMilestone((target.milestone as MilestoneOpt) ?? "");
    } else {
      const previous = lastReport(project);
      setDate(todayISO());
      setProgress(previous?.progress ?? 0);
      setHealth(previous?.health ?? 3);
      setNote("");
      setMilestone("");
    }
  }, [open, project, reportId]);

  const save = async () => {
    setError(null);
    if (!date) {
      setError("Escolha uma data.");
      return;
    }
    setSaving(true);
    try {
      const input: ReportInput = {
        date,
        progress,
        health,
        note: note.trim(),
        ...(milestone ? { milestone } : {}),
      };
      if (reportId) await updateReport(project.id, reportId, input);
      else await createReport(project.id, input);
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar registro" : "Novo reporte"} · {project.code}
          </DialogTitle>
          <DialogDescription>
            {project.name}
            {editing ? " — edite os dados deste registro." : " — escolha a data e preencha o reporte."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Data">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>

          <Field label={`Progresso — ${progress}%`}>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="h-2 flex-1 cursor-pointer accent-[#9b6afa]"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-20"
              />
            </div>
          </Field>

          <Field label="Marco (opcional)">
            <Select
              value={milestone || "none"}
              onValueChange={(v) => setMilestone(v === "none" ? "" : (v as MilestoneOpt))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem marco (registro normal)</SelectItem>
                <SelectItem value="start">Início do projeto</SelectItem>
                <SelectItem value="end">Fim do projeto</SelectItem>
                <SelectItem value="info">Informativo</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {!milestone && (
            <Field label="On-tracking (saúde)">
              <Select value={String(health)} onValueChange={(v) => setHealth(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 · On tracking</SelectItem>
                  <SelectItem value="4">4 · Bom</SelectItem>
                  <SelectItem value="3">3 · Atenção</SelectItem>
                  <SelectItem value="2">2 · Risco</SelectItem>
                  <SelectItem value="1">1 · Em perigo</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field label="Nota">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
