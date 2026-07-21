/**
 * Sincroniza a URL do painel com a URL do backoffice que o embute, via
 * `postMessage`. O painel guarda a rota no **hash** (`#/projetos`) e os filtros
 * no **query string** (`?status=...`, via History API); ambos são espelhados na
 * URL do backoffice, nos dois sentidos:
 *
 * - painel -> backoffice: `route-change` a cada `hashchange`/`popstate` e a cada
 *   `pushState`/`replaceState` (filtros) — estes são silenciosos por padrão,
 *   então instrumentamos o History API (ver {@link patchHistory}).
 * - backoffice -> painel: `navigate` aplica rota (hash) e filtros (query) sem
 *   recarregar, e dispara {@link EXTERNAL_NAV_EVENT} para a app re-ler a URL.
 *
 * No-op fora de iframe. Origin validado contra {@link ALLOWED_ANCESTORS}.
 */
import { ALLOWED_ANCESTORS } from "./embed";
import { supabase } from "./supabase";

const PANEL_SOURCE = "time-plataforma";
const BACKOFFICE_SOURCE = "appmax-backoffice";

/**
 * Evento disparado quando o backoffice empurra uma nova URL (rota/filtros).
 * Componentes que derivam estado do query string (ex.: `TasksPanel`) escutam
 * este evento para re-ler a URL, já que a leitura normal acontece só no mount.
 */
export const EXTERNAL_NAV_EVENT = "panel:external-navigate";

/** Rota atual: hash sem o prefixo `#/` (Tarefas = ""). */
function currentPath(): string {
  return window.location.hash.replace(/^#\/?/, "");
}

/** Query string atual, sem o `chrome` (controle de embed, não é estado da app). */
function currentSearch(): string {
  const p = new URLSearchParams(window.location.search);
  p.delete("chrome");
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Origin do backoffice que embute o painel (para validar e endereçar mensagens). */
function parentOrigin(): string {
  const ancestor = window.location.ancestorOrigins?.[0];
  if (ancestor) return ancestor;
  try {
    return new URL(document.referrer).origin;
  } catch {
    return "*";
  }
}

function isAllowed(origin: string): boolean {
  return import.meta.env.DEV || ALLOWED_ANCESTORS.includes(origin);
}

/**
 * `pushState`/`replaceState` não disparam evento nativo. Instrumenta ambos para
 * emitir `locationchange`, de modo que mudanças de filtro sejam observáveis.
 * Idempotente.
 */
function patchHistory() {
  const w = window as typeof window & { __routeSyncPatched?: boolean };
  if (w.__routeSyncPatched) return;
  w.__routeSyncPatched = true;
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function (this: History, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event("locationchange"));
      return result;
    };
  }
}

export function initRouteSync(): () => void {
  if (window.parent === window) return () => {};
  patchHistory();

  const target = parentOrigin();
  const post = (type: string) =>
    window.parent.postMessage(
      { source: PANEL_SOURCE, type, path: currentPath(), search: currentSearch() },
      target,
    );

  const onLocalChange = () => post("route-change");

  const onMessage = (e: MessageEvent) => {
    if (!isAllowed(e.origin) || e.data?.source !== BACKOFFICE_SOURCE) return;

    // Sessão herdada do backoffice: aplica os tokens para o painel escrever no
    // Supabase (mesmo projeto) como o usuário logado. Leituras não dependem disso.
    if (e.data.type === "auth" && e.data.access_token && e.data.refresh_token) {
      void supabase.auth.setSession({
        access_token: e.data.access_token,
        refresh_token: e.data.refresh_token,
      });
      return;
    }

    if (e.data.type !== "navigate") return;

    const nextHash = e.data.path ? `/${e.data.path}` : "";
    const nextSearch: string = e.data.search ?? "";

    if (nextSearch !== currentSearch()) {
      // Aplica os filtros vindos do backoffice sem recarregar e avisa a app.
      history.replaceState(
        null,
        "",
        window.location.pathname + nextSearch + window.location.hash,
      );
      window.dispatchEvent(new Event(EXTERNAL_NAV_EVENT));
    }
    if (nextHash !== window.location.hash.replace(/^#/, "")) {
      window.location.hash = nextHash;
    }
  };

  window.addEventListener("hashchange", onLocalChange);
  window.addEventListener("popstate", onLocalChange);
  window.addEventListener("locationchange", onLocalChange);
  window.addEventListener("message", onMessage);

  // Anuncia o estado inicial e reafirma no handshake.
  post("ready");
  post("route-change");

  return () => {
    window.removeEventListener("hashchange", onLocalChange);
    window.removeEventListener("popstate", onLocalChange);
    window.removeEventListener("locationchange", onLocalChange);
    window.removeEventListener("message", onMessage);
  };
}
