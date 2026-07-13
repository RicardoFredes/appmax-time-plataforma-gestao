/** Detecta se o tipo de issue do Jira é um bug (cobre "Bug" e "Erro"). */
export function isBug(issueType: string): boolean {
  return /bug|erro/i.test(issueType);
}
