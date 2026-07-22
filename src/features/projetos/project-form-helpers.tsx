/** Helpers compartilhados pelos dialogs de CRUD de projeto. */
import { Label } from "@/components/ui/label";
import { initials } from "@/lib/people";
import type { ProjectMeta } from "./data";
import type { Project } from "./types";

/** Data de hoje em `YYYY-MM-DD` (fuso local). */
export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * Próximo código incremental (`PRJ-<n>`) a partir dos existentes — usa o maior
 * número já usado + 1 (não reaproveita buracos deixados por projetos apagados).
 */
export function nextCode(projects: Project[]): string {
  let max = 0;
  for (const p of projects) {
    const m = /^PRJ-(\d+)$/i.exec(p.code.trim());
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `PRJ-${max + 1}`;
}

/** Slug estável a partir do nome (id do projeto, usado na URL de detalhe). */
export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "projeto"
  );
}

/** Metadados vazios de um projeto novo (antes de preencher). */
export const EMPTY_META: ProjectMeta = {
  id: "",
  code: "",
  name: "",
  description: "",
  status: "in_progress",
  teamId: null,
  priority: 3,
  quarter: "",
  startDate: null,
  dueDate: null,
  closedDate: null,
};

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function MiniAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
      {initials(name)}
    </span>
  );
}
