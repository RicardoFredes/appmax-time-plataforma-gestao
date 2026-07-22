import { Fragment } from "react";

/** Casa URLs http(s). O `www.` é promovido a https na hora de montar o href. */
const URL_RE = /\b(https?:\/\/[^\s<]+[^\s<.,:;!?)\]}'"]|www\.[^\s<]+[^\s<.,:;!?)\]}'"])/gi;

/** Encurta a URL exibida (sem esquema, sem query longa) mantendo o clique íntegro. */
function label(url: string): string {
  const withoutScheme = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const [base] = withoutScheme.split("?");
  const clean = base.replace(/\/$/, "");
  return clean.length > 48 ? `${clean.slice(0, 47)}…` : clean;
}

/**
 * Renderiza `text` transformando URLs soltas em links clicáveis.
 * As notas/descrições de projeto são texto livre editado à mão; alguns trazem
 * links (Confluence, Jira). Abre em nova aba e evita vazar o referrer.
 */
export function Linkify({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    const raw = m[0];
    const start = m.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    const href = /^www\./i.test(raw) ? `https://${raw}` : raw;
    parts.push(
      <a
        key={start}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
      >
        {label(raw)}
      </a>,
    );
    last = start + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}
