/** Helpers de exibição de pessoas (nomes/avatares). */

/** Iniciais para avatar: primeira letra do primeiro e do último nome. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Primeiro nome (para rótulos curtos). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
