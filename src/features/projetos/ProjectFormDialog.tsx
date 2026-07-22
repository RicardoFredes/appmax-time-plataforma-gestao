/**
 * Dialog de CRUD dos metadados de um projeto — salva direto no Supabase (escrita
 * exige sessão herdada do backoffice). Cria/edita metadados + time + engenheiros
 * (membros do time).
 */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PRIORITY_LABEL, STATUS_META, STATUS_ORDER } from "./derive";
import {
  fetchTeamMembers,
  fetchTeams,
  setEngineers,
  upsertProject,
  type ProjectMeta,
} from "./data";
import { EMPTY_META, Field, MiniAvatar, nextCode, slugify } from "./project-form-helpers";
import type { Engineer, Project, ProjectStatus, Team } from "./types";

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  existingProjects,
  currentQuarter,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** `null` = novo projeto. */
  project: Project | null;
  /** Todos os projetos (qualquer quarter) — base do código incremental automático. */
  existingProjects: Project[];
  currentQuarter: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProjectMeta>(EMPTY_META);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Engineer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // (Re)inicializa o form + carrega os times ao abrir.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (project) {
      const { engineers, reports: _r, ...meta } = project;
      void _r;
      setForm(meta);
      setSelectedIds(new Set(engineers.map((e) => e.id)));
    } else {
      setForm({ ...EMPTY_META, code: nextCode(existingProjects), quarter: currentQuarter });
      setSelectedIds(new Set());
    }
    fetchTeams()
      .then((ts) => {
        setTeams(ts);
        // Novo projeto: cai no primeiro time por padrão.
        setForm((f) => (f.teamId ? f : { ...f, teamId: ts[0]?.id ?? null }));
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [open, project, existingProjects, currentQuarter]);

  // Carrega os membros quando o time muda.
  useEffect(() => {
    if (!open || !form.teamId) {
      setMembers([]);
      return;
    }
    let alive = true;
    fetchTeamMembers(form.teamId)
      .then((m) => alive && setMembers(m))
      .catch(() => alive && setMembers([]));
    return () => {
      alive = false;
    };
  }, [open, form.teamId]);

  const patch = (p: Partial<ProjectMeta>) => setForm((f) => ({ ...f, ...p }));

  const changeTeam = (teamId: string) => {
    // Trocar de time zera a seleção (engenheiros são membros do time).
    setForm((f) => ({ ...f, teamId }));
    setSelectedIds(new Set());
  };

  const toggle = (id: string, on: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const save = async () => {
    setError(null);
    if (!form.name.trim() || !form.code.trim() || !form.quarter.trim()) {
      setError("Preencha nome, código e quarter.");
      return;
    }
    setSaving(true);
    try {
      const id = project?.id || slugify(form.name);
      const meta: ProjectMeta = {
        ...form,
        id,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        closedDate: form.closedDate || null,
      };
      await upsertProject(meta);
      await setEngineers(id, [...selectedIds]);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? "Editar projeto" : "Novo projeto"}</DialogTitle>
          <DialogDescription>
            {project ? project.code : "Cadastre um projeto e seus engenheiros."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código">
            <Input
              value={form.code}
              readOnly
              tabIndex={-1}
              aria-describedby={!project ? "codigo-auto" : undefined}
              className="cursor-default bg-muted text-muted-foreground"
            />
            {!project && (
              <p id="codigo-auto" className="text-xs text-muted-foreground">
                Gerado automaticamente.
              </p>
            )}
          </Field>
          <Field label="Quarter (ex.: 2026-Q3)">
            <Input value={form.quarter} onChange={(e) => patch({ quarter: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Nome">
              <Input value={form.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
          </div>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => patch({ status: v as ProjectStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Prioridade">
            <Select
              value={String(form.priority)}
              onValueChange={(v) => patch({ priority: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} · {PRIORITY_LABEL[n]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Início">
            <DatePicker
              value={form.startDate ?? ""}
              onChange={(v) => patch({ startDate: v || null })}
              clearable
            />
          </Field>
          <Field label="Previsão (prazo)">
            <DatePicker
              value={form.dueDate ?? ""}
              onChange={(v) => patch({ dueDate: v || null })}
              clearable
            />
          </Field>
          <Field label="Fechamento">
            <DatePicker
              value={form.closedDate ?? ""}
              onChange={(v) => patch({ closedDate: v || null })}
              clearable
            />
          </Field>
          <Field label="Time">
            <Select value={form.teamId ?? ""} onValueChange={changeTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um time" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição">
              <Textarea
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Label>Engenheiros (membros do time)</Label>
            <div className="mt-1.5 grid gap-1.5 rounded-md border p-3 sm:grid-cols-2">
              {!form.teamId && (
                <p className="text-sm text-muted-foreground">Selecione um time primeiro.</p>
              )}
              {form.teamId && members.length === 0 && (
                <p className="text-sm text-muted-foreground">Time sem membros.</p>
              )}
              {members.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedIds.has(e.id)}
                    onCheckedChange={(v) => toggle(e.id, v === true)}
                  />
                  <MiniAvatar name={e.name} avatarUrl={e.avatarUrl} />
                  <span className="truncate">{e.name}</span>
                </label>
              ))}
            </div>
          </div>
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
