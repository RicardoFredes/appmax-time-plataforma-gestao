/** Átomos compartilhados entre as seções do onboarding. */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/people";

/**
 * Paleta estável por pessoa: o índice sai de um hash do e-mail, então a cor
 * não muda quando alguém entra ou sai da lista.
 */
const PALETTE = [
  "#9b6afa", // roxo Appmax
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f43f5e",
];

export function accentFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({
  name,
  seed,
  size = "md",
  className,
}: {
  name: string;
  seed: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims =
    size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-xs";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        dims,
        className,
      )}
      style={{ backgroundColor: accentFor(seed) }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/** Cabeçalho de seção: ícone, título e um canto livre pra ações da seção. */
export function Section({
  id,
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-primary">{icon}</span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Subtítulo dentro de uma seção (grupo de repos, trilha do time, etc.). */
export function GroupHeading({
  title,
  count,
  description,
}: {
  title: string;
  count?: number;
  description?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h3>
      {count !== undefined && (
        <span className="text-xs tabular-nums text-muted-foreground">· {count}</span>
      )}
      {description && (
        <p className="w-full text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/**
 * Texto com ênfase leve: `**negrito**` e `` `código` ``. Só isso, porque o conteúdo
 * editorial do onboarding não precisa de markdown de verdade.
 */
export function RichText({ children }: { children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-muted px-1 font-mono text-[0.9em]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

/** Chip de tecnologia com logo, usado nos cards de repositório e de pessoa. */
export function StackChip({ label, logo }: { label: string; logo?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
      {logo && <img src={logo} alt="" className="h-3 w-3" aria-hidden />}
      {label}
    </span>
  );
}
