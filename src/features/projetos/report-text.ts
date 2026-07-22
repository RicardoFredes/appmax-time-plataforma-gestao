/** Geração do relatório copiável (Markdown com tabelas) + helper de cópia (com fallback no iframe). */
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { STATUS_META, currentHealth, currentProgress, healthMeta, lastReport, priorityMeta } from "./derive";
import { engineerNames } from "./ProjectRow";
import type { DutyItem, Metrics } from "./report-metrics";
import type { Section } from "./report-sections";
import type { Project } from "./types";

/** Sanitiza texto livre para caber numa célula de tabela Markdown (uma linha, sem `|`). */
function cell(text: string): string {
  return text.replace(/\r?\n+/g, " ").replace(/\|/g, "\\|").trim();
}

/** Ícone de saúde por faixa; projetos só com marcos (sem saúde) usam ✅ se concluídos, senão "—". */
function healthCell(p: Project): string {
  const h = currentHealth(p);
  if (h === null) return p.status === "done" ? "✅" : "—";
  const { level, label } = healthMeta(h);
  const icon = level >= 4 ? "🟢" : level === 3 ? "🟡" : level === 2 ? "🟠" : "🔴";
  return `${icon} ${label} (${level}/5)`;
}

function noteCell(p: Project): string {
  const note = lastReport(p)?.note?.trim() || p.description || "—";
  return cell(note);
}

export function buildReportText(
  sections: Section[],
  duty: DutyItem[],
  m: Metrics,
  date: string | null,
  showEngineer: boolean,
  showImportance: boolean,
): string {
  const L: string[] = ["# Relatório de Projetos — Time Plataforma", ""];
  if (date) L.push(`_Atualizado em ${format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}_`, "");

  L.push(
    "## Panorama",
    "",
    "| Progresso ponderado | Saúde ponderada | On-track | Atenção | Em risco | Vencidos |",
    "|---|---|---|---|---|---|",
    `| ${m.weightedProgress}% | ${m.weightedHealth}/5 | ${m.onTrack} | ${m.warning} | ${m.atRisk} | ${m.overdue} |`,
    "",
  );

  if (duty.length) {
    L.push("## Sustentação da semana", "", "| Grupo | Responsável |", "|---|---|");
    for (const d of duty) {
      const extra = d.uncovered
        ? " (sem cobertura)"
        : d.coveringFor
          ? ` (cobrindo ${cell(d.coveringFor)})`
          : "";
      L.push(`| ${cell(d.scope)} | ${cell(d.name)}${extra} |`);
    }
    L.push("");
  }

  L.push(
    "## Projetos",
    "",
    "**Legenda de saúde:** 🟢 On tracking / No caminho · 🟡 Atenção · 🟠 Em risco · 🔴 Em perigo · ✅ Concluído",
    "",
  );

  for (const s of sections) {
    const headers = ["Projeto"];
    if (showEngineer) headers.push("Engenheiro");
    if (showImportance) headers.push("Prioridade");
    headers.push("%", "Status", "Saúde", "Observação");

    L.push(`### ${s.text}`, "", `| ${headers.join(" | ")} |`, `|${headers.map(() => "---").join("|")}|`);
    for (const p of s.projects) {
      const row = [`[${p.code}] ${cell(p.name)}`];
      if (showEngineer) row.push(cell(engineerNames(p)));
      if (showImportance) row.push(priorityMeta(p.priority).label);
      row.push(`${currentProgress(p)}%`, STATUS_META[p.status].label, healthCell(p), noteCell(p));
      L.push(`| ${row.join(" | ")} |`);
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
