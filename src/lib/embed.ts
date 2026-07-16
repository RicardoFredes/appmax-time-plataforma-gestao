/**
 * Guarda de embed: o painel só deve renderizar dentro de um iframe do backoffice
 * autenticado. O controle real é o header `Content-Security-Policy: frame-ancestors`
 * (ver public/_headers) — o navegador recusa embutir em qualquer outro origin. Esta
 * checagem no cliente cobre o caso de abrir a URL solta (top-level, fora de iframe) e
 * serve como defesa extra.
 *
 * Mantenha ALLOWED_ANCESTORS em sincronia com o `frame-ancestors` de public/_headers.
 */
export const ALLOWED_ANCESTORS = [
  "https://backoffice.appmax.com.br",
  // TODO: confirmar o domínio de homolog do backoffice.
  "https://homolog-backoffice.appmax.com.br",
];

/**
 * Rota do painel dentro do backoffice, para onde o acesso direto (top-level) é
 * redirecionado — fechando o fluxo: quem abre a URL solta cai na página do
 * backoffice que embute o painel (e já resolve a autenticação de lá).
 */
// TODO: confirmar a rota real do Time Plataforma no backoffice.
export const BACKOFFICE_PANEL_URL = "https://backoffice.appmax.com.br/time-plataforma";

export type EmbedStatus = "ok" | "standalone" | "forbidden-ancestor";

/**
 * True quando o embedder pediu para esconder o "chrome" do painel (a barra de
 * navegação própria) via `?chrome=off`. Usado quando o backoffice embute uma aba
 * específica e faz a navegação pelo menu dele — evita barra de navegação dupla.
 */
export function isChromeless(): boolean {
  return new URLSearchParams(window.location.search).get("chrome") === "off";
}

/** Decide se o painel pode renderizar no contexto atual. */
export function checkEmbed(): EmbedStatus {
  // Em dev (`pnpm dev`) não bloqueia — permite desenvolver o painel sozinho.
  if (import.meta.env.DEV) return "ok";

  // Fora de iframe (uso direto no *.pages.dev) → bloqueia.
  let framed: boolean;
  try {
    framed = window.self !== window.top;
  } catch {
    // Acessar window.top lançou => contexto cross-origin, logo estamos embutidos.
    framed = true;
  }
  if (!framed) return "standalone";

  // Defesa extra: se der para identificar o ancestral, confere contra a allowlist.
  // (O header frame-ancestors já impede embutir em origins não permitidos; quando
  // não dá para identificar — ex.: Firefox sem ancestorOrigins e sem referrer —,
  // confiamos no header e liberamos.)
  const ancestors = window.location.ancestorOrigins;
  if (ancestors && ancestors.length > 0) {
    const ok = Array.from(ancestors).some((o) => ALLOWED_ANCESTORS.includes(o));
    return ok ? "ok" : "forbidden-ancestor";
  }
  if (document.referrer) {
    try {
      const origin = new URL(document.referrer).origin;
      if (!ALLOWED_ANCESTORS.includes(origin)) return "forbidden-ancestor";
    } catch {
      /* referrer inválido — ignora e confia no header */
    }
  }
  return "ok";
}
