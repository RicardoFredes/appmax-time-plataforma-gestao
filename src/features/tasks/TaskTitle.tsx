import type { ReactNode } from "react";

/**
 * Renderiza o título com dois realces:
 * - prefixos entre colchetes viram badges: "[T2P] Mobile..." -> [badge T2P] "Mobile...";
 * - trechos entre parênteses ficam em itálico: "... (fora do prazo)".
 */
const LEADING_BADGES = /^\s*((?:\[[^\]]+\]\s*)+)(.*)$/;
const PARENS = /(\([^)]*\))/g;

/** Quebra o texto e envolve os trechos entre parênteses em itálico. */
function withItalicParens(text: string): ReactNode[] {
  return text.split(PARENS).map((part, i) =>
    /^\(.*\)$/.test(part) ? (
      <em key={i} className="italic">
        {part}
      </em>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function TaskTitle({ summary }: { summary: string }) {
  const match = summary.match(LEADING_BADGES);
  const tags = match ? (match[1].match(/\[[^\]]+\]/g) ?? []) : [];
  const rest = match ? match[2].trim() : summary;

  return (
    <>
      {tags.map((tag, i) => (
        <span
          key={i}
          className="mr-1 inline-block rounded bg-secondary px-1.5 py-px align-middle text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground"
        >
          {tag.slice(1, -1).trim()}
        </span>
      ))}
      {withItalicParens(rest)}
    </>
  );
}
