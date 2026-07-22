/** Edições rápidas em tela no detalhe do projeto: status, engenheiros, descrição. */
import { useEffect, useState } from "react";
import { Loader2, Pencil, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenu } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { STATUS_META, STATUS_ORDER } from "./derive";
import { fetchTeamMembers, setEngineers, upsertProject, type ProjectMeta } from "./data";
import { MiniAvatar } from "./project-form-helpers";
import { FreeText } from "./Linkify";
import type { Engineer, Project, ProjectStatus } from "./types";

/** Campos de topo (sem engenheiros/registros) — base do `upsertProject` de um patch. */
function metaOf(p: Project): ProjectMeta {
  const { engineers: _e, reports: _r, ...meta } = p;
  return meta;
}

/** Badge de status editável (Select disfarçado de pill colorida). */
export function StatusPicker({
  project,
  onSaved,
}: {
  project: Project;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const meta = STATUS_META[project.status];

  const change = async (status: ProjectStatus) => {
    if (status === project.status) return;
    setSaving(true);
    try {
      await upsertProject({ ...metaOf(project), status });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Select value={project.status} onValueChange={(v) => change(v as ProjectStatus)} disabled={saving}>
      <SelectTrigger
        className="h-6 w-auto gap-1 rounded-full border-none px-2.5 py-0 text-xs font-medium shadow-none focus:ring-1 focus:ring-offset-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-70"
        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
      >
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue />}
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_META[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Engenheiros do projeto, com picker (membros do time) num dropdown. */
export function EngineersPicker({
  project,
  onSaved,
}: {
  project: Project;
  onSaved: () => void;
}) {
  const [members, setMembers] = useState<Engineer[] | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!project.teamId) {
      setMembers(null);
      return;
    }
    let alive = true;
    fetchTeamMembers(project.teamId)
      .then((m) => alive && setMembers(m))
      .catch(() => alive && setMembers([]));
    return () => {
      alive = false;
    };
  }, [project.teamId]);

  const ids = new Set(project.engineers.map((e) => e.id));

  const toggle = async (id: string, on: boolean) => {
    const next = on ? [...ids, id] : [...ids].filter((x) => x !== id);
    setPending(id);
    try {
      await setEngineers(project.id, next);
      onSaved();
    } finally {
      setPending(null);
    }
  };

  const label =
    project.engineers.length > 0 ? project.engineers.map((e) => e.name).join(", ") : "Sem engenheiro";

  return (
    <DropdownMenu
      align="start"
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 hover:bg-accent"
        >
          <UserRound className="h-3.5 w-3.5" />
          {label}
        </button>
      }
    >
      <div className="w-56 p-1.5">
        {!project.teamId && (
          <p className="px-1.5 py-1 text-xs text-muted-foreground">
            Defina um time no formulário completo primeiro.
          </p>
        )}
        {project.teamId && members === null && (
          <p className="px-1.5 py-1 text-xs text-muted-foreground">Carregando…</p>
        )}
        {members !== null && members.length === 0 && (
          <p className="px-1.5 py-1 text-xs text-muted-foreground">Time sem membros.</p>
        )}
        {members?.map((e) => (
          <label
            key={e.id}
            className="flex items-center gap-2 rounded-sm px-1.5 py-1 text-sm hover:bg-accent"
          >
            <Checkbox
              checked={ids.has(e.id)}
              disabled={pending === e.id}
              onCheckedChange={(v) => toggle(e.id, v === true)}
            />
            <MiniAvatar name={e.name} avatarUrl={e.avatarUrl} />
            <span className="truncate">{e.name}</span>
          </label>
        ))}
      </div>
    </DropdownMenu>
  );
}

/** Descrição do projeto, editável inline (clique no lápis troca para um textarea). */
export function DescriptionEditor({
  project,
  onSaved,
  className,
}: {
  project: Project;
  onSaved: () => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(project.description);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setValue(project.description);
  }, [project.description, editing]);

  const save = async () => {
    setSaving(true);
    try {
      await upsertProject({ ...metaOf(project), description: value });
      onSaved();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className={cn("max-w-2xl space-y-2", className)}>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          autoFocus
          disabled={saving}
        />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />} Salvar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group flex max-w-2xl items-start gap-1.5", className)}>
      {project.description ? (
        <FreeText text={project.description} />
      ) : (
        <p className="text-sm italic text-muted-foreground/60">Sem descrição.</p>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        title="Editar descrição"
        onClick={() => setEditing(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
