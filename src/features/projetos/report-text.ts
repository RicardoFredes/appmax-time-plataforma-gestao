/** Geração do texto copiável do relatório + helper de cópia (com fallback no iframe). */
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { STATUS_META, currentHealth, currentProgress, healthMeta, lastReport } from "./derive";
import { engineerNames } from "./ProjectRow";
import type { DutyItem, Metrics } from "./report-metrics";
import type { Section } from "./report-sections";

export function buildReportText(
  sections: Section[],
  duty: DutyItem[],
  m: Metrics,
  date: string | null,
): string {
  const L: string[] = ["Relatório de projetos — Time Plataforma"];
  if (date) L.push(`Atualizado em ${format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}`);
  L.push("");

  L.push("Panorama (ponderado pela importância):");
  L.push(`- Progresso ponderado: ${m.weightedProgress}%`);
  L.push(`- Saúde ponderada: ${m.weightedHealth}/5`);
  L.push(`- On-track: ${m.onTrack} · Atenção: ${m.warning} · Em risco: ${m.atRisk} · Vencidos: ${m.overdue}`);
  L.push("");

  if (duty.length) {
    L.push("Sustentação esta semana:");
    for (const d of duty) {
      const extra = d.uncovered
        ? " (sem cobertura)"
        : d.coveringFor
          ? ` (cobrindo ${d.coveringFor})`
          : "";
      L.push(`- ${d.scope}: ${d.name}${extra}`);
    }
    L.push("");
  }

  for (const s of sections) {
    L.push(`${s.text}:`);
    for (const p of s.projects) {
      const u = lastReport(p);
      const note = u?.note?.trim() || p.description || "—";
      const sa = currentHealth(p);
      const onTrack = sa !== null ? ` · ${healthMeta(sa).label} (${healthMeta(sa).level}/5)` : "";
      const resp = engineerNames(p);
      L.push(
        `  - [${p.code}] ${p.name} (${resp}) — ${currentProgress(p)}% · ${STATUS_META[p.status].label}${onTrack}: ${note}`,
      );
    }
    L.push("");
  }
  return L.join("\n").trim();
}

/**
 * Copia texto para a área de transferência. Dentro do iframe do backoffice a
 * `navigator.clipboard` costuma ser bloqueada (permission policy / foco), então
 * caímos num `<textarea>` + `execCommand("copy")`. Retorna se conseguiu copiar.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // cai no fallback abaixo
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
