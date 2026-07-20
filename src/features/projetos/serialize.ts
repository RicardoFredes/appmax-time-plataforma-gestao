/**
 * Serializa `ProjetosData` no mesmo formato do arquivo `projetos.json`
 * (indent 2, cada registro semanal em uma única linha, `$doc` no topo).
 *
 * Usado pelo editor do frontend (`ProjetosEditor`) para o JSON copiado bater
 * byte a byte com o arquivo. O CLI (`sync/projetos.ts`) tem uma cópia própria
 * desta lógica (o projeto `sync` do tsconfig não importa de `src`).
 */

import type { ProjetosData, RegistroSemanal } from "./types";

export function serializeProjetosData(data: ProjetosData, doc?: string): string {
  const withDoc = doc !== undefined ? { $doc: doc, ...data } : data;
  let out = JSON.stringify(withDoc, null, 2);
  // Colapsa cada registro semanal em uma linha só, como no arquivo original.
  out = out.replace(/\{\n\s*"semana":[\s\S]*?\n\s*\}/g, (block) => {
    const r = JSON.parse(block) as RegistroSemanal;
    return `{ "semana": ${JSON.stringify(r.semana)}, "progresso": ${r.progresso}, "saude": ${r.saude}, "nota": ${JSON.stringify(r.nota)} }`;
  });
  return out + "\n";
}
