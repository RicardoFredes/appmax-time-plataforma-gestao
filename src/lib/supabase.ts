/**
 * Client Supabase do painel (uso no browser). Aponta para o **mesmo projeto** do
 * backoffice (`hckrainomxsawfzmjufb`), então a sessão do backoffice — recebida via
 * `postMessage` e aplicada com `supabase.auth.setSession` em `route-sync.ts` — vale
 * aqui e o RLS resolve `auth.uid()` para o mesmo usuário.
 *
 * Leitura é anônima (RLS `SELECT` para `anon`); escrita exige sessão (`authenticated`).
 * Config espelha o backoffice: um `lock` no-op substitui o `navigator.locks` padrão,
 * que pode travar queries em abas ociosas (dentro de iframe isso é comum).
 */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no ambiente. " +
      "Copie os valores do backoffice (projeto hckrainomxsawfzmjufb) para o `.env`.",
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    // Substitui o lock padrão (navigator.locks) por um no-op — evita queries
    // congeladas em abas ociosas/iframe. Mesmo tratamento do backoffice.
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});
