import { Fragment } from "react";

/** Casa URLs http(s). O `www.` é promovido a https na hora de montar o href. */
const URL_RE = /\b(https?:\/\/[^\s<]+[^\s<.,:;!?)\]}'"]|www\.[^\s<]+[^\s<.,:;!?)\]}'"])/gi;

/** Encurta a URL exibida (sem esquema, sem query longa) mantendo o clique íntegro. */
function rotulo(url: string): string {
  const semEsquema = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const [base] = semEsquema.split("?");
  const limpo = base.replace(/\/$/, "");
  return limpo.length > 48 ? `${limpo.slice(0, 47)}…` : limpo;
}

/**
 * Renderiza `texto` transformando URLs soltas em links clicáveis.
 * As notas/descrições de projeto são texto livre editado à mão; alguns trazem
 * links (Confluence, Jira). Abre em nova aba e evita vazar o referrer.
 */
export function Linkify({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(URL_RE)) {
    const bruto = m[0];
    const inicio = m.index ?? 0;
    if (inicio > ultimo) partes.push(texto.slice(ultimo, inicio));
    const href = /^www\./i.test(bruto) ? `https://${bruto}` : bruto;
    partes.push(
      <a
        key={inicio}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
      >
        {rotulo(bruto)}
      </a>,
    );
    ultimo = inicio + bruto.length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return (
    <>
      {partes.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}
